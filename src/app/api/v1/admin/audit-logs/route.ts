import { NextResponse } from 'next/server';
import { AuditService } from '@/server/services/audit-service';

export async function GET() {
  const logs = await AuditService.getLogs();
  return NextResponse.json({ success: true, data: logs });
}

export async function DELETE() {
  await AuditService.clearLogs();
  return NextResponse.json({ success: true, message: 'Audit logs cleared.' });
}
