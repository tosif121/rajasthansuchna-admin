import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import fs from 'fs';
import path from 'path';

function getFallbackAgencies() {
  try {
    const seedPath = path.join(process.cwd(), 'src', 'data', 'seed-data.json');
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      if (Array.isArray(data.agencies)) {
        return data.agencies.map((a: Record<string, string>) => ({
          id: a.id,
          slug: a.id,
          nameHi: a.nameHi,
          nameEn: a.nameEn,
          code: a.id.toUpperCase(),
          parentGroup: a.parentGroup === 'central' ? 'central' : 'rajasthan',
          officialUrl: a.officialUrl || 'https://rajasthan.gov.in',
        }));
      }
    }
  } catch {
    // Fall through to an empty list when seed data is unavailable.
  }
  return [];
}

export async function GET() {
  if (sql && (await isNeonReachable(sql))) {
    try {
      const rows = (await safeNeonQuery(sql`
        SELECT slug as id, slug, name_hi as "nameHi", name_en as "nameEn", code, parent_group as "parentGroup", official_url as "officialUrl"
        FROM agencies
        ORDER BY created_at ASC;
      `)) as any[];
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, data: rows });
      }
    } catch (err) {
      console.error('Failed to query agencies from DB, using fallback:', err);
    }
  }

  return NextResponse.json({ success: true, data: getFallbackAgencies() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nameHi, nameEn, code, parentGroup, officialUrl } = body;
    if (!nameEn || !code) {
      return NextResponse.json({ success: false, error: 'Agency name (En) and code are required' }, { status: 400 });
    }

    const slug = (code || nameEn).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)+/g, '');

    if (sql && (await isNeonReachable(sql))) {
      try {
        const rows = (await safeNeonQuery(sql`
          INSERT INTO agencies (slug, name_hi, name_en, code, parent_group, official_url, is_active)
          VALUES (
            ${slug},
            ${nameHi || nameEn},
            ${nameEn},
            ${code.toUpperCase()},
            ${parentGroup === 'central' ? 'central' : 'rajasthan'},
            ${officialUrl || 'https://rajasthan.gov.in'},
            true
          )
          ON CONFLICT (slug) DO UPDATE SET
            name_hi = EXCLUDED.name_hi,
            name_en = EXCLUDED.name_en,
            code = EXCLUDED.code,
            parent_group = EXCLUDED.parent_group,
            official_url = EXCLUDED.official_url
          RETURNING slug as id, slug, name_hi as "nameHi", name_en as "nameEn", code, parent_group as "parentGroup", official_url as "officialUrl";
        `)) as any[];
        if (rows && rows.length > 0) {
          return NextResponse.json({ success: true, data: rows[0] }, { status: 201 });
        }
      } catch (err) {
        console.warn('Neon DB agency insert failed, falling back to local object:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: slug,
        slug,
        nameHi: nameHi || nameEn,
        nameEn,
        code: code.toUpperCase(),
        parentGroup: parentGroup === 'central' ? 'central' : 'rajasthan',
        officialUrl: officialUrl || 'https://rajasthan.gov.in',
      }
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create agency';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nameHi, nameEn, code, parentGroup, officialUrl, isActive } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Agency id is required' }, { status: 400 });
    }

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        UPDATE agencies
        SET 
          name_en = COALESCE(${nameEn || null}, name_en),
          name_hi = COALESCE(${nameHi || null}, name_hi),
          code = COALESCE(${code ? code.toUpperCase() : null}, code),
          parent_group = COALESCE(${parentGroup || null}, parent_group),
          official_url = COALESCE(${officialUrl || null}, official_url),
          is_active = COALESCE(${isActive !== undefined ? Boolean(isActive) : null}, is_active)
        WHERE slug = ${id} OR id::text = ${id};
      `);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update agency' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Agency id is required' }, { status: 400 });
    }

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        DELETE FROM agencies WHERE slug = ${id} OR id::text = ${id};
      `);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete agency' }, { status: 500 });
  }
}


