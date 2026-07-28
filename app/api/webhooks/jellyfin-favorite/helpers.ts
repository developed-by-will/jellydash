import {
  JELLYFIN_ADMIN_API_KEY,
  SERVER_URL,
  WATCHLIST_MOVIES_POSTER_PATH,
  WATCHLIST_MOVIES_THUMB_PATH,
  WATCHLIST_PLAYLIST_NAME,
  WATCHLIST_PLAYLIST_SORT_NAME
} from '@/app/api/constants';
import { getHeaders, requestApi } from '@/app/api/helpers';
import fs from 'fs';
import { NextRequest } from 'next/server';
import path from 'path';
import { getMoviesPlaylistId, getSeriesPlaylistId, setMoviesPlaylistId, setSeriesPlaylistId } from './store';
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

async function deleteItemImage(itemId: string, imageType: ImageType): Promise<void> {
  // Best-effort - a 404 (nothing to delete) is fine, not an error.
  await fetch(`${SERVER_URL}/Items/${itemId}/Images/${imageType}`, {
    method: 'DELETE',
    headers: getHeaders(JELLYFIN_ADMIN_API_KEY)
  });
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
 * (own Id, own ImageTags). So neither "show Playlists first" nor "give it a proper image" can be
 * set once for everyone; both have to be verified/corrected per user, right after we know they
 * have at least one playlist. Cheap and mostly idempotent (the order check skips the write when
 * already correct; the image upload just re-applies the same bytes, harmless if repeated).
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

  // Only Thumb - the home-screen tile widget prefers Primary over Thumb when both are set,
  // which would squeeze the portrait poster into this landscape tile and distort it. Jellyfin
  // auto-generates its own composite Primary image asynchronously shortly after this view first
  // materializes (a background job, not part of this request) - deleting it right away loses the
  // race. Delete once now, and schedule a delayed second delete (without blocking this webhook's
  // response - the app runs as a persistent process, not serverless, so this is safe) to catch
  // that background job once it's done.
  await deleteItemImage(playlistsView.Id, 'Primary');

  const thumbBytes = fs.readFileSync(WATCHLIST_MOVIES_THUMB_PATH);
  await uploadItemImage(
    playlistsView.Id,
    'Thumb',
    thumbBytes,
    contentTypeForPath(WATCHLIST_MOVIES_THUMB_PATH)
  );

  setTimeout(() => {
    deleteItemImage(playlistsView.Id, 'Primary').catch(() => {});
  }, 5000);

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

  const playlistId = await createPlaylist(
    request,
    WATCHLIST_PLAYLIST_NAME,
    userId,
    WATCHLIST_PLAYLIST_SORT_NAME
  );

  const posterBytes = fs.readFileSync(WATCHLIST_MOVIES_POSTER_PATH);
  await uploadItemImage(
    playlistId,
    'Primary',
    posterBytes,
    contentTypeForPath(WATCHLIST_MOVIES_POSTER_PATH)
  );

  const thumbBytes = fs.readFileSync(WATCHLIST_MOVIES_THUMB_PATH);
  await uploadItemImage(
    playlistId,
    'Thumb',
    thumbBytes,
    contentTypeForPath(WATCHLIST_MOVIES_THUMB_PATH)
  );

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
