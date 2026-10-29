import { Message } from 'firebase-admin/messaging';
import { getFirebaseMessaging } from '@/lib/firebase-admin';

export interface FcmBroadcastPayload {
  title: string;
  body: string;
  vacancyId?: string;
  vacancySlug?: string;
  type?: string;
  agencyName?: string;
}

export interface FcmBroadcastResult {
  success: boolean;
  status: 'sent' | 'skipped_no_credentials' | 'failed';
  messageId?: string;
  error?: string;
}

export async function sendFcmBroadcast(
  payload: FcmBroadcastPayload
): Promise<FcmBroadcastResult> {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return {
      success: false,
      status: 'skipped_no_credentials',
      error: 'Firebase service account key not configured on server.',
    };
  }

  try {
    // Message payload targeting the 'all_jobs' topic that students subscribe to
    const message: Message = {
      topic: 'all_jobs',
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        vacancyId: payload.vacancyId || '',
        vacancySlug: payload.vacancySlug || '',
        type: payload.type || 'newVacancy',
        agencyName: payload.agencyName || 'Rajasthan Suchna',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'high_importance_channel',
          sound: 'default',
          defaultSound: true,
          defaultVibrateTimings: true,
          color: '#A30B0B',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const messageId = await messaging.send(message);
    console.log('[FCM Admin] Broadcast sent successfully, messageId:', messageId);

    return {
      success: true,
      status: 'sent',
      messageId,
    };
  } catch (err: unknown) {
    console.error('[FCM Admin] Send failure:', err);
    return {
      success: false,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Failed to send FCM push notification',
    };
  }
}
