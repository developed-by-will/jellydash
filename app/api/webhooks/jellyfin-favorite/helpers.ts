import { JELLYFIN_ADMIN_API_KEY, SERVER_URL, WATCHLIST_PLAYLIST_SORT_NAME } from '@/app/api/constants';
import { getHeaders, requestApi } from '@/app/api/helpers';
import {
  getMoviesPlaylistImagePath,
  getPlaylistsViewImagePath,
  getWatchlistSettings
} from '@/app/db/watchlistSettings';
import fs from 'fs';
import { NextRequest } from 'next/server';
import path from 'path';
import {
  getAllTrackedPlaylists,
  getMoviesPlaylistId,
  getSeriesPlaylistId,
  removeMoviesPlaylistId,
  removeSeriesPlaylistId,
  setMoviesPlaylistId,
  setSeriesPlaylistId
} from './store';
import { FavoriteChange, PlaylistCreationResult } from './types';

type ImageType = 'Primary' | 'Thumb';

function contentTypeForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.png' ? 'image/png' : 'image/jpeg';
}

async function createPlaylist(
  request: NextRequest,
  displayName: string,
  userId: string,
  sortName?: string
): Promise<string> {
  // Jellyfin derives a playlist's internal Id deterministically from its sanitized Name
  // (MD5 of "...Playlist" + path), and every user's playlists live under the same shared
  // root folder (PlaylistManager.GetPlaylistsFolder ignores the userId argument) - so two
  // users creating a playlist with the same display name collide on the same underlying
  // item and one creation fails. Create with a userId-qualified name to force a unique Id,
  // then rename it back to the clean display name (renaming only updates the Name
  // property - it doesn't touch the already-established Id/path).
  const uniqueName = `${displayName} (${userId})`;

  const res = await requestApi('/Playlists', request, {
    method: 'POST',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY,
    body: { Name: uniqueName, UserId: userId, MediaType: 'Video', IsPublic: false }
  });
  if (!res.ok) {
    throw new Error(`Failed to create playlist "${displayName}": ${res.status}`);
  }
  const data: PlaylistCreationResult = await res.json();
  await renamePlaylist(request, data.Id, userId, displayName, sortName);

  return data.Id;
}

