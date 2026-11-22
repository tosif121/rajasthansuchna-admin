import { NextRequest, NextResponse } from 'next/server';
import { NoticeService, AdminNoticeRecord } from '@/server/services/notice-service';
import { getCachedOrFetch } from '@/server/cache';

export interface CurrentAffairsItem {
  id: string;
  date: string;
  titleHi: string;
  titleEn: string;
  summaryHi: string;
  summaryEn: string;
  category: string;
  sourceUrl: string;
  sourceName: string;
  slug?: string;
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  try {
    const currentAffairs = await getCachedOrFetch('current-affairs:list', 15, async () => {
      const allNotices = await NoticeService.getNotices();
      const items: CurrentAffairsItem[] = allNotices
        .filter((n: AdminNoticeRecord) => {
          const type = (n.noticeType || '').toLowerCase();
          const category = (n.categoryId || '').toLowerCase();
          return (
            type === 'scheme' ||
            type === 'current_affairs' ||
            category === 'schemes' ||
            (n.titleHi && n.titleHi.includes('योजना')) ||
            (n.titleEn && n.titleEn.toLowerCase().includes('scheme'))
          );
        })
        .map((n: AdminNoticeRecord) => ({
          id: `ca_${n.id}`,
          date: n.publishedAt || new Date().toISOString(),
          titleHi: n.titleHi,
          titleEn: n.titleEn,
          summaryHi: n.summaryHi,
          summaryEn: n.summaryEn,
          category: n.categoryName || 'Government Schemes & Policies',
          sourceUrl: n.facts?.sourceUrl || 'https://dipr.rajasthan.gov.in',
          sourceName: n.facts?.verifiedBy || 'सूचना एवं जनसंपर्क विभाग (DIPR)',
          slug: n.slug,
        }));

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return items;
    });

    const durationMs = Date.now() - start;
    return NextResponse.json(
      {
        success: true,
        count: currentAffairs.length,
        data: currentAffairs,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
          'X-Response-Time': `${durationMs}ms`,
          'X-Cache-Lookup': 'in-memory-lru-singleflight',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch current affairs' },
      { status: 500 }
    );
  }
}
