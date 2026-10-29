import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Resolve DATABASE_URL from argv, .env.local, or process.env
let databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes('ep-sample')) {
  const envLocalPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        const val = line.substring('DATABASE_URL='.length).trim();
        if (val && !val.includes('ep-sample')) {
          databaseUrl = val;
          break;
        }
      }
    }
  }
}

console.log('='.repeat(60));
console.log('🚀 RAJASTHAN SUCHNA - NEON DB SEEDER');
console.log('='.repeat(60));

const seedDataPath = path.join(rootDir, 'src', 'data', 'seed-data.json');
if (!fs.existsSync(seedDataPath)) {
  console.error('❌ seed-data.json not found at:', seedDataPath);
  process.exit(1);
}

const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
const { agencies, categories, vacancies } = seedData;
const seedSampleNotices = process.env.SEED_SAMPLE_NOTICES === 'true';
const seedableVacancies = seedSampleNotices
  ? vacancies
  : vacancies.filter((v) => !/sample/i.test(`${v.titleEn || ''} ${v.titleHi || ''} ${v.slug || ''}`));

const mcqSeedPath = path.join(rootDir, 'src', 'data', 'mcq-tests.json');
const mcqTests = fs.existsSync(mcqSeedPath)
  ? JSON.parse(fs.readFileSync(mcqSeedPath, 'utf-8'))
  : [];

console.log(`📦 Loaded seed data:`);
console.log(`   - ${agencies.length} Government Agencies`);
console.log(`   - ${categories.length} Categories`);
console.log(`   - ${seedableVacancies.length} Recruitment Vacancies (sample notices ${seedSampleNotices ? 'enabled' : 'skipped'})`);

if (!databaseUrl || databaseUrl.includes('ep-sample')) {
  console.log('\n⚠️  NO VALID NEON DATABASE_URL FOUND');
  console.log('   The current URL is either missing or contains "ep-sample" placeholder.');
  console.log('\n👉 To seed your Neon PostgreSQL database directly, run:');
  console.log('   node scripts/seed-neon.mjs "postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-PROJECT.us-east-2.aws.neon.tech/neondb?sslmode=require"');
  console.log('\n   Or add your real connection string to .env.local:');
  console.log('   DATABASE_URL=postgresql://...\n');
  process.exit(0);
}

console.log(`\n🔌 Connecting to Neon DB: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}...`);

const sql = neon(databaseUrl);

