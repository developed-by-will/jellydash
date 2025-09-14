import { LoginPayloadType } from '@/app/(pages)/login/formValidations';
import { AuthenticateByNameResponse } from '@/app/@types';
import { catchError, fetchApi } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { Username, Pw }: LoginPayloadType = await request.json();
    const endpoint = '/Users/AuthenticateByName';

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

    const session: AuthenticateByNameResponse = await authResponse.json();

    return NextResponse.json(
      {
        ...session,
        message: 'Authentication successful'
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
