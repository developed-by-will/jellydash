import { catchError, parseLibraries, requestApi } from '@/app/api/helpers';
import { LibraryItem } from '@/app/api/types';
import {
  EXCLUDED_LIBRARIES_PATH,
  ensureDefaultRoles,
  getRoleLibraryFile,
  getRoles
} from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

export type LibraryWithRoles = {
  id: string;
  name: string;
  roles: string[];
  excluded: boolean;
};

export async function GET(request: NextRequest) {
  try {
    const getVirtualFolders = await requestApi('/Library/VirtualFolders', request, {
      method: 'GET',
      requiresAuth: true
    });

    const virtualFolders: LibraryItem[] = await getVirtualFolders.json();

    // First sync ever on this install (roles.json doesn't exist yet) - seed the default
    // roles/files from whatever Jellyfin currently reports. No-op on every subsequent call.
    ensureDefaultRoles(virtualFolders.map((lib) => ({ id: lib.ItemId, name: lib.Name })));

    // Read each role's file fresh on every request (not a cached object) so this reflects
    // toggles/renames immediately.
    const roles = getRoles();
    const roleMembership = Object.fromEntries(
      roles.map((role) => [role.id, parseLibraries(getRoleLibraryFile(role.id)).map((lib) => lib.id)])
    ) as Record<string, string[]>;

    const excludedIds = parseLibraries(EXCLUDED_LIBRARIES_PATH).map((lib) => lib.id);

    const librariesWithRoles: LibraryWithRoles[] = virtualFolders.map((library) => ({
      id: library.ItemId,
      name: library.Name,
      roles: roles
        .map((role) => role.id)
        .filter((roleId) => roleMembership[roleId].includes(library.ItemId)),
      excluded: excludedIds.includes(library.ItemId)
    }));

    return NextResponse.json(librariesWithRoles, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
