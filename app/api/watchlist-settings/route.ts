import { catchError } from '@/app/api/helpers';
import {
  getMoviesPlaylistImageUrl,
  getPlaylistsViewImageUrl,
  getWatchlistSettings,
  saveMoviesPlaylistImage,
  savePlaylistsViewImage,
  saveWatchlistSettings
} from '@/app/db/watchlistSettings';
import { NextRequest, NextResponse } from 'next/server';
import { reapplyWatchlistCustomizations } from '../webhooks/jellyfin-favorite/helpers';

function currentState() {
  return {
    settings: getWatchlistSettings(),
    moviesImageUrl: getMoviesPlaylistImageUrl(),
    playlistsImageUrl: getPlaylistsViewImageUrl()
  };
}

export async function GET() {
  try {
    return NextResponse.json(currentState(), { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Saves whichever names/images were provided, then immediately pushes them to every existing
// tracked playlist and "Playlists" view (not just future ones) - same logic the scan-triggered
// reapply webhook uses, just run right away so the change is visible without waiting.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const moviesPlaylistName = formData.get('moviesPlaylistName');
    const playlistsViewName = formData.get('playlistsViewName');
    const moviesImage = formData.get('moviesImage');
    const playlistsImage = formData.get('playlistsImage');

    if (moviesImage instanceof File && moviesImage.size > 0) {
      saveMoviesPlaylistImage(Buffer.from(await moviesImage.arrayBuffer()));
    }

    if (playlistsImage instanceof File && playlistsImage.size > 0) {
      savePlaylistsViewImage(Buffer.from(await playlistsImage.arrayBuffer()));
    }

    saveWatchlistSettings({
      ...(typeof moviesPlaylistName === 'string' && moviesPlaylistName.trim()
        ? { moviesPlaylistName: moviesPlaylistName.trim() }
        : {}),
      ...(typeof playlistsViewName === 'string' && playlistsViewName.trim()
        ? { playlistsViewName: playlistsViewName.trim() }
        : {})
    });

    const applyResult = await reapplyWatchlistCustomizations(request);

    return NextResponse.json({ ...currentState(), applyResult }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
