'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { History, Shield, CheckCircle2, User, Clock } from 'lucide-react';

interface AuditLogEntry {
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

const mockLogs: AuditLogEntry[] = [
  {
    id: 'aud_01',
    actorName: 'Vikram Sharma',
    actorRole: 'Editor',
    action: 'CREATED_DRAFT',
    entityType: 'Notice',
    entityName: 'राजस्थान पुलिस कांस्टेबल भर्ती 2026',
    timestamp: '2026-10-24 21:40:12 UTC',
    ipAddress: '103.24.112.5 (Jaipur)',
    status: 'SUCCESS'
  },
  {
    id: 'aud_02',
    actorName: 'Vikram Sharma',
    actorRole: 'Editor',
    action: 'SELF_APPROVAL_ATTEMPT',
    entityType: 'Notice',
    entityName: 'राजस्थान पटवारी भर्ती 2026',
    timestamp: '2026-10-24 21:55:04 UTC',
    ipAddress: '103.24.112.5 (Jaipur)',
    status: 'BLOCKED'
  },
  {
    id: 'aud_03',
    actorName: 'Sunita Meena',
    actorRole: 'Reviewer',
    action: 'APPROVED_NOTICE',
    entityType: 'Notice',
    entityName: 'राजस्थान पटवारी भर्ती 2026',
    timestamp: '2026-10-24 22:04:19 UTC',
    ipAddress: '103.24.115.18 (Jodhpur)',
    status: 'SUCCESS'
  },
  {
    id: 'aud_04',
    actorName: 'Anil Verma',
    actorRole: 'Publisher',
    action: 'PUBLISHED_FLUTTER_FEED',
    entityType: 'Public Feed',
    entityName: 'RSMSSB Constable 2026',
    timestamp: '2026-10-24 22:15:33 UTC',
    ipAddress: '103.24.112.5 (Jaipur)',
    status: 'SUCCESS'
  }
];

export default function AuditLogsPage() {
  const [currentRole, setCurrentRole] = useState('reviewer');

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-6 h-6 text-[#A30B0B] dark:text-amber-400" />
              ऑडिट रिकॉर्ड एवं सुरक्षा लॉग <span className="text-sm font-normal text-slate-500 dark:text-slate-400">· Audit Logs</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Immutable chronological record of administrative actions, policy violations, and publishing transitions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Origin IP</th>
                    <th className="py-3 px-4 text-right">Gate Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                  {mockLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">{log.actorName}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{log.actorRole}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-medium text-slate-900 dark:text-white">{log.entityName}</p>
                        <span className="text-[10px] text-slate-500">{log.entityType}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                        {log.ipAddress}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {log.status === 'SUCCESS' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50">
                            ALLOWED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/50">
                            POLICY BLOCKED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
