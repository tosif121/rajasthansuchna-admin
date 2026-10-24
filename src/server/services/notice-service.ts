import { WorkflowStateMachine, WorkflowStatus } from '../workflow/state-machine';

export interface FlutterOfficialLink {
  label: string;
  url: string;
  kind: string; // 'notificationPdf' | 'applyOnline' | 'officialSite' | 'result' | 'admitCard'
}

export interface FlutterArticleSection {
  key: string;
  title: string;
  body: string;
  rows?: Record<string, string>;
  pageRef?: string;
}

export interface FlutterRecruitmentFacts {
  postsCount?: number;
  applicationStart?: string;
  applicationEnd?: string;
  feeEndDate?: string;
  examDate?: string;
  feeGeneralObc?: string;
  feeScSt?: string;
  qualification: string;
  ageMin?: number;
  ageMax?: number;
  selectionProcess: string;
  sourceUrl: string;
  sourceDate: string;
  verifiedAt: string;
  verifiedBy: string;
}

export interface AdminNoticeRecord {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyId: string;
  agencyName: string;
  categoryId: string;
  categoryName: string;
  state: 'rajasthan' | 'central';
  noticeType: string;
  status: WorkflowStatus;
  revisionNumber: number;
  summaryHi: string;
  summaryEn: string;
  facts: FlutterRecruitmentFacts;
  sections: FlutterArticleSection[];
  links: FlutterOfficialLink[];
  editorId: string;
  editorName: string;
  publishedAt?: string;
  updatedAt: string;
}

