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
  targetExam?: string;
  preferredCategoryIds?: string[];
  credits: number;
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

async function ensureUsersTable() {
  if (!sql || !(await isNeonReachable(sql))) return;
  try {
    await safeNeonQuery(sql`
      CREATE TABLE IF NOT EXISTS app_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        target_exam TEXT,
        preferred_category_ids TEXT[],
        credits INT DEFAULT 10 NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        last_active_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
      ALTER TABLE app_users ADD COLUMN IF NOT EXISTS credits INT DEFAULT 10 NOT NULL;
    `);
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, targetExam, preferredCategoryIds } = body;

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPhone = (phone || '').trim();
    const trimmedPass = (password || '').trim();

    const cleanPhone = trimmedPhone.replace(/\D/g, '').slice(-10);
    if (!trimmedName || !cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Full name and a valid 10-digit mobile number are required.' },
        { status: 400 }
      );
    }

    const finalEmail = trimmedEmail || `${cleanPhone}@student.rajasthansuchna.in`;

    const fallbackList = getFallbackUsers();
    if (fallbackList.some((u) => u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'An account with this mobile number already exists.' },
        { status: 409 }
      );
    }

    const aiSettings = AiSettingsService.getSettings();
    const initialCredits = typeof aiSettings.defaultSignupCredits === 'number' ? aiSettings.defaultSignupCredits : 10;

    const userId = `usr_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const finalExam = (targetExam || '').trim() || 'General / All Exams';
    const finalCategories = Array.isArray(preferredCategoryIds) ? preferredCategoryIds : [];

    if (sql && (await isNeonReachable(sql))) {
      try {
        await ensureUsersTable();
        await safeNeonQuery(sql`
          INSERT INTO app_users (id, name, email, phone, target_exam, preferred_category_ids, credits, is_active, created_at, last_active_at)
          VALUES (
            ${userId},
            ${trimmedName},
            ${finalEmail},
            ${cleanPhone},
            ${finalExam},
            ${finalCategories},
            ${initialCredits},
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            target_exam = EXCLUDED.target_exam,
            last_active_at = NOW();
        `);
      } catch (dbErr) {
        console.warn('Could not insert user into Neon DB, relying on JSON store:', dbErr);
      }
    }

    const newUser: StudentUser = {
      id: userId,
      name: trimmedName,
      email: finalEmail,
      phone: cleanPhone,
      targetExam: finalExam,
      preferredCategoryIds: finalCategories,
      credits: initialCredits,
      isActive: true,
      createdAt: nowIso,
      lastActiveAt: nowIso,
    };

    fallbackList.unshift(newUser);
    saveFallbackUsers(fallbackList);

    const token = `rs_token_${userId}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: newUser,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid registration payload.' },
      { status: 400 }
    );
  }
}
