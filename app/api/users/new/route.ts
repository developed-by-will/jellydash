import { fetchApi, generatePassword } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { PackageName, PACKAGES } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    const Package: PackageName = body.package;

    // Check if package exists
    if (!PACKAGES[Package]) {
      return NextResponse.json({ message: `Package does not exist` }, { status: 400 });
    }

    const endpoints = {
      create: '/Users/New',
      userList: '/Users'
    };

    // Check if user already exists
    const getUsersResponse = await fetchApi(endpoints.userList, request, {
      method: 'GET',
      requiresAuth: true
    });
    const users: User[] = await getUsersResponse.json();

    if (users.some((user: User) => user.Name === username)) {
      return NextResponse.json({ message: `User already exists` }, { status: 400 });
    }

    // Create user
    const createResponse = await fetchApi(endpoints.create, request, {
      method: 'POST',
      requiresAuth: true,
      body: {
        Name: username
      }
    });

    if (!createResponse.ok) {
      return NextResponse.json({ message: `Error creating user` }, { status: 400 });
    }

    // Get the newly created user by name (more reliable than checking LastActivityDate)
    const getNewUserResponse = await fetchApi(endpoints.userList, request, {
      method: 'GET',
      requiresAuth: true
    });
    const updatedUsers: User[] = await getNewUserResponse.json();
    const newUser = updatedUsers.find((user: User) => user.Name === username);

    if (!newUser) {
      return NextResponse.json({ message: `Could not find newly created user` }, { status: 400 });
    }

    // Update user's policies
    const policies: User = {
      ...newUser,
      ...PACKAGES[Package]
    };

    const policyUpdate = await fetchApi(`/Users/${newUser.Id}/Policy`, request, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(policies)
    });

    if (!policyUpdate.ok) {
      return NextResponse.json({ message: `Error updating user policies` }, { status: 400 });
    }

    // Set password
    const newPassword = password ?? generatePassword();
    const passwordUpdate = await fetchApi(`/Users/${newUser.Id}/Password`, request, {
      method: 'POST',
      requiresAuth: true,
      body: {
        CurrentPw: '',
        NewPw: newPassword
      }
    });

    if (!passwordUpdate.ok) {
      return NextResponse.json({ message: `Error setting password` }, { status: 400 });
    }

    return NextResponse.json(
      {
        details: {
          username: newUser.Name,
          userId: newUser.Id,
          password: newPassword,
          policies
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in user creation:', error);
    return NextResponse.json({ message: `Internal server error` }, { status: 500 });
  }
}
