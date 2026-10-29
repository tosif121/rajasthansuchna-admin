import { NextRequest, NextResponse } from 'next/server';
import { McqService } from '@/server/services/mcq-service';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const data = await McqService.getAllTests(true);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    if (err instanceof AuthError || (err as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (err as Error).message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch tests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const actorName = req.headers.get('x-actor-name') || admin.email || 'Admin';
    const created = await McqService.createTest(body, actorName);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof AuthError || (err as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (err as Error).message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
