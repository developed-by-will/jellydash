import { catchError } from '@/app/api/helpers';
import { WEBHOOK_SECRET } from '@/app/api/constants';
import { NextRequest, NextResponse } from 'next/server';
import { applyFavoriteChange } from './helpers';
import { UserDataSavedPayload } from './types';

export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload: UserDataSavedPayload = await request.json();

    // UserDataSaved also fires for played-toggle and playback-progress changes (the latter
    // roughly every 10s during active playback) - favorite/rating changes are the only ones
    // reported with this SaveReason, so this is the common case, not an error path.
    if (payload.SaveReason !== 'UpdateUserRating') {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    console.log(
      `[jellyfin-favorite] handling ItemType=${payload.ItemType} Favorite=${payload.Favorite} ItemId=${payload.ItemId} UserId=${payload.UserId}`
    );

    // A favorited Series has no SeriesId/SeriesName of its own (those fields are only
    // populated for Season/Episode items) - it IS the series, so use its own Id/Name.
    const seriesId = payload.ItemType === 'Series' ? payload.ItemId : payload.SeriesId;
    const seriesName = payload.ItemType === 'Series' ? payload.Name : payload.SeriesName;

    await applyFavoriteChange(request, {
      userId: payload.UserId,
      itemId: payload.ItemId,
      itemType: payload.ItemType,
      favorite: payload.Favorite,
      seriesId,
      seriesName
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[jellyfin-favorite] error:', error);
    return catchError(error);
  }
}
