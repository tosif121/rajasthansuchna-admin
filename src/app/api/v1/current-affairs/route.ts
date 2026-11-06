import { NextRequest, NextResponse } from 'next/server';
import { NoticeService, AdminNoticeRecord } from '@/server/services/notice-service';

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
  try {
    // Current Affairs & Government Schemes are authentic Notices of type 'scheme' or 'current_affairs'
    const allNotices = await NoticeService.getNotices();

    const currentAffairs: CurrentAffairsItem[] = allNotices
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

    // Sort by publication date descending
    currentAffairs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      count: currentAffairs.length,
      data: currentAffairs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch current affairs' },
      { status: 500 }
    );
  }
}
