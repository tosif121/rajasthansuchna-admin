import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/server/services/notice-service';
import { invalidateNoticeCache } from '@/server/cache';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const actorName = req.headers.get('x-actor-name') || admin.email || 'Admin';
    const res = await NoticeService.updateNotice(id, body, actorName);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }
    invalidateNoticeCache();
    return NextResponse.json({ success: true, data: res.notice, message: 'Notice updated successfully.' });
  } catch (err: unknown) {
    if (err instanceof AuthError || (err as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (err as Error).message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin(req);
    const deleted = await NoticeService.deleteNotice(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Notice not found.' }, { status: 404 });
    }
    invalidateNoticeCache();
    return NextResponse.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (err: unknown) {
    if (err instanceof AuthError || (err as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (err as Error).message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete notice' }, { status: 500 });
  }
}
