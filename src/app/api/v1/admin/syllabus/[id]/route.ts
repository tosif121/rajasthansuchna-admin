import { NextRequest, NextResponse } from 'next/server';
import { PrepService } from '@/server/services/prep-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await PrepService.getSyllabusById(id);
  if (!item) {
    return NextResponse.json({ success: false, error: 'Syllabus not found' }, { status: 404 });
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
    const updated = await PrepService.updateSyllabus(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Syllabus not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid syllabus update body';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await PrepService.deleteSyllabus(id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Syllabus not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Syllabus deleted successfully' });
}
