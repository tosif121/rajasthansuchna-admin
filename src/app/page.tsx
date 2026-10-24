"use client";

import { apiGet, invalidateClientApiCache } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { 
  PageHeader, 
  StatCard, 
  DataTable, 
  Column, 
  DeleteConfirmationModal,
  FormattedTimestamp, 
  DatePicker
} from '@/components/reusable';
import { 
  Plus, 
  CheckCircle2, 
  Globe, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  Trash2,
  FileText,
  Clock,
  Building
} from 'lucide-react';

interface NoticeItem {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyName: string;
  status: 'active' | 'inactive';
  revisionNumber: number;
  editorId: string;
  editorName: string;
  updatedAt: string;
  facts: {
    postsCount?: number;
    applicationEnd?: string;
    qualification: string;
  };
}

export default function AdminDashboardPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectNotice, setInspectNotice] = useState<NoticeItem | null>(null);
  // Delete modal state
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleHi, setFormTitleHi] = useState('');
  const [formAgency, setFormAgency] = useState('RSMSSB (Staff Selection Board)');
  const [formPosts, setFormPosts] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formQual, setFormQual] = useState('');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ success: boolean; data: NoticeItem[] }>('/api/v1/admin/notices', { ttlSeconds: 10 });
      if (data.success) {
        setNotices(data.data);
      }
    } catch {
      setFeedback({ message: 'Failed to load notices', type: 'error' });
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
        setFeedback({ message: 'Notice deleted successfully.', type: 'success' });
        setNoticeToDelete(null);
        fetchNotices();
      } else {
        setFeedback({ message: data.error || 'Failed to delete notice.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Error deleting notice.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      invalidateClientApiCache('/api/v1/admin/notices');
      const res = await fetch('/api/v1/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'admin',
          'x-actor-name': 'Admin'
        },
        body: JSON.stringify({
          titleEn: formTitleEn,
          titleHi: formTitleHi || formTitleEn,
          agencyName: formAgency,
          status: 'active',
          facts: {
            postsCount: parseInt(formPosts, 10) || 500,
            applicationEnd: formDeadline,
            qualification: formQual,
            selectionProcess: 'Written Exam and Document Verification',
            sourceUrl: 'https://rajasthan.gov.in',
            sourceDate: new Date().toISOString().split('T')[0],
            verifiedAt: new Date().toISOString().split('T')[0],
            verifiedBy: 'Rajasthan Suchna Operations'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: 'New notice created and set to active.', type: 'success' });
        setShowCreateModal(false);
        setFormTitleEn('');
        setFormTitleHi('');
        setFormPosts('');
        setFormDeadline('');
        setFormQual('');
        fetchNotices();
      }
    } catch {
      setFeedback({ message: 'Failed to create notice.', type: 'error' });
    }
  };

  const stats = {
    total: notices.length,
    active: notices.filter(n => n.status === 'active').length,
    inactive: notices.filter(n => n.status === 'inactive').length,
    agencies: 6
  };

  // Reusable DataTable Columns for Dashboard
  const tableColumns: Column<NoticeItem>[] = [
    {
      header: 'Recruitment Title / Commission',
      cell: (notice) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-xs">{notice.titleEn || notice.titleHi}</p>
          <span className="inline-block mt-1 text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
            {notice.agencyName}
          </span>
        </div>
      ),
    },
    {
      header: 'Posts',
      cell: (notice) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {notice.facts?.postsCount?.toLocaleString() || 'N/A'}
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
      header: 'Author',
      cell: (notice) => (
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          <p className="text-slate-700 dark:text-slate-300 font-medium">{notice.editorName}</p>
          <p className="text-[10px]">Rev #{notice.revisionNumber}</p>
        </div>
      ),
    },
    {
      header: 'Status Action',
      className: 'text-right',
      cell: (notice) => {
        const isActive = notice.status === 'active';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setInspectNotice(notice)}
              title="Inspect Flutter Model"
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
            eyebrow="Publishing Center"
            title="Dashboard"
            description="Manage recruitment notices, activate or deactivate circulars, and broadcast verified circulars to the Rajasthan Suchna Flutter app."
            actions={
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchNotices}
                  title="Refresh notices"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> New Recruitment Notice
                </Button>
              </div>
            }
          />

          {/* Feedback Banner */}
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
              <button
                onClick={() => setFeedback(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Reusable StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Notices"
              value={stats.total}
              description="All circulars in system"
              icon={<FileText className="w-4 h-4 text-[#A30B0B] dark:text-red-400" />}
              borderColor="border-l-[#A30B0B]"
            />
            <StatCard
              title="Active Circulars"
              value={stats.active}
              description="Live in Flutter App Feed"
              icon={<Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
            <StatCard
              title="Inactive Circulars"
              value={stats.inactive}
              description="Drafts & Retracted"
              icon={<Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
              borderColor="border-l-slate-400"
            />
            <StatCard
              title="Commissions / Agencies"
              value={stats.agencies}
              description="RSMSSB, RPSC, etc."
              icon={<Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
          </div>

          {/* Reusable DataTable for Recruitment Notices */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recruitment Notices
            </h3>
            <DataTable
              columns={tableColumns}
              data={notices}
              isLoading={loading}
              searchKey="titleEn"
              searchPlaceholder="Filter notices by recruitment name..."
              pageSize={10}
              emptyTitle="No notices found"
              emptyDescription="Create a new recruitment notice to publish to the Flutter mobile app."
            />
          </div>
        </main>
      </div>

      {/* Reusable DeleteConfirmationModal */}
      <DeleteConfirmationModal
        isOpen={!!noticeToDelete}
        title="Delete Notice"
        description="Are you sure you want to delete this recruitment notice? It will be removed immediately from the system and Flutter feed."
        itemName={noticeToDelete?.titleEn || noticeToDelete?.titleHi}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setNoticeToDelete(null)}
      />

      {/* Create Notice Modal (shadcn Dialog) */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Recruitment Notice</DialogTitle>
            <DialogDescription>
              Enter circular details to add as an active recruitment notice.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Recruitment Title (English)</label>
              <Input
                type="text"
                required
                placeholder="e.g. Rajasthan Agriculture Supervisor Recruitment 2026"
                value={formTitleEn}
                onChange={(e) => setFormTitleEn(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Title (Devanagari - Optional)</label>
              <Input
                type="text"
                placeholder="e.g. Rajasthan Krishi Paryavekshak Bharti 2026"
                value={formTitleHi}
                onChange={(e) => setFormTitleHi(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Recruitment Commission</label>
                <Select
                  value={formAgency}
                  onValueChange={setFormAgency}
                >
                  <SelectTrigger className="w-full h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#A30B0B]">
                    <SelectValue placeholder="Select commission" />
                  </SelectTrigger>
                  <SelectContent className="z-[80]">
                    <SelectItem value="RSMSSB (Staff Selection Board)">RSMSSB</SelectItem>
                    <SelectItem value="RPSC (Public Service Commission)">RPSC</SelectItem>
                    <SelectItem value="Rajasthan Police Headquarters">Rajasthan Police</SelectItem>
                    <SelectItem value="SSC (Staff Selection Commission)">SSC (Central)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Total Posts</label>
                <Input
                  type="number"
                  value={formPosts}
                  onChange={(e) => setFormPosts(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Application Deadline</label>
                <DatePicker
                  date={formDeadline}
                  onChange={(dateStr) => setFormDeadline(dateStr)}
                  placeholder="Select deadline"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Minimum Qualification</label>
                <Input
                  type="text"
                  value={formQual}
                  onChange={(e) => setFormQual(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Notice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspect Notice Modal (shadcn Dialog) */}
      <Dialog open={!!inspectNotice} onOpenChange={(open) => { if (!open) setInspectNotice(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flutter API Contract Preview</DialogTitle>
            <DialogDescription>
              Live JSON serialized for mobile client Vacancy model
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
