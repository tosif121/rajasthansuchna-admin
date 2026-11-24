import { NextRequest, NextResponse } from 'next/server';
import { PrepService } from '@/server/services/prep-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await PrepService.getPyqById(id);
  if (!item) {
    return NextResponse.json({ success: false, error: 'PYQ not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: item });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await PrepService.updatePyq(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'PYQ not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid PYQ update body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await PrepService.deletePyq(id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'PYQ not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'PYQ deleted successfully' });
}
