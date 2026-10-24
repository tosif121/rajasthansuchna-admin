import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const actorId = req.headers.get('x-actor-id') || 'usr_publisher_1';
  const actorRole = req.headers.get('x-actor-role') || 'publisher';

  const res = await NoticeService.publishNotice(id, actorId, actorRole);
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: 'Notice officially published to Flutter mobile feed.' });
}
