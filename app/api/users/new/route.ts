import { CreateUserPayloadType } from '@/app/(pages)/jd-admin/users/create/formValidations';
import { catchError, fetchApi, generatePassword } from '@/app/api/helpers';
import { CreateUserResponseType, User } from '@/app/api/types';
import { PackageName, PACKAGES } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';
import { mobileDisplayPrefs } from '../../constants';
import { updateUserDisplayPreferences } from '../update-display-prefs/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Username, Pw } = body as CreateUserPayloadType;
    const Package: PackageName = body.Package;

    // Check if package exists
    if (!PACKAGES[Package]) {
      return NextResponse.json({ message: `Package does not exist` }, { status: 400 });
    }

    const endpoints = {
      create: '/Users/New',
      userList: '/Users',
      remove: `/Users`
    };

    // Check if user already exists
    const getUsersResponse = await fetchApi(endpoints.userList, request, {
      method: 'GET',
      requiresAuth: true
    });
    const users: User[] = await getUsersResponse.json();

    if (users.some((user: User) => user.Name === Username)) {
      return NextResponse.json({ message: `User already exists` }, { status: 400 });
    }

    // Create user
    const createResponse = await fetchApi(endpoints.create, request, {
      method: 'POST',
      requiresAuth: true,
      body: {
        Name: Username
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
    const newUser = updatedUsers.find((user: User) => user.Name === Username);

    if (!newUser) {
      return NextResponse.json({ message: `Could not find newly created user` }, { status: 400 });
    }

    // Update user's policies
    const userInfo: User = {
      ...newUser,
      ...PACKAGES[Package]
    };

    const policyUpdate = await fetchApi(`/Users/${newUser.Id}/Policy`, request, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(userInfo)
    });

    if (!policyUpdate.ok) {
      return NextResponse.json({ message: `Error updating user policies` }, { status: 400 });
    }

    // Set password
    const newPassword = Pw?.length ? Pw : generatePassword();
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

    const prefsUpdate = await updateUserDisplayPreferences(mobileDisplayPrefs, request);

    if (!prefsUpdate.ok) {
      await fetchApi(endpoints.remove + `/${newUser.Id}`, request, {
        method: 'DELETE',
        requiresAuth: true
      });

      return NextResponse.json({ message: `Error updating display preferences` }, { status: 400 });
    }

    return NextResponse.json({ User: userInfo, Pw: newPassword } as CreateUserResponseType, {
      status: 200
    });
  } catch (error) {
    return catchError(error);
  }
}
