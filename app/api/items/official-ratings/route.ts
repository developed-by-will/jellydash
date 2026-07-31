import { catchError, requestApi } from '@/app/api/helpers';
import { JellyfinItem, JellyfinItemsResponse, VirtualFolderType } from '@/app/api/types';
import { getRatings } from '@/app/db/ratings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const page = request.nextUrl.searchParams.get('page') ?? '0';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '30');
    const startIndex = parseInt(page) * limit;

    // Get VirtualFolders
    const virtualFoldersRes = await requestApi(`/Library/VirtualFolders`, request, {
      method: 'GET',
      requiresAuth: true
    });
    const virtualFolders: VirtualFolderType[] = await virtualFoldersRes.json();

    // Filter for specific libraries
    const targetLibraries = ['Animação', 'Documentários', 'Filmes', 'Séries', 'Séries PT'];
    const filteredLibraries = virtualFolders
      .filter((folder) => {
        const hasMovieOrSeriesType = folder.LibraryOptions?.TypeOptions?.some(
          (typeOption) => typeOption.Type === 'Movie' || typeOption.Type === 'Series'
        );
        const hasMatchingName = targetLibraries.includes(folder.Name);
        return hasMovieOrSeriesType && hasMatchingName;
      })
      .map((folder) => ({
        id: folder.ItemId,
        name: folder.Name
      }));

    console.log('FILTERED LIBRARIES:', filteredLibraries);

    // Fetch ALL items from each library (no pagination in individual calls)
    const allItems: JellyfinItem[] = [];
    let moviesFetched = 0;
    let seriesFetched = 0;

    for (const library of filteredLibraries) {
      const itemsRes = await requestApi(
        `/Users/${userId}/Items?Recursive=true&enableUserData=false&Fields=DateCreated,OfficialRating&ParentId=${library.id}&IncludeItemTypes=Movie,Series&SortBy=DateCreated&SortOrder=Descending`,
        request,
        { method: 'GET', requiresAuth: true }
      );

      if (itemsRes.ok) {
        const itemsData: JellyfinItemsResponse = await itemsRes.json();
        if (itemsData.Items) {
          allItems.push(...itemsData.Items);

          // Count movies and series
          const movieCount = itemsData.Items.filter((item) => item.Type === 'Movie').length;
          const seriesCount = itemsData.Items.filter((item) => item.Type === 'Series').length;

          moviesFetched += movieCount;
          seriesFetched += seriesCount;

          console.log(
            `Fetched ${itemsData.Items.length} items from library: ${library.name} (Movies: ${movieCount}, Series: ${seriesCount})`
          );
        }
      }
    }

    // Extract allowed rating values for easier checking
    const allowedRatings = getRatings().map((rating) => rating.value);

    // Sort items: first by whether they have allowed ratings, then by DateCreated
    allItems.sort((a, b) => {
      // Check if items have allowed ratings
      const aHasRating = a.OfficialRating && allowedRatings.includes(a.OfficialRating);
      const bHasRating = b.OfficialRating && allowedRatings.includes(b.OfficialRating);

      // Primary sort: items without ratings come first
      if (aHasRating && !bHasRating) {
        return 1; // b comes first (no rating)
      } else if (!aHasRating && bHasRating) {
        return -1; // a comes first (no rating)
      } else if (!aHasRating && !bHasRating) {
        // Both have no ratings - sort by DateCreated (newest first)
        const dateA = a.DateCreated ? new Date(a.DateCreated).getTime() : 0;
        const dateB = b.DateCreated ? new Date(b.DateCreated).getTime() : 0;
        return dateB - dateA;
      } else {
        // Both have ratings - sort by DateCreated (newest first)
        const dateA = a.DateCreated ? new Date(a.DateCreated).getTime() : 0;
        const dateB = b.DateCreated ? new Date(b.DateCreated).getTime() : 0;
        return dateB - dateA;
      }
    });

    console.log(
      `Total items fetched: ${allItems.length} (Movies: ${moviesFetched}, Series: ${seriesFetched})`
    );

    // Apply pagination after global sorting
    const paginatedItems = allItems.slice(startIndex, startIndex + limit);

    // Get Name, ID, DateCreated, and OfficialRating from each item
    const Items: JellyfinItem[] = paginatedItems.map((item) => ({
      Name: item.Name,
      Id: item.Id,
      DateCreated: item.DateCreated,
      OfficialRating: item.OfficialRating ?? ''
    }));

    return NextResponse.json(
      {
        Items: Items,
        TotalRecordCount: allItems.length, // Total count of all items (not just paginated)
        MovieCount: moviesFetched,
        SeriesCount: seriesFetched,
        Page: parseInt(page),
        TotalPages: Math.ceil(allItems.length / limit)
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
