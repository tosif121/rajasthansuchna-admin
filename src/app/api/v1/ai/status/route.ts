import { NextResponse } from 'next/server';
import { AiSettingsService } from '@/server/services/ai-settings-service';

export async function GET() {
  const settings = AiSettingsService.getPublicSettings();
  return NextResponse.json({
    success: true,
    isEnabled: settings.isEnabled && settings.hasKey,
    model: settings.model,
    hasKey: settings.hasKey,
  });
}
