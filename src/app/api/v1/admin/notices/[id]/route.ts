import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await NoticeService.deleteNotice(id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Notice not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Notice deleted successfully.' });
}
