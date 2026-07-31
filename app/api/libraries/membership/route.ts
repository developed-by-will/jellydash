import { appendLibraryLine, catchError, removeLibraryLine, parseLibraries } from '@/app/api/helpers';
import { EXCLUDED_LIBRARIES_PATH, getRoleLibraryFile, getRoles } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

// A membership "list" is either a role id (dynamic - whatever exists in roles.json) or the
// special EXCLUDED flag file.
function resolveFile(list: string): string | null {
  if (list === 'EXCLUDED') return EXCLUDED_LIBRARIES_PATH;

  const role = getRoles().find((r) => r.id === list);
  return role ? getRoleLibraryFile(role.id) : null;
}

// Add a library to a role's (or EXCLUDED's) file.
export async function POST(request: NextRequest) {
  try {
    const { id, name, list } = await request.json();

    if (!id || !name || !list) {
      return NextResponse.json({ message: 'id, name, and list are required' }, { status: 400 });
    }

    const file = resolveFile(list);

    if (!file) {
      return NextResponse.json({ message: `Unknown list "${list}"` }, { status: 400 });
    }

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

    if (!id || !list) {
      return NextResponse.json({ message: 'id and list are required' }, { status: 400 });
    }

    const file = resolveFile(list);

    if (!file) {
      return NextResponse.json({ message: `Unknown list "${list}"` }, { status: 400 });
    }

    removeLibraryLine(file, id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
