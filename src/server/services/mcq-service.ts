import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { AuditService } from './audit-service';
import { isNeonReachable, safeNeonQuery } from '@/lib/db';

export interface McqOption {
  hi: string;
  en: string;
}

export interface McqQuestionInput {
  questionHi: string;
  questionEn: string;
  options: McqOption[];
  correctOption: number;
  explanationHi?: string;
  explanationEn?: string;
}

export interface McqQuestionRecord extends McqQuestionInput {
  id: string;
  orderIndex: number;
}

export interface McqTestInput {
  slug?: string;
  titleHi: string;
  titleEn: string;
  descriptionHi?: string;
  descriptionEn?: string;
  durationMinutes?: number;
  isActive?: boolean;
  questions: McqQuestionInput[];
}

export interface McqTestRecord extends Omit<McqTestInput, 'questions'> {
  id: string;
  slug: string;
  isActive: boolean;
  durationMinutes: number;
  questions: McqQuestionRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface McqTestSummary {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  durationMinutes: number;
  isActive: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SeedQuestion {
  id?: string;
  questionHi?: string;
  questionEn?: string;
  options?: McqOption[];
  correctOption?: number;
  explanationHi?: string;
  explanationEn?: string;
}

interface SeedTest {
  id?: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi?: string;
  descriptionEn?: string;
  durationMinutes?: number;
  isActive?: boolean;
  questions?: SeedQuestion[];
}

interface TestRow {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi?: string | null;
  descriptionEn?: string | null;
  durationMinutes?: number | null;
  isActive?: boolean | null;
  questionCount?: number | string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

interface QuestionRow {
  id: string;
  questionHi: string;
  questionEn: string;
  optionsJson?: McqOption[] | null;
  correctOption?: number | null;
  explanationHi?: string | null;
  explanationEn?: string | null;
  orderIndex?: number | null;
}

const nowIso = () => new Date().toISOString();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function loadSeedTests(): McqTestRecord[] {
  try {
    const seedPath = path.join(process.cwd(), 'src', 'data', 'mcq-tests.json');
    if (!fs.existsSync(seedPath)) return [];
    const data = JSON.parse(fs.readFileSync(seedPath, 'utf8')) as SeedTest[];
    if (!Array.isArray(data)) return [];
    return data.map((test) => ({
      id: test.id || test.slug,
      slug: test.slug,
      titleHi: test.titleHi,
      titleEn: test.titleEn,
      descriptionHi: test.descriptionHi || '',
      descriptionEn: test.descriptionEn || '',
      durationMinutes: test.durationMinutes || 10,
      isActive: test.isActive !== false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      questions: (test.questions || []).map((question, index) => ({
        id: question.id || `q${index + 1}`,
        questionHi: question.questionHi || '',
        questionEn: question.questionEn || '',
        options: Array.isArray(question.options) ? question.options : [],
        correctOption: question.correctOption || 0,
        explanationHi: question.explanationHi || '',
        explanationEn: question.explanationEn || '',
        orderIndex: index,
      })),
    }));
  } catch {
    return [];
  }
}

const memoryTests: McqTestRecord[] = loadSeedTests();

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('ep-sample')) return neon(dbUrl);
  return null;
}

function normalizeQuestions(input: McqQuestionInput[] | undefined): McqQuestionInput[] {
  const questions = Array.isArray(input) ? input : [];
  if (questions.length === 0) throw new Error('At least one question is required.');
  return questions.map((question, index) => {
    const questionHi = String(question.questionHi || '').trim();
    const questionEn = String(question.questionEn || '').trim();
    if (!questionHi && !questionEn) throw new Error(`Question ${index + 1} is missing text.`);
    const options = Array.isArray(question.options) ? question.options.map((option) => ({
      hi: String(option?.hi || '').trim(),
      en: String(option?.en || '').trim(),
    })) : [];
    if (options.length < 2 || options.some((option) => !option.hi && !option.en)) {
      throw new Error(`Question ${index + 1} must have at least two options.`);
    }
    const correctOption = Number(question.correctOption);
    if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption >= options.length) {
      throw new Error(`Question ${index + 1} has an invalid correct option.`);
    }
    return {
      questionHi: questionHi || questionEn,
      questionEn: questionEn || questionHi,
      options,
      correctOption,
      explanationHi: String(question.explanationHi || '').trim(),
      explanationEn: String(question.explanationEn || '').trim(),
    };
  });
}

