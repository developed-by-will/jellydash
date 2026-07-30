import { appendLibraryLine, catchError, parseLibraries, removeLibraryLine } from '@/app/api/helpers';
import { libraries, PACKAGE_LIBRARY_FILE, ToggleableRole } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

export type MembershipList = ToggleableRole | 'EXCLUDED';

function isValidList(value: unknown): value is MembershipList {
  return value === 'EXCLUDED' || (typeof value === 'string' && value in PACKAGE_LIBRARY_FILE);
}

function resolveFile(list: MembershipList): string {
  return list === 'EXCLUDED' ? libraries.excluded : PACKAGE_LIBRARY_FILE[list];
}

// Add a library to a role's (or EXCLUDED's) file.
export async function POST(request: NextRequest) {
  try {
    const { id, name, list } = await request.json();

    if (!id || !name || !isValidList(list)) {
      return NextResponse.json(
        { message: 'id, name, and a valid list are required' },
        { status: 400 }
      );
    }

    const file = resolveFile(list);
    const alreadyPresent = parseLibraries(file).some((lib) => lib.id === id);

    if (alreadyPresent) {
      return NextResponse.json({ ok: true, message: 'Already present' }, { status: 200 });
    }

    appendLibraryLine(file, id, name);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Remove a library from a role's (or EXCLUDED's) file.
export async function DELETE(request: NextRequest) {
  try {
    const { id, list } = await request.json();

    if (!id || !isValidList(list)) {
      return NextResponse.json({ message: 'id and a valid list are required' }, { status: 400 });
    }

    removeLibraryLine(resolveFile(list), id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
