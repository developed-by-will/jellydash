import { exec, spawn } from 'child_process';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const FFMPEG_PATH = 'C:\\Program Files\\Jellyfin\\Server\\ffmpeg.exe';
const FFPROBE_PATH = 'C:\\Program Files\\Jellyfin\\Server\\ffprobe.exe';

interface Conversion {
  ffmpeg: any;
  tempOutputPath: string;
  lastPercent: number;
  controller: AbortController;
}
const runningConversions = new Map<string, Conversion>();

function normalizePath(p: string) {
  return p.replace(/\\\\/g, '\\').replace(/\//g, '\\').toLowerCase();
}

// ---------------- Cleanup ----------------
async function cleanup(file: string, conversion: Conversion) {
  const ffmpeg = conversion.ffmpeg;

  // Kill ffmpeg properly
  if (!ffmpeg.killed) {
    ffmpeg.kill('SIGINT'); // safer on Windows, or 'taskkill' as fallback
  }

  // Wait for process exit
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => resolve(), 5000); // fallback if exit never fires
    ffmpeg.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  // Delete temp file
  if (fs.existsSync(conversion.tempOutputPath)) {
    try {
      fs.unlinkSync(conversion.tempOutputPath);
      console.log('🗑️ Temp file deleted:', conversion.tempOutputPath);
    } catch (e) {
      console.warn('⚠️ Failed to delete temp file:', e);
    }
  }

  runningConversions.delete(file);
  try {
    conversion.controller.abort();
  } catch {}
}

// ---------------- POST ----------------
export async function POST(req: Request) {
  const body = await req.json();
  const { path: file, width, height } = body;

  if (!file || !width || !height)
    return new Response(JSON.stringify({ error: 'Missing file, width, or height' }), {
      status: 400
    });
  if (!fs.existsSync(file))
    return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });

  const normalizedFile = normalizePath(file);
  const dir = path.dirname(file);
  const baseName = path.basename(file, path.extname(file));
  const optimizedDir = path.join(dir, 'optimized');
  if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir, { recursive: true });

  const tempOutputPath = path.join(optimizedDir, `${baseName}.mp4`);
  const finalOutputPath = path.join(dir, `${baseName}.mp4`);

  // Get duration with ffprobe
  let durationSec = 0;
  try {
    const { stdout } = await execAsync(
      `"${FFPROBE_PATH}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`
    );
    durationSec = parseFloat(stdout.trim());
    if (isNaN(durationSec)) durationSec = 0;
  } catch {
    durationSec = 0;
  }

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const abortController = new AbortController();

  const stream = new ReadableStream({
    start(controller) {
      // ---------------- Spawn FFmpeg ----------------
      const ffmpegArgs = [
        '-y',
        '-i',
        file,
        '-vf',
        `scale=${width}:${height},format=yuv420p,yadif`,
        '-c:v',
        'libx264',
        '-preset',
        'veryslow',
        '-tune',
        'film',
        '-profile:v',
        'high',
        '-level',
        '4.1',
        '-crf',
        '24',
        '-x264-params',
        'trellis=2:psy-rd=1.0:0.15:subme=9:weightp=2:b-adapt=2:direct=auto:me=umh',
        '-c:a',
        'aac',
        '-b:a',
        '160k',
        '-movflags',
        '+faststart',
        tempOutputPath,
        '-progress',
        'pipe:1',
        '-nostats'
      ];

      const ffmpeg = spawn(FFMPEG_PATH, ffmpegArgs, { windowsHide: true });

      runningConversions.set(normalizedFile, {
        ffmpeg,
        tempOutputPath,
        lastPercent: 0,
        controller: abortController
      });

      // Abort listener
      abortController.signal.addEventListener('abort', () => {
        const conversion = runningConversions.get(normalizedFile);
        if (conversion) cleanup(normalizedFile, conversion);
        try {
          controller.close();
        } catch {}
      });

      // Progress polling interval
      const progressInterval = setInterval(() => {
        const conversion = runningConversions.get(normalizedFile);
        if (!conversion) return clearInterval(progressInterval);
        const percent = Math.min(100, conversion.lastPercent);
        try {
          controller.enqueue(`event: progress\ndata: ${percent.toFixed(1)}\n\n`);
        } catch {}
      }, 10000);

      // Parse FFmpeg progress
      ffmpeg.stdout.on('data', (data: Buffer) => {
        const lines = data.toString().split(/\r?\n/);
        for (const line of lines) {
          const match = line.match(/out_time_ms=(\d+)/);
          if (match && durationSec > 0) {
            const outSec = parseInt(match[1]) / 1000000;
            const conversion = runningConversions.get(normalizedFile);
            if (conversion) conversion.lastPercent = Math.min(100, (outSec / durationSec) * 100);
          }
        }
      });

      ffmpeg.on('close', (code) => {
        clearInterval(progressInterval);
        const conversion = runningConversions.get(normalizedFile);
        if (!conversion) return;

        if (code !== 0) {
          cleanup(normalizedFile, conversion);
          try {
            controller.enqueue(
              `event: error\ndata: ${JSON.stringify({ message: 'FFmpeg failed', code })}\n\n`
            );
            controller.close();
          } catch {}
          return;
        }

        try {
          // Delete original, move optimized
          if (fs.existsSync(file)) fs.unlinkSync(file); // delete original
          if (fs.existsSync(finalOutputPath)) fs.unlinkSync(finalOutputPath); // overwrite if exists
          fs.renameSync(tempOutputPath, finalOutputPath); // move temp file

          // Remove the optimized folder if empty
          try {
            const files = fs.readdirSync(optimizedDir);
            if (files.length === 0) fs.rmdirSync(optimizedDir);
          } catch (e) {
            console.warn('⚠️ Failed to remove optimized folder:', e);
          }

          controller.enqueue(`event: progress\ndata: 100.0\n\n`);
          controller.enqueue(
            `event: complete\ndata: ${JSON.stringify({ output: finalOutputPath })}\n\n`
          );
          controller.close();
        } catch (e) {
          cleanup(normalizedFile, conversion);
          try {
            controller.enqueue(
              `event: error\ndata: ${JSON.stringify({ message: 'Cleanup failed', error: String(e) })}\n\n`
            );
            controller.close();
          } catch {}
        }
      });
    },
    cancel() {
      const conversion = runningConversions.get(normalizedFile);
      if (conversion) cleanup(normalizedFile, conversion);
    }
  });

  return new Response(stream, { headers });
}

