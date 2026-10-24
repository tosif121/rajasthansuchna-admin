import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';

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
}

const notificationsFilePath = path.join(process.cwd(), 'src', 'data', 'notifications.json');

const defaultNotifications: AdminNotificationRecord[] = [
  {
    id: 'notif_init_1',
    title: 'Rajasthan Patwari Recruitment 2026: 2,998 Posts Notification Released',
    message: 'Revenue Department of Rajasthan invites online applications for 2,998 Patwari posts. Check full eligibility and syllabus.',
    vacancyId: 'vac_patwari',
    vacancySlug: 'rajasthan-patwari-recruitment-sample',
    agencyName: 'RSSB Jaipur',
    type: 'newVacancy',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif_init_2',
    title: 'Rajasthan 4th Grade Recruitment 2026: Online Portal Active',
    message: 'Online registration portal has opened for 4th grade positions across Rajasthan government departments.',
    vacancyId: 'vac_01',
    vacancySlug: 'rajasthan-4th-grade-recruitment-sample',
    agencyName: 'RSSB Portal',
    type: 'newVacancy',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif_init_3',
    title: 'RPSC RAS/RTS 2026: Preliminary Exam Admit Cards Released',
    message: 'E-Admit cards for Rajasthan State and Subordinate Services (RAS Pre 2026) are now available for download.',
    vacancyId: 'vac_03',
    vacancySlug: 'rpsc-ras-rts-exam-sample',
    agencyName: 'RPSC Ajmer',
    type: 'admitCard',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif_init_4',
    title: 'Rajasthan Police Constable Recruitment: Application Deadline Approaching',
    message: 'Only 3 days remaining to submit online applications for Rajasthan Police Constable vacancies. Complete registration before portal closes.',
    vacancyId: 'vac_04',
    vacancySlug: 'rajasthan-police-constable-sample',
    agencyName: 'Rajasthan Police',
    type: 'closingSoon',
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
    const sql = getSql();
    if (sql) {
      try {
        const rows = await sql`
          SELECT 
            id, title, message, notice_id as "noticeId", notice_slug as "noticeSlug",
            agency_name as "agencyName", notification_type as "type",
            created_at as "createdAt", sent_at as "sentAt"
          FROM notifications
          ORDER BY created_at DESC;
        `;
        if (rows && rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            message: r.message,
            vacancyId: r.noticeId || 'vac_01',
            vacancySlug: r.noticeSlug || 'sample-slug',
            agencyName: r.agencyName || 'Rajasthan Suchna',
            type: (r.type as NotificationType) || 'newVacancy',
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            sentAt: r.sentAt ? new Date(r.sentAt).toISOString() : undefined,
          }));
        }
      } catch (err) {
        // Table might not exist or network unavailable
      }
    }
    return memoryNotifications;
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
      vacancyId: data.vacancyId || 'vac_01',
      vacancySlug: data.vacancySlug || 'sample-slug',
      agencyName: data.agencyName || 'Rajasthan Suchna Portal',
      type: data.type || 'newVacancy',
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };

    // 1. Save to local/memory immediately
    memoryNotifications.unshift(newRecord);
    saveLocalNotifications(memoryNotifications);

    // 2. Save to Neon PostgreSQL if available
    const sql = getSql();
    if (sql) {
      try {
        await sql`
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
        `;
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
    if (sql) {
      try {
        await sql`DELETE FROM notifications WHERE id = ${id}`;
      } catch (_) {}
    }
    return true;
  }
}
