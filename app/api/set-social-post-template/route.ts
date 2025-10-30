import { mkdir, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get('picture') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure /public exists
  const uploadDir = path.join(process.cwd(), 'public');
  await mkdir(uploadDir, { recursive: true });

  // ✅ Always save as 'social-post-template.png'
  const fileName = 'social-post-template.png';
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return NextResponse.json({
    success: true,
    filePath: fileName
  });
}
