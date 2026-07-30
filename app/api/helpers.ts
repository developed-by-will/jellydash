import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { libraries } from '../db/packages';
import { DEBUG_JELLYFIN_ENDPOINT, DEVICE_ID, REQUEST_LOGS, SERVER_URL } from './constants';
import { ApiConfig, Library } from './types';

export function catchError(error: unknown): NextResponse {
  return NextResponse.json(
    {
      message: 'An error occurred',
      error: error instanceof Error ? error.message : String(error)
    },
    { status: 500 }
  );
}
export const getHeaders = (
  accessToken?: string | null,
  opts?: {
    deviceId?: string;
  }
) => {
  const deviceID = opts?.deviceId ?? DEVICE_ID;

  return {
    'Content-Type': 'application/json',
    'User-Agent': 'HomeflixAPI',
    Authorization: `MediaBrowser Client="HomeflixAPI", Device="Homeflix API", DeviceId="${deviceID}", Version="10.10.3'"${accessToken ? `, Token="${accessToken}"` : ''}`
  };
};

export async function requestApi(
  endpoint: string,
  request: NextRequest,
  config: ApiConfig & {
    headersOverride?: Parameters<typeof getHeaders>[1];
    accessToken?: string;
  }
): Promise<Response> {
  try {
    // Determine the token to use
    const token =
      config.accessToken ?? (config.requiresAuth ? request.headers.get('access_token') : undefined);

    // If auth is required but token is missing, throw 401
    if (config.requiresAuth && !token) {
      return NextResponse.json({ message: 'No server token provided' }, { status: 401 });
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method: config.method,
      headers: getHeaders(token, config.headersOverride)
    };

    // Attach body if present
    if ('body' in config && config.body !== undefined) {
      fetchOptions.body =
        typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
    }

    const requestEndpoint = SERVER_URL + endpoint;

    // Optional debug logging
    if (REQUEST_LOGS === 'true' && endpoint.includes(DEBUG_JELLYFIN_ENDPOINT)) {
      console.log(requestEndpoint, fetchOptions);
    }

    return await fetch(requestEndpoint, fetchOptions);
  } catch (error) {
    return catchError(error);
  }
}

export function generatePassword() {
  const specialCharFrequency = 3;
  const specialChars = "!@#$%^&*ç~ãâºª()=?»«'.,;-_";
  const uuid = crypto.randomUUID();
  const uuidWithoutHyphens = uuid.replace(/-/g, '');

  return uuidWithoutHyphens
    .split('')
    .map((char, index) => {
      if (index % specialCharFrequency === 0 && specialChars.length > 0) {
        return specialChars[Math.floor(Math.random() * specialChars.length)];
      }
      return char;
    })
    .join('');
}

export function generateLibrarySortingPrefs(libraryIds: string[]): Record<string, string> {
  const prefs: Record<string, string> = {};

  // Validate input
  if (!libraryIds || !Array.isArray(libraryIds)) {
    console.warn('Invalid libraryIds input:', libraryIds);
    return prefs;
  }

  // Process each library ID
  libraryIds.forEach((id) => {
    if (!id) return;

    const cleanId = id.trim();
    if (!cleanId) return;

    // Add series sorting preference
    prefs[`${cleanId}-series`] = JSON.stringify({
      SortBy: 'PremiereDate,SortName',
      SortOrder: 'Descending'
    });

    // Add movies sorting preference
    prefs[`${cleanId}-movies`] = JSON.stringify({
      SortBy: 'PremiereDate,SortName,ProductionYear',
      SortOrder: 'Descending'
    });

    // Add folder sorting preferences
    prefs[`items-${cleanId}-Folder-sortorder`] = 'Descending';
    prefs[`items-${cleanId}-Folder-sortby`] = 'ProductionYear,PremiereDate,SortName';
  });
  return prefs;
}

export function parseLibraries(filePath: string): Library[] {
  try {
    return fs
      .readFileSync(filePath, 'utf-8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes('->'))
      .map((line) => {
        const [id, name] = line.split('->').map((part) => part.trim());
        return { id, name };
      });
  } catch (error) {
    console.error('Error reading library file:', error);
    return [];
  }
}

export function getLibraryIdsByName(libraries: Library[], names: string[]): string[] {
  return libraries.filter((lib) => names.some((name) => lib.name === name)).map((lib) => lib.id);
}

// Appends an `id->name` line to a library file, adding a leading newline first if the file's
// last line doesn't already end with one (e.g. it was hand-edited) - otherwise the new entry
// gets glued onto the end of the previous line instead of starting its own.
export function appendLibraryLine(filePath: string, id: string, name: string): void {
  const line = `${id}->${name}`;

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, line + '\n');
    return;
  }

  const existing = fs.readFileSync(filePath, 'utf-8');
  const needsLeadingNewline = existing.length > 0 && !existing.endsWith('\n');

  fs.appendFileSync(filePath, (needsLeadingNewline ? '\n' : '') + line + '\n');
}

// Removes any line for `id` from a library file.
export function removeLibraryLine(filePath: string, id: string): void {
  const remaining = parseLibraries(filePath).filter((lib) => lib.id !== id);

  fs.writeFileSync(
    filePath,
    remaining.length ? remaining.map((lib) => `${lib.id}->${lib.name}`).join('\n') + '\n' : ''
  );
}

export function getAdminLibrariesIds(): string[] {
  try {
    return fs
      .readFileSync(libraries.admin, 'utf-8')
      .split('\n')
      .map((name) => name.trim())
      .filter((line) => line.includes('->'))
      .map((line) => line.split('->')[0].trim());
  } catch (error) {
    console.error('Error reading admin libraries:', error);
    return [];
  }
}

export function getLibrariesIds(libraries: string[]): string[] {
  return libraries.map((lib) => lib.split('->')[0].trim());
}
