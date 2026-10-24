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
          isActive: true,
        }));
      }
    }
  } catch (_) {}
  return [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get('all') === 'true'; // Admin requests all, client app defaults to active only

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('ep-sample')) {
    try {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT slug as id, slug, name_hi as "nameHi", name_en as "nameEn", icon, COALESCE(is_active, true) as "isActive"
        FROM categories
        ORDER BY created_at ASC;
      `;
      if (rows && rows.length > 0) {
        const data = includeAll ? rows : rows.filter((c: any) => c.isActive !== false);
        return NextResponse.json({ success: true, data });
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
    const { nameHi, nameEn, slug: rawSlug, icon, isActive } = body;
    if (!nameEn) {
      return NextResponse.json({ success: false, error: 'Category name (English) is required' }, { status: 400 });
    }

    const slug = (rawSlug || nameEn).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)+/g, '');
    const active = isActive !== undefined ? Boolean(isActive) : true;
    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl && !dbUrl.includes('ep-sample')) {
      const sql = neon(dbUrl);
      const [inserted] = await sql`
        INSERT INTO categories (slug, name_hi, name_en, icon, is_active)
        VALUES (${slug}, ${nameHi || nameEn}, ${nameEn}, ${icon || null}, ${active})
        ON CONFLICT (slug) DO UPDATE SET
          name_hi = EXCLUDED.name_hi,
          name_en = EXCLUDED.name_en,
          icon = EXCLUDED.icon,
          is_active = EXCLUDED.is_active
        RETURNING slug as id, slug, name_hi as "nameHi", name_en as "nameEn", icon, is_active as "isActive";
      `;
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: { id: slug, slug, nameHi: nameHi || nameEn, nameEn, icon, isActive: active }
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category id is required' }, { status: 400 });
    }

    const nextActive = Boolean(isActive);
    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl && !dbUrl.includes('ep-sample')) {
      const sql = neon(dbUrl);
      await sql`
        UPDATE categories 
        SET is_active = ${nextActive}
        WHERE slug = ${id} OR id::text = ${id};
      `;
    }

    return NextResponse.json({ success: true, id, isActive: nextActive });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
