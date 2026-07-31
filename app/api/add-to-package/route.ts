import { appendLibraryLine, catchError, parseLibraries } from '@/app/api/helpers';
import { getRoleLibraryFile, getRoles } from '@/app/db/packages';
import { NextRequest, NextResponse } from 'next/server';

// Legacy endpoint kept for the Postman collection - equivalent to POST /api/libraries/membership
// with `list` renamed to `package`. Roles are looked up by id case-insensitively so old calls
// using the uppercase names (e.g. "STANDARD") still work against today's lowercase role ids.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;
    const packageId: string = body.package;

    const role = getRoles().find((r) => r.id.toLowerCase() === String(packageId).toLowerCase());

    if (!role) {
      return NextResponse.json({ message: `Role "${packageId}" does not exist` }, { status: 400 });
    }

    const file = getRoleLibraryFile(role.id);
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
