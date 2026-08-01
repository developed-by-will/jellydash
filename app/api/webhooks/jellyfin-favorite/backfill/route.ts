import { catchError } from '@/app/api/helpers';
import { isValidWebhookSecret } from '@/app/db/webhookSecret';
import { NextRequest, NextResponse } from 'next/server';
import { backfillFavoritesForUser } from '../helpers';

/**
 * One-off backfill for favorites that existed before the webhook was wired up. Reuses the same
 * applyFavoriteChange logic the webhook uses, so results are identical to what would have
 * happened had each item been favorited after the webhook was in place.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    if (!isValidWebhookSecret(secret)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ message: 'userId parameter is required' }, { status: 400 });
    }

    const result = await backfillFavoritesForUser(request, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
