import { catchError } from '@/app/api/helpers';
import { isValidWebhookSecret } from '@/app/db/webhookSecret';
import { NextRequest, NextResponse } from 'next/server';
import { applyFavoriteChange } from './helpers';
import { UserDataSavedPayload } from './types';

export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    if (!isValidWebhookSecret(secret)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload: UserDataSavedPayload = await request.json();

    const isFavoriteToggle = payload.SaveReason === 'UpdateUserRating';
    const isMarkedWatched =
      (payload.SaveReason === 'PlaybackFinished' ||
        payload.SaveReason === 'TogglePlayed' ||
        payload.SaveReason === 'UpdateUserPlayedPosition') &&
      payload.Played === true;

    // Only proceed if the user toggled the favorite status OR marked the item as watched
    if (!isFavoriteToggle && !isMarkedWatched) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    console.log(
      `[jellyfin-favorite] handling ItemType=${payload.ItemType} Favorite=${payload.Favorite} Played=${payload.Played} ItemId=${payload.ItemId} UserId=${payload.UserId}`
    );

    // A favorited Series has no SeriesId/SeriesName of its own (those fields are only
    // populated for Season/Episode items) - it IS the series, so use its own Id/Name.
    const seriesId = payload.ItemType === 'Series' ? payload.ItemId : payload.SeriesId;
    const seriesName = payload.ItemType === 'Series' ? payload.Name : payload.SeriesName;

    // If the item was marked as watched, treat it as an unfavorite action to remove it from the playlist
    const targetFavoriteState = isMarkedWatched ? false : payload.Favorite;

    await applyFavoriteChange(request, {
      userId: payload.UserId,
      itemId: payload.ItemId,
      itemType: payload.ItemType,
      favorite: targetFavoriteState,
      seriesId,
      seriesName
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[jellyfin-favorite] error:', error);
    return catchError(error);
  }
}
