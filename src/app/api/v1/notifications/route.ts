import { NextRequest, NextResponse } from 'next/server';
import { NotificationService, NotificationType } from '@/server/services/notification-service';

export async function GET(req: NextRequest) {
  try {
    const list = await NotificationService.getNotifications();
    return NextResponse.json(
      {
        success: true,
        data: list,
        total: list.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, vacancyId, vacancySlug, agencyName, type } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const created = await NotificationService.createNotification({
      title,
      message,
      vacancyId,
      vacancySlug,
      agencyName,
      type: type as NotificationType,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification broadcasted successfully',
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}
