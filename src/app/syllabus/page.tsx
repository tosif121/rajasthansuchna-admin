"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Column,
  DataTable,
  DeleteConfirmationModal,
  PageHeader,
  StatCard,
} from "@/components/reusable";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BookOpen,
  Building,
  CheckCircle2,
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { SyllabusRecord } from "@/server/services/prep-service";

interface SyllabusFormData {
  titleHi: string;
  titleEn: string;
  agencyId: string;
  agencyName: string;
  examYear: string;
  totalMarks: string;
  durationMinutes: number;
  pdfUrl: string;
  subjectsStrHi: string;
  subjectsStrEn: string;
  schemeSummaryHi: string;
  schemeSummaryEn: string;
  isActive: boolean;
}

const emptyForm: SyllabusFormData = {
  titleHi: "",
  titleEn: "",
  agencyId: "rpsc",
  agencyName: "राजस्थान लोक सेवा आयोग (RPSC)",
  examYear: "2026",
  totalMarks: "200",
  durationMinutes: 180,
  pdfUrl: "",
  subjectsStrHi: "सामान्य ज्ञान, राजस्थान सामान्य अध्ययन, तार्किक विवेचन",
  subjectsStrEn: "General Knowledge, Rajasthan Studies, Logical Reasoning",
  schemeSummaryHi: "",
  schemeSummaryEn: "",
  isActive: true,
};

const agencyList = [
  { id: "rpsc", name: "राजस्थान लोक सेवा आयोग (RPSC)" },
  { id: "rssb", name: "राजस्थान कर्मचारी चयन बोर्ड (RSSB)" },
  { id: "police", name: "राजस्थान पुलिस भर्ती बोर्ड" },
  { id: "hcraj", name: "राजस्थान उच्च न्यायालय (HCRAJ)" },
  { id: "central", name: "केंद्रीय भर्ती (SSC / UPSC / Railway)" },
  { id: "other", name: "अन्य भर्ती संस्था" },
];

