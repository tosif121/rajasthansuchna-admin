import { NextRequest, NextResponse } from 'next/server';
import { PrepService } from '@/server/services/prep-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const agencyId = searchParams.get('agencyId') || undefined;

  const list = await PrepService.getPyqs(q, agencyId);
  return NextResponse.json({ success: true, count: list.length, data: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await PrepService.createPyq(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid PYQ request body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
