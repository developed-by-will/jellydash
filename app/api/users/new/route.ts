import { CreateUserPayloadType } from '@/app/(pages)/jd-admin/users/create/formValidations';
import { catchError, generatePassword, requestApi } from '@/app/api/helpers';
import { CreateUserResponseType, User } from '@/app/api/types';
import { getRolePolicy, getRoles } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';
import { mobileDisplayPrefs } from '../../constants';
import { updateUserDisplayPreferences } from '../helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Username, Pw } = body as CreateUserPayloadType;
    const Package: string = body.Package;

    const role = getRoles().find((r) => r.id === Package);

    if (!role) {
      return NextResponse.json({ message: `Package does not exist` }, { status: 400 });
    }

    const endpoints = {
      create: '/Users/New',
      userList: '/Users',
      remove: `/Users`
    };

    // Check if user exists
    const getUsersResponse = await requestApi(endpoints.userList, request, {
      method: 'GET',
      requiresAuth: true
    });
    const users: User[] = await getUsersResponse.json();

    if (users.some((user) => user.Name === Username)) {
      return NextResponse.json({ message: `User already exists` }, { status: 400 });
    }

    // Create user
    const createResponse = await requestApi(endpoints.create, request, {
      method: 'POST',
      requiresAuth: true,
      body: { Name: Username }
    });

    if (!createResponse.ok) {
      return NextResponse.json({ message: `Error creating user` }, { status: 400 });
    }

    const updatedUsers: User[] = await (
      await requestApi(endpoints.userList, request, { method: 'GET', requiresAuth: true })
    ).json();
    const newUser = updatedUsers.find((u) => u.Name === Username);

    if (!newUser) {
      return NextResponse.json({ message: `Could not find newly created user` }, { status: 400 });
    }

    const userInfo: User = { ...newUser, ...getRolePolicy(role) };

    // Update policies
    const policyUpdate = await requestApi(`/Users/${newUser.Id}/Policy`, request, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(userInfo)
    });

    if (!policyUpdate.ok) {
      return NextResponse.json({ message: `Error updating user policies` }, { status: 400 });
    }

    // Set password
    const newPassword = Pw?.length ? Pw : generatePassword();
    const passwordUpdate = await requestApi(`/Users/${newUser.Id}/Password`, request, {
      method: 'POST',
      requiresAuth: true,
      body: { CurrentPw: '', NewPw: newPassword }
    });

    if (!passwordUpdate.ok) {
      return NextResponse.json({ message: `Error setting password` }, { status: 400 });
    }

    // ✅ Call the helper function directly
    const prefsUpdate = await updateUserDisplayPreferences(mobileDisplayPrefs, request);

    if (!prefsUpdate.ok) {
      // Cleanup if display preferences fail
      await requestApi(`${endpoints.remove}/${newUser.Id}`, request, {
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
