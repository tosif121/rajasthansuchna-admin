'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { 
  CheckSquare, 
  CheckCircle2, 
  FileWarning, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  FileCheck2,
  Calendar,
  Users
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
    applicationStart?: string;
    applicationEnd?: string;
    qualification: string;
    selectionProcess: string;
    sourceUrl: string;
    verifiedBy: string;
  };
  links: Array<{ label: string; url: string; kind: string }>;
}

export default function ReviewQueuePage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState('reviewer');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/notices?status=in_review');
      const data = await res.json();
      if (data.success) {
        setNotices(data.data);
      }
    } catch {
      setFeedback({ message: 'Failed to load review queue', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    setFeedback(null);
    try {
      const actorId = currentRole === 'editor' ? 'usr_editor_1' : 'usr_reviewer_2';
      const res = await fetch(`/api/v1/admin/notices/${id}/approve`, {
        method: 'POST',
        headers: {
          'x-actor-id': actorId,
          'x-actor-role': currentRole
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || 'Approval rejected by workflow policy.', type: 'error' });
      } else {
        setFeedback({ message: 'Notice approved and queued for publication.', type: 'success' });
        fetchQueue();
      }
    } catch {
      setFeedback({ message: 'Network error executing approval.', type: 'error' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-[#A30B0B] dark:text-amber-400" />
                समीक्षा कतार <span className="text-sm font-normal text-slate-500 dark:text-slate-400">· Review Queue</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Verify factual accuracy, official notification PDF links, and deadlines before approval.
              </p>
            </div>

            <button
              onClick={fetchQueue}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

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

          {/* Notice Review Cards */}
          {notices.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Review Queue is Empty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All submitted recruitment notices have been verified and processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50">
                          PENDING APPROVAL
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {notice.agencyName}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{notice.titleHi}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{notice.titleEn}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(notice.id)}
                        className="flex items-center gap-1.5 bg-[#A30B0B] hover:bg-[#850909] text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" /> Approve Notice
                      </button>
                    </div>
                  </div>

                  {/* Fact Checks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
                        <Users className="w-3.5 h-3.5" /> Total Vacancies
                      </span>
                      <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                        {notice.facts?.postsCount?.toLocaleString() || 'Unspecified'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
                        <Calendar className="w-3.5 h-3.5" /> Application Window
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono">
                        {notice.facts?.applicationStart || 'N/A'} ➔ {notice.facts?.applicationEnd || 'N/A'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
                        <FileCheck2 className="w-3.5 h-3.5" /> Minimum Qualification
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                        {notice.facts?.qualification}
                      </span>
                    </div>
                  </div>

                  {/* Evidence Source URL */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Author:</span> {notice.editorName} (Rev #{notice.revisionNumber})
                    </div>
                    {notice.facts?.sourceUrl && (
                      <a
                        href={notice.facts.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-semibold mt-1 sm:mt-0"
                      >
                        Official Source Portal: {notice.facts.sourceUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
