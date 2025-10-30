import { catchError, requestApi } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { Id } = body;

    const endpoint = `/Users/${Id}`;

    if (!Id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const res = await requestApi(endpoint, request, {
      method: 'DELETE',
      requiresAuth: true
    });

    if (res.status !== 204) {
      return NextResponse.json({ message: `Error removing user` }, { status: 400 });
    }

    return NextResponse.json({ message: `User was removed` }, { status: 200 });
  } catch (error) {
    catchError(error);
  }
}
