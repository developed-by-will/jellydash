import { catchError, fetchApi } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { Username, Pw } = await request.json();
    const endpoint = '/Users/authenticatebyname';

    const authResponse = await fetchApi(endpoint, request, {
      method: 'POST',
      body: { Username, Pw },
      requiresAuth: false
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { message: 'Authentication failed', error: authResponse.text() },
        { status: authResponse.status }
      );
    }

    const { AccessToken, SessionInfo } = await authResponse.json();

    return NextResponse.json(
      {
        AccessToken,
        SessionInfo,
        message: 'Authentication successful'
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
