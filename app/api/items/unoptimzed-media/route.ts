import { catchError, requestApi } from '@/app/api/helpers';
import { JellyfinItemsResponse } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const itemType = request.nextUrl.searchParams.get('IncludeItemTypes');
    const limitParam = request.nextUrl.searchParams.get('limit') || '10';
    const pageParam = request.nextUrl.searchParams.get('page') || '1';
    const page = Math.max(parseInt(pageParam, 10), 1);
    const limit = parseInt(limitParam);

    if (!itemType) {
      return NextResponse.json(
        { error: 'IncludeItemTypes parameter is required' },
        { status: 400 }
      );
    }

    let totalAvailable = 0;
    let startIndex = 0;
    const filteredItems: any[] = [];

    // Fetch batches until we have enough filtered results for the requested page
    while (filteredItems.length < page * limit) {
      const getItems = await requestApi(
        `/Items?IncludeItemTypes=${itemType}&Recursive=true&StartIndex=${startIndex}&Limit=${limit}&Fields=MediaStreams,MediaSources`,
        request,
        {
          method: 'GET',
          requiresAuth: true
        }
      );

      if (!getItems.ok) {
        return NextResponse.json(
          {
            error: `Failed to retrieve ${itemType} data. Server response code: ${getItems.status}`
          },
          { status: getItems.status }
        );
      }

      const data: JellyfinItemsResponse = await getItems.json();
      const allItems = data.Items;
      totalAvailable = data.TotalRecordCount || totalAvailable;

      if (!allItems || allItems.length === 0) {
        break; // no more items to fetch
      }

      for (const item of allItems) {
        const mediaSource = item.MediaSources?.[0];
        const container = mediaSource?.Container;
        const streams = item.MediaStreams || [];

        const videoStream = streams.find((s: any) => s.Type === 'Video');

        // Apply your filter
        const isNotOptimized =
          (container !== 'mp4' && container !== 'mkv') ||
          (videoStream && videoStream.Codec !== 'h264');

        if (isNotOptimized) {
          const width = videoStream?.Width || 0;
          const height = videoStream?.Height || 0;

          // Treat as fullHD if width >= 1900 OR height >= 1000 (looser tolerance)
          const fullHD = width >= 1900 || height >= 1000;

          filteredItems.push({
            name: item.Name,
            container,
            stream: videoStream?.Codec,
            path: mediaSource?.Path,
            width,
            height,
            fullHD
          });
        }
      }

      startIndex += limit;

      // Stop if we've fetched all available items
      if (startIndex >= totalAvailable) break;
    }

    // Paginate filtered results
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = filteredItems.slice(start, end);

    return NextResponse.json(
      {
        page,
        perPage: limit,
        totalAvailable,
        totalFiltered: filteredItems.length,
        results: paginatedResults
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
