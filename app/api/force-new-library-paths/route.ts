import { fetchApi } from '@/app/api/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { baseLibraryConfig } from './baseLibraryOptions';
import { allowedSubtitleValues } from './types';

export async function PATCH(request: NextRequest) {
  const library = request.nextUrl.searchParams.get('name');
  const body = await request.json();
  const { PathInfos, PreferredMetadataLanguage, MetadataCountryCode, AllowEmbeddedSubtitles } =
    body;

  if (!library) {
    return NextResponse.json({ message: 'Library name is required' }, { status: 400 });
  }

  if (!allowedSubtitleValues.includes(AllowEmbeddedSubtitles)) {
    return NextResponse.json(
      {
        message: `Invalid AllowEmbeddedSubtitles value. Must be one of: ${allowedSubtitleValues.join(
          ', '
        )}`
      },
      { status: 400 }
    );
  }

  try {
    const remove = await fetchApi(
      `/Library/VirtualFolders?refreshLibrary=true&name=${library}`,
      request,
      {
        method: 'DELETE',
        requiresAuth: true
      }
    );

    if (remove.status === 204 || remove.status === 404) {
      const encodedLibraryName = encodeURIComponent(library);
      const normalizedPaths = PathInfos.map((path: string) => ({ Path: path }));

      const add = await fetchApi(
        `/Library/VirtualFolders?refreshLibrary=true&name=${encodedLibraryName}`,
        request,
        {
          method: 'POST',
          requiresAuth: true,
          body: {
            LibraryOptions: {
              ...baseLibraryConfig.LibraryOptions,
              PreferredMetadataLanguage,
              MetadataCountryCode,
              AllowEmbeddedSubtitles,
              PathInfos: normalizedPaths
            }
          }
        }
      );

      if (add.status === 204) {
        return NextResponse.json({ message: 'Library added/updated' }, { status: 200 });
      }
    }

    return NextResponse.json({ message: `Request failed, check payload.` }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
