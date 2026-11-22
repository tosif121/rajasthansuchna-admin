import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import { AiSettingsService } from '@/server/services/ai-settings-service';
import fs from 'fs';
import path from 'path';

interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  credits?: number;
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string;
}

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

function getFallbackUsers(): StudentUser[] {
  try {
    if (fs.existsSync(usersFilePath)) {
      return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }
  } catch {}
  return [];
}

function saveFallbackUsers(users: StudentUser[]) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, emailOrPhone, name } = body;

    const rawInput = (phone || emailOrPhone || '').toString().trim();
    const cleanPhone = rawInput.replace(/\D/g, '').slice(-10);

    if (!rawInput && !cleanPhone) {
      return NextResponse.json(
        { success: false, error: 'Mobile number is required to log in.' },
        { status: 400 }
      );
    }

    let existingUser: any = null;

    // 1. Primary check in Neon PostgreSQL Database
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
          WHERE (${cleanPhone}::text != '' AND RIGHT(phone, 10) = ${cleanPhone})
             OR (${rawInput}::text != '' AND LOWER(email) = LOWER(${rawInput}))
          LIMIT 1;
        `)) as any[];
        if (rows && rows.length > 0) {
          existingUser = rows[0];
        }
      } catch (err) {
        console.warn("DB query failed in auth/login:", err);
      }
    }

    // 2. Secondary fallback check in users.json
    const fallbackList = getFallbackUsers();
    if (!existingUser) {
      existingUser = fallbackList.find(
        (u) =>
          (cleanPhone && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone) ||
          (u.email && u.email.toLowerCase() === rawInput.toLowerCase())
      );
    }

    const aiSettings = AiSettingsService.getSettings();
    const initialCredits = typeof aiSettings.defaultSignupCredits === 'number' ? aiSettings.defaultSignupCredits : 10;
    const nowIso = new Date().toISOString();
    const displayName = (name || '').trim() || (cleanPhone ? `Candidate (${cleanPhone.slice(-4)})` : 'Candidate');

    // If new user logging in via verified mobile OTP, auto-create account
    if (!existingUser) {
      const newUserId = `usr_${Date.now()}`;
      const generatedEmail = `${cleanPhone || newUserId}@student.rajasthansuchna.in`;
      const newUser: any = {
        id: newUserId,
        name: displayName,
        email: generatedEmail,
        phone: cleanPhone || rawInput,
        targetExam: '',
        qualification: '',
        district: '',
        credits: initialCredits,
        isActive: true,
        createdAt: nowIso,
        lastActiveAt: nowIso,
      };

      if (sql && (await isNeonReachable(sql))) {
        try {
          await safeNeonQuery(sql`
            INSERT INTO app_users (id, name, email, phone, credits, is_active, created_at, last_active_at)
            VALUES (${newUserId}, ${displayName}, ${generatedEmail}, ${cleanPhone || rawInput}, ${initialCredits}, true, NOW(), NOW())
            ON CONFLICT (email) DO NOTHING;
          `);
        } catch {}
      }

      fallbackList.unshift(newUser);
      saveFallbackUsers(fallbackList);
      existingUser = newUser;
    } else {
      // If user exists, update last_active_at in DB
      if (sql && (await isNeonReachable(sql))) {
        try {
          await safeNeonQuery(sql`
            UPDATE app_users 
            SET last_active_at = NOW() 
            WHERE id = ${existingUser.id}
          `);
        } catch {}
      }
    }

    const token = `rs_jwt_${existingUser.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        targetExam: existingUser.targetExam || existingUser.target_exam || '',
        qualification: existingUser.qualification || '',
        district: existingUser.district || '',
        credits: existingUser.credits ?? initialCredits,
        role: 'student',
        isLoggedIn: true,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid login payload.' },
      { status: 400 }
    );
  }
}
