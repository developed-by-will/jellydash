import { catchError, requestApi } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Id, IsDisabled } = body;

    const getUsersResponse = await requestApi('/Users', request, {
      method: 'GET',
      requiresAuth: true
    });
    const users: User[] = await getUsersResponse.json();

    if (!users.length) throw new Error('Failed to fetch users');

    const user = users.find((u) => u.Id === Id.toString());
    const userDetailsResponse = await requestApi(`/Users/${user?.Id}/Policy`, request, {
      method: 'POST',
      requiresAuth: true,
      body: {
        ...user?.Policy,
        IsDisabled
      }
    });

    if (!userDetailsResponse.ok) throw new Error('Failed to update user');

    return NextResponse.json({ message: `User was ${IsDisabled ? 'disabled' : 'enabled'}` });
  } catch (error) {
    return catchError(error);
  }
}
