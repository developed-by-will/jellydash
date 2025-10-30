import { catchError, requestApi } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const endpoint = '/Users';

    const getUsers = await requestApi(endpoint, request, {
      method: 'GET',
      requiresAuth: true
    });

    const users: User[] = await getUsers.json();

    // Order by Last Activity Date
    users.sort(
      (a: User, b: User) =>
        new Date(b.LastActivityDate).getTime() - new Date(a.LastActivityDate).getTime()
    );

    if (users.length > 0) {
      return NextResponse.json(
        users.map(
          (user: User) =>
            ({
              Name: user.Name,
              Id: user.Id,
              Policy: {
                BlockedTags: user.Policy.BlockedTags,
                IsDisabled: user.Policy.IsDisabled
              },
              LastActivityDate: user.LastActivityDate,
              LastLoginDate: user.LastLoginDate
            }) as User
        ),
        { status: 200 }
      );
    }

    return NextResponse.json({ message: `Error getting list of users` }, { status: 400 });
  } catch (error) {
    catchError(error);
  }
}
