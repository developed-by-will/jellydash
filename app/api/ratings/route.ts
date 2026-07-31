import { catchError } from '@/app/api/helpers';
import { getRatings, Rating, saveRatings } from '@/app/db/ratings';
import { NextRequest, NextResponse } from 'next/server';

function slugify(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'rating';
}

function uniqueId(base: string, existing: Rating[]): string {
  if (!existing.some((rating) => rating.id === base)) return base;

  let suffix = 2;
  while (existing.some((rating) => rating.id === `${base}-${suffix}`)) suffix += 1;

  return `${base}-${suffix}`;
}

export async function GET() {
  try {
    return NextResponse.json(getRatings(), { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Create a new rating - label is what's shown in the picker, value is what gets written as the
// item's OfficialRating in Jellyfin.
export async function POST(request: NextRequest) {
  try {
    const { label, value } = await request.json();

    if (!label || typeof label !== 'string' || !label.trim()) {
      return NextResponse.json({ message: 'A label is required' }, { status: 400 });
    }

    if (!value || typeof value !== 'string' || !value.trim()) {
      return NextResponse.json({ message: 'A value is required' }, { status: 400 });
    }

    const ratings = getRatings();
    const id = uniqueId(slugify(label), ratings);

    const newRating: Rating = { id, label: label.trim(), value: value.trim() };
    saveRatings([...ratings, newRating]);

    return NextResponse.json(newRating, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Rename a rating's label and/or value. The id never changes.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'id is required' }, { status: 400 });
    }

    const ratings = getRatings();
    const rating = ratings.find((r) => r.id === id);

    if (!rating) {
      return NextResponse.json({ message: 'Rating not found' }, { status: 404 });
    }

    if (typeof body.label === 'string' && body.label.trim()) {
      rating.label = body.label.trim();
    }

    if (typeof body.value === 'string' && body.value.trim()) {
      rating.value = body.value.trim();
    }

    saveRatings(ratings);

    return NextResponse.json(rating, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}

// Delete a rating. Items already tagged with its value in Jellyfin keep that value - this only
// affects what's offered going forward in the picker.
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'id is required' }, { status: 400 });
    }

    const ratings = getRatings().filter((rating) => rating.id !== id);
    saveRatings(ratings);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return catchError(error);
  }
}
