import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import { getCachedOrFetch, invalidateCategoryCache } from '@/server/cache';

export async function GET(req: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get('all') === 'true'; // Admin requests all, client app defaults to active only

  const cacheKey = `categories:list:${includeAll}`;
  const data = await getCachedOrFetch(cacheKey, 30, async () => {
    if (sql && (await isNeonReachable(sql))) {
      try {
        const rows = (await safeNeonQuery(sql`
          SELECT 
            c.slug as id, 
            c.slug, 
            c.name_hi as "nameHi", 
            c.name_en as "nameEn", 
            c.icon, 
            COALESCE(c.is_active, true) as "isActive",
            p.slug as "parentId"
          FROM categories c
          LEFT JOIN categories p ON c.parent_id = p.id
          ORDER BY c.created_at ASC;
        `)) as any[];
        if (rows && rows.length > 0) {
          return includeAll ? rows : rows.filter((c: any) => c.isActive !== false);
        }
      } catch (err) {
        console.error('Failed to query categories from DB:', err);
      }
    }
    return [];
  });

  const durationMs = Date.now() - start;
  return NextResponse.json(
    { success: true, data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Response-Time': `${durationMs}ms`,
        'X-Cache-Lookup': 'in-memory-lru-singleflight',
      },
    }
  );
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

    if (sql && (await isNeonReachable(sql))) {
      const rows = (await safeNeonQuery(sql`
        INSERT INTO categories (slug, name_hi, name_en, icon, is_active)
        VALUES (${slug}, ${nameHi || nameEn}, ${nameEn}, ${icon || null}, ${active})
        ON CONFLICT (slug) DO UPDATE SET
          name_hi = EXCLUDED.name_hi,
          name_en = EXCLUDED.name_en,
          icon = EXCLUDED.icon,
          is_active = EXCLUDED.is_active
        RETURNING slug as id, slug, name_hi as "nameHi", name_en as "nameEn", icon, is_active as "isActive";
      `)) as any[];
      if (rows && rows.length > 0) {
        invalidateCategoryCache();
        return NextResponse.json({ success: true, data: rows[0] }, { status: 201 });
      }
    }

    invalidateCategoryCache();
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

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        UPDATE categories 
        SET is_active = ${nextActive}
        WHERE slug = ${id} OR id::text = ${id};
      `);
      invalidateCategoryCache();
    }

    return NextResponse.json({ success: true, id, isActive: nextActive });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category id is required' }, { status: 400 });
    }

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        DELETE FROM categories WHERE slug = ${id} OR id::text = ${id};
      `);
      invalidateCategoryCache();
    } else {
      invalidateCategoryCache();
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

