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
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid Authorization header.' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: 'usr_me',
      name: 'Verified Candidate',
      email: 'student@rajasthansuchna.in',
      targetExam: 'CET / Rajasthan Police / REET',
      isLoggedIn: true,
    },
  });
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

        // Upsert into Neon PostgreSQL
        await safeNeonQuery(sql`
          INSERT INTO app_users (id, name, email, phone, target_exam, qualification, district, credits, is_active, created_at, last_active_at)
          VALUES (${id || `usr_${Date.now()}`}, ${safeName}, ${finalEmail}, ${finalPhone}, ${targetExam || ''}, ${qualification || ''}, ${district || ''}, 10, true, NOW(), NOW())
          ON CONFLICT (email) DO UPDATE
          SET name = COALESCE(NULLIF(${safeName}, ''), app_users.name),
              phone = COALESCE(NULLIF(${finalPhone}, ''), app_users.phone),
              target_exam = COALESCE(NULLIF(${targetExam ? targetExam.trim() : ''}, ''), app_users.target_exam),
              qualification = COALESCE(NULLIF(${qualification ? qualification.trim() : ''}, ''), app_users.qualification),
              district = COALESCE(NULLIF(${district ? district.trim() : ''}, ''), app_users.district),
              last_active_at = NOW();
        `);
      } catch (err) {
        console.warn("DB update failed in auth/me:", err);
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
