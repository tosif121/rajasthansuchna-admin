import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import { getCachedOrFetch, invalidateAgencyCache } from '@/server/cache';
import { agencyLogoUrl } from '@/lib/agency-logo';
import { isAgencyLogoKey } from '@/lib/server/agency-logos';

function normalizeLogoAsset(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const asset = value.trim();
  if (isAgencyLogoKey(asset) || /^(data:image\/|https?:\/\/)/.test(asset)) return asset;
  return null;
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  const rows = await getCachedOrFetch('agencies:list', 30, async () => {
    if (sql && (await isNeonReachable(sql))) {
      try {
        const dbRows = (await safeNeonQuery(sql`
          SELECT slug as id, slug, name_hi as "nameHi", name_en as "nameEn", code, parent_group as "parentGroup", official_url as "officialUrl", logo_asset as "logoAsset"
          FROM agencies
          ORDER BY created_at ASC;
        `)) as any[];
        if (dbRows && dbRows.length > 0) return dbRows;
      } catch (err) {
        console.error('Failed to query agencies from DB:', err);
      }
    }
    return [];
  });
  const origin = new URL(req.url).origin;
  const data = rows.map((row) => ({
    ...row,
    logoUrl: agencyLogoUrl(row.logoAsset, origin),
  }));

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
    const { nameHi, nameEn, code, parentGroup, officialUrl, logoAsset, logoUrl } = body;
    if (!nameEn || !code) {
      return NextResponse.json({ success: false, error: 'Agency name (En) and code are required' }, { status: 400 });
    }

    const logoKey = normalizeLogoAsset(logoAsset ?? logoUrl);
    const origin = new URL(req.url).origin;
    const slug = (code || nameEn).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)+/g, '');

    const agencyRecord = {
      id: slug,
      slug,
      nameHi: nameHi || nameEn,
      nameEn,
      code: code.toUpperCase(),
      parentGroup: parentGroup === 'central' ? 'central' : 'rajasthan',
      officialUrl: officialUrl || 'https://rajasthan.gov.in',
      logoAsset: logoKey || '',
      logoUrl: agencyLogoUrl(logoKey, origin),
    };

    if (sql && (await isNeonReachable(sql))) {
      try {
        const rows = (await safeNeonQuery(sql`
          INSERT INTO agencies (slug, name_hi, name_en, code, parent_group, official_url, logo_asset, is_active)
          VALUES (
            ${slug},
            ${nameHi || nameEn},
            ${nameEn},
            ${code.toUpperCase()},
            ${parentGroup === 'central' ? 'central' : 'rajasthan'},
            ${officialUrl || 'https://rajasthan.gov.in'},
            ${logoKey},
            true
          )
          ON CONFLICT (slug) DO UPDATE SET
            name_hi = EXCLUDED.name_hi,
            name_en = EXCLUDED.name_en,
            code = EXCLUDED.code,
            parent_group = EXCLUDED.parent_group,
            official_url = EXCLUDED.official_url,
            logo_asset = COALESCE(EXCLUDED.logo_asset, agencies.logo_asset)
          RETURNING slug as id, slug, name_hi as "nameHi", name_en as "nameEn", code, parent_group as "parentGroup", official_url as "officialUrl", logo_asset as "logoAsset";
        `)) as any[];
        if (rows && rows.length > 0) {
          invalidateAgencyCache();
          return NextResponse.json(
            {
              success: true,
              data: {
                ...rows[0],
                logoAsset: rows[0].logoAsset || '',
                logoUrl: agencyLogoUrl(rows[0].logoAsset, origin),
              },
            },
            { status: 201 }
          );
        }
      } catch (err) {
        console.warn('Neon DB agency insert failed, falling back to local object:', err);
      }
    }

    invalidateAgencyCache();
    return NextResponse.json({
      success: true,
      data: agencyRecord
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create agency';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nameHi, nameEn, code, parentGroup, officialUrl, isActive, logoAsset, logoUrl } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Agency id is required' }, { status: 400 });
    }

    const logoProvided = logoAsset !== undefined || logoUrl !== undefined;
    const logoKey = normalizeLogoAsset(logoAsset ?? logoUrl);
    const origin = new URL(req.url).origin;

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        UPDATE agencies
        SET 
          name_en = COALESCE(${nameEn || null}, name_en),
          name_hi = COALESCE(${nameHi || null}, name_hi),
          code = COALESCE(${code ? code.toUpperCase() : null}, code),
          parent_group = COALESCE(${parentGroup || null}, parent_group),
          official_url = COALESCE(${officialUrl || null}, official_url),
          is_active = COALESCE(${isActive !== undefined ? Boolean(isActive) : null}, is_active),
          logo_asset = CASE WHEN ${logoProvided} THEN ${logoKey} ELSE logo_asset END
        WHERE slug = ${id} OR id::text = ${id};
      `);
      invalidateAgencyCache();
    }

    return NextResponse.json({
      success: true,
      id,
      logoAsset: logoKey || '',
      logoUrl: agencyLogoUrl(logoKey, origin),
    });
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
      invalidateAgencyCache();
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete agency' }, { status: 500 });
  }
}


