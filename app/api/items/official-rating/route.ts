import { catchError, requestApi } from '@/app/api/helpers';
import { JellyfinResponse } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';
import { MPARatings } from '../../constants';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const libraryId = request.nextUrl.searchParams.get('libraryId');
    const searchQuery = request.nextUrl.searchParams.get('query')?.trim() ?? null;

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '30', 10);
    const page = Math.max(parseInt(request.nextUrl.searchParams.get('page') || '0', 10), 0);

    if (searchQuery) {
      const res = await requestApi(
        `/Items?${userId}&limit=800&recursive=true&searchTerm=${searchQuery}&includeItemTypes=Movie&includeItemTypes=Series`,
        request,
        { method: 'GET', requiresAuth: true }
      );

      if (!res.ok)
        return NextResponse.json(
          { error: `Search failed with code ${res.status}` },
          { status: res.status }
        );

      const data: JellyfinResponse = await res.json();

      const MPAARating = new Set(MPARatings.map((r) => r.value));

      const results = data.Items.map((item) => {
        const primaryTag = item?.ImageTags?.Primary ?? null;

        return {
          Id: item.Id,
          Name: item.Name,
          Poster: primaryTag,
          BlurHash: primaryTag ? (item?.ImageBlurHashes?.Primary?.[primaryTag] ?? null) : null,
          Src: primaryTag ? `Items/${item.Id}/Images/Primary` : null,
          OfficialRating: MPAARating.has(item.OfficialRating ?? '') ? item.OfficialRating : ''
        };
      });

      return NextResponse.json(
        {
          page,
          perPage: limit,
          totalAvailable: data.TotalRecordCount,
          totalFiltered: results.length,
          results
        },
        { status: 200 }
      );
    }

    let totalAvailable = 0;
    let startIndex = 0;

    const filteredItems: JellyfinResponse['Items'] = [];

    const needed = (page + 1) * limit;

    while (filteredItems.length < needed) {
      const res = await requestApi(
        `/Users/${userId}/Items?StartIndex=${startIndex}&Limit=${limit}&ImageTypeLimit=1&ParentId=${libraryId}&SortOrder=Descending`,
        request,
        { method: 'GET', requiresAuth: true }
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to retrieve data. Server response code: ${res.status}` },
          { status: res.status }
        );
      }

      const data: JellyfinResponse = await res.json();
      const items = data.Items;
      totalAvailable = data.TotalRecordCount || totalAvailable;

      if (!items || items.length === 0) break;

      filteredItems.push(...items);
      startIndex += limit;

      if (startIndex >= totalAvailable) break;
    }

    const start = page * limit;
    const end = start + limit;
    const paginatedResults = filteredItems.slice(start, end);
    const MPAARating = new Set(MPARatings.map((r) => r.value));

    const finalResults = paginatedResults.map((item) => {
      const primaryTag = item?.ImageTags?.Primary ?? null;

      return {
        Id: item.Id,
        Name: item.Name,
        Poster: primaryTag,
        BlurHash: primaryTag ? (item?.ImageBlurHashes?.Primary?.[primaryTag] ?? null) : null,
        Src: primaryTag ? `Items/${item.Id}/Images/Primary` : null,
        OfficialRating: MPAARating.has(item.OfficialRating ?? '') ? item.OfficialRating : ''
      };
    });

    return NextResponse.json(
      {
        page,
        perPage: limit,
        totalAvailable,
        totalFiltered: filteredItems.length,
        results: finalResults
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
