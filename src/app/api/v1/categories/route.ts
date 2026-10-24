import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

function getFallbackCategories() {
  try {
    const seedPath = path.join(process.cwd(), 'src', 'data', 'seed-data.json');
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      if (Array.isArray(data.categories)) {
        return data.categories.map((c: any) => ({
          id: c.id,
          slug: c.id,
          nameHi: c.nameHi || c.nameEn,
          nameEn: c.nameEn,
          icon: c.icon || null,
        }));
      }
    }
  } catch (_) {}
  return [];
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('ep-sample')) {
    try {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT slug as id, slug, name_hi as "nameHi", name_en as "nameEn", icon
        FROM categories
        ORDER BY created_at ASC;
      `;
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, data: rows });
      }
    } catch (err) {
      console.error('Failed to query categories from DB, using fallback:', err);
    }
  }

  return NextResponse.json({ success: true, data: getFallbackCategories() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nameHi, nameEn, slug: rawSlug, icon } = body;
    if (!nameEn) {
      return NextResponse.json({ success: false, error: 'Category name (English) is required' }, { status: 400 });
    }

    const slug = (rawSlug || nameEn).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)+/g, '');
    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl && !dbUrl.includes('ep-sample')) {
      const sql = neon(dbUrl);
      const [inserted] = await sql`
        INSERT INTO categories (slug, name_hi, name_en, icon)
        VALUES (${slug}, ${nameHi || nameEn}, ${nameEn}, ${icon || null})
        ON CONFLICT (slug) DO UPDATE SET
          name_hi = EXCLUDED.name_hi,
          name_en = EXCLUDED.name_en,
          icon = EXCLUDED.icon
        RETURNING slug as id, slug, name_hi as "nameHi", name_en as "nameEn", icon;
      `;
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: { id: slug, slug, nameHi: nameHi || nameEn, nameEn, icon } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
