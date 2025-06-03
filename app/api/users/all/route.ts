import { catchError, fetchApi } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const endpoint = '/Users';

    const getUsers = await fetchApi(endpoint, request, {
      method: 'GET',
      requiresAuth: true
    });

    const users: User[] = await getUsers.json();

    if (users.length > 0) {
      return NextResponse.json(
        users.map((user: User) => ({
          Name: user.Name,
          Id: user.Id,
          IsDisabled: user.Policy.IsDisabled,
          Policy: {
            BlockedTags: user.Policy.BlockedTags
          }
        })),
        { status: 200 }
      );
    }

    return NextResponse.json({ message: `Error getting list of users` }, { status: 400 });
  } catch (error) {
    catchError(error);
  }
}
