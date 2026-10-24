import { NextRequest, NextResponse } from 'next/server';
import { AiSettingsService } from '@/server/services/ai-settings-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { apiKey, prompt } = body;

    if (prompt && typeof prompt === 'string' && prompt.trim().length > 0) {
      const res = await AiSettingsService.generateTestResponse(prompt.trim());
      return NextResponse.json({
        success: true,
        type: 'generation',
        result: res,
      });
    }

    const testResult = await AiSettingsService.testConnection(apiKey);
    return NextResponse.json({
      success: testResult.success,
      type: 'connection',
      result: testResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error testing AI connection';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
