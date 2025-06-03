import { catchError, fetchApi } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const endpoint = `/Users/${userId}`;

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const getUser = await fetchApi(endpoint, request, {
      method: 'GET',
      requiresAuth: true
    });

    const user: User = await getUser.json();

    if (user) {
      return NextResponse.json(user, { status: 200 });
    }

    return NextResponse.json({ message: `Error getting the user` }, { status: 400 });
  } catch (error) {
    return catchError(error);
  }
}
