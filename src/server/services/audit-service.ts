export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityName: string;
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'BLOCKED';
}

// In-Memory store for live administrative actions
const auditLogs: AuditLogEntry[] = [];

export class AuditService {
  static async getLogs(): Promise<AuditLogEntry[]> {
    return [...auditLogs];
  }

  static async recordLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      ...entry,
    };
    auditLogs.unshift(newEntry);
    return newEntry;
  }

  static async clearLogs(): Promise<void> {
    auditLogs.length = 0;
  }
}
