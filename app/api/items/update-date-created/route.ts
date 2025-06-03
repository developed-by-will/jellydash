import { catchError, fetchApi } from '@/app/api/helpers';
import { JellyfinResponse } from '@/app/api/types';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

const PROCESSED_ITEMS_FILE = 'app/db';

// Helper function to read items from a file
function readProcessedItems(itemType: string): Set<string> {
  try {
    const filePath = `${PROCESSED_ITEMS_FILE}/${itemType.toLowerCase()}-dates`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return new Set(
        content
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      );
    }
  } catch (error) {
    console.error(`Error reading ${itemType}-dates items file:`, error);
  }
  return new Set();
}

// Helper function to write processed item to file
function writeProcessedItem(itemType: string, itemId: string) {
  try {
    const filePath = `${PROCESSED_ITEMS_FILE}/${itemType.toLowerCase()}-dates`;
    fs.appendFileSync(filePath, `${itemId}\n`);
  } catch (error) {
    console.error(`Error writing to processed ${itemId}:`, error);
  }
}

// eslint-disable-next-line typescript/S3776
export async function PATCH(request: NextRequest) {
  try {
    const itemType = request.nextUrl.searchParams.get('IncludeItemTypes');
    const forceFlag = request.nextUrl.searchParams.get('force') === 'true';

    if (!itemType) {
      return NextResponse.json(
        { error: 'IncludeItemTypes parameter is required' },
        { status: 400 }
      );
    }

    // Read already processed items
    const processedItems = readProcessedItems(itemType);

    // Get all items
    const getItems = await fetchApi(`/Items?IncludeItemTypes=${itemType}&Recursive=true`, request, {
      method: 'GET',
      requiresAuth: true
    });

    if (!getItems.ok) {
      return NextResponse.json(
        {
          error: `Failed to retrieve ${itemType} data. Server response code: ${getItems.status}`
        },
        { status: getItems.status }
      );
    }

    const data: JellyfinResponse = await getItems.json();
    const allItems = data.Items;
    const totalItems = allItems.length;

    // Filter items based on force flag and processed status
    const itemsToProcess = forceFlag
      ? [...allItems].sort((a, b) => a.Id.localeCompare(b.Id))
      : allItems.filter((item) => !processedItems.has(item.Id));

    const itemsProcessCount = itemsToProcess.length;
    let processedItemsCount = 0;
    let consecutiveErrors = 0;
    const results = [];

    // Process updates sequentially to avoid overwhelming the server
    for (const item of itemsToProcess) {
      try {
        // Get complete item data
        const itemData = await fetchApi(`/Items/${item.Id}`, request, {
          method: 'GET',
          requiresAuth: true
        });

        if (!itemData.ok) {
          throw new Error(`Server response code: ${itemData.status}`);
        }

        const fullItemData = await itemData.json();
        processedItemsCount++;
        consecutiveErrors = 0;

        // Update DateCreated if needed
        if (fullItemData.DateCreated !== fullItemData.PremiereDate) {
          await fetchApi(`/Items/${fullItemData.Id}`, request, {
            method: 'POST',
            body: JSON.stringify({ ...fullItemData, DateCreated: fullItemData.PremiereDate }),
            requiresAuth: true
          });
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Write to file only if successful
        writeProcessedItem(itemType, item.Id);

        results.push({
          id: item.Id,
          name: item.Name,
          status: 'success',
          dateCreated: fullItemData.DateCreated
        });

        console.log(`✓ ${item.Name} date updated. ${processedItemsCount} of ${itemsProcessCount}`);
      } catch (error) {
        consecutiveErrors++;
        processedItemsCount++;

        results.push({
          id: item.Id,
          name: item.Name,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });

        if (consecutiveErrors >= 10) {
          results.push({
            status: 'aborted',
            message: 'Too many consecutive errors. Processing stopped.'
          });
          break;
        }
      }
    }

    return NextResponse.json(
      {
        message: forceFlag
          ? `Processing completed for ${processedItemsCount} of ${itemsProcessCount} items (force mode)`
          : `Processing completed for ${processedItemsCount} of ${itemsProcessCount} items`,
        details: {
          totalItems,
          processedItemsCount,
          itemsProcessCount,
          forceFlagUsed: forceFlag,
          consecutiveErrorsOccurred: consecutiveErrors,
          results,
          skippedPreviouslyProcessed: forceFlag ? 0 : totalItems - itemsProcessCount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return catchError(error);
  }
}
