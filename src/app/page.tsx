'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { 
  FileCheck2, 
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
  Eye
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

  // Form states
  const [formTitleHi, setFormTitleHi] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formAgency, setFormAgency] = useState('RSMSSB (कर्मचारी चयन बोर्ड)');
  const [formPosts, setFormPosts] = useState('1500');
  const [formDeadline, setFormDeadline] = useState('2026-12-15');
  const [formQual, setFormQual] = useState('12th Pass / CET Qualified');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/notices');
      const data = await res.json();
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

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': currentRole === 'editor' ? 'usr_editor_1' : 'usr_reviewer_2',
          'x-actor-name': currentRole === 'editor' ? 'Vikram Sharma (Editor)' : 'Sunita Meena (Reviewer)'
        },
        body: JSON.stringify({
          titleHi: formTitleHi,
          titleEn: formTitleEn,
          agencyName: formAgency,
          facts: {
            postsCount: parseInt(formPosts, 10) || 500,
            applicationEnd: formDeadline,
            qualification: formQual,
            selectionProcess: 'लिखित परीक्षा एवं दस्तावेज सत्यापन',
            sourceUrl: 'https://rajasthan.gov.in',
            sourceDate: new Date().toISOString().split('T')[0],
            verifiedAt: new Date().toISOString().split('T')[0],
            verifiedBy: 'Rajasthan Suchna Ops'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: 'New draft notice created.', type: 'success' });
        setShowCreateModal(false);
        setFormTitleHi('');
        setFormTitleEn('');
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

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Bar / Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                संपादकीय डैशबोर्ड <span className="text-[#A30B0B] dark:text-amber-400 text-lg">· Publishing Center</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Draft ➔ Review ➔ Approve ➔ Publish workflow with strict self-approval prevention.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchNotices}
                title="Refresh"
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-[#A30B0B] hover:bg-[#850909] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md shadow-red-950/20 transition-all"
              >
                <Plus className="w-4 h-4" /> New Recruitment Draft
              </button>
            </div>
          </div>

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

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Live in Flutter Feed</span>
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.published}</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Published</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats.inReview}</span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400/90 font-medium">Requires Approval</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Drafts in Progress</span>
                <FileEdit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.drafts}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Unsubmitted</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Agencies</span>
                <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.agencies}</span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">RSSB, RPSC, etc.</span>
              </div>
            </div>
          </div>

          {/* Workflow Pipeline Table */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#A30B0B]" />
                  Recruitment Publication Queue (समीक्षा एवं प्रकाशन सूची)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Enforces role-based gates. Only approved items reach the public Flutter API.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Recruitment Title / Agency</th>
                    <th className="py-3 px-4">Posts</th>
                    <th className="py-3 px-4">Application Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Author / Revision</th>
                    <th className="py-3 px-4 text-right">Workflow Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                  {notices.map((notice) => {
                    const isDraft = notice.status === 'draft';
                    const isInReview = notice.status === 'in_review';
                    const isApproved = notice.status === 'approved';
                    const isPublished = notice.status === 'published';

                    return (
                      <tr key={notice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white text-xs">{notice.titleHi}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{notice.titleEn}</p>
                          <span className="inline-block mt-1 text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                            {notice.agencyName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {notice.facts?.postsCount?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
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
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          <p className="text-slate-700 dark:text-slate-300 font-medium">{notice.editorName}</p>
                          <p className="text-[10px]">Rev #{notice.revisionNumber}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Draft Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Recruitment Draft</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Title (Hindi - देवनागरी)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. राजस्थान कृषि पर्यवेक्षक भर्ती 2026"
                  value={formTitleHi}
                  onChange={(e) => setFormTitleHi(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#A30B0B]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajasthan Agriculture Supervisor Recruitment 2026"
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#A30B0B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Recruitment Agency</label>
                  <select
                    value={formAgency}
                    onChange={(e) => setFormAgency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#A30B0B]"
                  >
                    <option value="RSMSSB (कर्मचारी चयन बोर्ड)">RSMSSB</option>
                    <option value="RPSC (लोक सेवा आयोग)">RPSC</option>
                    <option value="राजस्थान पुलिस मुख्यालय">Rajasthan Police</option>
                    <option value="SSC (कर्मचारी चयन आयोग)">SSC (Central)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Total Posts</label>
                  <input
                    type="number"
                    value={formPosts}
                    onChange={(e) => setFormPosts(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#A30B0B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#A30B0B]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formQual}
                    onChange={(e) => setFormQual(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#A30B0B]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A30B0B] hover:bg-[#850909] text-white font-semibold rounded-lg shadow-md"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Notice Modal */}
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
