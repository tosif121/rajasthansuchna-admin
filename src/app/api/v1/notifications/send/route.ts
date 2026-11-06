import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql, isNeonReachable, safeNeonQuery } from "@/lib/db";
import { getFirebaseMessaging } from "@/lib/firebase-admin";
import { requireAdmin, AuthError } from "@/lib/auth";


const schema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  type: z.string().default("newVacancy"),
  entityId: z.string().max(200).optional(),
  agencyName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid notification payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { userId, title, body: messageBody, type, entityId, agencyName } = parsed.data;

    let devices: any[] = [];
    if (sql && (await isNeonReachable(sql))) {
      // Query target device tokens from Neon PostgreSQL
      devices = (await safeNeonQuery(userId
        ? sql`SELECT token FROM push_devices WHERE user_id = ${userId}`
        : sql`SELECT token FROM push_devices`)) as any[] || [];
    }

    if (devices.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        accepted: 0,
        failed: 0,
        message: "Notification broadcast processed. No registered device tokens found.",
      });
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) {
      return NextResponse.json({
        success: true,
        sent: devices.length,
        accepted: 0,
        failed: 0,
        fcmStatus: "skipped_no_credentials",
        message: `Saved for ${devices.length} registered devices. To activate real-time system tray pushes, add Firebase service account credentials to .env.local.`,
      });
    }

    let accepted = 0;
    let failed = 0;
    const invalidTokens: string[] = [];

    // FCM multicast accepts up to 500 tokens per call
    for (let i = 0; i < devices.length; i += 500) {
      const batch = devices.slice(i, i + 500);
      const tokens = batch.map((device: any) => device.token as string);

      const result = await messaging.sendEachForMulticast({
        tokens,
        notification: { title, body: messageBody },
        data: {
          type,
          agencyName: agencyName || "Rajasthan Suchna",
          ...(entityId ? { entityId, vacancySlug: entityId } : {}),
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        android: {
          priority: "high",
          notification: {
            channelId: "high_importance_channel",
            sound: "default",
            defaultSound: true,
            defaultVibrateTimings: true,
            color: "#A30B0B",
          },
        },
        apns: {
          payload: {
            aps: { sound: "default", badge: 1 },
          },
        },
      });

      accepted += result.successCount;
      failed += result.failureCount;

      result.responses.forEach((response, index) => {
        if (
          !response.success &&
          [
            "messaging/registration-token-not-registered",
            "messaging/invalid-registration-token",
          ].includes(response.error?.code ?? "")
        ) {
          invalidTokens.push(tokens[index]);
        }
      });
    }

    // Remove permanently invalid tokens
    for (const token of invalidTokens) {
      await sql`DELETE FROM push_devices WHERE token = ${token}`;
    }

    return NextResponse.json({
      success: true,
      sent: devices.length,
      accepted,
      failed,
      removedInvalidTokens: invalidTokens.length,
      message: `Successfully pushed notification to ${accepted} devices via FCM!`,
    });
  } catch (error: any) {
    if (error instanceof AuthError || error?.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    console.error("Push send failed", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unable to send notification" },
      { status: 500 }
    );
  }
}
