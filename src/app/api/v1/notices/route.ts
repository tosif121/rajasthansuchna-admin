import { NextRequest, NextResponse } from 'next/server';
import { NoticeService, AdminNoticeRecord } from '@/server/services/notice-service';
import { getCachedOrFetch } from '@/server/cache';

function matchesCategory(n: AdminNoticeRecord, catId: string): boolean {
  const c = catId.trim().toLowerCase();
  if (c === 'all' || c === 'latest') return true;
  if (c === 'rajasthan') return (n.state || '').toLowerCase() === 'rajasthan';
  if (c === 'central') return (n.state || '').toLowerCase() === 'central';

  const type = (n.noticeType || '').toLowerCase();
  const title = `${n.titleHi || ''} ${n.titleEn || ''}`.toLowerCase();

  if (c === 'admit_card' || c === 'admitcard') {
    return type === 'admitcard' || title.includes('admit') || title.includes('प्रवेश पत्र') || title.includes('एडमिट');
  }
  if (c === 'result' || c === 'results') {
    return type === 'result' || title.includes('result') || title.includes('रिजल्ट') || title.includes('परिणाम');
  }
  if (c === 'schemes' || c === 'scheme') {
    return type === 'scheme' || title.includes('scheme') || title.includes('yojana') || title.includes('योजना');
  }

  const cat = (n.categoryId || '').trim().toLowerCase();
  const agency = (n.agencyId || '').trim().toLowerCase();
  const agencyName = (n.agencyName || '').trim().toLowerCase();
  const slug = (n.slug || '').trim().toLowerCase();

  // 1. Direct match on ID or Agency
  if (cat === c || agency === c) return true;

  // 2. Substring matching (e.g. 'police' matches 'police_defence', 'rpsc' matches 'rpsc-ajmer')
  if (cat && (cat.includes(c) || c.includes(cat))) return true;
  if (agency && (agency.includes(c) || c.includes(agency))) return true;
  if (agencyName && agencyName.includes(c)) return true;
  if (slug && slug.includes(c)) return true;

  // 3. Dynamic token matching for composite keys (e.g. 'education_dept', 'police_defence', 'rvunl_jvvnl')
  const tokens = c.split(/[_\-\s]+/).filter((t) => t.length > 2);
  for (const token of tokens) {
    if (
      (cat && cat.includes(token)) ||
      (agency && agency.includes(token)) ||
      (agencyName && agencyName.includes(token)) ||
      title.includes(token)
    ) {
      return true;
    }
  }

  return false;
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
  const categoryId = searchParams.get('categoryId') || searchParams.get('category');
  const agencyId = searchParams.get('agencyId') || searchParams.get('agency');
  const state = searchParams.get('state');
  const type = searchParams.get('type') || searchParams.get('noticeType');
  const sortBy = searchParams.get('sort') || searchParams.get('sortBy') || 'newest';
  const query = searchParams.get('q') || searchParams.get('searchQuery');

  const cacheKey = `notices:active:${categoryId || 'all'}:${agencyId || 'all'}:${state || 'all'}:${type || 'all'}:${sortBy}:${query || ''}:${page}:${limit}`;

  // Coalesce concurrent in-flight requests into 1 execution with 5s TTL cache for responsiveness
  const result = await getCachedOrFetch(cacheKey, 5, async () => {
    let notices = await NoticeService.getNotices({
      status: 'active',
      query: query || undefined,
      agencyId: agencyId || undefined,
    });

    // 1. Filter by state
    if (state && state !== 'all') {
      notices = notices.filter((n) => (n.state || '').toLowerCase() === state.toLowerCase());
    }

    // 2. Filter by type
    if (type && type !== 'all') {
      const cleanType = type.toLowerCase().replace(/_/g, '');
      notices = notices.filter((n) => (n.noticeType || '').toLowerCase().replace(/_/g, '') === cleanType);
    }

    // 3. Filter by category
    if (categoryId && categoryId !== 'all') {
      const catList = categoryId
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      if (catList.length > 0) {
        notices = notices.filter((n) => catList.some((cat) => matchesCategory(n, cat)));
      }
    }

    // 4. Sort
    if (sortBy === 'deadline') {
      notices.sort((a, b) => {
        const endA = a.facts?.applicationEnd ? new Date(a.facts.applicationEnd).getTime() : Number.MAX_SAFE_INTEGER;
        const endB = b.facts?.applicationEnd ? new Date(b.facts.applicationEnd).getTime() : Number.MAX_SAFE_INTEGER;
        return endA - endB;
      });
    } else {
      // newest
      notices.sort((a, b) => {
        const pubA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const pubB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return pubB - pubA;
      });
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
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
        'X-Response-Time': `${Date.now() - start}ms`,
        'X-Cache-Lookup': 'in-memory-lru-singleflight',
      },
    }
  );
}
