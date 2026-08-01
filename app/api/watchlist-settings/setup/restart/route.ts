import { NextRequest, NextResponse } from 'next/server';
import { restartJellyfinServer } from '../helpers';

/** A successful restart drops the connection mid-response - so unlike every other route here, a
 * thrown/network error is the expected outcome, not a failure. Either way we tell the user the
 * restart was triggered and point them at "Check Jellyfin Server Connection" to confirm it's back. */
export async function POST(request: NextRequest) {
  try {
    await restartJellyfinServer(request);
  } catch {
    // Expected - the server process exits mid-request.
  }

  return NextResponse.json(
    { ok: true, message: 'Restart triggered - give it a few seconds, then check the connection.' },
    { status: 200 }
  );
}
