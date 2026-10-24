import { NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';

export async function GET() {
  const all = await NoticeService.getNotices();
  
  const stats = {
    total: all.length,
    drafts: all.filter(n => n.status === 'draft').length,
    inReview: all.filter(n => n.status === 'in_review').length,
    approved: all.filter(n => n.status === 'approved').length,
    published: all.filter(n => n.status === 'published').length,
  };

  const recentPending = all
    .filter(n => n.status === 'in_review')
    .slice(0, 5);

  return NextResponse.json({
    success: true,
    data: {
      stats,
      recentPending
    }
  });
}
