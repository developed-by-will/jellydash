import { SERVER_URL } from '@/app/api/constants';
import { catchError } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { checkHooksStatus, isWebhookPluginInstalled } from '../helpers';

/** Reports what the setup wizard still has left to do, so the page can jump straight to the
 * plain settings form for anyone who already has this configured (manually or via the wizard). */
export async function GET(request: NextRequest) {
  try {
    const pluginInstalled = await isWebhookPluginInstalled(request).catch((error) => {
      console.error('[watchlist-settings/setup/status] plugin check failed:', error);
      return false;
    });
    const hooks = pluginInstalled
      ? await checkHooksStatus(request).catch((error) => {
          console.error('[watchlist-settings/setup/status] hooks check failed:', error);
          return { favorite: false, taskCompleted: false };
        })
      : { favorite: false, taskCompleted: false };

    return NextResponse.json({ pluginInstalled, hooks, serverUrl: SERVER_URL }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
