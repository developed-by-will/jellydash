import { catchError, getExcludedLibraryNames } from '@/app/api/helpers';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { updateUserConfigurations } from '../../users/update-configs/route';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { library } = body;

    const file = 'app/db/libraries/excluded';

    // Check if library already exists
    if (fs.existsSync(file)) {
      const fileContent = fs.readFileSync(file, 'utf-8');

      if (fileContent.includes(library)) {
        return NextResponse.json({ message: 'Library already excluded' }, { status: 400 });
      }

      // Appends new library
      fs.appendFileSync(file, library + '\n');

      await UpdateExcludeFromHome(request);

      // Get the list of libraries
      const excludedLibraries = getExcludedLibraryNames();

      return NextResponse.json({ excludedLibraries }, { status: 200 });
    }

    // Creates new file and writes the excluded library
    fs.writeFileSync(file, library + '\n');
    await UpdateExcludeFromHome(request);

    // Get the list of libraries
    const excludedLibraries = getExcludedLibraryNames();

    return NextResponse.json(
      { message: 'List of excluded libraries', excludedLibraries },
      { status: 200 }
    );
  } catch (error) {
    catchError(error);
  }
}

async function UpdateExcludeFromHome(request: NextRequest) {
  return updateUserConfigurations(request);
}
