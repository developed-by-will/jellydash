import { catchError, fetchApi } from '@/app/api/helpers';
import { SearchItemsType } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized request' }, { status: 403 });
    }

    //Get movie posters
    const moviesEndpoint = `/Items?userId=${userId}&limit=100&recursive=true&searchTerm=alie&fields=PrimaryImageAspectRatio&fields=CanDelete&fields=MediaSourceCount&includeItemTypes=Movie&imageTypeLimit=1&enableTotalRecordCount=false`;

    const getMoviePosters = await fetchApi(moviesEndpoint, request, {
      method: 'GET',
      requiresAuth: true
    });

    const posters: SearchItemsType = await getMoviePosters.json();

    //Get show posters
    const showsEndpoint = `/Items?userId=${userId}&limit=100&recursive=true&searchTerm=alie&fields=PrimaryImageAspectRatio&fields=CanDelete&fields=MediaSourceCount&includeItemTypes=Series&imageTypeLimit=1&enableTotalRecordCount=false`;

    const getShowsPosters = await fetchApi(showsEndpoint, request, {
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
        Poster: posterId,
        BlurHash: item.ImageBlurHashes.Primary[posterId],
        Src: `Items/${item.Id}/Images/Primary?fillHeight=380&fillWidth=253&quality=96`
      };
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    catchError(error);
  }
}
