import { NextRequest, NextResponse } from 'next/server';
import { AiSettingsService } from '@/server/services/ai-settings-service';

// Basic sliding-window rate limiter for public AI queries (protects Gemini quota)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) {
    return false; // Limit: max 20 queries per minute per IP
  }
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many queries. Please wait a moment before asking again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { vacancyTitle, facts, query, language = 'hi' } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Query is required.' }, { status: 400 });
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Query exceeds maximum allowed length of 500 characters.' },
        { status: 400 }
      );
    }

    const settings = AiSettingsService.getSettings();
    if (!settings.isEnabled || !settings.apiKey.trim()) {
      return NextResponse.json({
        success: false,
        error: 'AI assistant is not configured or disabled by administrator.',
      }, { status: 503 });
    }

    const factsContext = facts ? JSON.stringify(facts, null, 2) : 'No extra facts provided.';
    const prompt = `Notice/Vacancy: ${vacancyTitle || 'Government Recruitment'}
Verified Facts:
${factsContext}

User Query (${language === 'en' ? 'English' : 'Hindi'}):
${trimmedQuery}

Instructions:
Answer the user's question accurately based on the facts provided above in the user's language. If a fact is not available in the verified notice, explicitly state that it is not specified in the notification.`;

    const res = await AiSettingsService.generateTestResponse(prompt);
    return NextResponse.json({
      success: true,
      answer: {
        text: res.text,
        model: res.model,
        latencyMs: res.latencyMs,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error processing AI chat query';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
