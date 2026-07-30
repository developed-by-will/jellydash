import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

type DeleteStatus = 'deleted' | 'not_found' | 'skipped' | 'error';

interface DeleteResult {
  path: string;
  status: DeleteStatus;
  message?: string;
}

// Normalize a path for comparison: consistent separators, resolved, lowercased
// (Windows paths are case-insensitive).
function normalizeForCompare(p: string) {
  return path.normalize(p).toLowerCase();
}

// host. When a Jellyfin path is supplied, translate it onto the real music folder path
// before touching the disk. Without one, assume the m3u8 already contains host paths.
function toHostPath(rawPath: string, musicPath: string, jellyfinPath?: string): string {
  const posixPath = rawPath.replace(/\\/g, '/').trim();

  if (jellyfinPath) {
    const containerRoot = jellyfinPath.replace(/\\/g, '/').replace(/\/+$/, '');

    if (containerRoot && posixPath.toLowerCase().startsWith(containerRoot.toLowerCase())) {
      const relative = posixPath.slice(containerRoot.length).replace(/^\/+/, '');
      return path.join(musicPath, relative.split('/').join(path.sep));
    }
  }

  // Fall back to treating it as an already host-style path (e.g. pasted manually)
  return path.normalize(rawPath.replace(/\//g, '\\'));
}

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get('playlist') as File;
  const musicPath = ((data.get('musicPath') as string) || '').trim();
  const jellyfinPath = ((data.get('jellyfinPath') as string) || '').trim();

  if (!file) {
    return NextResponse.json({ error: 'No m3u8 file uploaded' }, { status: 400 });
  }

  if (!musicPath) {
    return NextResponse.json({ error: 'Music folder path is required' }, { status: 400 });
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/);

  // Extract only song paths, skipping blank lines and #EXT metadata
  const songPaths = lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  if (songPaths.length === 0) {
    return NextResponse.json({ error: 'No song paths found in playlist' }, { status: 400 });
  }

  const musicRoot = normalizeForCompare(musicPath);
  const results: DeleteResult[] = [];

  for (const rawPath of songPaths) {
    const filePath = toHostPath(rawPath, musicPath, jellyfinPath);
    const normalized = normalizeForCompare(filePath);

    // Safety guard: never delete anything outside the folder path provided
    if (!normalized.startsWith(musicRoot)) {
      results.push({ path: rawPath, status: 'skipped', message: 'Outside music library path' });
      continue;
    }

    try {
      if (!fs.existsSync(filePath)) {
        results.push({ path: rawPath, status: 'not_found', message: filePath });
        continue;
      }

      fs.unlinkSync(filePath);
      results.push({ path: rawPath, status: 'deleted', message: filePath });
    } catch (err: any) {
      results.push({ path: rawPath, status: 'error', message: err?.message ?? 'Unknown error' });
    }
  }

  const summary = {
    total: results.length,
    deleted: results.filter((r) => r.status === 'deleted').length,
    notFound: results.filter((r) => r.status === 'not_found').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    errors: results.filter((r) => r.status === 'error').length
  };

  return NextResponse.json({ summary, results });
}