export async function renamePlaylist(
  request: NextRequest,
  playlistId: string,
  userId: string,
  displayName: string,
  sortName?: string
): Promise<void> {
  // The playlist-specific rename endpoint (POST /Playlists/{id}) resolves the acting user via
  // User.GetUserId() internally and rejects a bare API-key call with no bound user identity.
  // The generic item-update endpoint doesn't have that restriction, so use it instead - same
  // fetch-full-dto-then-repost pattern as app/api/items/update-date-created/route.ts.
  const getRes = await requestApi(`/Users/${userId}/Items/${playlistId}`, request, {
    method: 'GET',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
  if (!getRes.ok) {
    throw new Error(`Failed to fetch playlist ${playlistId} for rename: ${getRes.status}`);
  }
  const item = await getRes.json();

  const postRes = await requestApi(`/Items/${playlistId}`, request, {
    method: 'POST',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY,
    body: sortName
      ? { ...item, Name: displayName, ForcedSortName: sortName }
      : { ...item, Name: displayName }
  });
  if (!postRes.ok) {
    throw new Error(
      `Failed to rename playlist ${playlistId} to "${displayName}": ${postRes.status}`
    );
  }
}

/**
 * Renames any user-scoped Item (a playlist, a view, ...) via the generic item-update endpoint -
 * same fetch-full-dto-then-repost pattern as renamePlaylist above. Used for the "Playlists"
 * home-screen view label. No-ops if the name already matches.
 */
async function renameView(
  request: NextRequest,
  userId: string,
  itemId: string,
  displayName: string
): Promise<void> {
  const getRes = await requestApi(`/Users/${userId}/Items/${itemId}`, request, {
    method: 'GET',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
  if (!getRes.ok) {
    return;
  }
  const item = await getRes.json();
  if (item.Name === displayName) {
    return;
  }

  await requestApi(`/Items/${itemId}`, request, {
    method: 'POST',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY,
    body: { ...item, Name: displayName }
  });
}

async function uploadItemImage(
  itemId: string,
  imageType: ImageType,
  bytes: Buffer,
  contentType: string
): Promise<void> {
  // Jellyfin's SetItemImage always base64-decodes the request body server-side
  // (see ImageController.GetFromBase64Stream), regardless of Content-Type.
  const res = await fetch(`${SERVER_URL}/Items/${itemId}/Images/${imageType}`, {
    method: 'POST',
    headers: {
      ...getHeaders(JELLYFIN_ADMIN_API_KEY),
      'Content-Type': contentType
    },
    body: bytes.toString('base64')
  });
  if (!res.ok) {
    throw new Error(`Failed to upload ${imageType} image for ${itemId}: ${res.status}`);
  }
}

async function fetchItemImage(
  itemId: string,
  imageType: ImageType
): Promise<{ bytes: Buffer; contentType: string } | null> {
  const res = await fetch(`${SERVER_URL}/Items/${itemId}/Images/${imageType}`, {
    method: 'GET',
    headers: getHeaders(JELLYFIN_ADMIN_API_KEY)
  });
  if (!res.ok) {
    return null;
  }
  const arrayBuffer = await res.arrayBuffer();
  return {
    bytes: Buffer.from(arrayBuffer),
    contentType: res.headers.get('content-type') ?? 'image/jpeg'
  };
}

/** The store is just a local cache - verify the playlist wasn't deleted (by hand or otherwise) before trusting it. */
async function playlistStillExists(
  request: NextRequest,
  userId: string,
  playlistId: string
): Promise<boolean> {
  const res = await requestApi(`/Users/${userId}/Items/${playlistId}`, request, {
    method: 'GET',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
  return res.ok;
}

/**
 * Each user gets their own distinct "Playlists" home-screen view object (a different Id per
 * user, seemingly only created once that user has at least one playlist) - it is NOT the same
 * shared Id as the underlying playlist storage folder, and it is NOT shared across users either
 * (own Id, own ImageTags, own Name). So the label, image, and "show first" ordering can't be set
 * once for everyone; all three have to be verified/corrected per user, right after we know they
 * have at least one playlist - and again later via reapplyWatchlistCustomizations, since Jellyfin's
 * own library scan periodically regenerates this view's image (and the plain re-upload here is
 * exactly what undoes that). Cheap and idempotent to repeat (each step no-ops or re-applies the
 * same bytes/name when already correct).
 */
async function ensurePlaylistsViewPresentation(request: NextRequest, userId: string): Promise<void> {
  const viewsRes = await requestApi(`/Users/${userId}/Views`, request, {
    method: 'GET',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
  if (!viewsRes.ok) {
    return;
  }
  const viewsData = await viewsRes.json();
  const playlistsView = (viewsData.Items as Array<{ Id: string; CollectionType?: string }>).find(
    (item) => item.CollectionType === 'playlists'
  );
  if (!playlistsView) {
    return;
  }

  const settings = getWatchlistSettings();

  // Best-effort - if Jellyfin ever rejects renaming this auto-generated view, don't let that
  // block the image/ordering steps below.
  await renameView(request, userId, playlistsView.Id, settings.playlistsViewName).catch(() => {});

  // Both Primary and Thumb get the same uploaded image now - Jellyfin will keep regenerating its
  // own composite Primary on every library scan, but reapplyWatchlistCustomizations re-runs this
  // same upload afterwards to put ours back.
  const imagePath = getPlaylistsViewImagePath();
  if (imagePath) {
    const bytes = fs.readFileSync(imagePath);
    const contentType = contentTypeForPath(imagePath);
    await uploadItemImage(playlistsView.Id, 'Primary', bytes, contentType);
    await uploadItemImage(playlistsView.Id, 'Thumb', bytes, contentType);
  }

  const userRes = await requestApi(`/Users/${userId}`, request, {
    method: 'GET',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
  if (!userRes.ok) {
    return;
  }
  const user = await userRes.json();
  const config = user.Configuration ?? {};
  const currentOrdered: string[] = config.OrderedViews ?? [];

  if (currentOrdered[0] === playlistsView.Id) {
    return;
  }

  const newOrdered = [playlistsView.Id, ...currentOrdered.filter((id) => id !== playlistsView.Id)];

  await requestApi(`/Users/${userId}/Configuration`, request, {
    method: 'POST',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY,
    body: { ...config, OrderedViews: newOrdered }
  });
}

export async function ensureMoviesPlaylist(request: NextRequest, userId: string): Promise<string> {
  const existing = getMoviesPlaylistId(userId);
  if (existing && (await playlistStillExists(request, userId, existing))) {
    return existing;
  }

  const settings = getWatchlistSettings();

  const playlistId = await createPlaylist(
    request,
    settings.moviesPlaylistName,
    userId,
    WATCHLIST_PLAYLIST_SORT_NAME
  );

  const imagePath = getMoviesPlaylistImagePath();
  if (imagePath) {
    const bytes = fs.readFileSync(imagePath);
    await uploadItemImage(playlistId, 'Primary', bytes, contentTypeForPath(imagePath));
  }

  setMoviesPlaylistId(userId, playlistId);
  await ensurePlaylistsViewPresentation(request, userId);
  return playlistId;
}

export async function ensureSeriesPlaylist(
  request: NextRequest,
  userId: string,
  seriesId: string,
  seriesName: string
): Promise<string> {
  const existing = getSeriesPlaylistId(userId, seriesId);
  if (existing && (await playlistStillExists(request, userId, existing))) {
    return existing;
  }

  const playlistId = await createPlaylist(request, seriesName, userId);

  const primary = await fetchItemImage(seriesId, 'Primary');
  if (primary) {
    await uploadItemImage(playlistId, 'Primary', primary.bytes, primary.contentType);
  }

  const thumb = await fetchItemImage(seriesId, 'Thumb');
  if (thumb) {
    await uploadItemImage(playlistId, 'Thumb', thumb.bytes, thumb.contentType);
  }

  setSeriesPlaylistId(userId, seriesId, playlistId);
  await ensurePlaylistsViewPresentation(request, userId);
  return playlistId;
}

export async function addItemToPlaylist(
  request: NextRequest,
  playlistId: string,
  itemId: string,
  userId: string
): Promise<void> {
  const res = await requestApi(
    `/Playlists/${playlistId}/Items?ids=${itemId}&userId=${userId}`,
    request,
    {
      method: 'POST',
      requiresAuth: true,
      accessToken: JELLYFIN_ADMIN_API_KEY,
      body: undefined
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to add item ${itemId} to playlist ${playlistId}: ${res.status}`);
  }
}

/**
 * Applies a favorite to the right watchlist playlist. Shared by the webhook route and the
 * favorites backfill route so both follow identical rules.
 *
 * Unfavoriting is intentionally a no-op: playlists are only ever added to automatically, never
 * modified on unfavorite. If a user wants something removed, they delete the whole playlist or
 * remove items one by one themselves, directly in Jellyfin.
 *
 * Favoriting a single episode, a season, or the whole series are all treated the same way - add
 * the series itself to the playlist, which Jellyfin auto-expands into every current episode
 * (verified against the live server), so there's no need to enumerate episodes ourselves.
 * Re-adding the same series to an already-populated playlist doesn't duplicate entries (also
 * verified), so this is safe to do on every such favorite, not just the first one.
 */
export async function applyFavoriteChange(
  request: NextRequest,
  change: FavoriteChange
): Promise<void> {
  if (!change.favorite) {
    return;
  }

  const { userId, itemId, itemType, seriesId, seriesName } = change;

  if (itemType === 'Episode' || itemType === 'Season' || itemType === 'Series') {
    if (!seriesId || !seriesName) {
      return;
    }
    const playlistId = await ensureSeriesPlaylist(request, userId, seriesId, seriesName);
    await addItemToPlaylist(request, playlistId, seriesId, userId);
  } else {
    const playlistId = await ensureMoviesPlaylist(request, userId);
    await addItemToPlaylist(request, playlistId, itemId, userId);
  }
}

type FavoriteItem = {
  Id: string;
  Name: string;
  Type: string;
  SeriesId?: string;
  SeriesName?: string;
};

type FavoriteItemsResponse = {
  Items: FavoriteItem[];
  TotalRecordCount: number;
};

export type BackfillResult = {
  totalFavorites: number;
  processed: number;
  succeeded: number;
  failed: number;
  results: Array<{ id: string; name: string; status: 'added' | 'failed'; error?: string }>;
};

/**
 * Finds every favorite a user already has and applies each one via applyFavoriteChange, exactly
 * as if they'd just favorited it. Used both by the manual backfill endpoint and by the setup
 * wizard's "Create Watchlists" step, so favorites that predate the webhook (or predate the whole
 * Watchlist feature) still end up in the right playlist instead of only future favorites.
 */
export async function backfillFavoritesForUser(
  request: NextRequest,
  userId: string
): Promise<BackfillResult> {
  const itemsRes = await requestApi(
    `/Users/${userId}/Items?Filters=IsFavorite&Recursive=true&IncludeItemTypes=Movie,Series,Season,Episode,Video`,
    request,
    { method: 'GET', requiresAuth: true, accessToken: JELLYFIN_ADMIN_API_KEY }
  );
  if (!itemsRes.ok) {
    throw new Error(`Failed to list favorites for ${userId}: ${itemsRes.status}`);
  }

  const data: FavoriteItemsResponse = await itemsRes.json();
  const results: BackfillResult['results'] = [];

  for (const item of data.Items) {
    try {
      const seriesId = item.Type === 'Series' ? item.Id : item.SeriesId;
      const seriesName = item.Type === 'Series' ? item.Name : item.SeriesName;

      await applyFavoriteChange(request, {
        userId,
        itemId: item.Id,
        itemType: item.Type,
        favorite: true,
        seriesId,
        seriesName
      });

      results.push({ id: item.Id, name: item.Name, status: 'added' });
    } catch (error) {
      results.push({
        id: item.Id,
        name: item.Name,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    totalFavorites: data.TotalRecordCount,
    processed: results.length,
    succeeded: results.filter((r) => r.status === 'added').length,
    failed: results.filter((r) => r.status === 'failed').length,
    results
  };
}

/**
 * Re-applies the custom name and Primary image to every movies-watchlist playlist we manage, and
 * the custom name/Primary/Thumb to every user's "Playlists" home-screen view - across every user.
 * Jellyfin's own library scan periodically regenerates a playlist's image (and can reset the
 * "Playlists" view's own image/name) from its current contents - there's no way to stop Jellyfin
 * from doing that, so instead this is meant to be called right after a scan finishes (wired up as
 * a second Jellyfin webhook, notification type "Task Completed", pointed at the sibling
 * jellyfin-task-completed route) to put everything back. Safe to call at any time for any reason -
 * every step either no-ops or re-applies the same bytes/name it already applied before, so
 * repeated/redundant calls are harmless. Series playlists are intentionally left alone here - their
 * images come from the series itself, which Jellyfin has no reason to touch.
 */
export async function reapplyWatchlistCustomizations(
  request: NextRequest
): Promise<{ fixed: number; failed: Array<{ playlistId: string; error: string }> }> {
  const tracked = getAllTrackedPlaylists();
  const settings = getWatchlistSettings();
  const imagePath = getMoviesPlaylistImagePath();
  const failed: Array<{ playlistId: string; error: string }> = [];
  let fixed = 0;

  for (const entry of tracked) {
    if (entry.kind === 'series') {
      // Series playlists aren't renamed/re-imaged here, but stale references (deleted by hand)
      // should still be dropped so a future favorite recreates a fresh playlist instead of
      // silently pointing at nothing.
      const stillExists = await playlistStillExists(request, entry.userId, entry.playlistId);
      if (!stillExists) {
        removeSeriesPlaylistId(entry.userId, entry.seriesId);
      }
      continue;
    }

    try {
      const stillExists = await playlistStillExists(request, entry.userId, entry.playlistId);
      if (!stillExists) {
        // Playlist was deleted by hand in Jellyfin - drop the stale reference instead of
        // repeatedly failing on it every time a scan finishes.
        removeMoviesPlaylistId(entry.userId);
        continue;
      }

      await renamePlaylist(
        request,
        entry.playlistId,
        entry.userId,
        settings.moviesPlaylistName,
        WATCHLIST_PLAYLIST_SORT_NAME
      );

      if (imagePath) {
        const bytes = fs.readFileSync(imagePath);
        await uploadItemImage(entry.playlistId, 'Primary', bytes, contentTypeForPath(imagePath));
      }

      fixed += 1;
    } catch (error) {
      failed.push({
        playlistId: entry.playlistId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ensurePlaylistsViewPresentation already does exactly what a "reapply" needs for the Playlists
  // view (rename + re-upload image + fix ordering) - just re-run it per distinct user.
  const userIds = [...new Set(tracked.map((entry) => entry.userId))];
  for (const userId of userIds) {
    await ensurePlaylistsViewPresentation(request, userId);
  }

  return { fixed, failed };
}
