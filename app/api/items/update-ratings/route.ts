import { catchError, requestApi } from '@/app/api/helpers';
import { JellyfinItem } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

type RatingUpdate = {
  ItemId: string;
  Rating: string;
};

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('UserId');
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected an array of items' }, { status: 400 });
    }

    for (const item of body as RatingUpdate[]) {
      const { ItemId, Rating } = item;

      if (!ItemId) continue;

      // Fetch current item
      const getItem = await requestApi(`/Items/${ItemId}?userId=${userId}`, request, {
        method: 'GET',
        requiresAuth: true
      });

      if (!getItem.ok) {
        console.log('✗ Failed to fetch item:', ItemId, await getItem.text());
        continue;
      }

      if (!getItem.ok) continue;

      const existingItem: JellyfinItem = await getItem.json();

      // Update OfficialRating
      const updateItem = await requestApi(`/Items/${ItemId}`, request, {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({
          ...existingItem,
          OfficialRating: Rating,
          LockedFields: ['OfficialRating']
        })
      });

      if (!updateItem.ok) {
        console.log('✗ Failed to update rating for: ', existingItem.Name);
        continue;
      }

      console.log(`✓ Updated ${existingItem.Name} with rating ${Rating}`);
    }

    return NextResponse.json({ message: 'Items updated successfully' }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
