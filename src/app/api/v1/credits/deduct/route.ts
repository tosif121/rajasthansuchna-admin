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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phone, email } = body;
    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);
    const cleanEmail = (email || '').toString().trim().toLowerCase();
    const resolvedId = (userId || '').toString().trim();

    let remainingCredits: number = 0;
    let found = false;

    // 1. Decrement in Neon DB
    if (sql && (await isNeonReachable(sql))) {
      try {
        const rows = (await safeNeonQuery(sql`
          UPDATE app_users
          SET credits = GREATEST(0, COALESCE(credits, 10) - 1),
              last_active_at = NOW()
          WHERE (${resolvedId}::text != '' AND id = ${resolvedId})
             OR (${cleanPhone}::text != '' AND RIGHT(phone, 10) = ${cleanPhone})
             OR (${cleanEmail}::text != '' AND LOWER(email) = ${cleanEmail})
          RETURNING credits;
        `)) as any[];

        if (rows && rows.length > 0) {
          remainingCredits = rows[0].credits;
          found = true;
        }
      } catch (err) {
        console.warn('DB credit deduction failed:', err);
      }
    }

    // 2. Decrement in fallback users.json
    const fallbackList = getFallbackUsers();
    const userIndex = fallbackList.findIndex(
      (u: any) =>
        (resolvedId && u.id === resolvedId) ||
        (cleanPhone && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone) ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (userIndex >= 0) {
      if (!found) {
        fallbackList[userIndex].credits = Math.max(0, (fallbackList[userIndex].credits ?? 10) - 1);
        remainingCredits = fallbackList[userIndex].credits;
      } else {
        fallbackList[userIndex].credits = remainingCredits;
      }
      fallbackList[userIndex].lastActiveAt = new Date().toISOString();
      saveFallbackUsers(fallbackList);
      found = true;
    }

    if (!found) {
      remainingCredits = 9;
    }

    return NextResponse.json({
      success: true,
      remainingCredits,
      message: '1 AI credit deducted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to deduct credit' },
      { status: 500 }
    );
  }
}