async function runSeed() {
  try {
    // Step 1: Create tables if not exists
    console.log('\n🔨 Step 1: Creating database schema tables...');

    await sql`
      CREATE TABLE IF NOT EXISTS agencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT NOT NULL UNIQUE,
        name_hi TEXT NOT NULL,
        name_en TEXT NOT NULL,
        code TEXT NOT NULL,
        parent_group TEXT NOT NULL,
        official_url TEXT NOT NULL,
        logo_asset TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT NOT NULL UNIQUE,
        name_hi TEXT NOT NULL,
        name_en TEXT NOT NULL,
        parent_id UUID,
        icon TEXT,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT NOT NULL UNIQUE,
        agency_id UUID NOT NULL REFERENCES agencies(id),
        category_id UUID NOT NULL REFERENCES categories(id),
        state TEXT DEFAULT 'rajasthan' NOT NULL,
        notice_type TEXT DEFAULT 'vacancy' NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        current_revision_id UUID,
        published_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        is_featured BOOLEAN DEFAULT false NOT NULL,
        is_breaking BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS mcq_tests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT NOT NULL UNIQUE,
        title_hi TEXT NOT NULL,
        title_en TEXT NOT NULL,
        description_hi TEXT DEFAULT '' NOT NULL,
        description_en TEXT DEFAULT '' NOT NULL,
        duration_minutes INTEGER DEFAULT 10 NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS mcq_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_id UUID NOT NULL REFERENCES mcq_tests(id) ON DELETE CASCADE,
        question_hi TEXT NOT NULL,
        question_en TEXT NOT NULL,
        options_json JSONB NOT NULL,
        correct_option INTEGER DEFAULT 0 NOT NULL,
        explanation_hi TEXT DEFAULT '' NOT NULL,
        explanation_en TEXT DEFAULT '' NOT NULL,
        order_index INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notice_revisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
        revision_number INTEGER NOT NULL,
        title_hi TEXT NOT NULL,
        title_en TEXT NOT NULL,
        summary_hi TEXT NOT NULL,
        summary_en TEXT NOT NULL,
        facts_json JSONB NOT NULL,
        sections_json JSONB NOT NULL,
        links_json JSONB NOT NULL,
        revision_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        CONSTRAINT notice_revision_unique UNIQUE (notice_id, revision_number)
      );
    `;

    console.log('   ✓ Schema tables verified and ready.');

    // Step 2: Seed Agencies
    console.log(`\n🏛️ Step 2: Seeding ${agencies.length} agencies...`);
    const agencyMap = {};
    for (const a of agencies) {
      const parentGroup = a.parentGroup === 'central' ? 'central' : 'rajasthan';
      const [inserted] = await sql`
        INSERT INTO agencies (slug, name_hi, name_en, code, parent_group, official_url, is_active)
        VALUES (
          ${a.id},
          ${a.nameHi},
          ${a.nameEn},
          ${a.id.toUpperCase()},
          ${parentGroup},
          ${a.officialUrl || 'https://rajasthan.gov.in'},
          true
        )
        ON CONFLICT (slug) DO UPDATE SET
          name_hi = EXCLUDED.name_hi,
          name_en = EXCLUDED.name_en,
          parent_group = EXCLUDED.parent_group,
          official_url = EXCLUDED.official_url
        RETURNING id, slug;
      `;
      agencyMap[inserted.slug] = inserted.id;
    }
    console.log(`   ✓ Inserted/Updated ${Object.keys(agencyMap).length} agencies.`);

    // Step 3: Seed Categories
    console.log(`\n📂 Step 3: Seeding ${categories.length} categories...`);
    const categoryMap = {};
    for (const c of categories) {
      const [inserted] = await sql`
        INSERT INTO categories (slug, name_hi, name_en)
        VALUES (
          ${c.id},
          ${c.nameHi},
          ${c.nameEn}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name_hi = EXCLUDED.name_hi,
          name_en = EXCLUDED.name_en
        RETURNING id, slug;
      `;
      categoryMap[inserted.slug] = inserted.id;
    }
    console.log(`   ✓ Inserted/Updated ${Object.keys(categoryMap).length} categories.`);

    // Step 4: Seed Vacancies & Revisions
    console.log(`\n📄 Step 4: Seeding ${seedableVacancies.length} recruitment notices and revisions...`);
    let noticeCount = 0;
    for (const v of seedableVacancies) {
      const agencyId = agencyMap[v.agencyId] || agencyMap['rssb'] || Object.values(agencyMap)[0];
      const categoryId = categoryMap[v.categoryId] || categoryMap['all'] || Object.values(categoryMap)[0];

      const [notice] = await sql`
        INSERT INTO notices (
          slug, agency_id, category_id, state, notice_type, status,
          published_at, expires_at, is_featured, is_breaking
        )
        VALUES (
          ${v.slug},
          ${agencyId},
          ${categoryId},
          ${v.state || 'rajasthan'},
          ${v.type || 'vacancy'},
          'active',
          ${v.publishedAt},
          ${v.expiresAt},
          ${Boolean(v.isFeatured)},
          ${Boolean(v.isBreaking)}
        )
        ON CONFLICT (slug) DO UPDATE SET
          state = EXCLUDED.state,
          notice_type = EXCLUDED.notice_type,
          status = 'active',
          published_at = EXCLUDED.published_at,
          expires_at = EXCLUDED.expires_at,
          is_featured = EXCLUDED.is_featured,
          is_breaking = EXCLUDED.is_breaking,
          updated_at = now()
        RETURNING id;
      `;

      // Revision
      const [rev] = await sql`
        INSERT INTO notice_revisions (
          notice_id, revision_number, title_hi, title_en, summary_hi, summary_en,
          facts_json, sections_json, links_json, revision_notes
        )
        VALUES (
          ${notice.id},
          1,
          ${v.titleHi},
          ${v.titleEn},
          ${v.summaryHi || ''},
          ${v.summaryEn || ''},
          ${JSON.stringify(v.facts || {})},
          ${JSON.stringify(v.sections || [])},
          ${JSON.stringify(v.links || [])},
          'Initial import from verified government releases'
        )
        ON CONFLICT (notice_id, revision_number) DO UPDATE SET
          title_hi = EXCLUDED.title_hi,
          title_en = EXCLUDED.title_en,
          summary_hi = EXCLUDED.summary_hi,
          summary_en = EXCLUDED.summary_en,
          facts_json = EXCLUDED.facts_json,
          sections_json = EXCLUDED.sections_json,
          links_json = EXCLUDED.links_json
        RETURNING id;
      `;

      // Update current revision
      await sql`
        UPDATE notices SET current_revision_id = ${rev.id} WHERE id = ${notice.id};
      `;

      noticeCount++;
    }

    console.log(`   ✓ Successfully seeded ${noticeCount} notices into Neon DB!`);

    console.log(`\n📝 Step 5: Seeding ${mcqTests.length} MCQ tests...`);
    for (const test of mcqTests) {
      const [savedTest] = await sql`
        INSERT INTO mcq_tests (
          slug, title_hi, title_en, description_hi, description_en,
          duration_minutes, is_active, updated_at
        )
        VALUES (
          ${test.slug}, ${test.titleHi}, ${test.titleEn},
          ${test.descriptionHi || ''}, ${test.descriptionEn || ''},
          ${test.durationMinutes || 10}, ${test.isActive !== false}, now()
        )
        ON CONFLICT (slug) DO UPDATE SET
          title_hi = EXCLUDED.title_hi,
          title_en = EXCLUDED.title_en,
          description_hi = EXCLUDED.description_hi,
          description_en = EXCLUDED.description_en,
          duration_minutes = EXCLUDED.duration_minutes,
          is_active = EXCLUDED.is_active,
          updated_at = now()
        RETURNING id;
      `;

      await sql`DELETE FROM mcq_questions WHERE test_id = ${savedTest.id};`;
      for (let index = 0; index < (test.questions || []).length; index++) {
        const question = test.questions[index];
        await sql`
          INSERT INTO mcq_questions (
            test_id, question_hi, question_en, options_json, correct_option,
            explanation_hi, explanation_en, order_index
          )
          VALUES (
            ${savedTest.id}, ${question.questionHi}, ${question.questionEn},
            ${JSON.stringify(question.options || [])}, ${question.correctOption || 0},
            ${question.explanationHi || ''}, ${question.explanationEn || ''}, ${index}
          );
        `;
      }
    }
    console.log(`   ✓ Successfully seeded ${mcqTests.length} MCQ tests!`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
  } catch (err) {
    console.error('\n❌ Error during Neon DB seeding:', err);
    process.exit(1);
  }
}

runSeed();
