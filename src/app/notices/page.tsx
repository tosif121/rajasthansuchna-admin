"use client";

import { apiGet, invalidateClientApiCache } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { 
  PageHeader, 
  DataTable, 
  Column, 
  DeleteConfirmationModal,
  FormattedTimestamp
} from '@/components/reusable';
import { 
  CheckCircle2, 
  Eye, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  Trash2 
} from 'lucide-react';

interface NoticeItem {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyId: string;
  agencyName: string;
  status: 'active' | 'inactive';
  revisionNumber: number;
  editorId: string;
  editorName: string;
  publishedAt?: string;
  updatedAt: string;
  facts: {
    postsCount?: number;
    applicationStart?: string;
    applicationEnd?: string;
    qualification: string;
    sourceUrl: string;
  };
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [inspectNotice, setInspectNotice] = useState<NoticeItem | null>(null);

  // Delete Confirmation Modal State
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ success: boolean; data: NoticeItem[] }>('/api/v1/admin/notices', { ttlSeconds: 10 });
      if (data.success) {
        setNotices(data.data);
      }
    } catch {
      setFeedback({ message: 'Failed to fetch recruitment notices', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleToggleStatus = async (noticeId: string) => {
    setFeedback(null);
    try {
      invalidateClientApiCache('/api/v1/admin/notices');
      const res = await fetch(`/api/v1/admin/notices/${noticeId}/status`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || 'Failed to update status.', type: 'error' });
      } else {
        setFeedback({ message: data.message || `Notice status updated to ${data.status}.`, type: 'success' });
        fetchNotices();
      }
    } catch {
      setFeedback({ message: 'Network error updating notice status.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!noticeToDelete) return;
    setIsDeleting(true);
    try {
      invalidateClientApiCache('/api/v1/admin/notices');
      const res = await fetch(`/api/v1/admin/notices/${noticeToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: 'Recruitment notice deleted successfully.', type: 'success' });
        setNoticeToDelete(null);
        fetchNotices();
      } else {
        setFeedback({ message: data.error || 'Failed to delete notice.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Network error deleting notice.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredNotices = notices.filter(n => {
    return statusFilter === 'all' || n.status === statusFilter;
  });

  // DataTable Column Definitions
  const columns: Column<NoticeItem>[] = [
    {
      header: 'Title & Commission',
      cell: (notice) => (
        <div className="max-w-sm">
          <p className="font-semibold text-slate-900 dark:text-white text-xs">{notice.titleEn || notice.titleHi}</p>
          <span className="inline-block mt-1 text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
            {notice.agencyName}
          </span>
        </div>
      ),
    },
    {
      header: 'Vacancies',
      cell: (notice) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {notice.facts?.postsCount?.toLocaleString() || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Eligibility',
      cell: (notice) => (
        <span className="text-slate-600 dark:text-slate-300 text-[11px] max-w-xs block truncate">
          {notice.facts?.qualification}
        </span>
      ),
    },
    {
      header: 'Deadline',
      cell: (notice) => (
        <FormattedTimestamp value={notice.facts?.applicationEnd || ""} fallback="To be announced" />
      ),
    },
    {
      header: 'Status',
      cell: (notice) => {
        const isActive = notice.status === 'active';
        if (isActive) {
          return (
            <Badge variant="success" className="gap-1.5 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ACTIVE
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="gap-1.5 font-bold text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            INACTIVE
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (notice) => {
        const isActive = notice.status === 'active';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setInspectNotice(notice)}
              title="Inspect JSON Model"
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {isActive ? (
              <button
                onClick={() => handleToggleStatus(notice.id)}
                className="flex items-center gap-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded transition-colors"
                title="Deactivate notice"
              >
                Deactivate
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus(notice.id)}
                className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-1 rounded transition-colors"
                title="Activate notice"
              >
                <CheckCircle2 className="w-3 h-3" /> Activate
              </button>
            )}

            {isActive && (
              <a
                href={`/api/v1/notices/${notice.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-1"
              >
                Live <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setNoticeToDelete(notice)}
              title="Delete Notice"
              className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          {/* Reusable PageHeader */}
          <PageHeader
            eyebrow="Recruitment Management"
            title="All Notices"
            description="Manage government recruitment circulars, activate/deactivate listings, and view live status in the mobile feed."
            actions={
              <button
                onClick={fetchNotices}
                title="Refresh notices"
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            }
          />

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80'
                  : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <span className="font-semibold">{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 font-bold px-2">✕</button>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { label: 'All Notices', value: 'all', count: notices.length },
              { label: 'Active', value: 'active', count: notices.filter(n => n.status === 'active').length },
              { label: 'Inactive', value: 'inactive', count: notices.filter(n => n.status === 'inactive').length },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as 'all' | 'active' | 'inactive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  statusFilter === tab.value
                    ? 'bg-[#A30B0B] text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={filteredNotices}
            isLoading={loading}
            searchKey="titleEn"
            searchPlaceholder="Search notices by recruitment title..."
            pageSize={10}
            emptyTitle="No recruitment notices found"
            emptyDescription={
              statusFilter !== 'all'
                ? `No notices currently in ${statusFilter} status.`
                : 'No recruitment circulars have been registered in the system yet.'
            }
          />
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!noticeToDelete}
        title="Delete Notice"
        description="Are you sure you want to permanently delete this recruitment notice? This will revoke mobile feed availability."
        itemName={noticeToDelete?.titleEn || noticeToDelete?.titleHi}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setNoticeToDelete(null)}
      />

      {/* Inspect Notice Modal (shadcn Dialog) */}
      <Dialog open={!!inspectNotice} onOpenChange={(open) => { if (!open) setInspectNotice(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flutter Mobile Feed Notice</DialogTitle>
            <DialogDescription>
              Parsed JSON payload transmitted to Rajasthan Suchna client
            </DialogDescription>
          </DialogHeader>

          <pre className="bg-slate-900 p-4 rounded-xl text-[11px] font-mono text-amber-400 dark:text-amber-300 overflow-x-auto max-h-96 border border-slate-800">
            {JSON.stringify(inspectNotice, null, 2)}
          </pre>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInspectNotice(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
