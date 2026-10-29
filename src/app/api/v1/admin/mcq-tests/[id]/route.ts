import { NextRequest, NextResponse } from 'next/server';
import { McqService } from '@/server/services/mcq-service';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await context.params;
    const test = await McqService.getTest(id);
    if (!test) {
      return NextResponse.json({ success: false, error: 'MCQ test not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: test });
  } catch (err: unknown) {
    if (err instanceof AuthError || (err as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (err as Error).message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await context.params;
    const body = await req.json();
    const actorName = req.headers.get('x-actor-name') || admin.email || 'Admin';
    const updated = await McqService.updateTest(id, body, actorName);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err instanceof AuthError || (err as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (err as Error).message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await context.params;
    const actorName = req.headers.get('x-actor-name') || admin.email || 'Admin';
    await McqService.deleteTest(id, actorName);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof AuthError || (err as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (err as Error).message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Failed to delete MCQ test';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
