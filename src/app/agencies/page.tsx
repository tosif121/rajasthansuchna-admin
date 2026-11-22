"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agencyLogoUrl } from "@/lib/agency-logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  ExternalLink,
  Globe,
  ShieldCheck,
  Trash2,
  Pencil,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ImageIcon,
} from "lucide-react";

interface Agency {
  id: string;
  nameEn: string;
  nameHi?: string;
  code: string;
  parentGroup: "rajasthan" | "central";
  officialUrl: string;
  activeNotices: number;
  logoUrl?: string;
  logoAsset?: string;
  logo?: string;
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState<"all" | "rajasthan" | "central">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal / Form state for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formNameEn, setFormNameEn] = useState("");
  const [formNameHi, setFormNameHi] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formGroup, setFormGroup] = useState<"rajasthan" | "central">("rajasthan");
  const [formUrl, setFormUrl] = useState("");
  const [formLogoAsset, setFormLogoAsset] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [pendingLogoDeletion, setPendingLogoDeletion] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Delete modal state
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAgenciesData = useCallback(async () => {
    try {
      setLoading(true);
      const [agenciesRes, noticesRes] = await Promise.all([
        fetch(`/api/v1/agencies?_t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ success: false, data: [] })),
        fetch(`/api/v1/notices?limit=100&_t=${Date.now()}`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      const rawAgencies = agenciesRes?.success && Array.isArray(agenciesRes.data) ? agenciesRes.data : [];
      const rawNotices = noticesRes?.success && Array.isArray(noticesRes.data) ? noticesRes.data : [];

      const mapped: Agency[] = rawAgencies.map((a: any) => {
        const aId = (a.id || a.slug || "").toLowerCase();
        const aCode = (a.code || a.id || "").toLowerCase();

        const activeCount = rawNotices.filter((n: any) => {
          const nAgency = (n.agencyId || "").toLowerCase();
          const nAgencyName = (n.agencyName || "").toLowerCase();
          return (
            nAgency === aId ||
            nAgency.includes(aId) ||
            aId.includes(nAgency) ||
            (aCode && nAgencyName.includes(aCode))
          );
        }).length;

        return {
          id: a.id || a.slug,
          nameEn: a.nameEn || a.nameHi || a.id,
          nameHi: a.nameHi,
          code: a.code || (a.slug || a.id).toUpperCase(),
          parentGroup: a.parentGroup === "central" ? "central" : "rajasthan",
          officialUrl: a.officialUrl || "https://rajasthan.gov.in",
          activeNotices: activeCount,
          logoAsset: a.logoAsset || "",
          logoUrl: a.logoUrl || agencyLogoUrl(a.logoAsset) || a.logo || a.iconAsset || "",
        };
      });

      setAgencies(mapped);
    } catch (err) {
      console.error("Failed to load agencies:", err);
      setFeedback({ message: "Failed to load recruitment agencies.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgenciesData();
  }, [loadAgenciesData]);

  const handleLogoFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFeedback({ message: "Please choose an image file (PNG, JPG, WebP or SVG).", type: "error" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ message: "Logo image must be 2 MB or smaller.", type: "error" });
      return;
    }

    try {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/admin/agencies/logo", {
        method: "POST",
        body: formData,
      }).then((r) => r.json());

      if (!res.success) {
        setFeedback({ message: res.error || "Failed to upload logo image.", type: "error" });
        return;
      }

      setFormLogoAsset(res.key);
      setFormLogoUrl(res.url);
      if (editingAgency?.logoAsset && editingAgency.logoAsset !== res.key) {
        setPendingLogoDeletion(editingAgency.logoAsset);
      }
      setFeedback({ message: "Logo image uploaded to Neon Object Storage.", type: "success" });
    } catch {
      setFeedback({ message: "Network error uploading logo image.", type: "error" });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const deleteLogoFromBucket = async (key: string): Promise<boolean> => {
    if (!key) return true;
    setIsDeletingLogo(true);
    try {
      const res = await fetch(`/api/v1/admin/agencies/logo?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      }).then((r) => r.json());
      return !!res.success;
    } catch {
      return false;
    } finally {
      setIsDeletingLogo(false);
    }
  };

  const closeAgencyModal = (open: boolean) => {
    if (!open) {
      if (formLogoAsset && (!editingAgency || formLogoAsset !== editingAgency.logoAsset)) {
        void deleteLogoFromBucket(formLogoAsset);
      }
      setPendingLogoDeletion("");
    }
    setIsModalOpen(open);
  };

  // Form handlers
  const openCreateAgency = () => {
    setEditingAgency(null);
    setFormNameEn("");
    setFormNameHi("");
    setFormCode("");
    setFormGroup("rajasthan");
    setFormUrl("https://");
    setFormLogoAsset("");
    setFormLogoUrl("");
    setPendingLogoDeletion("");
    setIsModalOpen(true);
  };

  const openEditAgency = (agency: Agency) => {
    setEditingAgency(agency);
    setFormNameEn(agency.nameEn);
    setFormNameHi(agency.nameHi || "");
    setFormCode(agency.code);
    setFormGroup(agency.parentGroup);
    setFormUrl(agency.officialUrl || "https://");
    setFormLogoAsset(agency.logoAsset || "");
    setFormLogoUrl(agency.logoUrl || agency.logo || "");
    setPendingLogoDeletion("");
    setIsModalOpen(true);
  };

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameEn.trim() || !formCode.trim()) {
      setFeedback({ message: "Agency English name and code are required.", type: "error" });
      return;
    }

    try {
      setIsSaving(true);
      const isEditing = !!editingAgency;
      const endpoint = "/api/v1/agencies";
      const method = isEditing ? "PATCH" : "POST";

      const payload: any = {
        nameEn: formNameEn.trim(),
        nameHi: formNameHi.trim() || formNameEn.trim(),
        code: formCode.trim().toUpperCase(),
        parentGroup: formGroup,
        officialUrl: formUrl.trim() || "https://rajasthan.gov.in",
        logoAsset: formLogoAsset,
      };

      if (isEditing) {
        payload.id = editingAgency.id;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res.success) {
        let cleanupFailed = false;
        if (pendingLogoDeletion) {
          cleanupFailed = !(await deleteLogoFromBucket(pendingLogoDeletion));
          setPendingLogoDeletion("");
        }
        const successMessage = isEditing
          ? `Agency "${formNameEn}" updated successfully.`
          : `Recruitment Agency "${formNameEn}" added successfully.`;
        setFeedback({
          message: cleanupFailed
            ? `${successMessage} Old logo could not be removed from storage.`
            : successMessage,
          type: cleanupFailed ? "error" : "success",
        });
        setIsModalOpen(false);
        await loadAgenciesData();
      } else {
        setFeedback({ message: res.error || "Failed to save recruitment agency.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error saving agency.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!agencyToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/agencies?id=${agencyToDelete.id}`, {
        method: "DELETE",
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({ message: `Agency "${agencyToDelete.nameEn}" removed successfully.`, type: "success" });
        setAgencyToDelete(null);
        await loadAgenciesData();
      } else {
        setFeedback({ message: res.error || "Failed to delete agency.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error deleting agency.", type: "error" });
    } finally {
      setAgencyToDelete(null);
      setIsDeleting(false);
    }
  };

  const rajasthanCount = agencies.filter((a) => a.parentGroup === "rajasthan").length;
  const centralCount = agencies.filter((a) => a.parentGroup === "central").length;
  const totalNotices = agencies.reduce((acc, curr) => acc + curr.activeNotices, 0);

  const filtered = agencies.filter((a) => filterGroup === "all" || a.parentGroup === filterGroup);

  const columns: Column<Agency>[] = [
    {
      header: "Commission / Board",
      accessorKey: "nameEn",
      cell: (agency) => (
        <div className="flex items-center gap-3">
          {agency.logoUrl || agency.logo ? (
            <img
              src={agency.logoUrl || agency.logo}
              alt={agency.nameEn}
              className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200 dark:border-slate-700 p-0.5 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0">
              {agency.code}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-xs">{agency.nameEn}</p>
            {agency.nameHi && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi block">{agency.nameHi}</span>
            )}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: {agency.id}</span>
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
          <Badge className="bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-700/50">
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
          {agency.officialUrl.replace("https://", "").replace("http://", "")}
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
            onClick={() => openEditAgency(agency)}
            title="Edit Agency"
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
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
            description="Official state and central examination commissions delivering verified circulars to the Raj Suchna mobile app."
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={openCreateAgency}
                  className="bg-[#A30B0B] hover:bg-[#850909] text-white gap-1.5 shadow-xs font-semibold text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Recruitment Agency
                </Button>

                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-[#A30B0B] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    title="Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#A30B0B] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
              className={`p-4 rounded-xl text-xs flex items-center justify-between border ${feedback.type === "success"
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
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-2">✕</button>
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
              description="SSC, UPSC, RRB & Central"
              icon={<Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
              borderColor="border-l-sky-500"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterGroup === "all" ? "bg-[#A30B0B] text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              All Agencies ({agencies.length})
            </button>
            <button
              onClick={() => setFilterGroup("rajasthan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterGroup === "rajasthan" ? "bg-[#A30B0B] text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              Rajasthan State ({rajasthanCount})
            </button>
            <button
              onClick={() => setFilterGroup("central")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterGroup === "central" ? "bg-[#A30B0B] text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
              isLoading={loading}
              searchPlaceholder="Search agency name or code..."
              searchKey="nameEn"
              emptyTitle="No agencies found"
              emptyDescription="No commissions match the selected jurisdiction or search keyword."
            />
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((agency) => (
                <div
                  key={agency.id}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-red-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    {agency.logoUrl || agency.logo ? (
                      <img
                        src={agency.logoUrl || agency.logo}
                        alt={agency.nameEn}
                        className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 dark:border-slate-700 p-1 shadow-md shadow-slate-200/50 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-bold text-white text-sm shadow-md shadow-red-950/20 shrink-0">
                        {agency.code}
                      </div>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${agency.parentGroup === "rajasthan"
                      ? "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50"
                      : "bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700/50"
                      }`}>
                      {agency.parentGroup === "rajasthan" ? "Rajasthan Govt" : "Central Govt"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{agency.nameEn}</h3>
                    {agency.nameHi && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-0.5">{agency.nameHi}</p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">ID: {agency.id}</p>
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
                        onClick={() => openEditAgency(agency)}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Edit Agency"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
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

          {/* Dialog: Add / Edit Recruitment Agency */}
          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              if (!open && (isUploadingLogo || isDeletingLogo)) return;
              closeAgencyModal(open);
            }}
          >
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAgency ? "Edit Recruitment Agency" : "Add Recruitment Agency"}</DialogTitle>
                <DialogDescription>
                  Official examination commission or board delivering recruitment circulars.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveAgency} className="space-y-3.5 py-2 text-xs">
                <div>
                  <Label className="mb-2 block">Agency Name (English) *</Label>
                  <Input
                    required
                    placeholder="e.g. Rajasthan Public Service Commission"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Agency Name (Hindi)</Label>
                  <Input
                    placeholder="e.g. राजस्थान लोक सेवा आयोग"
                    value={formNameHi}
                    onChange={(e) => setFormNameHi(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block">Agency Code *</Label>
                    <Input
                      required
                      placeholder="e.g. RPSC"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Jurisdiction</Label>
                    <Select value={formGroup} onValueChange={(val: "rajasthan" | "central") => setFormGroup(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rajasthan">Rajasthan State</SelectItem>
                        <SelectItem value="central">Central Govt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Official Website URL *</Label>
                  <Input
                    required
                    type="url"
                    placeholder="https://rpsc.rajasthan.gov.in"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Agency Logo / Image</Label>
                  {formLogoUrl ? (
                    <div className="relative flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <img
                        src={formLogoUrl}
                        alt="Agency Preview"
                        className="w-14 h-14 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">Logo attached</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Stored in Neon Object Storage</p>
                      </div>
                      <button
                        type="button"
                        disabled={isUploadingLogo || isDeletingLogo}
                        onClick={() => {
                          const removedKey = formLogoAsset;
                          setFormLogoAsset("");
                          setFormLogoUrl("");
                          if (!removedKey) return;

                          if (editingAgency?.logoAsset && removedKey === editingAgency.logoAsset) {
                            setPendingLogoDeletion(removedKey);
                            return;
                          }

                          void deleteLogoFromBucket(removedKey).then((deleted) => {
                            setFeedback({
                              message: deleted
                                ? "Logo removed from storage."
                                : "Logo cleared, but it could not be removed from storage.",
                              type: deleted ? "success" : "error",
                            });
                          });
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!isUploadingLogo && !isDeletingLogo) setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (isUploadingLogo || isDeletingLogo) return;
                        const file = e.dataTransfer.files?.[0];
                        if (file) void handleLogoFile(file);
                      }}
                      className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${isUploadingLogo || isDeletingLogo ? "opacity-60 cursor-not-allowed" : ""} ${isDragging
                        ? "border-[#A30B0B] bg-red-50/50 dark:bg-red-950/20"
                        : "border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/60 dark:bg-slate-900/60"
                        }`}
                      onClick={() => {
                        if (isUploadingLogo || isDeletingLogo) return;
                        fileInputRef.current?.click();
                      }}
                    >
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-1.5" />
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Drag & drop agency logo here, or <span className="text-[#A30B0B] underline font-semibold">browse file</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isUploadingLogo
                          ? "Uploading to Neon…"
                          : isDeletingLogo
                            ? "Removing from Neon…"
                            : "PNG, JPG, SVG, WebP · max 2 MB"}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        disabled={isUploadingLogo || isDeletingLogo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleLogoFile(file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploadingLogo || isDeletingLogo}
                    onClick={() => closeAgencyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || isUploadingLogo || isDeletingLogo}
                    className="bg-[#A30B0B] hover:bg-[#850909] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving
                      ? "Saving..."
                      : isUploadingLogo
                        ? "Uploading logo…"
                        : isDeletingLogo
                          ? "Removing logo…"
                          : editingAgency
                            ? "Update Agency"
                            : "Add Recruitment Agency"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

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
