import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { libraries } from '../db/packages';
import { DEVICE_ID, SERVER_URL } from './constants';
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

export const getHeaders = (token?: string | null) => ({
  'Content-Type': 'application/json',
  Authorization: `MediaBrowser Client="HomeflixAPI", Device="Homeflix API", DeviceId="${DEVICE_ID}", Version="10.10.3"${token ? `, Token="${token}"` : ''}`
});

export async function fetchApi(
  endpoint: string,
  request: NextRequest,
  config: ApiConfig
): Promise<Response> {
  try {
    const token = config.requiresAuth ? request.headers.get('server_token') : undefined;

    if (config.requiresAuth && !token) {
      return NextResponse.json({ message: 'No server token provided' }, { status: 401 });
    }

    const fetchOptions: RequestInit = {
      method: config.method,
      headers: getHeaders(token)
    };

    if ('body' in config && config.body !== undefined) {
      fetchOptions.body =
        typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
    }

    const requestEndpoint = SERVER_URL + endpoint;
    //console.log(requestEndpoint, fetchOptions);

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

  console.log('Generated preferences:', prefs); // Debug log
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

export function getExcludedLibraryNames(): string[] {
  try {
    return fs
      .readFileSync(libraries.excluded, 'utf-8')
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name !== '');
  } catch (error) {
    console.error('Error reading excluded libraries:', error);
    return [];
  }
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
