import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/server/services/notification-service';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    await NotificationService.deleteNotification(id);
    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
