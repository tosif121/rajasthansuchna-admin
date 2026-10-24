import { NextRequest, NextResponse } from 'next/server';
import { AiSettingsService } from '@/server/services/ai-settings-service';
import { AuditService } from '@/server/services/audit-service';

export async function GET() {
  try {
    const settings = AiSettingsService.getPublicSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch AI settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = AiSettingsService.updateSettings(body, 'Admin');

    await AuditService.recordLog({
      action: "Updated Gemini AI settings & API key",
      actorName: "Admin",
      actorRole: "Administrator",
      entityType: "System Settings",
      entityName: "Gemini AI Configuration",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: 'AI settings updated successfully',
      settings: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update AI settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
