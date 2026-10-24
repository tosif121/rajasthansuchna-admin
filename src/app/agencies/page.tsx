"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  PageHeader, 
  StatCard, 
  DataTable, 
  Column, 
  DeleteConfirmationModal 
} from "@/components/reusable";
import { 
  Building2, 
  ExternalLink, 
  Globe, 
  ShieldCheck, 
  Trash2, 
  LayoutGrid, 
  Table as TableIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Agency {
  id: string;
  nameEn: string;
  code: string;
  parentGroup: "rajasthan" | "central";
  officialUrl: string;
  activeNotices: number;
}

const initialAgencies: Agency[] = [
  { id: "agency_rsmssb", nameEn: "RSMSSB (Rajasthan Staff Selection Board)", code: "RSMSSB", parentGroup: "rajasthan", officialUrl: "https://rsmssb.rajasthan.gov.in", activeNotices: 0 },
  { id: "agency_rpsc", nameEn: "RPSC (Rajasthan Public Service Commission)", code: "RPSC", parentGroup: "rajasthan", officialUrl: "https://rpsc.rajasthan.gov.in", activeNotices: 0 },
  { id: "agency_police", nameEn: "Rajasthan Police Headquarters", code: "POLICE", parentGroup: "rajasthan", officialUrl: "https://police.rajasthan.gov.in", activeNotices: 0 },
  { id: "agency_hc", nameEn: "Rajasthan High Court Jodhpur", code: "HCRAJ", parentGroup: "rajasthan", officialUrl: "https://hcraj.nic.in", activeNotices: 0 },
  { id: "agency_ssc", nameEn: "Staff Selection Commission (SSC)", code: "SSC", parentGroup: "central", officialUrl: "https://ssc.gov.in", activeNotices: 0 },
  { id: "agency_rrb", nameEn: "Railway Recruitment Board (RRB)", code: "RRB", parentGroup: "central", officialUrl: "https://rrbcdg.gov.in", activeNotices: 0 },
];

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>(initialAgencies);

  useEffect(() => {
    apiGet<{ success: boolean; data: any[] }>("/api/v1/admin/notices", { ttlSeconds: 5 }).then(res => {
      if (res?.success && Array.isArray(res.data)) {
        setAgencies(prev => prev.map(a => ({
          ...a,
          activeNotices: res.data.filter(n => n.status === "active" && (n.agencyId === a.id || (n.agencyName && n.agencyName.toLowerCase().includes(a.code.toLowerCase())))).length
        })));
      }
    }).catch(() => {});
  }, []);
  const [filterGroup, setFilterGroup] = useState<"all" | "rajasthan" | "central">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Delete modal state
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const rajasthanCount = agencies.filter(a => a.parentGroup === "rajasthan").length;
  const centralCount = agencies.filter(a => a.parentGroup === "central").length;
  const totalNotices = agencies.reduce((acc, curr) => acc + curr.activeNotices, 0);

  const filtered = agencies.filter(a => filterGroup === "all" || a.parentGroup === filterGroup);

  const handleDeleteConfirm = () => {
    if (!agencyToDelete) return;
    setIsDeleting(true);
    setTimeout(() => {
      setAgencies(prev => prev.filter(a => a.id !== agencyToDelete.id));
      setFeedback({ message: `Agency ${agencyToDelete.code} removed successfully.`, type: "success" });
      setAgencyToDelete(null);
      setIsDeleting(false);
    }, 400);
  };

  const columns: Column<Agency>[] = [
    {
      header: "Commission / Board",
      accessorKey: "nameEn",
      cell: (agency) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-bold text-white text-xs shadow-xs">
            {agency.code}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-xs">{agency.nameEn}</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ID: {agency.id}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Jurisdiction",
      cell: (agency) => (
        agency.parentGroup === "rajasthan" ? (
          <Badge variant="warning">Rajasthan Govt</Badge>
        ) : (
          <Badge className="bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-700/50">
            Central Govt
          </Badge>
        )
      ),
    },
    {
      header: "Active Notices",
      cell: (agency) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
          {agency.activeNotices} circulars
        </span>
      ),
    },
    {
      header: "Official Portal",
      cell: (agency) => (
        <a
          href={agency.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Globe className="w-3.5 h-3.5" />
          {agency.officialUrl.replace("https://", "")}
        </a>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (agency) => (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={agency.officialUrl}
            target="_blank"
            rel="noreferrer"
            title="Open Official Website"
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setAgencyToDelete(agency)}
            title="Delete Agency"
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
        <AdminHeader />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          <PageHeader
            eyebrow="Commission Directory"
            title="Recruitment Agencies"
            description="Official state and central examination commissions delivering verified circulars to the Rajasthan Suchna mobile app."
            actions={
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "table" ? "bg-[#A30B0B] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "grid" ? "bg-[#A30B0B] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
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

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Agencies"
              value={agencies.length}
              description="Registered commissions"
              icon={<Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              borderColor="border-l-blue-500"
            />
            <StatCard
              title="Rajasthan State"
              value={rajasthanCount}
              description="State recruitment boards"
              icon={<ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
            <StatCard
              title="Central Agencies"
              value={centralCount}
              description="SSC, RRB & Central"
              icon={<Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              borderColor="border-l-purple-500"
            />
            <StatCard
              title="Active Circulars"
              value={totalNotices}
              description="Live on mobile app"
              icon={<ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
          </div>

          {/* Jurisdiction Filters */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
            <button
              onClick={() => setFilterGroup("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterGroup === "all" ? "bg-[#A30B0B] text-white shadow-sm" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              All Agencies ({agencies.length})
            </button>
            <button
              onClick={() => setFilterGroup("rajasthan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterGroup === "rajasthan" ? "bg-[#A30B0B] text-white shadow-sm" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Rajasthan State ({rajasthanCount})
            </button>
            <button
              onClick={() => setFilterGroup("central")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterGroup === "central" ? "bg-[#A30B0B] text-white shadow-sm" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Central Boards ({centralCount})
            </button>
          </div>

          {/* Data Presentation (Table or Grid) */}
          {viewMode === "table" ? (
            <DataTable
              columns={columns}
              data={filtered}
              searchPlaceholder="Search agency name or code..."
              searchKey="nameEn"
              emptyTitle="No agencies found"
              emptyDescription="No commissions match the selected jurisdiction or search keyword."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(agency => (
                <div
                  key={agency.id}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-red-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-bold text-white text-sm shadow-md shadow-red-950/20">
                      {agency.code}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      agency.parentGroup === "rajasthan"
                        ? "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50"
                        : "bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50"
                    }`}>
                      {agency.parentGroup === "rajasthan" ? "Rajasthan Govt" : "Central Govt"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{agency.nameEn}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{agency.id}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {agency.activeNotices} Active Notices
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={agency.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#A30B0B] dark:text-amber-400 hover:underline"
                      >
                        Visit <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setAgencyToDelete(agency)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Agency"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={!!agencyToDelete}
            title="Delete Agency"
            description="Are you sure you want to delete this agency? All notices associated with this agency may lose their primary commission reference."
            itemName={agencyToDelete?.nameEn}
            isDeleting={isDeleting}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setAgencyToDelete(null)}
          />
        </main>
      </div>
    </div>
  );
}
