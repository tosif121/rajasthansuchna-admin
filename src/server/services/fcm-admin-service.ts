import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';

let isInitialized = false;

function initFirebaseAdmin(): boolean {
  if (isInitialized || getApps().length > 0) {
    isInitialized = true;
    return true;
  }

  try {
    // 1. Try env variable JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      const creds = raw.startsWith('{')
        ? JSON.parse(raw)
        : JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));

      initializeApp({
        credential: cert(creds),
        projectId: creds.project_id || 'rajsuchnaa-9f50a',
      });
      isInitialized = true;
      console.log('[FCM Admin] Initialized with FIREBASE_SERVICE_ACCOUNT_KEY');
      return true;
    }

    // 2. Try file paths
    // Read project details from google-services.json
    let extractedProjectId = 'rajsuchnaa-9f50a';
    try {
      const gsPath = path.join(process.cwd(), 'src', 'data', 'google-services.json');
      if (fs.existsSync(gsPath)) {
        const gsData = JSON.parse(fs.readFileSync(gsPath, 'utf-8'));
        if (gsData?.project_info?.project_id) {
          extractedProjectId = gsData.project_info.project_id;
        }
      }
    } catch (_) {}

    const candidatePaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      path.join(process.cwd(), 'firebase-service-account.json'),
      path.join(process.cwd(), 'src', 'server', 'firebase-service-account.json'),
      path.join(process.cwd(), '..', 'rajasthan-suchna', 'firebase-service-account.json'),
      path.join(process.cwd(), '..', 'rajasthan-suchna', 'android', 'app', 'google-services.json'),
      '/Users/tosif/Downloads/rajsuchnaa-firebase-adminsdk.json',
    ].filter(Boolean) as string[];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const fileContent = fs.readFileSync(p, 'utf-8');
        const creds = JSON.parse(fileContent);
        initializeApp({
          credential: cert(creds),
          projectId: creds.project_id || 'rajsuchnaa-9f50a',
        });
        isInitialized = true;
        console.log(`[FCM Admin] Initialized using service account file at ${p}`);
        return true;
      }
    }

    console.warn(
      '[FCM Admin] Note: No Firebase Service Account Key found. Push alerts are saved to the app in-feed notifications database. Place firebase-service-account.json in the admin project root to activate real-time system tray pushes.'
    );
    return false;
  } catch (err) {
    console.error('[FCM Admin] Initialization error:', err);
    return false;
  }
}

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
  const ready = initFirebaseAdmin();
  if (!ready) {
    return {
      success: false,
      status: 'skipped_no_credentials',
      error: 'Firebase service account key not configured on server.',
    };
  }

  try {
    const messaging = getMessaging();

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
  } catch (err: any) {
    console.error('[FCM Admin] Send failure:', err);
    return {
      success: false,
      status: 'failed',
      error: err?.message || 'Failed to send FCM push notification',
    };
  }
}