function normalizeInput(input: Partial<McqTestInput>, existingSlug?: string): McqTestInput {
  const titleHi = String(input.titleHi || '').trim();
  const titleEn = String(input.titleEn || '').trim();
  if (!titleHi && !titleEn) throw new Error('Test title is required.');
  const duration = Number(input.durationMinutes);
  return {
    slug: slugify(input.slug || existingSlug || titleEn || titleHi),
    titleHi: titleHi || titleEn,
    titleEn: titleEn || titleHi,
    descriptionHi: String(input.descriptionHi || '').trim(),
    descriptionEn: String(input.descriptionEn || '').trim(),
    durationMinutes: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 10,
    isActive: input.isActive !== false,
    questions: normalizeQuestions(input.questions),
  };
}

function toRecord(row: TestRow, questions: McqQuestionRecord[]): McqTestRecord {
  return {
    id: row.id,
    slug: row.slug,
    titleHi: row.titleHi,
    titleEn: row.titleEn,
    descriptionHi: row.descriptionHi || '',
    descriptionEn: row.descriptionEn || '',
    durationMinutes: row.durationMinutes || 10,
    isActive: row.isActive !== false,
    questions,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : nowIso(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : nowIso(),
  };
}

function toSummary(test: McqTestRecord): McqTestSummary {
  return {
    id: test.id,
    slug: test.slug,
    titleHi: test.titleHi,
    titleEn: test.titleEn,
    descriptionHi: test.descriptionHi || '',
    descriptionEn: test.descriptionEn || '',
    durationMinutes: test.durationMinutes,
    isActive: test.isActive,
    questionCount: test.questions.length,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
  };
}

function questionsFromRows(rows: QuestionRow[]): McqQuestionRecord[] {
  return rows.map((row, index) => ({
    id: row.id,
    questionHi: row.questionHi || '',
    questionEn: row.questionEn || '',
    options: Array.isArray(row.optionsJson) ? row.optionsJson : [],
    correctOption: row.correctOption || 0,
    explanationHi: row.explanationHi || '',
    explanationEn: row.explanationEn || '',
    orderIndex: row.orderIndex ?? index,
  }));
}

export class McqService {
  static async getAllTests(includeInactive = false): Promise<McqTestSummary[]> {
    const db = getSql();
    if (db && (await isNeonReachable(db))) {
      try {
        const rows = (await safeNeonQuery(db`
          SELECT t.id, t.slug, t.title_hi as "titleHi", t.title_en as "titleEn",
                 t.description_hi as "descriptionHi", t.description_en as "descriptionEn",
                 t.duration_minutes as "durationMinutes", t.is_active as "isActive",
                 t.created_at as "createdAt", t.updated_at as "updatedAt",
                 (SELECT COUNT(*) FROM mcq_questions q WHERE q.test_id = t.id) as "questionCount"
          FROM mcq_tests t
          ORDER BY t.created_at DESC;
        `)) as unknown as TestRow[] | null;
        if (rows && rows.length > 0) {
          return rows
            .filter((row) => includeInactive || row.isActive !== false)
            .map((row) => ({
              id: row.id,
              slug: row.slug,
              titleHi: row.titleHi,
              titleEn: row.titleEn,
              descriptionHi: row.descriptionHi || '',
              descriptionEn: row.descriptionEn || '',
              durationMinutes: row.durationMinutes || 10,
              isActive: row.isActive !== false,
              questionCount: Number(row.questionCount || 0),
              createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : nowIso(),
              updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : nowIso(),
            }));
        }
      } catch (err) {
        console.error('Failed to query MCQ tests from DB, using memory:', err);
      }
    }

    return memoryTests
      .filter((test) => includeInactive || test.isActive)
      .map(toSummary);
  }

  static async getTest(identifier: string): Promise<McqTestRecord | null> {
    const db = getSql();
    if (db && (await isNeonReachable(db))) {
      try {
        const tests = (await safeNeonQuery(db`
          SELECT id, slug, title_hi as "titleHi", title_en as "titleEn",
                 description_hi as "descriptionHi", description_en as "descriptionEn",
                 duration_minutes as "durationMinutes", is_active as "isActive",
                 created_at as "createdAt", updated_at as "updatedAt"
          FROM mcq_tests
          WHERE id::text = ${identifier} OR slug = ${identifier}
          LIMIT 1;
        `)) as unknown as TestRow[] | null;
        if (tests && tests.length > 0) {
          const row = tests[0];
          const questions = (await safeNeonQuery(db`
            SELECT id, question_hi as "questionHi", question_en as "questionEn",
                   options_json as "optionsJson", correct_option as "correctOption",
                   explanation_hi as "explanationHi", explanation_en as "explanationEn",
                   order_index as "orderIndex"
            FROM mcq_questions
            WHERE test_id = ${row.id}
            ORDER BY order_index ASC, created_at ASC;
          `)) as unknown as QuestionRow[] | null;
          return toRecord(row, questionsFromRows(questions || []));
        }
      } catch (err) {
        console.error('Failed to query MCQ test from DB, using memory:', err);
      }
    }

    return memoryTests.find((test) => test.id === identifier || test.slug === identifier) || null;
  }

  static async createTest(input: Partial<McqTestInput>, actorName: string): Promise<McqTestRecord> {
    const normalized = normalizeInput(input);
    const timestamp = nowIso();
    const db = getSql();

    if (db && (await isNeonReachable(db))) {
      try {
        const slug = normalized.slug || slugify(normalized.titleEn);
        const res = (await safeNeonQuery(db`
          INSERT INTO mcq_tests (
            slug, title_hi, title_en, description_hi, description_en,
            duration_minutes, is_active, updated_at
          )
          VALUES (
            ${slug}, ${normalized.titleHi}, ${normalized.titleEn},
            ${normalized.descriptionHi || ''}, ${normalized.descriptionEn || ''},
            ${normalized.durationMinutes}, ${normalized.isActive}, now()
          )
          RETURNING id;
        `)) as unknown as { id: string }[] | null;
        const test = res?.[0];
        if (!test) throw new Error('Failed to insert test');

        const questions: McqQuestionRecord[] = [];
        for (let index = 0; index < normalized.questions.length; index++) {
          const question = normalized.questions[index];
          const [inserted] = (await db`
            INSERT INTO mcq_questions (
              test_id, question_hi, question_en, options_json, correct_option,
              explanation_hi, explanation_en, order_index
            )
            VALUES (
              ${test.id}, ${question.questionHi}, ${question.questionEn},
              ${JSON.stringify(question.options)}, ${question.correctOption},
              ${question.explanationHi || ''}, ${question.explanationEn || ''}, ${index}
            )
            RETURNING id;
          `) as unknown as { id: string }[];
          questions.push({ ...question, id: inserted.id, orderIndex: index });
        }

        const created = toRecord({
          id: test.id,
          slug,
          titleHi: normalized.titleHi,
          titleEn: normalized.titleEn,
          descriptionHi: normalized.descriptionHi,
          descriptionEn: normalized.descriptionEn,
          durationMinutes: normalized.durationMinutes,
          isActive: normalized.isActive,
          createdAt: timestamp,
          updatedAt: timestamp,
        }, questions);

        await AuditService.recordLog({
          actorName,
          actorRole: 'Admin',
          action: 'CREATE_MCQ_TEST',
          entityType: 'mcq_test',
          entityName: normalized.titleEn,
          ipAddress: '127.0.0.1',
          status: 'SUCCESS',
        });
        return created;
      } catch (err) {
        console.error('Failed to create MCQ test in DB:', err);
      }
    }

    const existingSlugs = new Set(memoryTests.map((test) => test.slug));
    let slug = normalized.slug || slugify(normalized.titleEn);
    if (existingSlugs.has(slug)) slug = `${slug}-${Date.now()}`;
    const created: McqTestRecord = {
      id: `mcq_${Date.now()}`,
      slug,
      titleHi: normalized.titleHi,
      titleEn: normalized.titleEn,
      descriptionHi: normalized.descriptionHi || '',
      descriptionEn: normalized.descriptionEn || '',
      durationMinutes: normalized.durationMinutes ?? 10,
      isActive: normalized.isActive !== false,
      createdAt: timestamp,
      updatedAt: timestamp,
      questions: normalized.questions.map((question, index) => ({
        ...question,
        id: `q_${Date.now()}_${index}`,
        orderIndex: index,
      })),
    };
    memoryTests.unshift(created);
    await AuditService.recordLog({
      actorName,
      actorRole: 'Admin',
      action: 'CREATE_MCQ_TEST',
      entityType: 'mcq_test',
      entityName: normalized.titleEn,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });
    return created;
  }

  static async updateTest(identifier: string, input: Partial<McqTestInput>, actorName: string): Promise<McqTestRecord> {
    const existing = await this.getTest(identifier);
    if (!existing) throw new Error('MCQ test not found.');
    const normalized = normalizeInput(input, existing.slug);
    const timestamp = nowIso();
    const db = getSql();

    if (db && (await isNeonReachable(db))) {
      try {
        const slug = normalized.slug || existing.slug;
        await safeNeonQuery(db`
          UPDATE mcq_tests SET
            slug = ${slug},
            title_hi = ${normalized.titleHi},
            title_en = ${normalized.titleEn},
            description_hi = ${normalized.descriptionHi || ''},
            description_en = ${normalized.descriptionEn || ''},
            duration_minutes = ${normalized.durationMinutes},
            is_active = ${normalized.isActive},
            updated_at = now()
          WHERE id::text = ${existing.id} OR slug = ${existing.slug};
        `);
        await safeNeonQuery(db`DELETE FROM mcq_questions WHERE test_id = ${existing.id};`);

        const questions: McqQuestionRecord[] = [];
        for (let index = 0; index < normalized.questions.length; index++) {
          const question = normalized.questions[index];
          const [inserted] = (await db`
            INSERT INTO mcq_questions (
              test_id, question_hi, question_en, options_json, correct_option,
              explanation_hi, explanation_en, order_index
            )
            VALUES (
              ${existing.id}, ${question.questionHi}, ${question.questionEn},
              ${JSON.stringify(question.options)}, ${question.correctOption},
              ${question.explanationHi || ''}, ${question.explanationEn || ''}, ${index}
            )
            RETURNING id;
          `) as unknown as { id: string }[];
          questions.push({ ...question, id: inserted.id, orderIndex: index });
        }

        await AuditService.recordLog({
          actorName,
          actorRole: 'Admin',
          action: 'UPDATE_MCQ_TEST',
          entityType: 'mcq_test',
          entityName: normalized.titleEn,
          ipAddress: '127.0.0.1',
          status: 'SUCCESS',
        });
        return {
          ...existing,
          ...normalized,
          slug,
          updatedAt: timestamp,
          questions,
        };
      } catch (err) {
        console.error('Failed to update MCQ test in DB:', err);
      }
    }

    const index = memoryTests.findIndex((test) => test.id === existing.id || test.slug === existing.slug);
    if (index < 0) throw new Error('MCQ test not found.');
    const updated: McqTestRecord = {
      ...existing,
      ...normalized,
      slug: normalized.slug || existing.slug,
      updatedAt: timestamp,
      questions: normalized.questions.map((question, questionIndex) => ({
        ...question,
        id: `q_${Date.now()}_${questionIndex}`,
        orderIndex: questionIndex,
      })),
    };
    memoryTests[index] = updated;
    await AuditService.recordLog({
      actorName,
      actorRole: 'Admin',
      action: 'UPDATE_MCQ_TEST',
      entityType: 'mcq_test',
      entityName: normalized.titleEn,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });
    return updated;
  }

  static async deleteTest(identifier: string, actorName: string): Promise<void> {
    const existing = await this.getTest(identifier);
    if (!existing) throw new Error('MCQ test not found.');
    const db = getSql();
    if (db && (await isNeonReachable(db))) {
      try {
        await safeNeonQuery(db`DELETE FROM mcq_tests WHERE id::text = ${existing.id} OR slug = ${existing.slug};`);
      } catch (err) {
        console.error('Failed to delete MCQ test from DB:', err);
      }
    }
    const index = memoryTests.findIndex((test) => test.id === existing.id || test.slug === existing.slug);
    if (index >= 0) memoryTests.splice(index, 1);
    await AuditService.recordLog({
      actorName,
      actorRole: 'Admin',
      action: 'DELETE_MCQ_TEST',
      entityType: 'mcq_test',
      entityName: existing.titleEn,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });
  }
}
