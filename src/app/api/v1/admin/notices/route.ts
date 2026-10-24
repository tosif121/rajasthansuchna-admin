import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';
import { getCachedOrFetch, invalidateNoticeCache } from '@/server/cache';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const query = searchParams.get('q') || undefined;
  const agencyId = searchParams.get('agencyId') || undefined;
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit') || searchParams.get('pageSize');

  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 10;
  const isPaginated = pageParam !== null || limitParam !== null;

  // Cache key with full parameters
  const cacheKey = `admin:notices:${status || 'all'}:${query || ''}:${agencyId || 'all'}:${isPaginated ? `${page}:${limit}` : 'all'}`;

  // Coalesce concurrent requests into a single promise execution with in-memory caching
  const result = await getCachedOrFetch(cacheKey, 15, async () => {
    const allNotices = await NoticeService.getNotices({ status, query, agencyId });
    const total = allNotices.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginated = isPaginated ? allNotices.slice(startIndex, startIndex + limit) : allNotices;

    return {
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore: startIndex + limit < total,
        timestamp: new Date().toISOString(),
      },
    };
  });

  return NextResponse.json(
    { success: true, ...result },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        'X-Cache-Lookup': 'in-memory-lru-singleflight',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorId = req.headers.get('x-actor-id') || 'usr_editor_1';
    const actorName = req.headers.get('x-actor-name') || 'Admin';

    const created = await NoticeService.createNotice(body, actorId, actorName);
    // Invalidate server cache on mutation
    invalidateNoticeCache();

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
