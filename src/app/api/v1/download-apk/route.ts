import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'downloads', 'rajsuchna.apk');

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'APK build currently not available. Please check back shortly.' }, { status: 404 });
  }

  const fileStat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="RajSuchna.apk"',
      'Content-Length': fileStat.size.toString(),
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
