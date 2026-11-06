import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql, isNeonReachable, safeNeonQuery } from "@/lib/db";
import { requireUser, requireAdmin, AuthError } from "@/lib/auth";


const deviceSchema = z.object({
  token: z.string().min(20).max(4096),
  platform: z.enum(["android", "ios"]).default("android"),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const input = deviceSchema.safeParse(body);

    if (!input.success) {
      return NextResponse.json(
        { success: false, error: "Invalid device payload", details: input.error.format() },
        { status: 400 }
      );
    }

    const { token, platform, userId: providedUserId } = input.data;
    const finalUserId = providedUserId || user.id;

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        INSERT INTO push_devices (user_id, token, platform, last_seen_at, updated_at)
        VALUES (${finalUserId}, ${token}, ${platform}, NOW(), NOW())
        ON CONFLICT (token) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          platform = EXCLUDED.platform,
          last_seen_at = NOW(),
          updated_at = NOW()
      `);
    }

    return NextResponse.json({
      success: true,
      message: "Device registered successfully for push notifications",
      data: { userId: finalUserId, platform },
    });
  } catch (error: any) {
    console.error("Device registration failed", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unable to register device" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const input = deviceSchema.pick({ token: true }).safeParse(body);

    if (!input.success) {
      return NextResponse.json(
        { success: false, error: "Invalid device payload" },
        { status: 400 }
      );
    }

    if (sql && (await isNeonReachable(sql))) {
      await safeNeonQuery(sql`
        DELETE FROM push_devices
        WHERE token = ${input.data.token}
      `);
    }

    return NextResponse.json({ success: true, message: "Device unregistered successfully" });
  } catch (error: any) {
    console.error("Device removal failed", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unable to remove device" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    if (!sql || !(await isNeonReachable(sql))) {
      return NextResponse.json({ success: true, totalDevices: 0, devices: [] });
    }
    const rows = (await safeNeonQuery(sql`
      SELECT id, user_id, platform, last_seen_at, created_at, SUBSTRING(token, 1, 15) || '...' as token_preview
      FROM push_devices
      ORDER BY last_seen_at DESC
      LIMIT 100;
    `)) as any[] || [];
    const countRes = (await safeNeonQuery(sql`SELECT count(*)::int as count FROM push_devices;`)) as any[] || [];
    const total = countRes[0]?.count || rows.length;

    return NextResponse.json({
      success: true,
      totalDevices: total,
      devices: rows,
    });
  } catch (error: any) {
    if (error instanceof AuthError || error?.statusCode === 401) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
