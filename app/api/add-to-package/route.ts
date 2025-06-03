import { catchError } from '@/app/api/helpers';
import { PackageName, PACKAGES } from '@/app/db/packages';
import fs from 'fs';
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

    const file = 'app/db/libraries/' + Package.toLowerCase();
    const library = `${id}->${name}`;

    // Check if library already exists
    if (fs.existsSync(file)) {
      const fileContent = fs.readFileSync(file, 'utf-8');

      if (fileContent.includes(library)) {
        return NextResponse.json({ message: 'Library already exists' }, { status: 400 });
      }

      // Appends new library
      fs.appendFileSync(file, library + '\n');

      return NextResponse.json(librariesList(fileContent), { status: 200 });
    }

    // Creates new file and writes the library
    fs.writeFileSync(file, library + '\n');
    const fileContent = fs.readFileSync(file, 'utf-8');

    return NextResponse.json(librariesList(fileContent), { status: 200 });
  } catch (error) {
    catchError(error);
  }
}

const librariesList = (fileContent: string) =>
  fileContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('->'))
    .map((line) => {
      const [id, name] = line.split('->').map((part) => part.trim());
      return { id, name };
    });