export default function SyllabusPage() {
  const [items, setItems] = useState<SyllabusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SyllabusRecord | null>(null);
  const [form, setForm] = useState<SyllabusFormData>(emptyForm);
  const [langTab, setLangTab] = useState<"hi" | "en">("hi");
  const [isSaving, setIsSaving] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<SyllabusRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/syllabus");
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch {
      setFeedback({ message: "Network error fetching syllabuses.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setLangTab("hi");
    setFormOpen(true);
  };

  const openEdit = (item: SyllabusRecord) => {
    setEditingItem(item);
    setForm({
      titleHi: item.titleHi,
      titleEn: item.titleEn,
      agencyId: item.agencyId,
      agencyName: item.agencyName,
      examYear: item.examYear || "2026",
      totalMarks: item.totalMarks || "",
      durationMinutes: item.durationMinutes || 180,
      pdfUrl: item.pdfUrl,
      subjectsStrHi: (item.subjects || []).join(", "),
      subjectsStrEn: (item.subjects || []).join(", "),
      schemeSummaryHi: item.schemeSummary || "",
      schemeSummaryEn: item.schemeSummary || "",
      isActive: item.isActive,
    });
    setLangTab("hi");
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleHi.trim() || !form.titleEn.trim() || !form.pdfUrl.trim()) {
      setFeedback({ message: "Please provide Hindi Title, English Title, and PDF URL.", type: "error" });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    const subjects = (form.subjectsStrHi || form.subjectsStrEn)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      titleHi: form.titleHi.trim(),
      titleEn: form.titleEn.trim(),
      agencyId: form.agencyId,
      agencyName: agencyList.find((a) => a.id === form.agencyId)?.name || form.agencyName,
      examYear: form.examYear.trim(),
      totalMarks: form.totalMarks.trim(),
      durationMinutes: Number(form.durationMinutes) || 180,
      pdfUrl: form.pdfUrl.trim(),
      subjects,
      schemeSummary: form.schemeSummaryHi.trim() || form.schemeSummaryEn.trim(),
      isActive: form.isActive,
    };

    try {
      const url = editingItem
        ? `/api/v1/admin/syllabus/${editingItem.id}`
        : "/api/v1/admin/syllabus";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || "Failed to save syllabus.", type: "error" });
      } else {
        setFeedback({
          message: editingItem ? "Syllabus updated successfully." : "Syllabus published to mobile app.",
          type: "success",
        });
        setFormOpen(false);
        await fetchItems();
      }
    } catch {
      setFeedback({ message: "Network error saving syllabus.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/syllabus/${itemToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: "Syllabus deleted successfully.", type: "success" });
        setItemToDelete(null);
        await fetchItems();
      } else {
        setFeedback({ message: data.error || "Failed to delete syllabus.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error deleting syllabus.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<SyllabusRecord>[] = [
    {
      header: "Syllabus & Commission",
      cell: (item) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
            {item.titleEn}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            {item.titleHi}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="inline-block text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
              {item.agencyName}
            </span>
            <span className="inline-block text-[10px] text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              Year {item.examYear}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Scheme & Marks",
      cell: (item) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {item.totalMarks || "As per notification"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {item.durationMinutes ? `${item.durationMinutes} mins` : "Duration N/A"}
          </p>
        </div>
      ),
    },
    {
      header: "Subjects",
      cell: (item) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(item.subjects || []).slice(0, 3).map((sub, i) => (
            <span
              key={i}
              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded"
            >
              {sub}
            </span>
          ))}
          {(item.subjects || []).length > 3 && (
            <span className="text-[10px] text-slate-400 font-semibold">
              +{item.subjects.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: "PDF Circular",
      cell: (item) => (
        <a
          href={item.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View PDF</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge
          variant="outline"
          className={
            item.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50"
              : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
          }
        >
          {item.isActive ? "Active" : "Draft"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEdit(item)}
            title="Edit Syllabus"
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setItemToDelete(item)}
            title="Delete Syllabus"
            className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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
            eyebrow="Candidate Preparation & Guidance"
            title="Syllabus & Exam Pattern"
            description="Manage official examination schemes, marks distribution, and downloadable PDF syllabuses synced to the mobile app."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchItems}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={openCreate}
                  className="bg-[#A30B0B] hover:bg-[#850909] text-white font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Syllabus
                </Button>
              </div>
            }
          />

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Syllabuses"
              value={items.length}
              description="Published exam schemes"
              icon={<BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              borderColor="border-l-slate-500"
            />
            <StatCard
              title="RPSC Syllabuses"
              value={items.filter((i) => i.agencyId === "rpsc").length}
              description="State commission exams"
              icon={<Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              borderColor="border-l-blue-500"
            />
            <StatCard
              title="RSSB Syllabuses"
              value={items.filter((i) => i.agencyId === "rssb").length}
              description="Subordinate board exams"
              icon={<Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
            <StatCard
              title="Active Publications"
              value={items.filter((i) => i.isActive).length}
              description="Visible on mobile app"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
          </div>

          {/* Reusable DataTable with Multi-select */}
          <DataTable
            columns={columns}
            data={items}
            isLoading={loading}
            searchKey="titleEn"
            searchPlaceholder="Search syllabus by title or commission..."
            pageSize={10}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            getRowId={(i) => i.id}
            emptyTitle="No syllabuses registered yet"
            emptyDescription="Click 'Add Syllabus' above to publish the first official examination scheme."
          />
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        title="Delete Syllabus"
        description="Are you sure you want to permanently delete this examination syllabus? Mobile candidates will no longer be able to download it."
        itemName={itemToDelete?.titleEn || itemToDelete?.titleHi}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Examination Syllabus" : "Add Examination Syllabus"}</DialogTitle>
            <DialogDescription>
              Official exam pattern and syllabus PDF published directly to the Raj Suchna mobile app.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            {/* Language Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Language Content / भाषा विवरण:
              </span>
              <div className="inline-flex items-center bg-slate-200 dark:bg-slate-700 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setLangTab("hi")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    langTab === "hi"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  )}
                >
                  <span>हिन्दी (Hindi)</span>
                  {form.titleHi.trim() && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab("en")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    langTab === "en"
                      ? "bg-[#A30B0B] text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  )}
                >
                  <span>English (अंग्रेजी)</span>
                  {form.titleEn.trim() && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              </div>
            </div>

            {/* Hindi Tab Content */}
            {langTab === "hi" && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div>
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">पाठ्यक्रम शीर्षक (Hindi) *</Label>
                  <Input
                    required
                    value={form.titleHi}
                    onChange={(e) => setForm((f) => ({ ...f, titleHi: e.target.value }))}
                    placeholder="उदा. आरएसएसबी समान पात्रता परीक्षा (सीईटी स्नातक स्तर) विस्तृत पाठ्यक्रम 2026"
                    className="mt-1 font-sans"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">मुख्य विषय (Comma Separated)</Label>
                  <Input
                    value={form.subjectsStrHi}
                    onChange={(e) => setForm((f) => ({ ...f, subjectsStrHi: e.target.value }))}
                    placeholder="राजस्थान सामान्य ज्ञान, इतिहास, गणित, रीजनिंग, दैनिक विज्ञान"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">परीक्षा स्कीम व नेगेटिव मार्किंग विवरण (Hindi)</Label>
                  <Textarea
                    rows={3}
                    value={form.schemeSummaryHi}
                    onChange={(e) => setForm((f) => ({ ...f, schemeSummaryHi: e.target.value }))}
                    placeholder="कुल 150 प्रश्न, 300 अंक, समय 3 घंटे। 1/3 नेगेटिव मार्किंग..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* English Tab Content */}
            {langTab === "en" && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div>
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">Syllabus Title (English) *</Label>
                  <Input
                    required
                    value={form.titleEn}
                    onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                    placeholder="e.g. RSSB CET Graduate Level Detailed Examination Syllabus 2026"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">Key Subjects (Comma Separated)</Label>
                  <Input
                    value={form.subjectsStrEn}
                    onChange={(e) => setForm((f) => ({ ...f, subjectsStrEn: e.target.value }))}
                    placeholder="General Knowledge, Rajasthan History, Quantitative Aptitude, Reasoning"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">Exam Scheme & Marking Summary (English)</Label>
                  <Textarea
                    rows={3}
                    value={form.schemeSummaryEn}
                    onChange={(e) => setForm((f) => ({ ...f, schemeSummaryEn: e.target.value }))}
                    placeholder="Total 150 questions, 300 marks, duration 3 hours. Negative marking 1/3..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* General Settings */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                General Settings / सामान्य विवरण
              </span>

              <div className="space-y-3">
                <div className="min-w-0">
                  <Label className="text-xs font-semibold">Commission / Agency</Label>
                  <Select
                    value={form.agencyId}
                    onValueChange={(val) => setForm((f) => ({ ...f, agencyId: val }))}
                  >
                    <SelectTrigger className="mt-1 w-full min-w-0">
                      <SelectValue placeholder="Select Commission / Agency" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencyList.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <Label className="text-xs font-semibold">Exam Year</Label>
                    <Input
                      value={form.examYear}
                      onChange={(e) => setForm((f) => ({ ...f, examYear: e.target.value }))}
                      placeholder="2026"
                      className="mt-1 w-full min-w-0"
                    />
                  </div>

                  <div className="min-w-0">
                    <Label className="text-xs font-semibold">Total Marks</Label>
                    <Input
                      value={form.totalMarks}
                      onChange={(e) => setForm((f) => ({ ...f, totalMarks: e.target.value }))}
                      placeholder="e.g. 300 or 200 + 800"
                      className="mt-1 w-full min-w-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Official Syllabus PDF Link *</Label>
                <Input
                  required
                  type="url"
                  value={form.pdfUrl}
                  onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))}
                  placeholder="https://rpsc.rajasthan.gov.in/Static/Syllabus/sample.pdf"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="sylActive"
                  checked={form.isActive}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: !!c }))}
                />
                <Label htmlFor="sylActive" className="text-xs font-medium cursor-pointer">
                  Publish immediately to mobile app feed
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#A30B0B] hover:bg-[#850909] text-white font-semibold cursor-pointer"
              >
                {isSaving ? "Saving..." : editingItem ? "Update Syllabus" : "Publish Syllabus"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
