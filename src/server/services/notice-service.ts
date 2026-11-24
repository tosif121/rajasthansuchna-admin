import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { AuditService } from './audit-service';
import { isNeonReachable, safeNeonQuery } from '@/lib/db';

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
  correctionEndDate?: string;
  examCityDate?: string;
  admitCardDate?: string;
  examDate?: string;
  answerKeyDate?: string;
  feeGeneralObc?: string;
  feeScSt?: string;
  feePh?: string;
  qualification: string;
  ageMin?: number;
  ageMax?: number;
  ageAsOnDate?: string;
  ageRelaxation?: string;
  categoryVacancies?: Record<string, string | number>;
  howToApply?: string;
  howToDownloadAdmitCard?: string;
  howToCheckResult?: string;
  telegramUrl?: string;
  whatsappUrl?: string;
  syllabusUrl?: string;
  shortNoticeUrl?: string;
  correctionUrl?: string;
  admitCardUrl?: string;
  examCityUrl?: string;
  answerKeyUrl?: string;
  scoreCardUrl?: string;
  resultUrl?: string;
  officialSiteUrl?: string;
  applyOnlineUrl?: string;
  notificationPdfUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;
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
  expiresAt?: string;
  isFeatured: boolean;
  isBreaking: boolean;
  revisionNotes?: string;
  updatedAt: string;
}

interface SeedVacancy {
  id: string;
  slug: string;
  titleHi?: string;
  titleEn?: string;
  agencyId?: string;
  categoryId?: string;
  state?: string;
  type?: string;
  summaryHi?: string;
  summaryEn?: string;
  facts?: FlutterRecruitmentFacts;
  sections?: FlutterArticleSection[];
  links?: FlutterOfficialLink[];
  publishedAt?: string;
  expiresAt?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  updatedAt?: string;
}

interface NoticeRow {
  id: string;
  slug: string;
  titleHi?: string | null;
  titleEn?: string | null;
  agencyId?: string;
  agencyName?: string | null;
  categoryId: string;
  categoryName?: string | null;
  state?: string | null;
  noticeType?: string | null;
  status?: string | null;
  revisionNumber?: number | null;
  summaryHi?: string | null;
  summaryEn?: string | null;
  facts?: FlutterRecruitmentFacts | null;
  sections?: FlutterArticleSection[] | null;
  links?: FlutterOfficialLink[] | null;
  publishedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  isFeatured?: boolean | null;
  isBreaking?: boolean | null;
  updatedAt?: string | Date | null;
}

