import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/server/services/notification-service';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only authenticated administrators may delete notifications globally
    await requireAdmin(req);

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    await NotificationService.deleteNotification(id);
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error: any) {
    if (error instanceof AuthError || error?.statusCode === 401) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
