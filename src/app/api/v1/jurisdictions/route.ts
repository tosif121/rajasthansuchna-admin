import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface JurisdictionItem {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  code: string;
  description?: string;
  isActive: boolean;
}

const attributesFilePath = path.join(process.cwd(), 'src', 'data', 'notice-attributes.json');

function getFallbackJurisdictions(): JurisdictionItem[] {
  try {
    if (fs.existsSync(attributesFilePath)) {
      const data = JSON.parse(fs.readFileSync(attributesFilePath, 'utf8'));
      if (Array.isArray(data.jurisdictions)) {
        return data.jurisdictions;
      }
    }
  } catch {}
  return [];
}

function saveFallbackJurisdictions(jurisdictions: JurisdictionItem[]) {
  try {
    let data: any = { noticeTypes: [], jurisdictions: [] };
    if (fs.existsSync(attributesFilePath)) {
      data = JSON.parse(fs.readFileSync(attributesFilePath, 'utf8'));
    }
    data.jurisdictions = jurisdictions;
    fs.writeFileSync(attributesFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch {}
}

async function ensureTable() {
  if (!sql || !(await isNeonReachable(sql))) return;
  try {
    await safeNeonQuery(sql`
      CREATE TABLE IF NOT EXISTS jurisdictions (
        id TEXT PRIMARY KEY,
        name_en TEXT NOT NULL,
        name_hi TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
    `);
  } catch {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get('all') === 'true';

  if (sql && (await isNeonReachable(sql))) {
    try {
      await ensureTable();
      const rows = (await safeNeonQuery(sql`
        SELECT id, id as slug, name_en as "nameEn", name_hi as "nameHi", code, description, is_active as "isActive"
        FROM jurisdictions
        ORDER BY created_at ASC;
      `)) as any[];

      if (rows && rows.length > 0) {
        const data = includeAll ? rows : rows.filter((r) => r.isActive !== false);
        return NextResponse.json({ success: true, data });
      }
    } catch {}
  }

  const list = getFallbackJurisdictions();
  const data = includeAll ? list : list.filter((r) => r.isActive !== false);
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nameEn, nameHi, code, description, isActive } = body;
    if (!nameEn) {
      return NextResponse.json({ success: false, error: 'Jurisdiction name (English) is required' }, { status: 400 });
    }

    const slug = (body.slug || body.id || code || nameEn)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)+/g, '');
    const active = isActive !== undefined ? Boolean(isActive) : true;
    const finalCode = (code || slug).toUpperCase();
    const finalHi = nameHi || nameEn;

    if (sql && (await isNeonReachable(sql))) {
      try {
        await ensureTable();
        const rows = (await safeNeonQuery(sql`
          INSERT INTO jurisdictions (id, name_en, name_hi, code, description, is_active)
          VALUES (${slug}, ${nameEn}, ${finalHi}, ${finalCode}, ${description || ''}, ${active})
          ON CONFLICT (id) DO UPDATE SET
            name_en = EXCLUDED.name_en,
            name_hi = EXCLUDED.name_hi,
            code = EXCLUDED.code,
            description = EXCLUDED.description,
            is_active = EXCLUDED.is_active
          RETURNING id, id as slug, name_en as "nameEn", name_hi as "nameHi", code, description, is_active as "isActive";
        `)) as any[];

        if (rows && rows.length > 0) {
          return NextResponse.json({ success: true, data: rows[0] }, { status: 201 });
        }
      } catch {}
    }

    const list = getFallbackJurisdictions();
    const index = list.findIndex((t) => t.id === slug);
    const item: JurisdictionItem = {
      id: slug,
      slug,
      nameEn,
      nameHi: finalHi,
      code: finalCode,
      description: description || '',
      isActive: active,
    };

    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }
    saveFallbackJurisdictions(list);

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save jurisdiction' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Jurisdiction id is required' }, { status: 400 });
    }

    const nextActive = Boolean(isActive);

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        UPDATE jurisdictions
        SET is_active = ${nextActive}
        WHERE id = ${id};
      `);
    }

    const list = getFallbackJurisdictions();
    const item = list.find((t) => t.id === id);
    if (item) {
      item.isActive = nextActive;
      saveFallbackJurisdictions(list);
    }

    return NextResponse.json({ success: true, id, isActive: nextActive });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update status' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Jurisdiction id is required' }, { status: 400 });
    }

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        DELETE FROM jurisdictions WHERE id = ${id};
      `);
    }

    const list = getFallbackJurisdictions().filter((t) => t.id !== id);
    saveFallbackJurisdictions(list);

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete jurisdiction' }, { status: 500 });
  }
}

