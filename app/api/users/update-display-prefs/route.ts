import { catchError, fetchApi } from '@/app/api/helpers';
import { CustomPreferences } from '@/app/api/types';
import { getLibraries, libraries } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

export async function updateUserDisplayPreferences(request: NextRequest, userId?: string) {
  try {
    const endpoint = '/DisplayPreferences/usersettings';
    const displayPreferences: CustomPreferences = await request.json();

    // Add library-specific preferences
    getLibraries(libraries.standard).forEach((libraryId) => {
      const cleanId = libraryId.trim();
      if (!cleanId) return;

      (displayPreferences.CustomPrefs as any)[`${cleanId}-series`] =
        '{"SortBy":"PremiereDate,SortName","SortOrder":"Descending"}';
      (displayPreferences.CustomPrefs as any)[`${cleanId}-movies`] =
        '{"SortBy":"PremiereDate,SortName,ProductionYear","SortOrder":"Descending"}';
      (displayPreferences.CustomPrefs as any)[`${cleanId}-Folder-sortorder`] = 'Descending';
      (displayPreferences.CustomPrefs as any)[`${cleanId}-Folder-sortby`] =
        'ProductionYear,PremiereDate,SortName';
    });

    if (userId) {
      await fetchApi(`${endpoint}?userId=${userId}&client=emby`, request, {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify(displayPreferences)
      });

      return NextResponse.json({ status: 200 });
    }

    // Get all users
    const usersResponse = await fetchApi('/Users', request, {
      method: 'GET',
      requiresAuth: true
    });
    const users = await usersResponse.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ message: 'No users found' }, { status: 404 });
    }

    // Process users sequentially
    const results: Array<{
      userId: string;
      username: string;
      success: boolean;
      status?: number;
      error?: string;
    }> = [];

    for (const user of users) {
      try {
        const response = await fetchApi(`${endpoint}?userId=${user.Id}&client=emby`, request, {
          method: 'POST',
          requiresAuth: true,
          body: JSON.stringify(displayPreferences)
        });

        results.push({
          userId: user.Id,
          username: user.Name,
          success: response.ok,
          status: response.status
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          userId: user.Id,
          username: user.Name,
          success: false,
          error: errorMessage
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Display preferences update completed',
        totalUsers: users.length,
        processedUsers: results.length,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Endpoint error:', error);
    return catchError(error);
  }
}

export async function POST(request: NextRequest) {
  return updateUserDisplayPreferences(request);
}
