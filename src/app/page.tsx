"use client";

import { apiGet, invalidateClientApiCache } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  ToggleSwitch,
  DatePicker
} from '@/components/reusable';
import { 
  Clock, 
  FileEdit, 
  Building, 
  Plus, 
  Send, 
  CheckCircle2, 
  Globe, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';

interface NoticeItem {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyName: string;
  status: 'draft' | 'in_review' | 'approved' | 'published';
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
  const [currentRole, setCurrentRole] = useState('reviewer');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectNotice, setInspectNotice] = useState<NoticeItem | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Delete modal state
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleHi, setFormTitleHi] = useState('');
  const [formAgency, setFormAgency] = useState('RSMSSB (Staff Selection Board)');
  const [formPosts, setFormPosts] = useState('1500');
  const [formDeadline, setFormDeadline] = useState('2026-12-15');
  const [formQual, setFormQual] = useState('12th Pass / CET Qualified');

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

  const handleWorkflowAction = async (noticeId: string, action: 'submit' | 'approve' | 'publish') => {
    setFeedback(null);
    try {
      const actorId = currentRole === 'editor' ? 'usr_editor_1' : 'usr_reviewer_2';
      invalidateClientApiCache('/api/v1/admin/notices');
      const res = await fetch(`/api/v1/admin/notices/${noticeId}/${action}`, {
        method: 'POST',
        headers: {
          'x-actor-id': actorId,
          'x-actor-role': currentRole
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || 'Action rejected by policy.', type: 'error' });
      } else {
        setFeedback({ message: data.message || `Notice ${action}d successfully.`, type: 'success' });
        fetchNotices();
      }
    } catch {
      setFeedback({ message: 'Network error executing workflow action.', type: 'error' });
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
        setFeedback({ message: 'Notice retracted/deleted successfully.', type: 'success' });
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
          'x-actor-id': currentRole === 'editor' ? 'usr_editor_1' : 'usr_reviewer_2',
          'x-actor-name': currentRole === 'editor' ? 'Admin' : 'Sunita Meena (Reviewer)'
        },
        body: JSON.stringify({
          titleEn: formTitleEn,
          titleHi: formTitleHi || formTitleEn,
          agencyName: formAgency,
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
        setFeedback({ message: 'New draft notice created successfully.', type: 'success' });
        setShowCreateModal(false);
        setFormTitleEn('');
        setFormTitleHi('');
        fetchNotices();
      }
    } catch {
      setFeedback({ message: 'Failed to create draft.', type: 'error' });
    }
  };

  const stats = {
    published: notices.filter(n => n.status === 'published').length,
    inReview: notices.filter(n => n.status === 'in_review').length,
    drafts: notices.filter(n => n.status === 'draft').length,
    agencies: 8
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
        const isDraft = notice.status === 'draft';
        const isInReview = notice.status === 'in_review';
        const isApproved = notice.status === 'approved';
        const isPublished = notice.status === 'published';

        if (isPublished) {
          return (
            <Badge variant="success" className="gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              PUBLISHED
            </Badge>
          );
        }
        if (isInReview) {
          return (
            <Badge variant="warning" className="gap-1">
              <Clock className="w-3 h-3" /> IN REVIEW
            </Badge>
          );
        }
        if (isApproved) {
          return (
            <Badge className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/50 gap-1">
              <CheckCircle2 className="w-3 h-3" /> APPROVED
            </Badge>
          );
        }
        return (
          <Badge variant="secondary">
            DRAFT
          </Badge>
        );
      },
    },
    {
      header: 'Author / Rev',
      cell: (notice) => (
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          <p className="text-slate-700 dark:text-slate-300 font-medium">{notice.editorName}</p>
          <p className="text-[10px]">Rev #{notice.revisionNumber}</p>
        </div>
      ),
    },
    {
      header: 'Workflow Action',
      className: 'text-right',
      cell: (notice) => {
        const isDraft = notice.status === 'draft';
        const isInReview = notice.status === 'in_review';
        const isApproved = notice.status === 'approved';
        const isPublished = notice.status === 'published';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setInspectNotice(notice)}
              title="Inspect Flutter Model"
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {isDraft && (
              <button
                onClick={() => handleWorkflowAction(notice.id, 'submit')}
                className="flex items-center gap-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-600/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-600/30 px-2 py-1 rounded transition-colors"
              >
                <Send className="w-3 h-3" /> Submit
              </button>
            )}

            {isInReview && (
              <button
                onClick={() => handleWorkflowAction(notice.id, 'approve')}
                className="flex items-center gap-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-600/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 hover:bg-blue-100 dark:hover:bg-blue-600/30 px-2 py-1 rounded transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" /> Approve
              </button>
            )}

            {isApproved && (
              <button
                onClick={() => handleWorkflowAction(notice.id, 'publish')}
                className="flex items-center gap-1 text-[11px] font-semibold bg-[#A30B0B] hover:bg-[#850909] text-white px-2.5 py-1 rounded shadow-xs transition-colors"
              >
                <Globe className="w-3 h-3" /> Publish
              </button>
            )}

            {isPublished && (
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
              title="Delete or Archive Notice"
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
        <AdminHeader currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          {/* Reusable PageHeader */}
          <PageHeader
            eyebrow="Publishing Center"
            title="Editorial Dashboard"
            description="Manage recruitment notices, conduct editorial reviews, and publish verified circulars to the Rajasthan Suchna Flutter app."
            actions={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Live Sync:</span>
                  <ToggleSwitch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    label="Auto Sync"
                  />
                </div>
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
                  <Plus className="w-4 h-4" /> New Recruitment Draft
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
              title="Live in Flutter Feed"
              value={stats.published}
              description="Active Circulars"
              icon={<Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
            <StatCard
              title="Pending Review"
              value={stats.inReview}
              description="Requires Approval"
              icon={<Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
            <StatCard
              title="Drafts in Progress"
              value={stats.drafts}
              description="Unsubmitted"
              icon={<FileEdit className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              borderColor="border-l-blue-500"
            />
            <StatCard
              title="Registered Agencies"
              value={stats.agencies}
              description="RSSB, RPSC, etc."
              icon={<Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              borderColor="border-l-purple-500"
            />
          </div>

          {/* Reusable DataTable for Recruitment Publication Queue */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recruitment Publication Queue
            </h3>
            <DataTable
              columns={tableColumns}
              data={notices}
              isLoading={loading}
              searchKey="titleEn"
              searchPlaceholder="Filter publication queue by recruitment name..."
              pageSize={10}
              emptyTitle="No notices in publication queue"
              emptyDescription="Create a new recruitment draft to start the publishing pipeline."
            />
          </div>
        </main>
      </div>

      {/* Reusable DeleteConfirmationModal */}
      <DeleteConfirmationModal
        isOpen={!!noticeToDelete}
        title="Retract / Delete Notice"
        description="Are you sure you want to delete this recruitment notice? It will be removed immediately from the queue and API."
        itemName={noticeToDelete?.titleEn || noticeToDelete?.titleHi}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setNoticeToDelete(null)}
      />

      {/* Create Draft Notice Modal (shadcn Dialog) */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Recruitment Draft</DialogTitle>
            <DialogDescription>
              Enter initial circular details. Editors cannot approve their own drafts.
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
                placeholder="e.g. राजस्थान कृषि पर्यवेक्षक भर्ती 2026"
                value={formTitleHi}
                onChange={(e) => setFormTitleHi(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Recruitment Commission</label>
                <select
                  value={formAgency}
                  onChange={(e) => setFormAgency(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#A30B0B]"
                >
                  <option value="RSMSSB (Staff Selection Board)">RSMSSB</option>
                  <option value="RPSC (Public Service Commission)">RPSC</option>
                  <option value="Rajasthan Police Headquarters">Rajasthan Police</option>
                  <option value="SSC (Staff Selection Commission)">SSC (Central)</option>
                </select>
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
                Save Draft Notice
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
