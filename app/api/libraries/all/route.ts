import { catchError, fetchApi } from '@/app/api/helpers';
import { LibraryItem } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const info = request.nextUrl.searchParams.get('info');

    const getLibraries = await fetchApi('/Library/VirtualFolders', request, {
      method: 'GET',
      requiresAuth: true
    });

    if (info === 'full') {
      const libraries = await getLibraries.json();

      return NextResponse.json(libraries, { status: 200 });
    }

    if (info === 'compact') {
      const libraries: LibraryItem[] = await getLibraries.json();

      // Return ItemID + '->' + Name
      return NextResponse.json(
        libraries.map((library) => `${library.ItemId}->${library.Name}`),
        { status: 200 }
      );
    }
  } catch (error) {
    catchError(error);
  }
}
