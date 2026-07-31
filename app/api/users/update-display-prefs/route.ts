// app/api/users/update-display-prefs/route.ts
import { catchError, requestApi } from '@/app/api/helpers';
import { CustomPreferencesBase } from '@/app/api/types';
import { getLibraries, getRoleLibraryFile } from '@/app/db/packages';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/authoptions';
import { tvDisplayPrefs } from '../../constants';

/**
 * Internal helper — DO NOT export
 */
async function updateUserDisplayPreferences(
  displayPreferences: CustomPreferencesBase,
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions);

    const endpoints = {
      mobile: '/DisplayPreferences/usersettings',
      tv: '/DisplayPreferences'
    };

    const libraryIds = getLibraries(getRoleLibraryFile('standard'))
      .map((id) => id.trim())
      .filter(Boolean);

    const usersResponse = await requestApi('/Users', request, {
      method: 'GET',
      requiresAuth: true
    });
    const users = await usersResponse.json();

    for (const user of users) {
      const customPrefs: Record<string, any> = { ...displayPreferences.CustomPrefs };
      for (const libId of libraryIds) {
        customPrefs[`items-${libId}-Folder-sortby`] = 'ProductionYear,PremiereDate,SortName';
        customPrefs[`items-${libId}-Folder-sortorder`] = 'Descending';
      }

      await requestApi(`${endpoints.mobile}?userId=${user.Id}&client=emby`, request, {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({ ...displayPreferences, CustomPrefs: customPrefs })
      });
    }

    const viewsResponse = await requestApi(`/UserViews?includeHidden=false`, request, {
      method: 'GET',
      requiresAuth: true
    });
    const viewsData = await viewsResponse.json();
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

/**
 * POST route handler
 */
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
