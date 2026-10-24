import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const query = searchParams.get('q') || undefined;

  const notices = await NoticeService.getNotices({ status, query });
  return NextResponse.json({ success: true, data: notices });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorId = req.headers.get('x-actor-id') || 'usr_editor_1';
    const actorName = req.headers.get('x-actor-name') || 'Admin';

    const created = await NoticeService.createNotice(body, actorId, actorName);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
