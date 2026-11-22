import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

function getFallbackUsers(): any[] {
  try {
    if (fs.existsSync(usersFilePath)) {
      return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }
  } catch {}
  return [];
}

function saveFallbackUsers(users: any[]) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch {}
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';

  const { searchParams } = new URL(req.url);
  const queryId = searchParams.get('id') || '';
  const queryPhone = (searchParams.get('phone') || '').replace(/\D/g, '').slice(-10);
  const queryEmail = (searchParams.get('email') || '').trim().toLowerCase();

  let tokenUserId = '';
  if (token && token.startsWith('rs_jwt_')) {
    const parts = token.split('_');
    if (parts.length >= 3) {
      tokenUserId = parts.slice(2, parts.length - 1).join('_');
    }
  }

  const lookupId = queryId || tokenUserId;

  let user: any = null;

  // 1. Check Neon PostgreSQL
  if (sql && (await isNeonReachable(sql))) {
    try {
      const rows = (await safeNeonQuery(sql`
        SELECT id, name, email, phone, 
               COALESCE(target_exam, '') as "targetExam", 
               COALESCE(qualification, '') as "qualification", 
               COALESCE(district, '') as "district", 
               COALESCE(credits, 10) as "credits", 
               COALESCE(is_active, true) as "isActive", 
               created_at as "createdAt", 
               last_active_at as "lastActiveAt"
        FROM app_users
        WHERE (${lookupId}::text != '' AND id = ${lookupId})
           OR (${queryPhone}::text != '' AND RIGHT(phone, 10) = ${queryPhone})
           OR (${queryEmail}::text != '' AND LOWER(email) = ${queryEmail})
        LIMIT 1;
      `)) as any[];

      if (rows && rows.length > 0) {
        user = rows[0];
      }
    } catch (e) {
      console.warn("DB query failed in auth/me GET:", e);
    }
  }

  // 2. Check fallback users.json
  if (!user) {
    const fallbackList = getFallbackUsers();
    user = fallbackList.find(
      (u: any) =>
        (lookupId && u.id === lookupId) ||
        (queryPhone && u.phone && u.phone.replace(/\D/g, '').slice(-10) === queryPhone) ||
        (queryEmail && u.email && u.email.toLowerCase() === queryEmail)
    );
  }

  if (user) {
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        targetExam: user.targetExam || user.target_exam || '',
        qualification: user.qualification || '',
        district: user.district || '',
        credits: user.credits ?? 10,
        isActive: user.isActive !== false,
        isLoggedIn: true,
      },
    });
  }

  // If token was present but no matching record found, return sensible defaults
  if (token || lookupId || queryPhone || queryEmail) {
    return NextResponse.json({
      success: true,
      user: {
        id: lookupId || 'usr_candidate',
        name: 'Candidate',
        email: queryEmail || (queryPhone ? `${queryPhone}@student.rajasthansuchna.in` : 'candidate@student.rajasthansuchna.in'),
        phone: queryPhone || undefined,
        targetExam: '',
        qualification: '',
        district: '',
        credits: 10,
        isActive: true,
        isLoggedIn: true,
      },
    });
  }

  return NextResponse.json(
    { success: false, error: 'Unauthorized or user not found.' },
    { status: 401 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, targetExam, qualification, district, phone } = body;
    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);

    const fallbackList = getFallbackUsers();
    const userIndex = fallbackList.findIndex(
      (u: any) =>
        (id && u.id === id) ||
        (cleanPhone && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone) ||
        (email && u.email && u.email.toLowerCase() === email.toLowerCase())
    );

    const nowIso = new Date().toISOString();
    let updatedUser: any;

    if (userIndex >= 0) {
      fallbackList[userIndex] = {
        ...fallbackList[userIndex],
        ...(name ? { name: name.trim().slice(0, 30) } : {}),
        ...(targetExam ? { targetExam: targetExam.trim() } : {}),
        ...(qualification ? { qualification: qualification.trim() } : {}),
        ...(district ? { district: district.trim() } : {}),
        lastActiveAt: nowIso,
      };
      updatedUser = fallbackList[userIndex];
      saveFallbackUsers(fallbackList);
    } else {
      updatedUser = {
        id: id || `usr_${Date.now()}`,
        name: (name || '').trim().slice(0, 30) || 'Candidate',
        email: email || `${cleanPhone || Date.now()}@student.rajasthansuchna.in`,
        phone: cleanPhone || phone,
        targetExam: (targetExam || '').trim(),
        qualification: (qualification || '').trim(),
        district: (district || '').trim(),
        credits: 10,
        isActive: true,
        createdAt: nowIso,
        lastActiveAt: nowIso,
      };
      fallbackList.unshift(updatedUser);
      saveFallbackUsers(fallbackList);
    }

    if (sql && (await isNeonReachable(sql))) {
      try {
        const safeName = (name || '').trim().slice(0, 30) || 'Candidate';
        const finalEmail = email || `${cleanPhone || Date.now()}@student.rajasthansuchna.in`;
        const finalPhone = cleanPhone || phone || '';

        // Upsert into Neon PostgreSQL and return live credits
        const dbRows = (await safeNeonQuery(sql`
          INSERT INTO app_users (id, name, email, phone, target_exam, qualification, district, credits, is_active, created_at, last_active_at)
          VALUES (${id || `usr_${Date.now()}`}, ${safeName}, ${finalEmail}, ${finalPhone}, ${targetExam || ''}, ${qualification || ''}, ${district || ''}, 10, true, NOW(), NOW())
          ON CONFLICT (email) DO UPDATE
          SET name = COALESCE(NULLIF(${safeName}, ''), app_users.name),
              phone = COALESCE(NULLIF(${finalPhone}, ''), app_users.phone),
              target_exam = COALESCE(NULLIF(${targetExam ? targetExam.trim() : ''}, ''), app_users.target_exam),
              qualification = COALESCE(NULLIF(${qualification ? qualification.trim() : ''}, ''), app_users.qualification),
              district = COALESCE(NULLIF(${district ? district.trim() : ''}, ''), app_users.district),
              last_active_at = NOW()
          RETURNING id, name, email, phone, target_exam as "targetExam", qualification, district, COALESCE(credits, 10) as credits, is_active as "isActive";
        `)) as any[];

        if (dbRows && dbRows.length > 0) {
          updatedUser = {
            ...updatedUser,
            ...dbRows[0],
            credits: dbRows[0].credits,
          };
        }
      } catch (err) {
        console.warn("DB update failed in auth/me:", err);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        credits: updatedUser.credits ?? 10,
        isLoggedIn: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
