import { catchError, fetchApi } from '@/app/api/helpers';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag } = body;

    const file = 'app/db/blocked-tags';

    // Check if tag already exists
    if (fs.existsSync(file)) {
      const fileContent = fs.readFileSync(file, 'utf-8');

      if (fileContent.includes(tag)) {
        return NextResponse.json({ message: 'Tag already exists' }, { status: 400 });
      }

      // Appends new tag
      fs.appendFileSync(file, tag + '\n');
      const response = await UpdateUserTags(file, request);
      console.log(response);

      return NextResponse.json({ message: 'Tag added' }, { status: 200 });
    }

    // Creates new file and writes the tag
    fs.writeFileSync(file, tag + '\n');
    await UpdateUserTags(file, request);
    return NextResponse.json({ message: 'Tag added' }, { status: 200 });
  } catch (error) {
    catchError(error);
  }
}

async function UpdateUserTags(file: string, request: NextRequest) {
  try {
    if (fs.existsSync(file)) {
      const fileContent = fs.readFileSync(file, 'utf-8');

      // Get users
      const getUsers = await fetchApi('/Users', request, {
        method: 'GET',
        requiresAuth: true
      });

      const users: User[] = await getUsers.json();

      // Update each user's policy
      users.forEach((user) => {
        if (user.Policy.BlockedTags.length === 0) return;

        const newPolicy = {
          ...user.Policy,
          BlockedTags: fileContent.split('\n').filter((tag) => tag !== '')
        };

        if (user.Name === 'Adrien') {
          newPolicy.BlockedTags.push('barbie,Barbie');
        }

        // Update user's policy
        fetchApi(`/Users/${user.Id}/Policy`, request, {
          method: 'POST',
          requiresAuth: true,
          body: JSON.stringify(newPolicy)
        });
      });
    }
  } catch (error) {
    catchError(error);
  }
}