function initMemoryNotices(): AdminNoticeRecord[] {
  try {
    const noticesPath = path.join(process.cwd(), "src", "data", "notices.json");
    if (fs.existsSync(noticesPath)) {
      const items = JSON.parse(fs.readFileSync(noticesPath, "utf8"));
      if (Array.isArray(items) && items.length > 0) {
        return items.map((v: any) => ({
          id: v.id || `not_${v.slug}`,
          slug: v.slug,
          titleHi: v.titleHi || '',
          titleEn: v.titleEn || '',
          agencyId: v.agencyId || 'rssb',
          agencyName: v.agencyName || (v.agencyId || '').toUpperCase(),
          categoryId: v.categoryId || 'rajasthan',
          categoryName: v.categoryName || v.categoryId || 'General',
          state: v.state === 'central' ? 'central' : 'rajasthan',
          noticeType: v.noticeType || v.type || 'vacancy',
          status: (v.status === 'inactive' ? 'inactive' : 'active') as NoticeStatus,
          revisionNumber: v.revisionNumber || 1,
          summaryHi: v.summaryHi || '',
          summaryEn: v.summaryEn || '',
          facts: (v.facts || {}) as FlutterRecruitmentFacts,
          sections: v.sections || [],
          links: v.links || [],
          editorId: v.editorId || 'admin',
          editorName: v.editorName || 'Administrator',
          publishedAt: v.publishedAt || new Date().toISOString(),
          expiresAt: v.expiresAt || null,
          isFeatured: Boolean(v.isFeatured),
          isBreaking: Boolean(v.isBreaking),
          updatedAt: v.updatedAt || v.publishedAt || new Date().toISOString(),
        }));
      }
    }

    const seedPath = path.join(process.cwd(), "src", "data", "seed-data.json");
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, "utf8"));
      if (Array.isArray(data.vacancies)) {
        return data.vacancies
          .filter((v: SeedVacancy) => !/sample/i.test(`${v.titleEn || ''} ${v.titleHi || ''} ${v.slug || ''}`))
          .map((v: SeedVacancy) => ({
          id: v.id,
          slug: v.slug,
          titleHi: v.titleHi,
          titleEn: v.titleEn,
          agencyId: v.agencyId || "",
          agencyName: (v.agencyId || "").toUpperCase(),
          categoryId: v.categoryId,
          categoryName: v.categoryId || "General",
          state: v.state === "central" ? "central" : "rajasthan",
          noticeType: v.type || "vacancy",
          status: "active" as NoticeStatus,
          revisionNumber: 1,
          summaryHi: v.summaryHi || "",
          summaryEn: v.summaryEn || "",
          facts: (v.facts || {}) as FlutterRecruitmentFacts,
          sections: v.sections || [],
          links: v.links || [],
          editorId: "admin",
          editorName: "Administrator",
          publishedAt: v.publishedAt,
          expiresAt: v.expiresAt,
          isFeatured: Boolean(v.isFeatured),
          isBreaking: Boolean(v.isBreaking),
          updatedAt: v.updatedAt || v.publishedAt || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.error("Failed to initialize memory notices from seed data:", err);
  }
  return [];
}

function saveMemoryNotices(_list: AdminNoticeRecord[]) {
  // DB is the single source of truth; no local json file writing needed.
}

const memoryNotices: AdminNoticeRecord[] = initMemoryNotices();

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
    if (sql && (await isNeonReachable(sql))) {
      try {
        const queryPromise = sql`
          SELECT 
            n.id, n.slug, n.state, n.notice_type as "noticeType", n.status, 
            n.published_at as "publishedAt", n.expires_at as "expiresAt",
            n.is_featured as "isFeatured", n.is_breaking as "isBreaking",
            n.updated_at as "updatedAt",
            a.slug as "agencyId", a.name_en as "agencyName",
            c.slug as "categoryId", c.name_en as "categoryName",
            r.revision_number as "revisionNumber", r.title_hi as "titleHi", r.title_en as "titleEn", 
            r.summary_hi as "summaryHi", r.summary_en as "summaryEn",
            r.facts_json as "facts", r.sections_json as "sections", r.links_json as "links"
          FROM notices n
          LEFT JOIN agencies a ON n.agency_id = a.id
          LEFT JOIN categories c ON n.category_id = c.id
          LEFT JOIN notice_revisions r ON r.id = COALESCE(n.current_revision_id, (
            SELECT nr.id FROM notice_revisions nr WHERE nr.notice_id = n.id ORDER BY nr.revision_number DESC LIMIT 1
          ))
          ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC;
        `;
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('DB Timeout')), 4500)
        );

        const rows = await Promise.race([queryPromise, timeoutPromise]);
        if (rows && Array.isArray(rows) && rows.length > 0) {
          let list: AdminNoticeRecord[] = (rows as unknown as NoticeRow[]).map((r) => ({
            id: r.id,
            slug: r.slug,
            titleHi: r.titleHi || '',
            titleEn: r.titleEn || '',
            agencyId: r.agencyId || '',
            agencyName: r.agencyName || (r.agencyId || '').toUpperCase(),
            categoryId: r.categoryId,
            categoryName: r.categoryName || r.categoryId,
            state: r.state === 'central' ? 'central' : 'rajasthan',
            noticeType: r.noticeType || 'vacancy',
            status: (r.status === 'active' || r.status === 'published' ? 'active' : 'inactive') as NoticeStatus,
            revisionNumber: r.revisionNumber || 1,
            summaryHi: r.summaryHi || '',
            summaryEn: r.summaryEn || '',
            facts: (r.facts || {}) as unknown as FlutterRecruitmentFacts,
            sections: r.sections || [],
            links: r.links || [],
            editorId: 'admin',
            editorName: 'Administrator',
            publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : undefined,
            expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : undefined,
            isFeatured: Boolean(r.isFeatured),
            isBreaking: Boolean(r.isBreaking),
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
      } catch {
        // Fall back to instant persistent memory notices
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
    return list.find((n) => n.slug === slug || n.id === slug) || null;
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
        verifiedBy: 'Raj Suchna Operations'
      },
      sections: data.sections || [],
      links: data.links || [],
      editorId: actorId,
      editorName: actorName,
      publishedAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
      isFeatured: Boolean(data.isFeatured),
      isBreaking: Boolean(data.isBreaking),
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
            INSERT INTO notices (
              slug, agency_id, category_id, state, notice_type, status,
              published_at, expires_at, is_featured, is_breaking
            )
            VALUES (
              ${newRecord.slug}, ${agencyDbId}, ${catDbId}, ${newRecord.state},
              ${newRecord.noticeType}, ${newRecord.status}, now(),
              ${newRecord.expiresAt || null}, ${newRecord.isFeatured}, ${newRecord.isBreaking}
            )
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
    saveMemoryNotices(memoryNotices);

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

  static async updateNotice(
    id: string,
    data: Partial<AdminNoticeRecord>,
    actorName: string = 'Admin'
  ): Promise<{ success: boolean; notice?: AdminNoticeRecord; error?: string }> {
    const notice = await this.getNoticeById(id);
    if (!notice) return { success: false, error: 'Notice not found.' };

    const merged: AdminNoticeRecord = {
      ...notice,
      ...data,
      id: notice.id,
      slug: notice.slug,
      facts: { ...notice.facts, ...(data.facts || {}) },
      sections: data.sections ?? notice.sections,
      links: data.links ?? notice.links,
      status: (data.status as NoticeStatus) || notice.status,
      noticeType: data.noticeType || notice.noticeType,
      state: data.state || notice.state,
      isFeatured: data.isFeatured ?? notice.isFeatured,
      isBreaking: data.isBreaking ?? notice.isBreaking,
      expiresAt: data.expiresAt ?? notice.expiresAt,
      editorId: notice.editorId,
      editorName: notice.editorName,
      updatedAt: new Date().toISOString(),
      revisionNumber: (notice.revisionNumber || 1) + 1,
    };

    const sql = getSql();
    if (sql) {
      try {
        const agencyRows = await sql`SELECT id FROM agencies WHERE slug = ${merged.agencyId} LIMIT 1;`;
        const catRows = await sql`SELECT id FROM categories WHERE slug = ${merged.categoryId} LIMIT 1;`;
        const agencyDbId = agencyRows[0]?.id;
        const catDbId = catRows[0]?.id;

        if (!agencyDbId || !catDbId) {
          return { success: false, error: 'Selected agency or category was not found.' };
        }

        const [updatedNotice] = await sql`
          UPDATE notices
          SET agency_id = ${agencyDbId},
              category_id = ${catDbId},
              state = ${merged.state},
              notice_type = ${merged.noticeType},
              status = ${merged.status},
              expires_at = ${merged.expiresAt || null},
              is_featured = ${merged.isFeatured},
              is_breaking = ${merged.isBreaking},
              updated_at = now()
          WHERE id::text = ${notice.id} OR slug = ${notice.slug} OR id::text = ${id}
          RETURNING id;
        `;

        if (!updatedNotice) {
          return { success: false, error: 'Notice not found in database.' };
        }

        const [maxRev] = await sql`
          SELECT COALESCE(MAX(revision_number), 0) as "maxRev"
          FROM notice_revisions
          WHERE notice_id = ${updatedNotice.id};
        `;
        const nextRevisionNumber = (Number(maxRev?.maxRev) || 0) + 1;
        merged.revisionNumber = nextRevisionNumber;

        const [revision] = await sql`
          INSERT INTO notice_revisions (
            notice_id, revision_number, title_hi, title_en, summary_hi, summary_en,
            facts_json, sections_json, links_json, revision_notes
          )
          VALUES (
            ${updatedNotice.id}, ${nextRevisionNumber}, ${merged.titleHi}, ${merged.titleEn},
            ${merged.summaryHi}, ${merged.summaryEn},
            ${JSON.stringify(merged.facts)},
            ${JSON.stringify(merged.sections)},
            ${JSON.stringify(merged.links)},
            ${data.revisionNotes || 'Updated via admin console'}
          )
          RETURNING id;
        `;

        await sql`
          UPDATE notices SET current_revision_id = ${revision.id} WHERE id = ${updatedNotice.id};
        `;

        merged.id = updatedNotice.id;
      } catch (err) {
        console.error('Failed to update notice in Neon DB:', err);
        const errMsg = err instanceof Error ? err.message : 'Database update failed.';
        return { success: false, error: `Database update failed: ${errMsg}` };
      }
    }

    const memoryIndex = memoryNotices.findIndex((n) => n.id === notice.id || n.slug === notice.slug);
    if (memoryIndex !== -1) {
      memoryNotices[memoryIndex] = merged;
      saveMemoryNotices(memoryNotices);
    }

    await AuditService.recordLog({
      actorName,
      actorRole: 'Admin',
      action: 'UPDATED_NOTICE',
      entityType: 'Notice',
      entityName: merged.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS'
    });

    return { success: true, notice: merged };
  }

  static async updateNoticeStatus(id: string, status: NoticeStatus): Promise<{ success: boolean; notice?: AdminNoticeRecord; error?: string }> {
    const notice = await this.getNoticeById(id);
    if (!notice) return { success: false, error: 'Notice not found.' };

    notice.status = status;
    notice.updatedAt = new Date().toISOString();
    if (status === 'active' && !notice.publishedAt) {
      notice.publishedAt = new Date().toISOString();
    }
    saveMemoryNotices(memoryNotices);

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
      saveMemoryNotices(memoryNotices);

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

  static async bulkUpdateStatus(ids: string[], status: NoticeStatus): Promise<{ updatedCount: number }> {
    if (!ids || ids.length === 0) return { updatedCount: 0 };
    const idSet = new Set(ids);
    let updatedCount = 0;
    const now = new Date().toISOString();

    for (const notice of memoryNotices) {
      if (idSet.has(notice.id) || idSet.has(notice.slug)) {
        notice.status = status;
        notice.updatedAt = now;
        if (status === 'active' && !notice.publishedAt) {
          notice.publishedAt = now;
        }
        updatedCount++;
      }
    }
    saveMemoryNotices(memoryNotices);

    const sql = getSql();
    if (sql) {
      try {
        await sql`
          UPDATE notices
          SET status = ${status}, updated_at = now()
          WHERE id::text = ANY(${ids}) OR slug = ANY(${ids});
        `;
      } catch (err) {
        console.error('Failed to bulk update notice status in DB:', err);
      }
    }

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: status === 'active' ? 'BULK_ACTIVATED_NOTICES' : 'BULK_DEACTIVATED_NOTICES',
      entityType: 'Notice',
      entityName: `${updatedCount} notices`,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS'
    });

    return { updatedCount };
  }

  static async bulkDelete(ids: string[]): Promise<{ deletedCount: number }> {
    if (!ids || ids.length === 0) return { deletedCount: 0 };
    const idSet = new Set(ids);
    const initialLen = memoryNotices.length;

    const remaining = memoryNotices.filter((n) => !idSet.has(n.id) && !idSet.has(n.slug));
    const deletedCount = initialLen - remaining.length;
    memoryNotices.length = 0;
    memoryNotices.push(...remaining);
    saveMemoryNotices(memoryNotices);

    const sql = getSql();
    if (sql) {
      try {
        await sql`
          DELETE FROM notices
          WHERE id::text = ANY(${ids}) OR slug = ANY(${ids});
        `;
      } catch (err) {
        console.error('Failed to bulk delete notices from DB:', err);
      }
    }

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'BULK_DELETED_NOTICES',
      entityType: 'Notice',
      entityName: `${deletedCount} notices`,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS'
    });

    return { deletedCount };
  }

  static async bulkEdit(
    ids: string[],
    updates: {
      categoryId?: string;
      agencyId?: string;
      agencyName?: string;
      isBreaking?: boolean;
      status?: NoticeStatus;
    }
  ): Promise<{ updatedCount: number }> {
    if (!ids || ids.length === 0) return { updatedCount: 0 };
    const idSet = new Set(ids);
    let updatedCount = 0;
    const now = new Date().toISOString();

    for (const notice of memoryNotices) {
      if (idSet.has(notice.id) || idSet.has(notice.slug)) {
        if (updates.categoryId !== undefined) notice.categoryId = updates.categoryId;
        if (updates.agencyId !== undefined) {
          notice.agencyId = updates.agencyId;
          if (updates.agencyName) notice.agencyName = updates.agencyName;
        }
        if (updates.isBreaking !== undefined) notice.isBreaking = updates.isBreaking;
        if (updates.status !== undefined) {
          notice.status = updates.status;
          if (updates.status === 'active' && !notice.publishedAt) {
            notice.publishedAt = now;
          }
        }
        notice.updatedAt = now;
        updatedCount++;
      }
    }
    saveMemoryNotices(memoryNotices);

    const sql = getSql();
    if (sql) {
      try {
        for (const id of ids) {
          await sql`
            UPDATE notices
            SET 
              category_id = COALESCE(${updates.categoryId || null}, category_id),
              agency_id = COALESCE(${updates.agencyId || null}, agency_id),
              agency_name = COALESCE(${updates.agencyName || null}, agency_name),
              is_breaking = COALESCE(${updates.isBreaking !== undefined ? updates.isBreaking : null}, is_breaking),
              status = COALESCE(${updates.status || null}, status),
              updated_at = now()
            WHERE id::text = ${id} OR slug = ${id};
          `;
        }
      } catch (err) {
        console.error('Failed to bulk edit notices in DB:', err);
      }
    }

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'BULK_EDITED_NOTICES',
      entityType: 'Notice',
      entityName: `${updatedCount} notices`,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS'
    });

    return { updatedCount };
  }

  static toFlutterVacancy(n: AdminNoticeRecord) {
    return {
      id: n.id,
      titleHi: n.titleHi,
      titleEn: n.titleEn,
      slug: n.slug,
      categoryId: n.categoryId,
      agencyId: n.agencyId,
      agencyName: n.agencyName || (n.agencyId || '').toUpperCase(),
      state: n.state,
      type: n.noticeType,
      noticeType: n.noticeType,
      status: n.status === 'active' ? 'published' : 'archived',
      isFeatured: n.isFeatured,
      isBreaking: n.isBreaking,
      expiresAt: n.expiresAt,
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
