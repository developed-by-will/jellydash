import { JELLYFIN_ADMIN_API_KEY, SERVER_URL } from '@/app/api/constants';
import { getHeaders, requestApi } from '@/app/api/helpers';
import {
  backfillFavoritesForUser,
  ensureMoviesPlaylist
} from '@/app/api/webhooks/jellyfin-favorite/helpers';
import { getOrCreateWebhookSecret } from '@/app/db/webhookSecret';
import { NextRequest } from 'next/server';

// jellyfin/jellyfin-plugin-webhook's fixed assembly GUID (from its build.yaml) - stable across
// versions, used both to install the right package and to address its configuration afterward.
const WEBHOOK_PLUGIN_GUID = '71552a5a-5c5c-4350-a2ae-ebe451a30173';
const WEBHOOK_PLUGIN_PACKAGE_NAME = 'Webhook';

type JellyfinPluginInfo = {
  Id: string;
  Name: string;
  Version: string;
  Status?: string;
};

/** Direct, unauthenticated reachability check against a user-provided base URL (setup wizard's
 * own "test communication" step - runs before we trust this URL for anything else). */
export async function pingUrl(baseUrl: string): Promise<boolean> {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (!trimmed) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${trimmed}/System/Ping`, { method: 'GET', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/** Pings the app's actual configured Jellyfin connection (SERVER_URL), not an arbitrary URL. */
export async function pingConfiguredServer(request: NextRequest): Promise<boolean> {
  try {
    const res = await requestApi('/System/Ping', request, { method: 'GET', requiresAuth: false });
    return res.ok;
  } catch {
    return false;
  }
}

async function getInstalledPlugins(request: NextRequest): Promise<JellyfinPluginInfo[]> {
  const res = await requestApi('/Plugins', request, {
    method: 'GET',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
  if (!res.ok) {
    throw new Error(`Failed to list plugins: ${res.status}`);
  }
  return res.json();
}

function normalizeGuid(guid: string): string {
  return guid.toLowerCase().replace(/-/g, '');
}

export async function isWebhookPluginInstalled(request: NextRequest): Promise<boolean> {
  const plugins = await getInstalledPlugins(request);
  return plugins.some((plugin) => plugin.Id && normalizeGuid(plugin.Id) === normalizeGuid(WEBHOOK_PLUGIN_GUID));
}

/** Installs the Webhook plugin from the official Jellyfin repository. Requires a server restart
 * to actually activate (Jellyfin loads plugin assemblies at startup). */
export async function installWebhookPlugin(request: NextRequest): Promise<void> {
  const res = await requestApi(
    `/Packages/Installed/${WEBHOOK_PLUGIN_PACKAGE_NAME}?AssemblyGuid=${WEBHOOK_PLUGIN_GUID}`,
    request,
    { method: 'POST', requiresAuth: true, accessToken: JELLYFIN_ADMIN_API_KEY }
  );
  if (!res.ok) {
    throw new Error(`Failed to install Webhook plugin: ${res.status}`);
  }
}

/** Triggers a restart. The connection is expected to drop mid-response as the process exits, so
 * callers should treat a network error here as "restart triggered", not a failure. */
export async function restartJellyfinServer(request: NextRequest): Promise<void> {
  await requestApi('/System/Restart', request, {
    method: 'POST',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
}

async function getWebhookPluginConfig(request: NextRequest): Promise<any> {
  const res = await requestApi(`/Plugins/${WEBHOOK_PLUGIN_GUID}/Configuration`, request, {
    method: 'GET',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
  if (!res.ok) {
    throw new Error(`Failed to read Webhook plugin configuration: ${res.status}`);
  }
  return res.json();
}

async function setWebhookPluginConfig(request: NextRequest, config: any): Promise<void> {
  // The plugin config endpoint has no requestApi-style JSON helper - it wants the raw
  // configuration object as the body, same shape GET returned (POST replaces it wholesale).
  const res = await fetch(`${SERVER_URL}/Plugins/${WEBHOOK_PLUGIN_GUID}/Configuration`, {
    method: 'POST',
    headers: { ...getHeaders(JELLYFIN_ADMIN_API_KEY), 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) {
    throw new Error(`Failed to save Webhook plugin configuration: ${res.status}`);
  }
}

function appUrl(): string {
  const raw = process.env.NEXTAUTH_URL ?? '';
  return raw.trim().replace(/\/+$/, '');
}

const FAVORITE_WEBHOOK_PATH = '/api/webhooks/jellyfin-favorite';
const TASK_COMPLETED_WEBHOOK_PATH = '/api/webhooks/jellyfin-task-completed';

function favoriteWebhookUri(): string {
  return `${appUrl()}${FAVORITE_WEBHOOK_PATH}?secret=${getOrCreateWebhookSecret()}`;
}

function taskCompletedWebhookUri(): string {
  return `${appUrl()}${TASK_COMPLETED_WEBHOOK_PATH}?secret=${getOrCreateWebhookSecret()}`;
}

// All destination options share this shape (see Jellyfin.Plugin.Webhook/Destinations/BaseOption.cs)
// - item type flags are enabled across the board so our own endpoints see every relevant favorite
// (they do their own filtering), and SendAllProperties=true means the plugin skips its Handlebars
// template entirely and just posts the full JSON data object, which is exactly the raw
// UserDataSaved/TaskCompleted payload our routes already expect.
function buildManagedGenericOption(webhookUri: string, webhookName: string, notificationType: string) {
  return {
    NotificationTypes: [notificationType],
    WebhookName: webhookName,
    WebhookUri: webhookUri,
    EnableMovies: true,
    EnableEpisodes: true,
    EnableSeries: true,
    EnableSeasons: true,
    EnableAlbums: true,
    EnableSongs: true,
    EnableVideos: true,
    SendAllProperties: true,
    TrimWhitespace: false,
    SkipEmptyMessageBody: false,
    EnableWebhook: true,
    Template: '',
    UserFilter: [],
    Headers: [],
    Fields: []
  };
}

const MANAGED_WEBHOOK_NAME = 'Jellydash - Watchlist';
const MANAGED_TASK_WEBHOOK_NAME = 'Jellydash - Watchlist (Task Completed)';

/** Entries we own are identified by URL path, not the secret (which can rotate). */
function isManagedEntry(entry: { WebhookUri?: string }, path: string): boolean {
  if (!entry.WebhookUri) {
    return false;
  }
  try {
    return new URL(entry.WebhookUri).pathname === path;
  } catch {
    return entry.WebhookUri.includes(path);
  }
}

export async function checkHooksStatus(
  request: NextRequest
): Promise<{ favorite: boolean; taskCompleted: boolean }> {
  const config = await getWebhookPluginConfig(request);
  const genericOptions: Array<{ WebhookUri?: string; EnableWebhook?: boolean }> =
    config.GenericOptions ?? [];

  return {
    favorite: genericOptions.some(
      (entry) => isManagedEntry(entry, FAVORITE_WEBHOOK_PATH) && entry.EnableWebhook !== false
    ),
    taskCompleted: genericOptions.some(
      (entry) => isManagedEntry(entry, TASK_COMPLETED_WEBHOOK_PATH) && entry.EnableWebhook !== false
    )
  };
}

/** Adds (or replaces, if already present) our two managed Generic Destinations. Safe to call
 * repeatedly - existing jellydash-owned entries are matched by URL path and replaced in place, and
 * every other destination the user has configured (Discord, Slack, their own Generic ones, ...) is
 * left completely untouched. */
export async function applyHooks(
  request: NextRequest
): Promise<{ favorite: boolean; taskCompleted: boolean }> {
  const config = await getWebhookPluginConfig(request);
  const existing: Array<{ WebhookUri?: string }> = config.GenericOptions ?? [];

  const untouched = existing.filter(
    (entry) => !isManagedEntry(entry, FAVORITE_WEBHOOK_PATH) && !isManagedEntry(entry, TASK_COMPLETED_WEBHOOK_PATH)
  );

  const favoriteOption = buildManagedGenericOption(
    favoriteWebhookUri(),
    MANAGED_WEBHOOK_NAME,
    'UserDataSaved'
  );
  const taskCompletedOption = buildManagedGenericOption(
    taskCompletedWebhookUri(),
    MANAGED_TASK_WEBHOOK_NAME,
    'TaskCompleted'
  );

  await setWebhookPluginConfig(request, {
    ...config,
    GenericOptions: [...untouched, favoriteOption, taskCompletedOption]
  });

  return { favorite: true, taskCompleted: true };
}

/** Creates the Watchlist playlist (and fixes up the "Playlists" tile) for every user, even ones
 * with zero favorites yet - ensureMoviesPlaylist only needs a userId, not any favorited items, so
 * this is entirely possible and safe to re-run (no-ops for users who already have one). Also
 * backfills each user's existing favorites into their new playlist, same as the manual backfill
 * endpoint, so anyone who favorited things before this was set up doesn't end up with an empty
 * playlist. */
export async function createWatchlistsForAllUsers(request: NextRequest): Promise<{
  total: number;
  favoritesAdded: number;
  favoritesFailed: number;
  failed: Array<{ userId: string; name: string; error: string }>;
}> {
  const usersRes = await requestApi('/Users', request, {
    method: 'GET',
    requiresAuth: true,
    accessToken: JELLYFIN_ADMIN_API_KEY
  });
  if (!usersRes.ok) {
    throw new Error(`Failed to list users: ${usersRes.status}`);
  }
  const users: Array<{ Id: string; Name: string }> = await usersRes.json();

  const failed: Array<{ userId: string; name: string; error: string }> = [];
  let favoritesAdded = 0;
  let favoritesFailed = 0;

  for (const user of users) {
    try {
      await ensureMoviesPlaylist(request, user.Id);
      const backfill = await backfillFavoritesForUser(request, user.Id);
      favoritesAdded += backfill.succeeded;
      favoritesFailed += backfill.failed;
    } catch (error) {
      failed.push({
        userId: user.Id,
        name: user.Name,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return { total: users.length, favoritesAdded, favoritesFailed, failed };
}

export { WEBHOOK_PLUGIN_GUID };
