import { headers, SERVER_URL } from '@/app/api/constants';
import { catchError } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, disable } = body;

    const endpoints = {
      getUserById: `/Users/${userId}`,
      userPolicyUpdate: `/Users/${userId}/Policy`
    };

    // Get user
    const getUser = await fetch(SERVER_URL + endpoints.getUserById, {
      method: 'GET',
      headers
    });

    const user: User = await getUser.json();

    if (user) {
      // Update user's policies
      const policies = {
        ...user.Policy,
        IsDisabled: disable
      };

      const policyUpdate = await fetch(SERVER_URL + endpoints.userPolicyUpdate, {
        method: 'POST',
        headers,
        body: JSON.stringify(policies)
      });

      if (policyUpdate.ok)
        return NextResponse.json(
          {
            message: `User's ${user.Name} was ${disable ? 'disabled' : 'enabled'}`
          },
          { status: 200 }
        );
    }

    return NextResponse.json({ message: `Error disabling user` }, { status: 400 });
  } catch (error) {
    catchError(error);
  }
}
