import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Resolve DATABASE_URL from .env.local
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envLocalPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        databaseUrl = line.substring('DATABASE_URL='.length).trim();
        break;
      }
    }
  }
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found.');
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log('='.repeat(60));
console.log('🔄 MIGRATING TO AUTHENTIC RECRUITMENT CATEGORIES');
console.log('='.repeat(60));

const newCategories = [
  {
    id: "teaching",
    slug: "teaching",
    nameHi: "शिक्षक एवं शिक्षा भर्ती",
    nameEn: "Teaching & Education",
    icon: "graduationCap",
    sortOrder: 1
  },
  {
    id: "police_defence",
    slug: "police_defence",
    nameHi: "पुलिस एवं रक्षा बल",
    nameEn: "Police & Defence",
    icon: "shield",
    sortOrder: 2
  },
  {
    id: "administrative",
    slug: "administrative",
    nameHi: "प्रशासनिक सेवा (RAS / UPSC)",
    nameEn: "Administrative & Civil Services",
    icon: "briefcase",
    sortOrder: 3
  },
  {
    id: "revenue_patwari",
    slug: "revenue_patwari",
    nameHi: "राजस्व एवं पटवारी भर्ती",
    nameEn: "Revenue & Patwari",
    icon: "landmark",
    sortOrder: 4
  },
  {
    id: "clerk_assistant",
    slug: "clerk_assistant",
    nameHi: "लिपिक एवं कनिष्ठ सहायक (LDC)",
    nameEn: "Clerk & Junior Assistant",
    icon: "fileText",
    sortOrder: 5
  },
  {
    id: "railway",
    slug: "railway",
    nameHi: "रेलवे भर्ती (RRB)",
    nameEn: "Railway Recruitment",
    icon: "building",
    sortOrder: 6
  },
  {
    id: "banking_insurance",
    slug: "banking_insurance",
    nameHi: "बैंकिंग एवं बीमा भर्ती",
    nameEn: "Banking & Insurance",
    icon: "landmark",
    sortOrder: 7
  },
  {
    id: "medical_health",
    slug: "medical_health",
    nameHi: "चिकित्सा एवं स्वास्थ्य भर्ती",
    nameEn: "Medical & Health",
    icon: "sparkles",
    sortOrder: 8
  },
  {
    id: "technical_energy",
    slug: "technical_energy",
    nameHi: "तकनीकी एवं विद्युत विभाग",
    nameEn: "Technical & Electricity",
    icon: "sparkles",
    sortOrder: 9
  },
  {
    id: "secondary_jobs",
    slug: "secondary_jobs",
    nameHi: "10वीं / 12वीं पास सरकारी भर्तियां",
    nameEn: "10th / 12th Pass Govt Jobs",
    icon: "tag",
    sortOrder: 10
  },
  {
    id: "graduate_jobs",
    slug: "graduate_jobs",
    nameHi: "स्नातक स्तरीय सरकारी भर्तियां",
    nameEn: "Graduate Level Jobs",
    icon: "award",
    sortOrder: 11
  }
];

const noticeCategoryMap = {
  'rajasthan-cet-senior-secondary-2026': 'secondary_jobs',
  'rajasthan-cet-graduation-level-2026': 'graduate_jobs',
  'rajasthan-police-sub-inspector-recruitment-2026': 'police_defence',
  'rajasthan-patwari-recruitment-2026': 'revenue_patwari',
  'rajasthan-pashu-parichar-recruitment-2026': 'secondary_jobs',
  'rajasthan-high-court-clerk-recruitment-2026': 'clerk_assistant',
  'rajasthan-reet-mains-teacher-recruitment-2026': 'teaching',
  'ssc-cgl-recruitment-2026': 'administrative',
  'rrb-ntpc-central-recruitment-2026': 'railway',
  'sbi-clerk-junior-associates-2026': 'banking_insurance',
};

async function run() {
  // Step 1: Insert new categories
  console.log('1️⃣ Inserting 11 new recruitment categories into Neon DB...');
  const catDbMap = {};
  for (const c of newCategories) {
    const [row] = await sql`
      INSERT INTO categories (slug, name_hi, name_en)
      VALUES (${c.slug}, ${c.nameHi}, ${c.nameEn})
      ON CONFLICT (slug) DO UPDATE SET
        name_hi = EXCLUDED.name_hi,
        name_en = EXCLUDED.name_en
      RETURNING id, slug;
    `;
    catDbMap[row.slug] = row.id;
  }
  console.log(`   ✓ Inserted/Updated ${Object.keys(catDbMap).length} categories.`);

  // Step 2: Remap existing notices to new category IDs
  console.log('2️⃣ Remapping existing notices to new recruitment categories...');
  for (const [slug, newCatSlug] of Object.entries(noticeCategoryMap)) {
    const newCatId = catDbMap[newCatSlug];
    if (newCatId) {
      await sql`
        UPDATE notices
        SET category_id = ${newCatId}
        WHERE slug = ${slug};
      `;
      console.log(`   ✓ Notice "${slug}" -> ${newCatSlug} (${newCatId})`);
    }
  }

  // Also set any remaining notices that might have had old category to administrative/secondary_jobs
  const defaultCatId = catDbMap['graduate_jobs'] || Object.values(catDbMap)[0];
  const oldSlugs = ['all', 'latest', 'rajasthan', 'central', 'admit_card', 'result', 'answer_key', 'schemes', 'private_jobs'];
  await sql`
    UPDATE notices n
    SET category_id = ${defaultCatId}
    FROM categories c
    WHERE n.category_id = c.id AND c.slug = ANY(${oldSlugs});
  `;

  // Step 3: Delete old obsolete categories
  console.log('3️⃣ Deleting old non-recruitment categories from Neon DB...');
  const deleted = await sql`
    DELETE FROM categories
    WHERE slug = ANY(${oldSlugs})
    RETURNING slug;
  `;
  console.log(`   ✓ Deleted ${deleted.length} old categories:`, deleted.map(d => d.slug));

  // Step 4: Update seed-data.json
  console.log('4️⃣ Updating src/data/seed-data.json...');
  const seedPath = path.join(rootDir, 'src', 'data', 'seed-data.json');
  if (fs.existsSync(seedPath)) {
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    seed.categories = newCategories;
    if (Array.isArray(seed.vacancies)) {
      for (const v of seed.vacancies) {
        if (noticeCategoryMap[v.slug]) {
          v.categoryId = noticeCategoryMap[v.slug];
        }
      }
    }
    fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');
    console.log('   ✓ seed-data.json successfully updated with new recruitment categories!');
  }

  console.log('='.repeat(60));
  console.log('🎉 RECRUITMENT CATEGORIES MIGRATION COMPLETED!');
  console.log('='.repeat(60));
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

