import { catchError, fetchApi, getAdminLibrariesIds } from '@/app/api/helpers';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { LibraryItem } from '../../types';

export async function PATCH(request: NextRequest) {
  try {
    const getLibraries = await fetchApi('/Library/VirtualFolders', request, {
      method: 'GET',
      requiresAuth: true
    });

    const librariesResponse: LibraryItem[] = await getLibraries.json();

    // Filter out admin libraries
    const adminLibrariesIds = getAdminLibrariesIds();
    const filteredLibraries = librariesResponse.filter(
      (library) => !adminLibrariesIds.includes(library.ItemId)
    );

    const standardLibraries = 'app/db/libraries/standard';

    // Write ids to file
    if (fs.existsSync(standardLibraries)) {
      fs.writeFileSync(
        standardLibraries,
        filteredLibraries.map((library) => `${library.ItemId}->${library.Name}`).join('\n')
      );
    }

    return NextResponse.json({ filteredLibraries: filteredLibraries }, { status: 200 });
  } catch (error) {
    catchError(error);
  }
}
