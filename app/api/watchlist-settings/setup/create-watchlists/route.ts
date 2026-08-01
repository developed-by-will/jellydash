import { catchError } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { createWatchlistsForAllUsers } from '../helpers';

export async function POST(request: NextRequest) {
  try {
    const result = await createWatchlistsForAllUsers(request);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
