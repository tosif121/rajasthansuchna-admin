import fs from 'fs';
import path from 'path';
import { AuditService } from './audit-service';

export interface SyllabusRecord {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyId: string;
  agencyName: string;
  examYear: string;
  totalMarks?: string;
  durationMinutes?: number;
  pdfUrl: string;
  subjects: string[];
  schemeSummary?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PyqRecord {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyId: string;
  agencyName: string;
  examYear: string;
  paperType: string;
  shiftOrDate?: string;
  questionPaperUrl: string;
  answerKeyUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentAffairsRecord {
  id: string;
  slug: string;
  date: string;
  titleHi: string;
  titleEn: string;
  summaryHi: string;
  summaryEn: string;
  category: string;
  sourceUrl?: string;
  sourceName?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanPhase {
  phaseNumber: number;
  title: string;
  durationWeeks: number;
  focusAreas: string[];
}

export interface StudyPlanResource {
  title: string;
  url?: string;
  type: 'pdf' | 'link' | 'book';
}

export interface StudyPlanRecord {
  id: string;
  slug: string;
  examTitleHi: string;
  examTitleEn: string;
  agencyId: string;
  targetDate?: string;
  durationDays: number;
  dailyHoursTarget: number;
  phases: StudyPlanPhase[];
  keyMilestones: string[];
  recommendedResources: StudyPlanResource[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PrepDataStore {
  syllabuses: SyllabusRecord[];
  pyqs: PyqRecord[];
  currentAffairs: CurrentAffairsRecord[];
  studyPlans: StudyPlanRecord[];
}

const SEED_FILE = path.join(process.cwd(), 'src', 'data', 'prep-seed.json');

function loadStore(): PrepDataStore {
  try {
    if (fs.existsSync(SEED_FILE)) {
      const raw = fs.readFileSync(SEED_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load prep-seed.json:', err);
  }
  return { syllabuses: [], pyqs: [], currentAffairs: [], studyPlans: [] };
}

function saveStore(data: PrepDataStore) {
  try {
    fs.writeFileSync(SEED_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save prep-seed.json:', err);
  }
}

let memoryStore: PrepDataStore = loadStore();

export class PrepService {
  // --- SYLLABUS ---
  static async getSyllabuses(query?: string, agencyId?: string): Promise<SyllabusRecord[]> {
    let list = [...memoryStore.syllabuses];
    if (agencyId && agencyId !== 'all') {
      list = list.filter((s) => s.agencyId.toLowerCase() === agencyId.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.titleEn.toLowerCase().includes(q) ||
          s.titleHi.includes(q) ||
          s.agencyName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getSyllabusById(id: string): Promise<SyllabusRecord | null> {
    return memoryStore.syllabuses.find((s) => s.id === id || s.slug === id) || null;
  }

  static async createSyllabus(input: Omit<SyllabusRecord, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<SyllabusRecord> {
    const now = new Date().toISOString();
    const id = `syl_${Date.now()}`;
    const slug = (input.titleEn || input.titleHi)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const record: SyllabusRecord = {
      ...input,
      id,
      slug: slug || id,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.syllabuses.unshift(record);
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'CREATED_SYLLABUS',
      entityType: 'Syllabus',
      entityName: record.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return record;
  }

  static async updateSyllabus(id: string, input: Partial<SyllabusRecord>): Promise<SyllabusRecord | null> {
    const idx = memoryStore.syllabuses.findIndex((s) => s.id === id || s.slug === id);
    if (idx === -1) return null;

    const existing = memoryStore.syllabuses[idx];
    const updated: SyllabusRecord = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.syllabuses[idx] = updated;
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'UPDATED_SYLLABUS',
      entityType: 'Syllabus',
      entityName: updated.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return updated;
  }

  static async deleteSyllabus(id: string): Promise<boolean> {
    const idx = memoryStore.syllabuses.findIndex((s) => s.id === id || s.slug === id);
    if (idx === -1) return false;

    const deleted = memoryStore.syllabuses[idx];
    memoryStore.syllabuses.splice(idx, 1);
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'DELETED_SYLLABUS',
      entityType: 'Syllabus',
      entityName: deleted.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return true;
  }

  // --- PYQS ---
  static async getPyqs(query?: string, agencyId?: string): Promise<PyqRecord[]> {
    let list = [...memoryStore.pyqs];
    if (agencyId && agencyId !== 'all') {
      list = list.filter((p) => p.agencyId.toLowerCase() === agencyId.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.titleEn.toLowerCase().includes(q) ||
          p.titleHi.includes(q) ||
          p.agencyName.toLowerCase().includes(q) ||
          p.paperType.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getPyqById(id: string): Promise<PyqRecord | null> {
    return memoryStore.pyqs.find((p) => p.id === id || p.slug === id) || null;
  }

  static async createPyq(input: Omit<PyqRecord, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<PyqRecord> {
    const now = new Date().toISOString();
    const id = `pyq_${Date.now()}`;
    const slug = (input.titleEn || input.titleHi)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const record: PyqRecord = {
      ...input,
      id,
      slug: slug || id,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.pyqs.unshift(record);
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'CREATED_PYQ',
      entityType: 'PYQ',
      entityName: record.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return record;
  }

  static async updatePyq(id: string, input: Partial<PyqRecord>): Promise<PyqRecord | null> {
    const idx = memoryStore.pyqs.findIndex((p) => p.id === id || p.slug === id);
    if (idx === -1) return null;

    const existing = memoryStore.pyqs[idx];
    const updated: PyqRecord = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.pyqs[idx] = updated;
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'UPDATED_PYQ',
      entityType: 'PYQ',
      entityName: updated.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return updated;
  }

  static async deletePyq(id: string): Promise<boolean> {
    const idx = memoryStore.pyqs.findIndex((p) => p.id === id || p.slug === id);
    if (idx === -1) return false;

    const deleted = memoryStore.pyqs[idx];
    memoryStore.pyqs.splice(idx, 1);
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'DELETED_PYQ',
      entityType: 'PYQ',
      entityName: deleted.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return true;
  }

  // --- CURRENT AFFAIRS ---
  static async getCurrentAffairs(query?: string, category?: string): Promise<CurrentAffairsRecord[]> {
    let list = [...memoryStore.currentAffairs];
    if (category && category !== 'all') {
      list = list.filter((c) => c.category === category);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.titleEn.toLowerCase().includes(q) ||
          c.titleHi.includes(q) ||
          c.summaryEn.toLowerCase().includes(q) ||
          c.summaryHi.includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getCurrentAffairById(id: string): Promise<CurrentAffairsRecord | null> {
    return memoryStore.currentAffairs.find((c) => c.id === id || c.slug === id) || null;
  }

  static async createCurrentAffair(input: Omit<CurrentAffairsRecord, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<CurrentAffairsRecord> {
    const now = new Date().toISOString();
    const id = `ca_${Date.now()}`;
    const slug = (input.titleEn || input.titleHi)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const record: CurrentAffairsRecord = {
      ...input,
      id,
      slug: slug || id,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.currentAffairs.unshift(record);
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'CREATED_CURRENT_AFFAIR',
      entityType: 'CurrentAffairs',
      entityName: record.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return record;
  }

  static async updateCurrentAffair(id: string, input: Partial<CurrentAffairsRecord>): Promise<CurrentAffairsRecord | null> {
    const idx = memoryStore.currentAffairs.findIndex((c) => c.id === id || c.slug === id);
    if (idx === -1) return null;

    const existing = memoryStore.currentAffairs[idx];
    const updated: CurrentAffairsRecord = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.currentAffairs[idx] = updated;
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'UPDATED_CURRENT_AFFAIR',
      entityType: 'CurrentAffairs',
      entityName: updated.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return updated;
  }

  static async deleteCurrentAffair(id: string): Promise<boolean> {
    const idx = memoryStore.currentAffairs.findIndex((c) => c.id === id || c.slug === id);
    if (idx === -1) return false;

    const deleted = memoryStore.currentAffairs[idx];
    memoryStore.currentAffairs.splice(idx, 1);
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'DELETED_CURRENT_AFFAIR',
      entityType: 'CurrentAffairs',
      entityName: deleted.titleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return true;
  }

  // --- STUDY PLANS ---
  static async getStudyPlans(query?: string, agencyId?: string): Promise<StudyPlanRecord[]> {
    let list = [...memoryStore.studyPlans];
    if (agencyId && agencyId !== 'all') {
      list = list.filter((sp) => sp.agencyId.toLowerCase() === agencyId.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (sp) =>
          sp.examTitleEn.toLowerCase().includes(q) ||
          sp.examTitleHi.includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getStudyPlanById(id: string): Promise<StudyPlanRecord | null> {
    return memoryStore.studyPlans.find((sp) => sp.id === id || sp.slug === id) || null;
  }

  static async createStudyPlan(input: Omit<StudyPlanRecord, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<StudyPlanRecord> {
    const now = new Date().toISOString();
    const id = `sp_${Date.now()}`;
    const slug = (input.examTitleEn || input.examTitleHi)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const record: StudyPlanRecord = {
      ...input,
      id,
      slug: slug || id,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.studyPlans.unshift(record);
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'CREATED_STUDY_PLAN',
      entityType: 'StudyPlan',
      entityName: record.examTitleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return record;
  }

  static async updateStudyPlan(id: string, input: Partial<StudyPlanRecord>): Promise<StudyPlanRecord | null> {
    const idx = memoryStore.studyPlans.findIndex((sp) => sp.id === id || sp.slug === id);
    if (idx === -1) return null;

    const existing = memoryStore.studyPlans[idx];
    const updated: StudyPlanRecord = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    memoryStore.studyPlans[idx] = updated;
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'UPDATED_STUDY_PLAN',
      entityType: 'StudyPlan',
      entityName: updated.examTitleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return updated;
  }

  static async deleteStudyPlan(id: string): Promise<boolean> {
    const idx = memoryStore.studyPlans.findIndex((sp) => sp.id === id || sp.slug === id);
    if (idx === -1) return false;

    const deleted = memoryStore.studyPlans[idx];
    memoryStore.studyPlans.splice(idx, 1);
    saveStore(memoryStore);

    await AuditService.recordLog({
      actorName: 'Admin',
      actorRole: 'Admin',
      action: 'DELETED_STUDY_PLAN',
      entityType: 'StudyPlan',
      entityName: deleted.examTitleEn,
      ipAddress: '127.0.0.1 (Jaipur)',
      status: 'SUCCESS',
    });

    return true;
  }
}