// In-Memory Repository for zero-dependency development & demo
let memoryNotices: AdminNoticeRecord[] = [
  {
    id: 'not_01',
    slug: 'rajasthan-police-constable-2026',
    titleHi: 'राजस्थान पुलिस कांस्टेबल भर्ती 2026 (10,500 पद)',
    titleEn: 'Rajasthan Police Constable Recruitment 2026 (10,500 Posts)',
    agencyId: 'agency_police',
    agencyName: 'राजस्थान पुलिस मुख्यालय (Rajasthan Police)',
    categoryId: 'cat_police',
    categoryName: 'पुलिस एवं सुरक्षा (Police & Defence)',
    state: 'rajasthan',
    noticeType: 'vacancy',
    status: 'published',
    revisionNumber: 2,
    summaryHi: 'कांस्टेबल (जीडी/चालक) के 10,500 पदों पर ऑनलाइन आवेदन आमंत्रित।',
    summaryEn: 'Online applications invited for 10,500 Constable GD & Driver posts.',
    facts: {
      postsCount: 10500,
      applicationStart: '2026-10-01',
      applicationEnd: '2026-11-15',
      qualification: '12th Pass (CET Senior Secondary Qualified)',
      ageMin: 18,
      ageMax: 26,
      selectionProcess: 'लिखित परीक्षा + शारीरिक दक्षता (PET/PST) + दस्तावेज सत्यापन',
      sourceUrl: 'https://police.rajasthan.gov.in',
      sourceDate: '2026-09-28',
      verifiedAt: '2026-10-02',
      verifiedBy: 'Rajasthan Suchna Editorial Board'
    },
    sections: [
      {
        key: 'overview',
        title: 'भर्ती विवरण (Overview)',
        body: 'राजस्थान पुलिस द्वारा 10,500 पदों पर कांस्टेबल भर्ती की विस्तृत विज्ञप्ति जारी की गई है।'
      }
    ],
    links: [
      { label: 'आधिकारिक विज्ञप्ति (PDF)', url: 'https://police.rajasthan.gov.in/recruitment.pdf', kind: 'notificationPdf' },
      { label: 'ऑनलाइन आवेदन करें (SSO)', url: 'https://sso.rajasthan.gov.in', kind: 'applyOnline' }
    ],
    editorId: 'usr_editor_1',
    editorName: 'Admin',
    publishedAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-05T14:30:00Z'
  },
  {
    id: 'not_02',
    slug: 'rajasthan-patwari-bharti-2026',
    titleHi: 'राजस्थान राजस्व पटवारी भर्ती 2026 (3,800 पद)',
    titleEn: 'Rajasthan Patwari Recruitment 2026 (3,800 Posts)',
    agencyId: 'agency_rsmssb',
    agencyName: 'RSMSSB (राजस्थान कर्मचारी चयन बोर्ड)',
    categoryId: 'cat_revenue',
    categoryName: 'राजस्व एवं लेखा (Revenue & Accounts)',
    state: 'rajasthan',
    noticeType: 'vacancy',
    status: 'in_review',
    revisionNumber: 1,
    summaryHi: 'राजस्व मंडल अजमेर द्वारा 3,800 पटवारी पदों की संशोधित विज्ञप्ति जारी।',
    summaryEn: 'RSMSSB notification for 3,800 Revenue Patwari vacancies across Rajasthan.',
    facts: {
      postsCount: 3800,
      applicationStart: '2026-11-05',
      applicationEnd: '2026-12-05',
      qualification: 'स्नातक (Graduation) + RSCIT / कम्प्यूटर डिप्लोमा',
      ageMin: 18,
      ageMax: 40,
      selectionProcess: 'लिखित परीक्षा (MCQ) एवं मेरिट सूची',
      sourceUrl: 'https://rsmssb.rajasthan.gov.in',
      sourceDate: '2026-10-20',
      verifiedAt: '2026-10-22',
      verifiedBy: 'Senior Editor Anil Verma'
    },
    sections: [],
    links: [
      { label: 'विज्ञप्ति डाउनलोड करें', url: 'https://rsmssb.rajasthan.gov.in/patwari-2026.pdf', kind: 'notificationPdf' }
    ],
    editorId: 'usr_editor_1',
    editorName: 'Admin',
    updatedAt: '2026-10-23T09:15:00Z'
  },
  {
    id: 'not_03',
    slug: 'rpsc-ras-rts-exam-2026',
    titleHi: 'RPSC RAS/RTS संयुक्त प्रतियोगी परीक्षा 2026',
    titleEn: 'RPSC RAS / RTS Combined Competitive Examination 2026',
    agencyId: 'agency_rpsc',
    agencyName: 'RPSC (राजस्थान लोक सेवा आयोग)',
    categoryId: 'cat_administrative',
    categoryName: 'प्रशासनिक सेवाएं (Administrative)',
    state: 'rajasthan',
    noticeType: 'vacancy',
    status: 'draft',
    revisionNumber: 1,
    summaryHi: 'आरएएस एवं अधीनस्थ सेवाओं के 980 पदों हेतु प्रारंभिक परीक्षा का प्रारूप।',
    summaryEn: 'RPSC RAS 2026 notification for 980 administrative officers.',
    facts: {
      postsCount: 980,
      applicationStart: '2026-11-10',
      applicationEnd: '2026-12-10',
      qualification: 'स्नातक (Any Degree)',
      ageMin: 21,
      ageMax: 40,
      selectionProcess: 'प्रारंभिक परीक्षा (Prelims) + मुख्य परीक्षा (Mains) + साक्षात्कार (Interview)',
      sourceUrl: 'https://rpsc.rajasthan.gov.in',
      sourceDate: '2026-10-24',
      verifiedAt: '2026-10-24',
      verifiedBy: 'Content Ops Team'
    },
    sections: [],
    links: [],
    editorId: 'usr_editor_2',
    editorName: 'Sunita Meena (Editor)',
    updatedAt: '2026-10-24T18:00:00Z'
  }
];

