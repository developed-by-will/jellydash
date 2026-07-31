import { catchError, requestApi } from '@/app/api/helpers';
import { JellyfinItemsResponse } from '@/app/api/types';
import { getRatings } from '@/app/db/ratings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get('page');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const query = request.nextUrl.searchParams.get('query')?.toLowerCase() ?? null;

    const pageStr = page ?? '0';
    const startIndex = parseInt(pageStr) * limit;

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Fetch all items first
    const allItemsRes = await requestApi(
      `/Items?Recursive=true&IncludeItemTypes=Series,Movie&Fields=OfficialRating,ImageTags,ImageBlurHashes&searchTerm=${encodeURIComponent(query)}`,
      request,
      { method: 'GET', requiresAuth: true }
    );

    if (!allItemsRes.ok) {
      return NextResponse.json(
        { error: `Failed to retrieve data. Server response code: ${allItemsRes.status}` },
        { status: allItemsRes.status }
      );
    }

    const allItemsData: JellyfinItemsResponse = await allItemsRes.json();
    const allItems = allItemsData.Items ?? [];

    const totalCount = allItems.length;
    const ratings = getRatings();

    // Sort items
    const sortedItems = allItems.toSorted((a, b) => {
      const aHasRating = ratings.some((r) => r.value === a.OfficialRating);
      const bHasRating = ratings.some((r) => r.value === b.OfficialRating);

      if (!aHasRating && bHasRating) return -1;
      if (aHasRating && !bHasRating) return 1;
      return 0;
    });

    // Paginate
    const paginatedItems = sortedItems.slice(startIndex, startIndex + limit);

    // Fetch metadata for paginated items
    const ids = paginatedItems.map((i) => i.Id).join(',');

    if (ids) {
      const metaRes = await requestApi(
        `/Items?Ids=${ids}&Fields=OfficialRating,LockedFields,ImageTags,ImageBlurHashes`,
        request,
        { method: 'GET', requiresAuth: true }
      );

      const metaData: JellyfinItemsResponse = await metaRes.json();
      const metadataMap = new Map(metaData.Items.map((item) => [item.Id, item]));

      const finalResults = paginatedItems.map((item) => {
        const meta = metadataMap.get(item.Id) || item;
        const primaryTag = meta?.ImageTags?.Primary ?? null;
        const hasMatchingRating = ratings.some((r) => r.value === meta?.OfficialRating);

        return {
          Id: item.Id,
          Name: meta?.Name ?? item.Name,
          Poster: primaryTag,
          BlurHash: primaryTag ? (meta?.ImageBlurHashes?.Primary?.[primaryTag] ?? null) : null,
          Src: primaryTag ? `Items/${item.Id}/Images/Primary` : null,
          OfficialRating: hasMatchingRating ? meta?.OfficialRating : '',
          AtualOfficialRating: meta?.OfficialRating ?? '',
          fullItem: meta
        };
      });

      return NextResponse.json(
        {
          page,
          perPage: limit,
          TotalItems: totalCount,
          TotalPages: Math.ceil(totalCount / limit),
          Items: finalResults
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return catchError(error);
  }
}
