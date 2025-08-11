import { catchError, fetchApi } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { UserName, IsDisabled } = body;

    // Check if user already exists
    const getUsersResponse = await fetchApi('/Users', request, {
      method: 'GET',
      requiresAuth: true
    });
    const users: User[] = await getUsersResponse.json();

    if (!users.some((user: User) => user.Name === UserName.toString())) {
      return NextResponse.json({ message: `User does not exists` }, { status: 400 });
    }

    // Update account status
    const user = users.find((user: User) => user.Name === UserName.toString());
    const userDetailsResponse = await fetchApi(`/Users/${user?.Id}/Policy`, request, {
      method: 'POST',
      requiresAuth: true,
      body: {
        ...user?.Policy,
        IsDisabled
      }
    });

    if (!userDetailsResponse.ok) {
      throw new Error('Failed to fetch user details');
    }

    return NextResponse.json(
      {
        message: `User was ${IsDisabled ? 'disabled' : 'enabled'}`
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
