import { catchError } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { pingUrl } from '../helpers';

export async function POST(request: NextRequest) {
  try {
    const { apiBaseUrl } = await request.json();
    if (!apiBaseUrl || typeof apiBaseUrl !== 'string') {
      return NextResponse.json({ message: 'apiBaseUrl is required' }, { status: 400 });
    }

    const ok = await pingUrl(apiBaseUrl);
    return NextResponse.json({ ok }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
