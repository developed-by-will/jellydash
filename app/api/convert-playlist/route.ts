import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get('playlist') as File;

  if (!file) {
    return NextResponse.json({ error: 'No m3u8 file uploaded' }, { status: 400 });
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/);

  // Extract only file paths
  const paths = lines.filter((line) => line.trim() && !line.startsWith('#'));

  const xmlItems = paths
    .map(
      (p) => `
    <PlaylistItem>
      <Path>${escapeXml(p)}</Path>
    </PlaylistItem>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<Playlist>
${xmlItems}
</Playlist>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Content-Disposition': 'attachment; filename="playlist.xml"'
    }
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
