// app/api/users/update-configs/route.ts
import { catchError, getLibrariesIds, parseLibraries, requestApi } from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { libraries } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Internal helper function to update user configurations.
 * Not exported to avoid TypeScript errors with route handler checks.
 */
async function updateUserConfigurations(request: NextRequest) {
  try {
    const body = await request.json();
    const { OrderedViews, SubtitleLanguagePreference } = body;

    // Get all standard libraries
    const standardLibraries = parseLibraries(libraries.standard);

    // Convert to "id->name" strings for comparison
    const standardLibraryStrings = standardLibraries.map((lib) => `${lib.id}->${lib.name}`);

    // Find missing libraries
    const missingLibraries = standardLibraryStrings.filter(
      (libString) => !OrderedViews.includes(libString)
    );

    if (missingLibraries.length > 0) {
      const missingLibraryObjects = missingLibraries.map((libString) => {
        const [id, name] = libString.split('->');
        return { id, name };
      });

      return NextResponse.json(
        {
          message: 'Some libraries are missing',
          missingLibraries: missingLibraryObjects.map((lib) => lib.name)
        },
        { status: 400 }
      );
    }

    // Fetch all users
    const getUsersResponse = await requestApi('/Users', request, {
      method: 'GET',
      requiresAuth: true
    });

    if (!getUsersResponse.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch users' },
        { status: getUsersResponse.status }
      );
    }

    const users: User[] = await getUsersResponse.json();

    // Update configuration for each user
    const updateResults = await Promise.all(
      users.map(async (user) => {
        try {
          const userDetailsResponse = await requestApi(`/Users/${user.Id}`, request, {
            method: 'GET',
            requiresAuth: true
          });

          if (!userDetailsResponse.ok) throw new Error('Failed to fetch user details');

          const userDetails = await userDetailsResponse.json();
          const isAdmin = userDetails.Policy.IsAdministrator === true;

          const userConfiguration = {
            PlayDefaultAudioTrack: true,
            SubtitleLanguagePreference: SubtitleLanguagePreference ?? 'eng',
            DisplayMissingEpisodes: false,
            GroupedFolders: [],
            SubtitleMode: 'Default',
            DisplayCollectionsView: false,
            EnableLocalPassword: false,
            OrderedViews: getLibrariesIds(OrderedViews),
            MyMediaExcludes: [],
            HidePlayedInLatest: true,
            RememberAudioSelections: true,
            RememberSubtitleSelections: true,
            EnableNextEpisodeAutoPlay: true
          };

          const updateResponse = await requestApi(`/Users/${user.Id}/Configuration`, request, {
            method: 'POST',
            body: JSON.stringify(userConfiguration),
            requiresAuth: true
          });

          return {
            userId: user.Id,
            username: user.Name,
            isAdmin,
            success: updateResponse.ok,
            status: updateResponse.status
          };
        } catch (error) {
          return {
            userId: user.Id,
            username: user.Name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Summarize results
    const successfulUpdates = updateResults.filter((r) => r.success).length;
    const failedUpdates = updateResults.filter((r) => !r.success);

    return NextResponse.json(
      {
        message: 'Configuration update completed',
        details: {
          totalUsers: users.length,
          successfulUpdates,
          failedUpdates: failedUpdates.length,
          adminUsers: updateResults.filter((r) => r.isAdmin).length,
          failedUsers: failedUpdates.map((f) => ({
            userId: f.userId,
            username: f.username,
            error: f.error
          }))
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}

/**
 * POST route handler for updating user configurations.
 */
export async function POST(request: NextRequest) {
  return updateUserConfigurations(request);
}
