import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // By default simulate senior reviewer
  const actorId = req.headers.get('x-actor-id') || 'usr_reviewer_2';
  const actorRole = req.headers.get('x-actor-role') || 'reviewer';

  const res = await NoticeService.approveNotice(id, actorId, actorRole);
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: 'Notice successfully approved.' });
}
