import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';
import { getCachedOrFetch } from '@/server/cache';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
  const categoryId = searchParams.get('categoryId') || searchParams.get('category');
  const agencyId = searchParams.get('agencyId') || searchParams.get('agency');
  const query = searchParams.get('q') || searchParams.get('searchQuery');

  const cacheKey = `notices:published:${categoryId || 'all'}:${agencyId || 'all'}:${query || ''}:${page}:${limit}`;

  // Coalesce concurrent in-flight requests into 1 execution with 30s TTL cache
  const result = await getCachedOrFetch(cacheKey, 30, async () => {
    let notices = await NoticeService.getNotices({
      status: 'published',
      query: query || undefined,
      agencyId: agencyId || undefined,
    });

    if (categoryId && categoryId !== 'all') {
      notices = notices.filter((n) => n.categoryId === categoryId);
    }

    const total = notices.length;
    const startIndex = (page - 1) * limit;
    const paginated = notices.slice(startIndex, startIndex + limit);
    const flutterFormatted = paginated.map((n) => NoticeService.toFlutterVacancy(n));

    return {
      data: flutterFormatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasMore: startIndex + limit < total,
        timestamp: new Date().toISOString(),
      },
    };
  });

  return NextResponse.json(
    { success: true, ...result },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache-Lookup': 'in-memory-lru-singleflight',
      },
    }
  );
}
