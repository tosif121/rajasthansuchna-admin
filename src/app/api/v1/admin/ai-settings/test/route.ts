import { NextRequest, NextResponse } from 'next/server';
import { AiSettingsService } from '@/server/services/ai-settings-service';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const { apiKey, prompt, model } = body;

    if (prompt && typeof prompt === 'string' && prompt.trim().length > 0) {
      const res = await AiSettingsService.generateTestResponse(prompt.trim(), model);
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
    if (error instanceof AuthError || (error as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (error as Error).message }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Error testing AI connection';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
