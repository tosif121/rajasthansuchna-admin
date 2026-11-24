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
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  Newspaper,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { CurrentAffairsRecord } from "@/server/services/prep-service";

interface CurrentAffairFormData {
  date: string;
  titleHi: string;
  titleEn: string;
  summaryHi: string;
  summaryEn: string;
  category: string;
  sourceUrl: string;
  sourceName: string;
  isFeatured: boolean;
}

const emptyForm: CurrentAffairFormData = {
  date: new Date().toISOString().split("T")[0],
  titleHi: "",
  titleEn: "",
  summaryHi: "",
  summaryEn: "",
  category: "योजना व नीतियां",
  sourceUrl: "https://dipr.rajasthan.gov.in",
  sourceName: "सूचना एवं जनसंपर्क विभाग (DIPR)",
  isFeatured: false,
};

const categoryList = [
  "योजना व नीतियां",
  "नियुक्तियां व खेल",
  "बजट व आर्थिक",
  "ऊर्जा व विकास",
  "राजस्थान विशेष",
  "राष्ट्रीय व अंतर्राष्ट्रीय",
];

export default function CurrentAffairsPage() {
  const [items, setItems] = useState<CurrentAffairsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CurrentAffairsRecord | null>(null);
  const [form, setForm] = useState<CurrentAffairFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<CurrentAffairsRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/current-affairs");
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch {
      setFeedback({ message: "Network error fetching current affairs.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().split("T")[0],
    });
    setFormOpen(true);
  };

  const openEdit = (item: CurrentAffairsRecord) => {
    setEditingItem(item);
    setForm({
      date: item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
      titleHi: item.titleHi,
      titleEn: item.titleEn,
      summaryHi: item.summaryHi,
      summaryEn: item.summaryEn,
      category: item.category || "योजना व नीतियां",
      sourceUrl: item.sourceUrl || "https://dipr.rajasthan.gov.in",
      sourceName: item.sourceName || "DIPR Rajasthan",
      isFeatured: !!item.isFeatured,
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleHi.trim() || !form.titleEn.trim() || !form.summaryHi.trim()) {
      setFeedback({ message: "Please provide Hindi Title, English Title, and Summary.", type: "error" });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload = {
      date: form.date,
      titleHi: form.titleHi.trim(),
      titleEn: form.titleEn.trim(),
      summaryHi: form.summaryHi.trim(),
      summaryEn: form.summaryEn.trim() || form.summaryHi.trim(),
      category: form.category,
      sourceUrl: form.sourceUrl.trim(),
      sourceName: form.sourceName.trim(),
      isFeatured: form.isFeatured,
    };

    try {
      const url = editingItem
        ? `/api/v1/admin/current-affairs/${editingItem.id}`
        : "/api/v1/admin/current-affairs";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || "Failed to save current affair.", type: "error" });
      } else {
        setFeedback({
          message: editingItem ? "Current affair updated successfully." : "Article published to mobile feed.",
          type: "success",
        });
        setFormOpen(false);
        await fetchItems();
      }
    } catch {
      setFeedback({ message: "Network error saving current affair.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/current-affairs/${itemToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: "Current affair deleted successfully.", type: "success" });
        setItemToDelete(null);
        await fetchItems();
      } else {
        setFeedback({ message: data.error || "Failed to delete current affair.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error deleting current affair.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<CurrentAffairsRecord>[] = [
    {
      header: "Date & Category",
      cell: (item) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{item.date ? item.date.split("T")[0] : "Recent"}</span>
          </p>
          <span className="inline-block mt-1 text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
            {item.category}
          </span>
        </div>
      ),
    },
    {
      header: "Article Title & Summary",
      cell: (item) => (
        <div className="max-w-md">
          <div className="flex items-center gap-1.5">
            {item.isFeatured && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.2 rounded border border-red-200 dark:border-red-900/50">
                <Flame className="w-2.5 h-2.5" /> FEATURED
              </span>
            )}
            <p className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
              {item.titleHi}
            </p>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
            {item.summaryHi}
          </p>
          {item.titleEn && (
            <p className="text-[10px] text-slate-400 mt-0.5 italic line-clamp-1">
              {item.titleEn}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Source",
      cell: (item) => (
        <div className="text-xs">
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            {item.sourceName || "Official DIPR"}
          </p>
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Globe className="w-2.5 h-2.5" />
              <span>Source Link</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEdit(item)}
            title="Edit Article"
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setItemToDelete(item)}
            title="Delete Article"
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
            eyebrow="Daily General Knowledge & Affairs"
            title="Current Affairs & Schemes"
            description="Manage daily Rajasthan, national current affairs, government schemes, and policy updates published to the mobile app."
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
                  Add Current Affair
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
              title="Total Articles"
              value={items.length}
              description="Published affairs records"
              icon={<Newspaper className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              borderColor="border-l-slate-500"
            />
            <StatCard
              title="Schemes & Policies"
              value={items.filter((i) => i.category.includes("योजना")).length}
              description="Welfare programs"
              icon={<Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
            <StatCard
              title="Featured Updates"
              value={items.filter((i) => i.isFeatured).length}
              description="High-priority alerts"
              icon={<Flame className="w-4 h-4 text-red-600 dark:text-red-400" />}
              borderColor="border-l-red-500"
            />
            <StatCard
              title="Rajasthan Special"
              value={items.filter((i) => i.category.includes("राजस्थान") || i.titleHi.includes("राजस्थान")).length}
              description="State-centric GK updates"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
          </div>

          {/* Reusable DataTable with Multi-select */}
          <DataTable
            columns={columns}
            data={items}
            isLoading={loading}
            searchKey="titleHi"
            searchPlaceholder="Search current affairs by title or keyword..."
            pageSize={10}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            getRowId={(i) => i.id}
            emptyTitle="No current affairs published yet"
            emptyDescription="Click 'Add Current Affair' above to publish the first daily update."
          />
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        title="Delete Current Affair"
        description="Are you sure you want to permanently delete this article? Mobile users will no longer see it in their daily feed."
        itemName={itemToDelete?.titleHi || itemToDelete?.titleEn}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Current Affair Article" : "Add Current Affair Article"}</DialogTitle>
            <DialogDescription>
              Daily GK, state policy, and exam-relevant current affairs for the mobile app.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Publication Date *</Label>
                <Input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm((f) => ({ ...f, category: val }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryList.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Title (Hindi) *</Label>
              <Input
                required
                value={form.titleHi}
                onChange={(e) => setForm((f) => ({ ...f, titleHi: e.target.value }))}
                placeholder="उदा. जैसलमेर व बीकानेर में 2400 मेगावाट नवीन सौर पार्क स्थापना को मंजूरी"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Title (English) *</Label>
              <Input
                required
                value={form.titleEn}
                onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                placeholder="e.g. Cabinet Approves 2,400 MW Ultra-Mega Solar Park in Jaisalmer"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Key Highlights & Summary (Hindi) *</Label>
              <Textarea
                required
                rows={3}
                value={form.summaryHi}
                onChange={(e) => setForm((f) => ({ ...f, summaryHi: e.target.value }))}
                placeholder="विस्तृत विवरण, मुख्य बिंदु, परीक्षा उपयोगी तथ्य..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Summary (English Optional)</Label>
              <Textarea
                rows={2}
                value={form.summaryEn}
                onChange={(e) => setForm((f) => ({ ...f, summaryEn: e.target.value }))}
                placeholder="English translation or summary notes..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Source Department / Portal</Label>
                <Input
                  value={form.sourceName}
                  onChange={(e) => setForm((f) => ({ ...f, sourceName: e.target.value }))}
                  placeholder="e.g. DIPR Rajasthan / CMO Rajasthan"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Source Link URL</Label>
                <Input
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))}
                  placeholder="https://dipr.rajasthan.gov.in"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="caFeatured"
                checked={form.isFeatured}
                onCheckedChange={(c) => setForm((f) => ({ ...f, isFeatured: !!c }))}
              />
              <Label htmlFor="caFeatured" className="text-xs font-medium cursor-pointer">
                Highlight as Featured / Breaking Alert in mobile app
              </Label>
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
                {isSaving ? "Saving..." : editingItem ? "Update Article" : "Publish Article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
