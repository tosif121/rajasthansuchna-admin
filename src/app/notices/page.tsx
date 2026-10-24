'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { PageHeader, EmptyState } from '@/components/reusable';
import { 
  FileText, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Globe, 
  Send, 
  Eye, 
  RefreshCw,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface NoticeItem {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyId: string;
  agencyName: string;
  status: 'draft' | 'in_review' | 'approved' | 'published';
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
  const [currentRole, setCurrentRole] = useState('reviewer');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [inspectNotice, setInspectNotice] = useState<NoticeItem | null>(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/notices');
      const data = await res.json();
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

  const handleWorkflowAction = async (noticeId: string, action: 'submit' | 'approve' | 'publish') => {
    setFeedback(null);
    try {
      const actorId = currentRole === 'editor' ? 'usr_editor_1' : 'usr_reviewer_2';
      const res = await fetch(`/api/v1/admin/notices/${noticeId}/${action}`, {
        method: 'POST',
        headers: {
          'x-actor-id': actorId,
          'x-actor-role': currentRole
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || 'Action rejected by publishing policy.', type: 'error' });
      } else {
        setFeedback({ message: data.message || `Notice ${action}d successfully.`, type: 'success' });
        fetchNotices();
      }
    } catch {
      setFeedback({ message: 'Error executing workflow action.', type: 'error' });
    }
  };

  const filteredNotices = notices.filter(n => {
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    const matchesSearch = !searchQuery || 
      n.titleHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.agencyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Reusable PageHeader */}
          <PageHeader
            eyebrow="Recruitment Management"
            title="All Notices"
            description="Manage government recruitment circulars, revise application windows, and audit verification states."
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

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { label: 'All Notices', value: 'all', count: notices.length },
                { label: 'Published', value: 'published', count: notices.filter(n => n.status === 'published').length },
                { label: 'In Review', value: 'in_review', count: notices.filter(n => n.status === 'in_review').length },
                { label: 'Drafts', value: 'draft', count: notices.filter(n => n.status === 'draft').length },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                    statusFilter === tab.value
                      ? 'bg-[#A30B0B] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title or agency..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#A30B0B]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Title & Agency</th>
                    <th className="py-3 px-4">Vacancies</th>
                    <th className="py-3 px-4">Eligibility</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                  {filteredNotices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8">
                        <EmptyState
                          title="No notices found"
                          description="No recruitment circulars match the selected status or query."
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredNotices.map((notice) => {
                      const isDraft = notice.status === 'draft';
                      const isInReview = notice.status === 'in_review';
                      const isApproved = notice.status === 'approved';
                      const isPublished = notice.status === 'published';

                      return (
                        <tr key={notice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="font-semibold text-slate-900 dark:text-white text-xs">{notice.titleEn || notice.titleHi}</p>
                            <span className="inline-block mt-1 text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                              {notice.agencyName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {notice.facts?.postsCount?.toLocaleString() || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs">
                            {notice.facts?.qualification}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {notice.facts?.applicationEnd || 'To be announced'}
                          </td>
                          <td className="py-3.5 px-4">
                            {isPublished && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50 flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                PUBLISHED
                              </span>
                            )}
                            {isInReview && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 flex items-center gap-1 w-fit">
                                <Clock className="w-3 h-3" /> IN REVIEW
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> APPROVED
                              </span>
                            )}
                            {isDraft && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1 w-fit">
                                DRAFT
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setInspectNotice(notice)}
                                title="Inspect JSON"
                                className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {isDraft && (
                                <button
                                  onClick={() => handleWorkflowAction(notice.id, 'submit')}
                                  className="flex items-center gap-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-600/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-600/30 px-2.5 py-1 rounded transition-colors"
                                >
                                  <Send className="w-3 h-3" /> Submit
                                </button>
                              )}

                              {isInReview && (
                                <button
                                  onClick={() => handleWorkflowAction(notice.id, 'approve')}
                                  className="flex items-center gap-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-600/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 hover:bg-blue-100 dark:hover:bg-blue-600/30 px-2.5 py-1 rounded transition-colors"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Approve
                                </button>
                              )}

                              {isApproved && (
                                <button
                                  onClick={() => handleWorkflowAction(notice.id, 'publish')}
                                  className="flex items-center gap-1 text-[11px] font-semibold bg-[#A30B0B] hover:bg-[#850909] text-white px-2.5 py-1 rounded shadow-sm transition-colors"
                                >
                                  <Globe className="w-3 h-3" /> Publish
                                </button>
                              )}

                              {isPublished && (
                                <a
                                  href={`/api/v1/notices/${notice.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                >
                                  Live API <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Inspect Modal */}
      {inspectNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Flutter API Contract Preview</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Live JSON serialized for Flutter Vacancy model</p>
              </div>
              <button onClick={() => setInspectNotice(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
            </div>

            <pre className="bg-slate-900 p-4 rounded-xl text-[11px] font-mono text-amber-400 dark:text-amber-300 overflow-x-auto max-h-96 border border-slate-800">
              {JSON.stringify(inspectNotice, null, 2)}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectNotice(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
