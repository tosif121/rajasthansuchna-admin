import { NextRequest, NextResponse } from 'next/server';
import { PrepService } from '@/server/services/prep-service';
import { NoticeService, AdminNoticeRecord } from '@/server/services/notice-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;

    // 1. Fetch primary dedicated Current Affairs records
    const dedicated = await PrepService.getCurrentAffairs(q, category);

    // 2. Fallback / supplementary notice schemes if query allows
    const notices = await NoticeService.getNotices();
    const noticeSchemes = notices
      .filter((n: AdminNoticeRecord) => {
        const type = (n.noticeType || '').toLowerCase();
        const cat = (n.categoryId || '').toLowerCase();
        return (
          type === 'scheme' ||
          cat === 'schemes' ||
          (n.titleHi && n.titleHi.includes('योजना'))
        );
      })
      .map((n: AdminNoticeRecord) => ({
        id: `ca_n_${n.id}`,
        slug: n.slug,
        date: n.publishedAt || n.updatedAt || new Date().toISOString(),
        titleHi: n.titleHi,
        titleEn: n.titleEn,
        summaryHi: n.summaryHi,
        summaryEn: n.summaryEn,
        category: n.categoryName || 'योजना व नीतियां',
        sourceUrl: n.facts?.sourceUrl || 'https://dipr.rajasthan.gov.in',
        sourceName: n.facts?.verifiedBy || 'सूचना एवं जनसंपर्क विभाग (DIPR)',
        isFeatured: n.isFeatured || false,
        createdAt: n.publishedAt || new Date().toISOString(),
        updatedAt: n.updatedAt || new Date().toISOString(),
      }));

    const combined = [...dedicated, ...noticeSchemes];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(
      {
        success: true,
        count: combined.length,
        data: combined,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch current affairs';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
