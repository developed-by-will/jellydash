import { catchError, requestApi } from '@/app/api/helpers';
import { JELLYFIN_ADMIN_API_KEY, WEBHOOK_SECRET } from '@/app/api/constants';
import { NextRequest, NextResponse } from 'next/server';
import { applyFavoriteChange } from '../helpers';

type FavoriteItem = {
  Id: string;
  Name: string;
  Type: string;
  SeriesId?: string;
  SeriesName?: string;
};

type FavoriteItemsResponse = {
  Items: FavoriteItem[];
  TotalRecordCount: number;
};

/**
 * One-off backfill for favorites that existed before the webhook was wired up. Reuses the same
 * applyFavoriteChange logic the webhook uses, so results are identical to what would have
 * happened had each item been favorited after the webhook was in place.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ message: 'userId parameter is required' }, { status: 400 });
    }

    const itemsRes = await requestApi(
      `/Users/${userId}/Items?Filters=IsFavorite&Recursive=true&IncludeItemTypes=Movie,Series,Season,Episode,Video`,
      request,
      { method: 'GET', requiresAuth: true, accessToken: JELLYFIN_ADMIN_API_KEY }
    );
    if (!itemsRes.ok) {
      return NextResponse.json(
        { message: `Failed to list favorites: ${itemsRes.status}` },
        { status: itemsRes.status }
      );
    }

    const data: FavoriteItemsResponse = await itemsRes.json();
    const results: Array<{ id: string; name: string; status: 'added' | 'failed'; error?: string }> = [];

    for (const item of data.Items) {
      try {
        const seriesId = item.Type === 'Series' ? item.Id : item.SeriesId;
        const seriesName = item.Type === 'Series' ? item.Name : item.SeriesName;

        await applyFavoriteChange(request, {
          userId,
          itemId: item.Id,
          itemType: item.Type,
          favorite: true,
          seriesId,
          seriesName
        });

        results.push({ id: item.Id, name: item.Name, status: 'added' });
      } catch (error) {
        results.push({
          id: item.Id,
          name: item.Name,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return NextResponse.json(
      {
        totalFavorites: data.TotalRecordCount,
        processed: results.length,
        succeeded: results.filter((r) => r.status === 'added').length,
        failed: results.filter((r) => r.status === 'failed').length,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
