import { catchError, requestApi } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { Username } = body;

    const getUsers = await requestApi('/Users', request, {
      method: 'GET',
      requiresAuth: true
    });

    const users: User[] = await getUsers.json();

    // Update each user's policy
    await Promise.all(
      users.map((user) => {
        const tag = `IPTV:${Username}`;
        const existingTags = user.Policy.BlockedTags ?? [];

        // Only proceed if the tag EXISTS
        if (!existingTags.includes(tag)) return;

        const newPolicy = {
          ...user.Policy,
          BlockedTags: existingTags.filter((t) => t !== tag)
        };

        return requestApi(`/Users/${user.Id}/Policy`, request, {
          method: 'POST',
          requiresAuth: true,
          body: JSON.stringify(newPolicy)
        });
      })
    );
    return NextResponse.json({ message: `M3U successfuly was removed` }, { status: 200 });
  } catch (error) {
    catchError(error);
  }
}
