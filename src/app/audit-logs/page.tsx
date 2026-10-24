"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  PageHeader, 
  StatCard, 
  DataTable, 
  Column, 
  DeleteConfirmationModal,
  FormattedTimestamp 
} from "@/components/reusable";
import { 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  Globe2, 
  Trash2, 
  AlertCircle,
  FileText
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityName: string;
  timestamp: string;
  ipAddress: string;
  status: "SUCCESS" | "BLOCKED";
}

const initialLogs: AuditLogEntry[] = [
  {
    id: "aud_01",
    actorName: "Admin",
    actorRole: "Editor",
    action: "CREATED_DRAFT",
    entityType: "Notice",
    entityName: "Rajasthan Police Constable Recruitment 2026",
    timestamp: "2026-10-24 21:40:12 UTC",
    ipAddress: "103.24.112.5 (Jaipur)",
    status: "SUCCESS"
  },
  {
    id: "aud_02",
    actorName: "Admin",
    actorRole: "Editor",
    action: "SELF_APPROVAL_ATTEMPT",
    entityType: "Notice",
    entityName: "Rajasthan Patwari Recruitment 2026",
    timestamp: "2026-10-24 21:55:04 UTC",
    ipAddress: "103.24.112.5 (Jaipur)",
    status: "BLOCKED"
  },
  {
    id: "aud_03",
    actorName: "Sunita Meena",
    actorRole: "Reviewer",
    action: "APPROVED_NOTICE",
    entityType: "Notice",
    entityName: "Rajasthan Patwari Recruitment 2026",
    timestamp: "2026-10-24 22:04:19 UTC",
    ipAddress: "103.24.115.18 (Jodhpur)",
    status: "SUCCESS"
  },
  {
    id: "aud_04",
    actorName: "Anil Verma",
    actorRole: "Publisher",
    action: "PUBLISHED_FLUTTER_FEED",
    entityType: "Public Feed",
    entityName: "RSMSSB Constable 2026",
    timestamp: "2026-10-24 22:15:33 UTC",
    ipAddress: "103.24.112.5 (Jaipur)",
    status: "SUCCESS"
  },
  {
    id: "aud_05",
    actorName: "System Automation",
    actorRole: "System",
    action: "EXAM_CALENDAR_SYNC",
    entityType: "Calendar",
    entityName: "RPSC RAS Prelims Schedule 2026",
    timestamp: "2026-10-24 22:30:00 UTC",
    ipAddress: "127.0.0.1 (Localhost)",
    status: "SUCCESS"
  }
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(initialLogs);
  const [currentRole, setCurrentRole] = useState("reviewer");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Delete modal state
  const [logToDelete, setLogToDelete] = useState<AuditLogEntry[] | AuditLogEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const blockedCount = logs.filter(l => l.status === "BLOCKED").length;
  const successCount = logs.filter(l => l.status === "SUCCESS").length;

  const handleDeleteConfirm = () => {
    if (!logToDelete) return;
    setIsDeleting(true);
    setTimeout(() => {
      if (Array.isArray(logToDelete)) {
        setLogs([]);
        setFeedback({ message: "All audit log entries purged.", type: "success" });
      } else {
        setLogs(prev => prev.filter(l => l.id !== logToDelete.id));
        setFeedback({ message: `Audit record ${logToDelete.id} removed.`, type: "success" });
      }
      setLogToDelete(null);
      setIsDeleting(false);
    }, 400);
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (log) => (
        <FormattedTimestamp value={log.timestamp} />
      ),
    },
    {
      header: "Actor",
      accessorKey: "actorName",
      cell: (log) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-xs">{log.actorName}</p>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">{log.actorRole}</span>
        </div>
      ),
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: (log) => (
        <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
          {log.action}
        </span>
      ),
    },
    {
      header: "Target Entity",
      accessorKey: "entityName",
      cell: (log) => (
        <div className="max-w-xs">
          <p className="font-medium text-slate-900 dark:text-white text-xs truncate">{log.entityName}</p>
          <span className="text-[10px] text-slate-500 font-mono">{log.entityType}</span>
        </div>
      ),
    },
    {
      header: "Origin Gateway",
      accessorKey: "ipAddress",
      cell: (log) => (
        <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
          {log.ipAddress}
        </span>
      ),
    },
    {
      header: "Gate Result",
      cell: (log) => (
        log.status === "SUCCESS" ? (
          <Badge variant="success">ALLOWED</Badge>
        ) : (
          <Badge variant="destructive">POLICY BLOCKED</Badge>
        )
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (log) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setLogToDelete(log)}
            title="Delete Log Entry"
            className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          <PageHeader
            eyebrow="Governance & Compliance"
            title="Audit Logs"
            description="Immutable chronological record of administrative actions, policy violations, and publishing transitions."
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogToDelete(logs)}
                disabled={logs.length === 0}
                className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Logs
              </Button>
            }
          />

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80"
                  : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <span className="font-semibold">{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 font-bold px-2">✕</button>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Events"
              value={logs.length}
              description="Recorded in system"
              icon={<History className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              borderColor="border-l-blue-500"
            />
            <StatCard
              title="Allowed Operations"
              value={successCount}
              description="Passed policy gate"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
            <StatCard
              title="Policy Blocked"
              value={blockedCount}
              description="Integrity guards tripped"
              icon={<ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              borderColor="border-l-rose-500"
            />
            <StatCard
              title="Origin Endpoints"
              value="3 gateways"
              description="Active admin IPs"
              icon={<Globe2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              borderColor="border-l-purple-500"
            />
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={logs}
            searchPlaceholder="Search actor, action or target entity..."
            searchKey="action"
            emptyTitle="No audit records found"
            emptyDescription="There are currently no recorded administrative events."
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={!!logToDelete}
            title={Array.isArray(logToDelete) ? "Purge All Audit Logs" : "Delete Audit Record"}
            description={
              Array.isArray(logToDelete)
                ? "Are you sure you want to purge all audit records? This action permanently clears the compliance trail."
                : "Are you sure you want to delete this audit record? This action cannot be reversed."
            }
            itemName={Array.isArray(logToDelete) ? "All Entries" : (logToDelete as AuditLogEntry)?.action}
            isDeleting={isDeleting}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setLogToDelete(null)}
          />
        </main>
      </div>
    </div>
  );
}
