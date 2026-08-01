import { catchError } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { pingConfiguredServer } from '../helpers';

export async function POST(request: NextRequest) {
  try {
    const up = await pingConfiguredServer(request);
    return NextResponse.json({ up }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
