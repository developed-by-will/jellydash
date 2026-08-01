import fs from 'fs';
import path from 'path';
import { WatchlistStore, WatchlistUserEntry } from './types';

const STORE_FILE = path.join(process.cwd(), 'app', 'db', 'watchlist-playlists.json');

const ensureDirectoryExists = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

function readStore(): WatchlistStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading watchlist-playlists store:', error);
  }
  return {};
}

function writeStore(store: WatchlistStore) {
  ensureDirectoryExists(STORE_FILE);
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function getUserEntry(store: WatchlistStore, userId: string): WatchlistUserEntry {
  return store[userId] ?? { series: {} };
}

export function getMoviesPlaylistId(userId: string): string | undefined {
  const store = readStore();
  return getUserEntry(store, userId).moviesPlaylistId;
}

export function setMoviesPlaylistId(userId: string, playlistId: string) {
  const store = readStore();
  const entry = getUserEntry(store, userId);
  entry.moviesPlaylistId = playlistId;
  store[userId] = entry;
  writeStore(store);
}

export function getSeriesPlaylistId(userId: string, seriesId: string): string | undefined {
  const store = readStore();
  return getUserEntry(store, userId).series[seriesId];
}

export function setSeriesPlaylistId(userId: string, seriesId: string, playlistId: string) {
  const store = readStore();
  const entry = getUserEntry(store, userId);
  entry.series[seriesId] = playlistId;
  store[userId] = entry;
  writeStore(store);
}

/** Drops a stale reference (the playlist no longer exists in Jellyfin, e.g. deleted by hand). */
export function removeMoviesPlaylistId(userId: string) {
  const store = readStore();
  const entry = getUserEntry(store, userId);
  delete entry.moviesPlaylistId;
  store[userId] = entry;
  writeStore(store);
}

export function removeSeriesPlaylistId(userId: string, seriesId: string) {
  const store = readStore();
  const entry = getUserEntry(store, userId);
  delete entry.series[seriesId];
  store[userId] = entry;
  writeStore(store);
}

/** Every playlist we currently manage, across every user - used to re-apply images to all of them. */
export function getAllTrackedPlaylists(): Array<
  { userId: string } & (
    | { kind: 'movies'; playlistId: string }
    | { kind: 'series'; seriesId: string; playlistId: string }
  )
> {
  const store = readStore();
  const result: ReturnType<typeof getAllTrackedPlaylists> = [];

  for (const [userId, entry] of Object.entries(store)) {
    if (entry.moviesPlaylistId) {
      result.push({ userId, kind: 'movies', playlistId: entry.moviesPlaylistId });
    }
    for (const [seriesId, playlistId] of Object.entries(entry.series ?? {})) {
      result.push({ userId, kind: 'series', seriesId, playlistId });
    }
  }

  return result;
}
