import { catchError } from '@/app/api/helpers';
import { isValidWebhookSecret } from '@/app/db/webhookSecret';
import { NextRequest, NextResponse } from 'next/server';
import { reapplyWatchlistCustomizations } from '../jellyfin-favorite/helpers';

/**
 * Meant to be wired up in Jellyfin's Webhook plugin as a second destination pointed at this URL,
 * notification type "Task Completed" (optionally scoped in the plugin's own config to just the
 * "Scan Media Library" task). Doesn't need to inspect the payload at all - any call re-applies our
 * custom names and images to every watchlist playlist (and the "Playlists" home view) we manage,
 * undoing whatever Jellyfin's scan just did to them. Can also be called manually (e.g. from
 * Postman) to force a fix right away.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    if (!isValidWebhookSecret(secret)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const result = await reapplyWatchlistCustomizations(request);

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    console.error('[jellyfin-task-completed] error:', error);
    return catchError(error);
  }
}
