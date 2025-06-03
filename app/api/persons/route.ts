import { catchError, fetchApi } from '@/app/api/helpers';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

const PROCESSED_PERSONS_FILE = 'app/db/faceless';

// Helper function to read processed persons from file
function readProcessedPersons(): Set<string> {
  try {
    if (fs.existsSync(PROCESSED_PERSONS_FILE)) {
      const content = fs.readFileSync(PROCESSED_PERSONS_FILE, 'utf-8');
      return new Set(
        content
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      );
    }
  } catch (error) {
    console.error('Error reading processed persons file:', error);
  }
  return new Set();
}

// Helper function to write processed persons to file
function writeProcessedPerson(personId: string) {
  try {
    fs.appendFileSync(PROCESSED_PERSONS_FILE, `${personId}\n`);
  } catch (error) {
    console.error('Error writing to processed persons file:', error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const forceFlag = request.nextUrl.searchParams.get('force') === 'true';

    // Read already processed persons
    const processedPersons = forceFlag ? new Set<string>() : readProcessedPersons();

    // Get all persons
    const personsResponse = await fetchApi('/Persons', request, {
      method: 'GET',
      requiresAuth: true
    });

    if (!personsResponse.ok) {
      return NextResponse.json(
        {
          error: `Failed to retrieve person data. Server response code: ${personsResponse.status}`
        },
        { status: personsResponse.status }
      );
    }

    const personsData = await personsResponse.json();
    const allPersons = personsData.Items ?? [];
    const totalPersons = allPersons.length;

    // Filter persons based on force flag and processed status
    let personsToProcess;
    if (forceFlag) {
      personsToProcess = [...allPersons].sort((a, b) => a.Id.localeCompare(b.Id));
    } else {
      personsToProcess = allPersons
        .filter(
          (person: { ImageTags: {}; Id: string }) =>
            (!person.ImageTags || Object.keys(person.ImageTags).length === 0) &&
            !processedPersons.has(person.Id)
        )
        .sort((a: { Id: string }, b: { Id: any }) => a.Id.localeCompare(b.Id));
    }

    const personsToProcessCount = personsToProcess.length;
    let processedCount = 0;
    let consecutiveErrors = 0;
    const results = [];

    // Process persons sequentially
    for (const person of personsToProcess) {
      try {
        const response = await fetchApi(`/Users/${userId}/Items/${person.Id}`, request, {
          method: 'GET',
          requiresAuth: true
        });

        if (!response.ok) {
          throw new Error(`Server response code: ${response.status}`);
        }

        const personData = await response.json();
        processedCount++;
        consecutiveErrors = 0;

        // Write to file only if successful
        writeProcessedPerson(person.Id);

        results.push({
          id: person.Id,
          name: person.Name,
          status: 'success',
          hasImageNow: !!personData.ImageTags
        });

        console.log(`✓ ${person.Name} refreshed. ${processedCount} of ${personsToProcessCount}`);

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        consecutiveErrors++;
        processedCount++;

        results.push({
          id: person.Id,
          name: person.Name,
          status: 'failed',
          error
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
          ? `Processing completed for ${processedCount} of ${personsToProcessCount} persons (force mode)`
          : `Processing completed for ${processedCount} of ${personsToProcessCount} persons without images`,
        details: {
          totalPersons,
          missingImages: allPersons.filter((p: { ImageTags: any }) => !p.ImageTags).length,
          processedCount,
          forceFlagUsed: forceFlag,
          consecutiveErrorsOccurred: consecutiveErrors,
          results,
          skippedPreviouslyProcessed: forceFlag
            ? 0
            : allPersons.length - personsToProcess.length - (totalPersons - allPersons.length)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Endpoint error:', error);
    return catchError(error);
  }
}
