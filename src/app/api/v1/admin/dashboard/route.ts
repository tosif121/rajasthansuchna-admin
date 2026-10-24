import { NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';

export async function GET() {
  const all = await NoticeService.getNotices();
  
  const stats = {
    total: all.length,
    active: all.filter(n => n.status === 'active').length,
    inactive: all.filter(n => n.status === 'inactive').length,
    agencies: 6,
  };

  const recent = all.slice(0, 5);

  return NextResponse.json({
    success: true,
    data: {
      stats,
      recent
    }
  });
}
