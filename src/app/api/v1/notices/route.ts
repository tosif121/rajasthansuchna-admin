import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const categoryId = searchParams.get('categoryId') || searchParams.get('category');
  const agencyId = searchParams.get('agencyId') || searchParams.get('agency');
  const query = searchParams.get('q') || searchParams.get('searchQuery');

  // Only published notices are exposed to Flutter mobile app
  let notices = await NoticeService.getNotices({
    status: 'published',
    query: query || undefined,
    agencyId: agencyId || undefined
  });

  if (categoryId && categoryId !== 'all') {
    notices = notices.filter(n => n.categoryId === categoryId);
  }

  const startIndex = (page - 1) * limit;
  const paginated = notices.slice(startIndex, startIndex + limit);
  const flutterFormatted = paginated.map(n => NoticeService.toFlutterVacancy(n));

  return NextResponse.json({
    success: true,
    data: flutterFormatted,
    meta: {
      page,
      limit,
      total: notices.length,
      hasMore: startIndex + limit < notices.length,
      timestamp: new Date().toISOString()
    }
  });
}
