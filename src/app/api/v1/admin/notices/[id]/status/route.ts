import { NextRequest, NextResponse } from 'next/server';
import { NoticeService, NoticeStatus } from '@/server/services/notice-service';
import { invalidateNoticeCache } from '@/server/cache';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { status?: NoticeStatus } = {};
  try {
    body = await req.json();
  } catch {
    // If no body provided, toggle status
  }

  if (body.status && (body.status === 'active' || body.status === 'inactive')) {
    const res = await NoticeService.updateNoticeStatus(id, body.status);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }
    invalidateNoticeCache();
    return NextResponse.json({
      success: true,
      status: body.status,
      message: `Notice status updated to ${body.status}.`
    });
  }

  // Toggle status
  const res = await NoticeService.toggleNoticeStatus(id);
  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }
  invalidateNoticeCache();
  return NextResponse.json({
    success: true,
    status: res.nextStatus,
    message: `Notice status is now ${res.nextStatus}.`
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(req, context);
}
