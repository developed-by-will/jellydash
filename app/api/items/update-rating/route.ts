import { catchError, requestApi } from '@/app/api/helpers';
import { JellyfinResponse } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';
import { MPARatings } from '../../constants';

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('UserId');
    const itemId = request.nextUrl.searchParams.get('ItemId');
    const rating = request.nextUrl.searchParams.get('Rating');

    if (!itemId) {
      return NextResponse.json({ error: 'ItemId parameter is required' }, { status: 400 });
    }

    const isValidRating = rating ? MPARatings.some((r) => r.value === rating) : false;

    if (!isValidRating) {
      return NextResponse.json({ error: 'Invalid or missing Rating parameter' }, { status: 400 });
    }

    const getItem = await requestApi(`/Items/${itemId}?userId=${userId}`, request, {
      method: 'GET',
      requiresAuth: true
    });

    if (!getItem.ok) {
      return NextResponse.json(
        {
          error: `Failed to retrieve data. Server response code: ${getItem.status}`
        },
        { status: getItem.status }
      );
    }

    const item: JellyfinResponse = await getItem.json();

    const updateItem = await requestApi(`/Items/${itemId}`, request, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ ...item, OfficialRating: rating })
    });

    if (!updateItem.ok) {
      return NextResponse.json(
        {
          error: `Failed to update data. Server response code: ${getItem.status}`
        },
        { status: getItem.status }
      );
    }

    return NextResponse.json(
      {
        message: 'Item updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
