import { catchError, getExcludedLibraryNames } from '@/app/api/helpers';
import fs from 'fs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const file = 'app/db/libraries/excluded';

    if (fs.existsSync(file)) {
      const excludedLibraries = getExcludedLibraryNames();

      return NextResponse.json({ excludedLibraries }, { status: 200 });
    }

    return NextResponse.json({ message: 'There are no excluded libraries' }, { status: 200 });
  } catch (error) {
    catchError(error);
  }
}
