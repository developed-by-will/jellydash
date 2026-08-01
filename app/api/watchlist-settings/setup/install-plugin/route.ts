import { catchError } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { installWebhookPlugin } from '../helpers';

export async function POST(request: NextRequest) {
  try {
    await installWebhookPlugin(request);
    return NextResponse.json({ ok: true, message: 'Webhook plugin installed.' }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
