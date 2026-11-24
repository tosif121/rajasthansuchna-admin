import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';
import { sendFcmBroadcast } from './fcm-admin-service';
import { isNeonReachable, safeNeonQuery } from '@/lib/db';
import { NoticeService } from './notice-service';

export type NotificationType = 'newVacancy' | 'admitCard' | 'result' | 'correction' | 'closingSoon';

export interface AdminNotificationRecord {
  id: string;
  title: string;
  message: string;
  vacancyId: string;
  vacancySlug: string;
  agencyName: string;
  type: NotificationType;
  createdAt: string;
  sentAt?: string;
  fcmStatus?: 'sent' | 'skipped_no_credentials' | 'failed';
  fcmMessageId?: string;
}

const notificationsFilePath = path.join(process.cwd(), 'src', 'data', 'notifications.json');

const defaultNotifications: AdminNotificationRecord[] = [
  {
    id: '91a70079-5dde-41fc-899c-4d4a70f92aca',
    title: 'Rajasthan CET 2026: Official Exam Dates Announced',
    message: 'Rajasthan Staff Selection Board (RSSB) has declared the official exam schedule for CET 2026. Download scheme and syllabus in the app.',
    vacancyId: 'vac_cet_2026',
    vacancySlug: 'rajasthan-cet-exam-dates-2026',
    agencyName: 'RSSB Jaipur',
    type: 'newVacancy',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c9dadcf6-13b9-4944-868e-b6536bcff586',
    title: 'Rajasthan Police SI Recruitment 2026: 859 Posts Announced',
    message: 'Rajasthan Public Service Commission (RPSC) has officially announced Sub Inspector (SI) & Platoon Commander recruitment. Check syllabus, physical standards, and online apply link now in the app.',
    vacancyId: 'vac_police_si_2026',
    vacancySlug: 'rajasthan-police-sub-inspector-recruitment-2026',
    agencyName: 'RPSC Ajmer',
    type: 'newVacancy',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif_patwari_2026',
    title: 'Rajasthan Patwari Recruitment 2026: 2,998 Posts Notification Released',
    message: 'Revenue Department of Rajasthan invites online applications for 2,998 Patwari posts. Check full eligibility and syllabus.',
    vacancyId: 'vac_patwari_2026',
    vacancySlug: 'rajasthan-patwari-recruitment-2026',
    agencyName: 'RSSB Jaipur',
    type: 'newVacancy',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif_ras_2026',
    title: 'RPSC RAS / RTS Exam 2026: Official Notification & Exam Scheme',
    message: 'Rajasthan State and Subordinate Combined Competitive Services Examination 2026 notification published by RPSC Ajmer.',
    vacancyId: 'vac_ras_2026',
    vacancySlug: 'rpsc-ras-rts-exam-2026',
    agencyName: 'RPSC Ajmer',
    type: 'newVacancy',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

function readLocalNotifications(): AdminNotificationRecord[] {
  try {
    if (fs.existsSync(notificationsFilePath)) {
      const data = JSON.parse(fs.readFileSync(notificationsFilePath, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Failed to read local notifications:', err);
  }
  return defaultNotifications;
}

function saveLocalNotifications(list: AdminNotificationRecord[]) {
  try {
    const dir = path.dirname(notificationsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(notificationsFilePath, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save local notifications:', err);
  }
}

let memoryNotifications: AdminNotificationRecord[] = readLocalNotifications();

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('ep-sample')) {
    return neon(dbUrl);
  }
  return null;
}

export class NotificationService {
  static async getNotifications(): Promise<AdminNotificationRecord[]> {
    let explicitNotifications: AdminNotificationRecord[] = [];
    const sql = getSql();
    if (sql && (await isNeonReachable(sql))) {
      try {
        const rows = (await safeNeonQuery(sql`
          SELECT 
            id, title, message, notice_id as "noticeId", notice_slug as "noticeSlug",
            agency_name as "agencyName", notification_type as "type",
            created_at as "createdAt", sent_at as "sentAt"
          FROM notifications
          ORDER BY created_at DESC;
        `)) as any[];
        if (rows && rows.length > 0) {
          explicitNotifications = rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            message: r.message,
            vacancyId: r.noticeId || '',
            vacancySlug: r.noticeSlug || '',
            agencyName: r.agencyName || 'Raj Suchna',
            type: (r.type as NotificationType) || 'newVacancy',
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            sentAt: r.sentAt ? new Date(r.sentAt).toISOString() : undefined,
          }));
        }
      } catch (err) {
        // Table might not exist or network unavailable
      }
    }

    if (explicitNotifications.length === 0) {
      explicitNotifications = [...memoryNotifications];
    }

    // Automatically incorporate ALL published Notices/Posts so every vacancy has a notification
    try {
      const allNotices = await NoticeService.getNotices();
      const existingSlugs = new Set(
        explicitNotifications
          .map((n) => n.vacancySlug || n.vacancyId)
          .filter(Boolean)
      );

      const noticeNotifications: AdminNotificationRecord[] = allNotices
        .filter((notice) => !existingSlugs.has(notice.slug) && !existingSlugs.has(notice.id))
        .map((notice) => {
          let notifType: NotificationType = 'newVacancy';
          const rawType = (notice.noticeType || '').toLowerCase();
          if (rawType === 'admitcard' || rawType === 'admit_card') {
            notifType = 'admitCard';
          } else if (rawType === 'result') {
            notifType = 'result';
          } else if (rawType === 'answerkey' || rawType === 'answer_key' || rawType === 'correction') {
            notifType = 'correction';
          }

          const title = notice.titleHi || notice.titleEn || 'नई भर्ती विज्ञप्ति';
          const summary = notice.summaryHi || notice.summaryEn;
          const agencyDisplay = notice.agencyName || (notice.agencyId ? notice.agencyId.replace('agency_', '').toUpperCase() : 'Raj Suchna');
          const postsText = notice.facts?.postsCount ? ` (${notice.facts.postsCount} पद)` : '';
          const message = summary && summary.trim().length > 0
            ? summary
            : `${agencyDisplay} द्वारा ${title}${postsText} की आधिकारिक विज्ञप्ति एवं महत्वपूर्ण तिथियां जारी।`;

          return {
            id: `notif_${notice.id}`,
            title,
            message,
            vacancyId: notice.id,
            vacancySlug: notice.slug,
            agencyName: agencyDisplay,
            type: notifType,
            createdAt: notice.publishedAt || (notice as any).updatedAt || new Date().toISOString(),
            sentAt: notice.publishedAt || (notice as any).updatedAt || new Date().toISOString(),
          };
        });

      const combined = [...explicitNotifications, ...noticeNotifications];
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return combined;
    } catch (err) {
      console.error('Failed to combine notices into notifications:', err);
      return explicitNotifications;
    }
  }

  static async createNotification(data: {
    title: string;
    message: string;
    vacancyId?: string;
    vacancySlug?: string;
    agencyName?: string;
    type?: NotificationType;
  }): Promise<AdminNotificationRecord> {
    const newRecord: AdminNotificationRecord = {
      id: randomUUID(),
      title: data.title.trim(),
      message: data.message.trim(),
      vacancyId: data.vacancyId || '',
      vacancySlug: data.vacancySlug || '',
      agencyName: data.agencyName || 'Raj Suchna Portal',
      type: data.type || 'newVacancy',
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };

    // 1. Dispatch real-time Push Notification via Firebase Cloud Messaging (FCM)
    try {
      const fcmRes = await sendFcmBroadcast({
        title: newRecord.title,
        body: newRecord.message,
        vacancyId: newRecord.vacancyId,
        vacancySlug: newRecord.vacancySlug,
        type: newRecord.type,
        agencyName: newRecord.agencyName,
      });
      newRecord.fcmStatus = fcmRes.status;
      if (fcmRes.messageId) {
        newRecord.fcmMessageId = fcmRes.messageId;
      }
    } catch (fcmErr) {
      console.warn('[NotificationService] FCM push error:', fcmErr);
      newRecord.fcmStatus = 'failed';
    }

    // 2. Save to local/memory immediately
    memoryNotifications.unshift(newRecord);
    saveLocalNotifications(memoryNotifications);

    // 2. Save to Neon PostgreSQL if available
    const sql = getSql();
    if (sql && (await isNeonReachable(sql))) {
      try {
        await safeNeonQuery(sql`
          INSERT INTO notifications (id, title, message, notice_slug, agency_name, notification_type, sent_at, created_at)
          VALUES (
            ${newRecord.id},
            ${newRecord.title},
            ${newRecord.message},
            ${newRecord.vacancySlug},
            ${newRecord.agencyName},
            ${newRecord.type},
            ${newRecord.sentAt},
            ${newRecord.createdAt}
          )
        `);
      } catch (err) {
        console.warn('Neon DB insert into notifications failed, kept in local store:', err);
      }
    }

    return newRecord;
  }

  static async deleteNotification(id: string): Promise<boolean> {
    memoryNotifications = memoryNotifications.filter((n) => n.id !== id);
    saveLocalNotifications(memoryNotifications);

    const sql = getSql();
    if (sql && (await isNeonReachable(sql))) {
      try {
        await safeNeonQuery(sql`DELETE FROM notifications WHERE id = ${id}`);
      } catch (_) {}
    }
    return true;
  }
}
