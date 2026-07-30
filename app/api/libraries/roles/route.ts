import { catchError, parseLibraries, requestApi } from '@/app/api/helpers';
import { LibraryItem } from '@/app/api/types';
import { libraries, PACKAGE_LIBRARY_FILE, ToggleableRole } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

export type LibraryWithRoles = {
  id: string;
  name: string;
  roles: ToggleableRole[];
  excluded: boolean;
};

export async function GET(request: NextRequest) {
  try {
    const getVirtualFolders = await requestApi('/Library/VirtualFolders', request, {
      method: 'GET',
      requiresAuth: true
    });

    const virtualFolders: LibraryItem[] = await getVirtualFolders.json();

    // Read each role's file fresh on every request (not the PACKAGES object, which is
    // computed once at module load and would show stale data right after a toggle). Each
    // role now has its own independent file (see PACKAGE_LIBRARY_FILE) - no cross-file
    // exclusion, a library can be granted to any combination of roles.
    const packageNames = Object.keys(PACKAGE_LIBRARY_FILE) as ToggleableRole[];
    const roleMembership = Object.fromEntries(
      packageNames.map((packageName) => [
        packageName,
        parseLibraries(PACKAGE_LIBRARY_FILE[packageName]).map((lib) => lib.id)
      ])
    ) as Record<ToggleableRole, string[]>;

    const excludedIds = parseLibraries(libraries.excluded).map((lib) => lib.id);

    const librariesWithRoles: LibraryWithRoles[] = virtualFolders.map((library) => ({
      id: library.ItemId,
      name: library.Name,
      roles: packageNames.filter((packageName) => roleMembership[packageName].includes(library.ItemId)),
      excluded: excludedIds.includes(library.ItemId)
    }));

    return NextResponse.json(librariesWithRoles, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
