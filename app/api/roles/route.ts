import { catchError } from '@/app/api/helpers';
import { getRoleLibraryFile, getRoles, Role, saveRoles } from '@/app/db/packages';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'role';
}

function uniqueId(base: string, existing: Role[]): string {
  if (!existing.some((role) => role.id === base)) return base;

  let suffix = 2;
  while (existing.some((role) => role.id === `${base}-${suffix}`)) suffix += 1;

  return `${base}-${suffix}`;
}

export async function GET() {
  try {
    return NextResponse.json(getRoles(), { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Create a new role - a fresh empty library file plus an entry in roles.json.
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ message: 'A role name is required' }, { status: 400 });
    }

    const roles = getRoles();
    const id = uniqueId(slugify(name), roles);

    const newRole: Role = { id, name: name.trim(), maxParentalRating: null };
    saveRoles([...roles, newRole]);

    const file = getRoleLibraryFile(id);
    if (!fs.existsSync(file)) fs.writeFileSync(file, '');

    return NextResponse.json(newRole, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Rename a role and/or change its parental rating cap. The id (and its library file) never
// changes - only the display name and cap are editable.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'id is required' }, { status: 400 });
    }

    const roles = getRoles();
    const role = roles.find((r) => r.id === id);

    if (!role) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    if (typeof body.name === 'string' && body.name.trim()) {
      role.name = body.name.trim();
    }

    if ('maxParentalRating' in body) {
      role.maxParentalRating =
        body.maxParentalRating === null || body.maxParentalRating === ''
          ? null
          : Number(body.maxParentalRating);
    }

    saveRoles(roles);

    return NextResponse.json(role, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Delete a role - removes it from roles.json and deletes its library file. Existing Jellyfin
// users already created with this role keep whatever permissions they were given; this only
// affects future role assignment.
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'id is required' }, { status: 400 });
    }

    const roles = getRoles().filter((role) => role.id !== id);
    saveRoles(roles);

    const file = getRoleLibraryFile(id);
    if (fs.existsSync(file)) fs.unlinkSync(file);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
