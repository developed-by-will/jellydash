import { catchError, requestApi } from '@/app/api/helpers';
import { SearchItemsType } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const searchTerm = request.nextUrl.searchParams.get('searchTerm');

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 403 });
    }

    // Get movie posters
    const moviesEndpoint = `/Items?userId=${userId}&limit=100&recursive=true&searchTerm=${searchTerm}&fields=PrimaryImageAspectRatio,CanDelete,MediaSourceCount,Overview&includeItemTypes=Movie&imageTypeLimit=1&enableTotalRecordCount=false`;

    const getMoviePosters = await requestApi(moviesEndpoint, request, {
      method: 'GET',
      requiresAuth: true
    });

    if (!getMoviePosters.ok) {
      const errText = await getMoviePosters.text();
      throw new Error(`Failed to fetch movie posters: ${errText}`);
    }

    const posters: SearchItemsType = await getMoviePosters.json();

    // Get show posters
    const showsEndpoint = `/Items?userId=${userId}&limit=100&recursive=true&searchTerm=${searchTerm}&fields=PrimaryImageAspectRatio,CanDelete,MediaSourceCount,Overview&includeItemTypes=Series&imageTypeLimit=1&enableTotalRecordCount=false`;

    const getShowsPosters = await requestApi(showsEndpoint, request, {
      method: 'GET',
      requiresAuth: true
    });

    const showsPosters: SearchItemsType = await getShowsPosters.json();

    posters.Items.push(...showsPosters.Items);

    const results = posters.Items.map((item) => {
      const posterId = item.ImageTags.Primary;
      return {
        Id: item.Id,
        Name: item.Name,
        Poster: posterId ?? null,
        BlurHash: posterId ? (item.ImageBlurHashes?.Primary?.[posterId] ?? null) : null,
        Src: posterId ? `Items/${item.Id}/Images/Primary` : null,
        OfficialRating: item.OfficialRating,
        Overview: item.Overview
      };
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error in /api/items/search:', error);
    catchError(error); // still keep your helper
    return NextResponse.json(
      { message: 'Failed to fetch search results', error: String(error) },
      { status: 500 }
    );
  }
}
