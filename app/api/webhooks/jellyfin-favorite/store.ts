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
