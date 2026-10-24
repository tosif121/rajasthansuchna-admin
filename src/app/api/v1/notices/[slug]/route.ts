import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const notice = await NoticeService.getNoticeBySlug(slug);

  if (!notice || notice.status !== 'active') {
    return NextResponse.json(
      { success: false, error: 'Active recruitment notice not found.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: NoticeService.toFlutterVacancy(notice),
  });
}
