import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';
import { invalidateNoticeCache } from '@/server/cache';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await NoticeService.updateNoticeStatus(id, 'active');
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }
  invalidateNoticeCache();
  return NextResponse.json({ success: true, message: 'Notice marked as active.' });
}