// ---------------- GET ----------------
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileParam = url.searchParams.get('file');
  if (!fileParam) return new Response(JSON.stringify({ error: 'Missing path' }), { status: 400 });

  const file = normalizePath(fileParam);
  const conversion = runningConversions.get(file);

  if (!conversion)
    return new Response(JSON.stringify({ error: 'No running conversion for this file' }), {
      status: 404
    });

  return NextResponse.json({ progress: `${conversion.lastPercent.toFixed(1)}%` });
}

// ---------------- DELETE ----------------
// ---------------- DELETE ----------------
export async function DELETE(req: Request) {
  try {
    const body = await req.json(); // expects JSON body
    const file = normalizePath(body.file);

    if (!file)
      return new Response(JSON.stringify({ error: 'Missing file parameter' }), { status: 400 });

    const conversion = runningConversions.get(file);

    if (conversion) {
      // Actively abort and cleanup a running conversion
      await cleanup(file, conversion);
      return NextResponse.json({ stopped: true, message: 'Conversion terminated', file });
    }

    // No running conversion found, but still attempt to clean temp files
    const dir = path.dirname(file);
    const optimizedDir = path.join(dir, 'optimized');
    if (fs.existsSync(optimizedDir)) {
      const tempFiles = fs
        .readdirSync(optimizedDir)
        .filter((f) => f.startsWith(path.basename(file, path.extname(file))));
      for (const tempFile of tempFiles) {
        try {
          fs.unlinkSync(path.join(optimizedDir, tempFile));
        } catch {}
      }
      // Remove folder if empty
      if (fs.existsSync(optimizedDir) && fs.readdirSync(optimizedDir).length === 0) {
        try {
          fs.rmdirSync(optimizedDir);
        } catch {}
      }
    }

    return NextResponse.json({
      stopped: false,
      message: 'No running conversion found, cleaned leftovers',
      file
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body', details: String(err) }), {
      status: 400
    });
  }
}
