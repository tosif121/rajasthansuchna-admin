import { AuditService } from './audit-service';

export type NoticeStatus = 'active' | 'inactive';

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
  status: NoticeStatus;
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

// Live in-memory repository (initialized clean with zero mock notices)
let memoryNotices: AdminNoticeRecord[] = [];

export class NoticeService {
  static async getNotices(filter?: { status?: string; query?: string; agencyId?: string }): Promise<AdminNoticeRecord[]> {
    let list = [...memoryNotices];
    if (filter?.status && filter.status !== 'all') {
      const targetStatus = filter.status === 'published' ? 'active' : filter.status;
      list = list.filter((n) => n.status === targetStatus);
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

  static async createNotice(data: Partial<AdminNoticeRecord>, actorId: string = 'admin', actorName: string = 'Admin'): Promise<AdminNoticeRecord> {
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
      status: (data.status as NoticeStatus) || 'active',
      revisionNumber: 1,
      summaryHi: data.summaryHi || '',
      summaryEn: data.summaryEn || '',
      facts: data.facts || {
        qualification: '10th / 12th / Graduate',
        selectionProcess: 'Written Exam and Document Verification',
        sourceUrl: 'https://rajasthan.gov.in',
        sourceDate: new Date().toISOString().split('T')[0],
        verifiedAt: new Date().toISOString().split('T')[0],
        verifiedBy: 'Rajasthan Suchna Operations'
      },
      sections: data.sections || [],
      links: data.links || [],
      editorId: actorId,
      editorName: actorName,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryNotices.unshift(newRecord);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'CREATED_NOTICE',
      entityType: 'Notice',
      entityName: newRecord.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS'
    });

    return newRecord;
  }

  static async updateNoticeStatus(id: string, status: NoticeStatus): Promise<{ success: boolean; notice?: AdminNoticeRecord; error?: string }> {
    const notice = await this.getNoticeById(id);
    if (!notice) return { success: false, error: 'Notice not found.' };

    notice.status = status;
    notice.updatedAt = new Date().toISOString();
    if (status === 'active' && !notice.publishedAt) {
      notice.publishedAt = new Date().toISOString();
    }

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: status === 'active' ? 'ACTIVATED_NOTICE' : 'DEACTIVATED_NOTICE',
      entityType: 'Notice',
      entityName: notice.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS'
    });

    return { success: true, notice };
  }

  static async toggleNoticeStatus(id: string): Promise<{ success: boolean; nextStatus?: NoticeStatus; error?: string }> {
    const notice = await this.getNoticeById(id);
    if (!notice) return { success: false, error: 'Notice not found.' };

    const nextStatus: NoticeStatus = notice.status === 'active' ? 'inactive' : 'active';
    notice.status = nextStatus;
    notice.updatedAt = new Date().toISOString();
    if (nextStatus === 'active' && !notice.publishedAt) {
      notice.publishedAt = new Date().toISOString();
    }

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: nextStatus === 'active' ? 'ACTIVATED_NOTICE' : 'DEACTIVATED_NOTICE',
      entityType: 'Notice',
      entityName: notice.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS'
    });

    return { success: true, nextStatus };
  }

  static async deleteNotice(id: string): Promise<boolean> {
    const idx = memoryNotices.findIndex((n) => n.id === id);
    if (idx !== -1) {
      const deleted = memoryNotices[idx];
      memoryNotices.splice(idx, 1);

      await AuditService.recordLog({
        actorName: 'Admin',
        actorRole: 'Admin',
        action: 'DELETED_NOTICE',
        entityType: 'Notice',
        entityName: deleted.titleEn,
        ipAddress: '127.0.0.1 (Jaipur)',
        status: 'SUCCESS'
      });

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
      noticeType: n.noticeType,
      status: n.status === 'active' ? 'published' : 'archived',
      summaryHi: n.summaryHi,
      summaryEn: n.summaryEn,
      facts: n.facts,
      sections: n.sections,
      links: n.links,
      publishedAt: n.publishedAt || n.updatedAt,
      updatedAt: n.updatedAt,
    };
  }
}
