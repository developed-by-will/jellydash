import { appendLibraryLine, catchError, parseLibraries } from '@/app/api/helpers';
import { PACKAGE_LIBRARY_FILE, PackageName, PACKAGES } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    const Package: PackageName = body.package;

    // Check if package exists
    if (!PACKAGES[Package]) {
      return NextResponse.json({ message: `Package does not exist` }, { status: 400 });
    }

    // PREMIUM has no library file of its own - it always mirrors Standard's list (see
    // app/db/packages.ts) - so there's nothing to add a library to here.
    if (!(Package in PACKAGE_LIBRARY_FILE)) {
      return NextResponse.json(
        { message: `${Package} has no library list of its own - add to STANDARD instead` },
        { status: 400 }
      );
    }

    const file = PACKAGE_LIBRARY_FILE[Package as keyof typeof PACKAGE_LIBRARY_FILE];
    const alreadyPresent = parseLibraries(file).some((lib) => lib.id === id);

    if (alreadyPresent) {
      return NextResponse.json({ message: 'Library already exists' }, { status: 400 });
    }

    appendLibraryLine(file, id, name);

    return NextResponse.json(parseLibraries(file), { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
