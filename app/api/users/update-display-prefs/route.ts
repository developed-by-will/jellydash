import { catchError, fetchApi } from '@/app/api/helpers';
import { CustomPreferences } from '@/app/api/types';
import { getLibraries, libraries } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

export async function updateUserDisplayPreferences(
  displayPreferences: CustomPreferences,
  request: NextRequest
) {
  try {
    const endpoint = '/DisplayPreferences/usersettings';
    const libraryIds = getLibraries(libraries.standard)
      .map((id) => id.trim())
      .filter(Boolean);

    // Fetch all users
    const usersResponse = await fetchApi('/Users', request, {
      method: 'GET',
      requiresAuth: true
    });
    const users = await usersResponse.json();

    // Loop through each user and apply preferences
    for (const user of users) {
      const customPrefs: Record<string, any> = { ...displayPreferences.CustomPrefs };

      for (const libId of libraryIds) {
        customPrefs[`items-${libId}-Folder-sortby`] = 'ProductionYear,PremiereDate,SortName';
        customPrefs[`items-${libId}-Folder-sortorder`] = 'Descending';
      }

      const cleanDisplayPreferences = {
        ...displayPreferences,
        CustomPrefs: customPrefs
      };
      await fetchApi(`${endpoint}?userId=${user.Id}&client=emby`, request, {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify(cleanDisplayPreferences)
      });
    }

    return { ok: true, message: 'Preferences updated for all users' };
  } catch (error) {
    return catchError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayPreferences } = body;

    const response = await updateUserDisplayPreferences(displayPreferences, request);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error updating display preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update display preferences' },
      { status: 500 }
    );
  }
}
