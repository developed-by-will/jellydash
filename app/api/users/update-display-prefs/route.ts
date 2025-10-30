import { catchError, requestApi } from '@/app/api/helpers';
import { CustomPreferencesBase } from '@/app/api/types';
import { getLibraries, libraries } from '@/app/db/packages';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import { tvDisplayPrefs } from '../../constants';

export async function updateUserDisplayPreferences(
  displayPreferences: CustomPreferencesBase,
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions);

    const endpoints = {
      mobile: '/DisplayPreferences/usersettings',
      tv: '/DisplayPreferences'
    };
    const libraryIds = getLibraries(libraries.standard)
      .map((id) => id.trim())
      .filter(Boolean);

    // Fetch all users
    const usersResponse = await requestApi('/Users', request, {
      method: 'GET',
      requiresAuth: true
    });
    const users = await usersResponse.json();

    // Loop through each user and apply preferences for mobile version
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
      await requestApi(`${endpoints.mobile}?userId=${user.Id}&client=emby`, request, {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify(cleanDisplayPreferences)
      });
    }

    // Loop through each library and apply TV preferences
    const viewsResponse = await requestApi(`/UserViews?includeHidden=false`, request, {
      method: 'GET',
      requiresAuth: true
    });
    const viewsData = await viewsResponse.json();

    // Filter only valid display preferences IDs
    const displayPrefsIds = viewsData.Items.map((lib: any) => lib.UserData?.Key).filter(Boolean);

    for (const libGuid of displayPrefsIds) {
      await requestApi(`/DisplayPreferences/${libGuid}?client=jellyfin-androidtv`, request, {
        method: 'POST',
        requiresAuth: false,
        accessToken: session?.user.JellyfinSession?.AccessToken,
        headersOverride: { deviceId: session?.user.JellyfinSession?.SessionInfo.DeviceId },
        body: tvDisplayPrefs
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
