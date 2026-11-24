import { NextRequest, NextResponse } from 'next/server';
import { PrepService } from '@/server/services/prep-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;

  const list = await PrepService.getCurrentAffairs(q, category);
  return NextResponse.json({ success: true, count: list.length, data: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await PrepService.createCurrentAffair(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid Current Affairs request body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