export class NoticeService {
  static async getNotices(filter?: { status?: string; query?: string; agencyId?: string }): Promise<AdminNoticeRecord[]> {
    let list = [...memoryNotices];
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((n) => n.status === filter.status);
    }
    if (filter?.agencyId && filter.agencyId !== 'all') {
      list = list.filter((n) => n.agencyId === filter.agencyId);
    }
    if (filter?.query && filter.query.trim().length > 0) {
      const q = filter.query.toLowerCase();
      list = list.filter((n) => n.titleHi.toLowerCase().includes(q) || n.titleEn.toLowerCase().includes(q) || n.slug.includes(q));
    }
    return list;
  }

  static async getNoticeById(id: string): Promise<AdminNoticeRecord | null> {
    return memoryNotices.find((n) => n.id === id) || null;
  }

  static async getNoticeBySlug(slug: string): Promise<AdminNoticeRecord | null> {
    return memoryNotices.find((n) => n.slug === slug) || null;
  }

  static async createNotice(data: Partial<AdminNoticeRecord>, actorId: string, actorName: string): Promise<AdminNoticeRecord> {
    const id = `not_${Date.now()}`;
    const slug = (data.titleEn || data.titleHi || 'recruitment')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newRecord: AdminNoticeRecord = {
      id,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      titleHi: data.titleHi || 'नई भर्ती अधिसूचना 2026',
      titleEn: data.titleEn || 'New Recruitment Notice 2026',
      agencyId: data.agencyId || 'agency_rsmssb',
      agencyName: data.agencyName || 'RSMSSB',
      categoryId: data.categoryId || 'cat_police',
      categoryName: data.categoryName || 'पुलिस एवं सुरक्षा',
      state: data.state || 'rajasthan',
      noticeType: data.noticeType || 'vacancy',
      status: 'draft',
      revisionNumber: 1,
      summaryHi: data.summaryHi || '',
      summaryEn: data.summaryEn || '',
      facts: data.facts || {
        qualification: '10th / 12th / Graduate',
        selectionProcess: 'लिखित परीक्षा',
        sourceUrl: 'https://rajasthan.gov.in',
        sourceDate: new Date().toISOString().split('T')[0],
        verifiedAt: new Date().toISOString().split('T')[0],
        verifiedBy: actorName
      },
      sections: data.sections || [],
      links: data.links || [],
      editorId: actorId,
      editorName: actorName,
      updatedAt: new Date().toISOString()
    };

    memoryNotices.unshift(newRecord);
    return newRecord;
  }

  static async submitForReview(noticeId: string, actorId: string, actorRole: string): Promise<{ success: boolean; error?: string }> {
    const notice = await this.getNoticeById(noticeId);
    if (!notice) return { success: false, error: 'Notice not found.' };

    const check = WorkflowStateMachine.evaluate({
      noticeId,
      revisionId: `rev_${notice.revisionNumber}`,
      currentStatus: notice.status,
      actorId,
      actorRole,
      editorId: notice.editorId
    }, 'submit');

    if (!check.allowed) return { success: false, error: check.error };
    notice.status = check.nextStatus!;
    notice.updatedAt = new Date().toISOString();
    return { success: true };
  }

  static async approveNotice(noticeId: string, actorId: string, actorRole: string): Promise<{ success: boolean; error?: string }> {
    const notice = await this.getNoticeById(noticeId);
    if (!notice) return { success: false, error: 'Notice not found.' };

    const check = WorkflowStateMachine.evaluate({
      noticeId,
      revisionId: `rev_${notice.revisionNumber}`,
      currentStatus: notice.status,
      actorId,
      actorRole,
      editorId: notice.editorId
    }, 'approve');

    if (!check.allowed) return { success: false, error: check.error };
    notice.status = check.nextStatus!;
    notice.updatedAt = new Date().toISOString();
    return { success: true };
  }

  static async publishNotice(noticeId: string, actorId: string, actorRole: string): Promise<{ success: boolean; error?: string }> {
    const notice = await this.getNoticeById(noticeId);
    if (!notice) return { success: false, error: 'Notice not found.' };

    const check = WorkflowStateMachine.evaluate({
      noticeId,
      revisionId: `rev_${notice.revisionNumber}`,
      currentStatus: notice.status,
      actorId,
      actorRole,
      editorId: notice.editorId
    }, 'publish');

    if (!check.allowed) return { success: false, error: check.error };
    notice.status = check.nextStatus!;
    notice.publishedAt = new Date().toISOString();
    notice.updatedAt = new Date().toISOString();
    return { success: true };
  }

  /**
   * Transforms an AdminNoticeRecord into the exact Flutter model format
   */
  static async deleteNotice(id: string): Promise<boolean> {
    const idx = memoryNotices.findIndex((n) => n.id === id);
    if (idx !== -1) {
      memoryNotices.splice(idx, 1);
      return true;
    }
    return false;
  }

  static toFlutterVacancy(n: AdminNoticeRecord) {
    return {
      id: n.id,
      titleHi: n.titleHi,
      titleEn: n.titleEn,
      slug: n.slug,
      categoryId: n.categoryId,
      agencyId: n.agencyId,
      state: n.state,
      language: 'hi',
      summaryHi: n.summaryHi,
      summaryEn: n.summaryEn,
      publishedAt: n.publishedAt || n.updatedAt,
      type: n.noticeType,
      facts: n.facts,
      sections: n.sections,
      links: n.links,
      revisionHistory: [
        {
          date: n.updatedAt,
          title: `Revision ${n.revisionNumber}`,
          description: `Verified by ${n.facts.verifiedBy}`
        }
      ],
      isFeatured: false,
      isBreaking: false
    };
  }
}
