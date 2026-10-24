import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
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

function initMemoryNotices(): AdminNoticeRecord[] {
  try {
    const seedPath = path.join(process.cwd(), "src", "data", "seed-data.json");
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, "utf8"));
      if (Array.isArray(data.vacancies)) {
        return data.vacancies.map((v: any) => ({
          id: v.id,
          slug: v.slug,
          titleHi: v.titleHi,
          titleEn: v.titleEn,
          agencyId: v.agencyId,
          agencyName: (v.agencyId || "").toUpperCase(),
          categoryId: v.categoryId,
          categoryName: v.categoryId || "General",
          state: v.state === "central" ? "central" : "rajasthan",
          noticeType: v.type || "vacancy",
          status: "active" as NoticeStatus,
          revisionNumber: 1,
          summaryHi: v.summaryHi || "",
          summaryEn: v.summaryEn || "",
          facts: v.facts || {},
          sections: v.sections || [],
          links: v.links || [],
          editorId: "admin",
          editorName: "Administrator",
          publishedAt: v.publishedAt,
          updatedAt: v.updatedAt || v.publishedAt || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.error("Failed to initialize memory notices from seed data:", err);
  }
  return [];
}

let memoryNotices: AdminNoticeRecord[] = initMemoryNotices();

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('ep-sample')) {
    return neon(dbUrl);
  }
  return null;
}

export class NoticeService {
  static async getNotices(filter?: { status?: string; query?: string; agencyId?: string }): Promise<AdminNoticeRecord[]> {
    const sql = getSql();
    if (sql) {
      try {
        const rows = await sql`
          SELECT 
            n.id, n.slug, n.state, n.notice_type as "noticeType", n.status, 
            n.published_at as "publishedAt", n.updated_at as "updatedAt",
            a.slug as "agencyId", a.name_en as "agencyName",
            c.slug as "categoryId", c.name_en as "categoryName",
            r.revision_number as "revisionNumber", r.title_hi as "titleHi", r.title_en as "titleEn", 
            r.summary_hi as "summaryHi", r.summary_en as "summaryEn",
            r.facts_json as "facts", r.sections_json as "sections", r.links_json as "links"
          FROM notices n
          JOIN agencies a ON n.agency_id = a.id
          JOIN categories c ON n.category_id = c.id
          LEFT JOIN notice_revisions r ON r.notice_id = n.id
          ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC;
        `;
        if (rows && rows.length > 0) {
          let list: AdminNoticeRecord[] = rows.map((r: any) => ({
            id: r.id,
            slug: r.slug,
            titleHi: r.titleHi || '',
            titleEn: r.titleEn || '',
            agencyId: r.agencyId,
            agencyName: r.agencyName || (r.agencyId || '').toUpperCase(),
            categoryId: r.categoryId,
            categoryName: r.categoryName || r.categoryId,
            state: r.state === 'central' ? 'central' : 'rajasthan',
            noticeType: r.noticeType || 'vacancy',
            status: (r.status === 'active' ? 'active' : 'inactive') as NoticeStatus,
            revisionNumber: r.revisionNumber || 1,
            summaryHi: r.summaryHi || '',
            summaryEn: r.summaryEn || '',
            facts: r.facts || {},
            sections: r.sections || [],
            links: r.links || [],
            editorId: 'admin',
            editorName: 'Administrator',
            publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : undefined,
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
          }));

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
      } catch (err) {
        console.error('Failed to query notices from DB, falling back to memory:', err);
      }
    }

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
    const list = await this.getNotices();
    return list.find((n) => n.id === id || n.slug === id) || null;
  }

  static async getNoticeBySlug(slug: string): Promise<AdminNoticeRecord | null> {
    const list = await this.getNotices();
    return list.find((n) => n.slug === slug) || null;
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
      agencyId: data.agencyId || 'rssb',
      agencyName: data.agencyName || 'RSMSSB / RSSB',
      categoryId: data.categoryId || 'rajasthan',
      categoryName: data.categoryName || 'Rajasthan',
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

    const sql = getSql();
    if (sql) {
      try {
        const agencyRows = await sql`SELECT id FROM agencies WHERE slug = ${newRecord.agencyId} LIMIT 1;`;
        const catRows = await sql`SELECT id FROM categories WHERE slug = ${newRecord.categoryId} LIMIT 1;`;
        const agencyDbId = agencyRows[0]?.id;
        const catDbId = catRows[0]?.id;

        if (agencyDbId && catDbId) {
          const [insertedNotice] = await sql`
            INSERT INTO notices (slug, agency_id, category_id, state, notice_type, status, published_at)
            VALUES (${newRecord.slug}, ${agencyDbId}, ${catDbId}, ${newRecord.state}, ${newRecord.noticeType}, ${newRecord.status}, now())
            RETURNING id;
          `;

          await sql`
            INSERT INTO notice_revisions (
              notice_id, revision_number, title_hi, title_en, summary_hi, summary_en,
              facts_json, sections_json, links_json
            )
            VALUES (
              ${insertedNotice.id}, 1, ${newRecord.titleHi}, ${newRecord.titleEn},
              ${newRecord.summaryHi}, ${newRecord.summaryEn},
              ${JSON.stringify(newRecord.facts)},
              ${JSON.stringify(newRecord.sections)},
              ${JSON.stringify(newRecord.links)}
            );
          `;
          newRecord.id = insertedNotice.id;
        }
      } catch (err) {
        console.error('Failed to insert notice into Neon DB:', err);
      }
    }

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

    const sql = getSql();
    if (sql) {
      try {
        await sql`
          UPDATE notices 
          SET status = ${status}, updated_at = now() 
          WHERE id::text = ${id} OR slug = ${id};
        `;
      } catch (err) {
        console.error('Failed to update notice status in DB:', err);
      }
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
    return this.updateNoticeStatus(id, nextStatus).then(res => ({
      success: res.success,
      nextStatus,
      error: res.error
    }));
  }

  static async deleteNotice(id: string): Promise<boolean> {
    const sql = getSql();
    if (sql) {
      try {
        await sql`
          DELETE FROM notices 
          WHERE id::text = ${id} OR slug = ${id};
        `;
      } catch (err) {
        console.error('Failed to delete notice from DB:', err);
      }
    }

    const idx = memoryNotices.findIndex((n) => n.id === id || n.slug === id);
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
    return true;
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
