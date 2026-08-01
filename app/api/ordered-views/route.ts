import { catchError } from '@/app/api/helpers';
import { getOrderedViews, saveOrderedViews } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

// GET takes no request param and touches no dynamic API, so Next's App Router would otherwise
// statically cache it at build time - meaning every client would keep getting the very first
// response forever, no matter what gets saved afterwards. Force it dynamic so every GET actually
// re-reads the file.
export const dynamic = 'force-dynamic';

// Returns the currently saved home screen order (Playlists tile + libraries), as last written by
// the reorder-home page. Callers should treat this as a starting point, not the source of truth
// for what libraries currently exist - Jellyfin's live library list is that source.
export async function GET() {
  try {
    return NextResponse.json(getOrderedViews(), { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Overwrites the saved order wholesale with whatever the client sends - this is a reorder tool,
// not an incremental membership list, so a full replace (rather than add/remove like
// libraries/membership) matches how the page actually edits it.
export async function POST(request: NextRequest) {
  try {
    const { orderedViews } = await request.json();

    if (
      !Array.isArray(orderedViews) ||
      orderedViews.some((view) => !view?.id || !view?.name || typeof view.id !== 'string')
    ) {
      return NextResponse.json(
        { message: 'orderedViews must be an array of { id, name }' },
        { status: 400 }
      );
    }

    saveOrderedViews(orderedViews);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
