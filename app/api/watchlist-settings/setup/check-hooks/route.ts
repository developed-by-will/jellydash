import { catchError } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { checkHooksStatus } from '../helpers';

export async function POST(request: NextRequest) {
  try {
    const status = await checkHooksStatus(request);
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
