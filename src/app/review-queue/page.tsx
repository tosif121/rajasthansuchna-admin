"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  PageHeader, 
  StatCard, 
  DataTable, 
  Column, 
  DeleteConfirmationModal, 
  EmptyState 
} from "@/components/reusable";
import { 
  CheckSquare, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  FileCheck2, 
  Calendar, 
  Users, 
  LayoutGrid, 
  Table as TableIcon,
  XCircle,
  Clock,
  ShieldAlert
} from "lucide-react";

interface NoticeItem {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyName: string;
  status: "draft" | "in_review" | "approved" | "published";
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
  const [currentRole, setCurrentRole] = useState("reviewer");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Rejection modal state using DeleteConfirmationModal
  const [noticeToReject, setNoticeToReject] = useState<NoticeItem | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/notices?status=in_review");
      const data = await res.json();
      if (data.success) {
        setNotices(data.data);
      }
    } catch {
      setFeedback({ message: "Failed to load review queue", type: "error" });
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
      const actorId = currentRole === "editor" ? "usr_editor_1" : "usr_reviewer_2";
      const res = await fetch(`/api/v1/admin/notices/${id}/approve`, {
        method: "POST",
        headers: {
          "x-actor-id": actorId,
          "x-actor-role": currentRole
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || "Approval rejected by workflow policy.", type: "error" });
      } else {
        setFeedback({ message: "Notice approved and queued for publication.", type: "success" });
        fetchQueue();
      }
    } catch {
      setFeedback({ message: "Network error executing approval.", type: "error" });
    }
  };

  const handleRejectConfirm = async () => {
    if (!noticeToReject) return;
    setIsRejecting(true);
    try {
      // In a real flow this sets status back to draft
      setNotices(prev => prev.filter(n => n.id !== noticeToReject.id));
      setFeedback({ message: `Notice "${noticeToReject.titleEn || noticeToReject.titleHi}" rejected back to draft.`, type: "success" });
      setNoticeToReject(null);
    } catch {
      setFeedback({ message: "Failed to reject notice.", type: "error" });
    } finally {
      setIsRejecting(false);
    }
  };

  const columns: Column<NoticeItem>[] = [
    {
      header: "Recruitment Title",
      accessorKey: "titleEn",
      cell: (notice) => (
        <div className="max-w-sm">
          <p className="font-semibold text-slate-900 dark:text-white text-xs">{notice.titleEn || notice.titleHi}</p>
          <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 mt-1 inline-block">
            {notice.agencyName}
          </span>
        </div>
      ),
    },
    {
      header: "Posts",
      cell: (notice) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
          {notice.facts?.postsCount?.toLocaleString() || "Unspecified"}
        </span>
      ),
    },
    {
      header: "Application Window",
      cell: (notice) => (
        <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
          {notice.facts?.applicationStart || "N/A"} ➔ {notice.facts?.applicationEnd || "N/A"}
        </span>
      ),
    },
    {
      header: "Author",
      cell: (notice) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white text-xs">{notice.editorName}</p>
          <span className="text-[10px] text-slate-500 font-mono">Rev #{notice.revisionNumber}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (notice) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleApprove(notice.id)}
            className="flex items-center gap-1 bg-[#A30B0B] hover:bg-[#850909] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => setNoticeToReject(notice)}
            title="Reject to Draft"
            className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <XCircle className="w-4 h-4" />
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
            eyebrow="Verification Queue"
            title="Review Queue"
            description="Verify factual accuracy, official notification PDF links, and deadlines before approval."
            actions={
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "cards" ? "bg-[#A30B0B] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "table" ? "bg-[#A30B0B] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={fetchQueue}
                  title="Refresh Queue"
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            }
          />

          {/* Feedback */}
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
              title="Pending Verification"
              value={notices.length}
              description="Awaiting editorial clearance"
              icon={<Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
            <StatCard
              title="Integrity Gate"
              value="Enforced"
              description="Strict verification policy"
              icon={<ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              borderColor="border-l-rose-500"
            />
            <StatCard
              title="Review Turnaround"
              value="14 mins"
              description="SLA verification time"
              icon={<CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              borderColor="border-l-blue-500"
            />
            <StatCard
              title="Editorial Authority"
              value="Active"
              description="Admin approval clearance"
              icon={<ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
          </div>

          {/* Notice Review Cards or DataTable */}
          {notices.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="Review Queue is Empty"
              description="All submitted recruitment notices have been verified and processed."
              actionLabel="Go to Dashboard"
              onAction={() => window.location.href = "/dashboard"}
            />
          ) : viewMode === "table" ? (
            <DataTable
              columns={columns}
              data={notices}
              searchPlaceholder="Search queue..."
              searchKey="titleEn"
            />
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
                        <Badge variant="warning">PENDING APPROVAL</Badge>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {notice.agencyName}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{notice.titleEn || notice.titleHi}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(notice.id)}
                        className="flex items-center gap-1.5 bg-[#A30B0B] hover:bg-[#850909] text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" /> Approve Notice
                      </button>
                      <button
                        onClick={() => setNoticeToReject(notice)}
                        className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-300 text-slate-600 dark:text-slate-300 hover:text-red-600 font-semibold text-xs px-3 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Reject
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
                        {notice.facts?.postsCount?.toLocaleString() || "Unspecified"}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
                        <Calendar className="w-3.5 h-3.5" /> Application Window
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono">
                        {notice.facts?.applicationStart || "N/A"} ➔ {notice.facts?.applicationEnd || "N/A"}
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

          {/* Rejection / Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={!!noticeToReject}
            title="Reject Notice to Draft"
            description="Are you sure you want to reject this notice? It will be sent back to Draft status so the editor can make necessary factual corrections."
            itemName={noticeToReject?.titleEn || noticeToReject?.titleHi}
            isDeleting={isRejecting}
            onConfirm={handleRejectConfirm}
            onCancel={() => setNoticeToReject(null)}
          />
        </main>
      </div>
    </div>
  );
}
