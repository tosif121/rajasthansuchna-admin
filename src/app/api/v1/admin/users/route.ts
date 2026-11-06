import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  targetExam?: string;
  preferredCategoryIds?: string[];
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string;
}

interface PushDeviceItem {
  id: string;
  userId?: string;
  platform: 'android' | 'ios';
  tokenPreview: string;
  lastSeenAt: string;
  createdAt: string;
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

export async function GET() {
  let registeredUsers: StudentUser[] = [];
  let devices: PushDeviceItem[] = [];

  if (sql && (await isNeonReachable(sql))) {
    try {
      const dbUsers = (await safeNeonQuery(sql`
        SELECT 
          id, 
          name, 
          email, 
          phone, 
          preferred_category_ids as "preferredCategoryIds",
          COALESCE(is_active, true) as "isActive",
          created_at as "createdAt",
          last_active_at as "lastActiveAt"
        FROM app_users
        ORDER BY created_at DESC;
      `)) as any[];

      if (dbUsers && dbUsers.length > 0) {
        registeredUsers = dbUsers;
      }

      const dbDevices = (await safeNeonQuery(sql`
        SELECT 
          id::text as id,
          user_id as "userId",
          platform,
          SUBSTRING(token, 1, 10) || '...' || SUBSTRING(token, LENGTH(token)-4, 5) as "tokenPreview",
          last_seen_at as "lastSeenAt",
          created_at as "createdAt"
        FROM push_devices
        ORDER BY last_seen_at DESC
        LIMIT 100;
      `)) as any[];

      if (dbDevices && dbDevices.length > 0) {
        devices = dbDevices;
      }
    } catch (e) {
      console.warn("DB query failed, using local store:", e);
    }
  }

  if (registeredUsers.length === 0) {
    registeredUsers = getFallbackUsers();
  }

  // Calculate genuine reach metrics without any mock data
  const totalRegistered = registeredUsers.length;
  const guestDevices = devices.filter((d) => !d.userId || d.userId.startsWith("guest"));
  const totalGuestDevices = guestDevices.length;
  const totalReach = totalRegistered + totalGuestDevices;

  const androidCount = devices.filter((d) => d.platform === "android").length;
  const iosCount = devices.filter((d) => d.platform === "ios").length;

  return NextResponse.json({
    success: true,
    data: {
      users: registeredUsers,
      devices,
      stats: {
        totalRegistered,
        totalGuestDevices,
        totalReach,
        androidCount,
        iosCount,
      },
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive, name } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const cleanName = typeof name === 'string' ? name.trim().slice(0, 30) : undefined;

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        UPDATE app_users
        SET is_active = COALESCE(${isActive !== undefined ? Boolean(isActive) : null}, is_active),
            name = COALESCE(${cleanName || null}, name),
            last_active_at = NOW()
        WHERE id = ${id};
      `);
    }

    const fallbackList = getFallbackUsers();
    const user = fallbackList.find((u) => u.id === id);
    if (user) {
      if (isActive !== undefined) user.isActive = Boolean(isActive);
      if (cleanName) user.name = cleanName;
      user.lastActiveAt = new Date().toISOString();
      saveFallbackUsers(fallbackList);
    }

    return NextResponse.json({ success: true, id, isActive: user?.isActive, name: user?.name });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        DELETE FROM app_users WHERE id = ${id};
      `);
    }

    const fallbackList = getFallbackUsers().filter((u) => u.id !== id);
    saveFallbackUsers(fallbackList);

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to delete user" }, { status: 500 });
  }
}

