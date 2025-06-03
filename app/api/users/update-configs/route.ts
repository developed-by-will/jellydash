import {
  catchError,
  fetchApi,
  getExcludedLibraryNames,
  getLibrariesIds,
  getLibraryIdsByName,
  parseLibraries
} from '@/app/api/helpers';
import { User } from '@/app/api/types';
import { libraries } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

export async function updateUserConfigurations(request: NextRequest) {
  try {
    const body = await request.json();
    const { OrderedViews, SubtitleLanguagePreference } = body;

    // Get all standard libraries from the file
    const standardLibraries = parseLibraries(libraries.standard);

    // Convert standard libraries to the same format as OrderedViews ("id->name")
    const standardLibraryStrings = standardLibraries.map((lib) => `${lib.id}->${lib.name}`);

    // Check if all standard libraries are present in OrderedViews
    const missingLibraries = standardLibraryStrings.filter(
      (libString) => !OrderedViews.includes(libString)
    );

    if (missingLibraries.length > 0) {
      // Convert back to objects for the response
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

    // Get all users
    const getUsersResponse = await fetchApi('/Users', request, {
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
          // Get user details to check if they're an admin
          const userDetailsResponse = await fetchApi(`/Users/${user.Id}`, request, {
            method: 'GET',
            requiresAuth: true
          });

          if (!userDetailsResponse.ok) {
            throw new Error('Failed to fetch user details');
          }

          const userDetails = await userDetailsResponse.json();
          const isAdmin = userDetails.Policy.IsAdministrator === true;

          // Get appropriate libraries based on admin status
          const standardLibraries = parseLibraries(libraries.standard);
          const adminLibraries = isAdmin ? parseLibraries(libraries.admin) : [];
          const userLibraries = [...standardLibraries, ...adminLibraries];

          const excludedNames = getExcludedLibraryNames();
          const excludeFromHome = getLibraryIdsByName(userLibraries, excludedNames);

          const userConfiguration = {
            PlayDefaultAudioTrack: true,
            SubtitleLanguagePreference: SubtitleLanguagePreference ?? 'eng',
            DisplayMissingEpisodes: false,
            GroupedFolders: [],
            SubtitleMode: 'Default',
            DisplayCollectionsView: false,
            EnableLocalPassword: false,
            OrderedViews: getLibrariesIds(OrderedViews),
            LatestItemsExcludes: excludeFromHome,
            MyMediaExcludes: [],
            HidePlayedInLatest: true,
            RememberAudioSelections: true,
            RememberSubtitleSelections: true,
            EnableNextEpisodeAutoPlay: true
          };

          const updateResponse = await fetchApi(`/Users/${user.Id}/Configuration`, request, {
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

    // Count successful updates
    const successfulUpdates = updateResults.filter((result) => result.success).length;
    const failedUpdates = updateResults.filter((result) => !result.success);

    return NextResponse.json(
      {
        message: `Configuration update completed`,
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

export async function POST(request: NextRequest) {
  return updateUserConfigurations(request);
}
