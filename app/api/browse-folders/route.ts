import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const DRIVE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function listDrives(): string[] {
  return DRIVE_LETTERS.map((letter) => `${letter}:\\`).filter((drive) => {
    try {
      return fs.existsSync(drive);
    } catch {
      return false;
    }
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestedPath = searchParams.get('path');

  // No path provided - list the available drives as browsing roots
  if (!requestedPath) {
    return NextResponse.json({ path: null, parent: null, folders: listDrives() });
  }

  const normalized = path.normalize(requestedPath);

  if (!fs.existsSync(normalized) || !fs.statSync(normalized).isDirectory()) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(normalized, { withFileTypes: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unable to read folder' }, { status: 500 });
  }

  const folders = entries
    .filter((entry) => {
      try {
        return entry.isDirectory();
      } catch {
        return false;
      }
    })
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const parentDir = path.dirname(normalized);
  // At a drive root, dirname resolves to itself - treat that as "no parent" (back to drive list)
  const parent = parentDir === normalized ? null : parentDir;

  return NextResponse.json({ path: normalized, parent, folders });
}
