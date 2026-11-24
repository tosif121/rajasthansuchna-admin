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
  Building,
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { StudyPlanRecord } from "@/server/services/prep-service";

interface StudyPlanFormData {
  examTitleHi: string;
  examTitleEn: string;
  agencyId: string;
  targetDate: string;
  durationDays: number;
  dailyHoursTarget: number;
  milestonesStr: string;
  phase1Title: string;
  phase1Weeks: number;
  phase2Title: string;
  phase2Weeks: number;
  phase3Title: string;
  phase3Weeks: number;
  isActive: boolean;
}

const emptyForm: StudyPlanFormData = {
  examTitleHi: "",
  examTitleEn: "",
  agencyId: "rssb",
  targetDate: "2026-12-31",
  durationDays: 60,
  dailyHoursTarget: 6,
  milestonesStr: "Day 15: सम्पूर्ण राजस्थान GK पाठ्यक्रम पूरा\nDay 35: मैथ्स व रीजनिंग के सभी ट्रिक्स अभ्यास\nDay 50: विगत 5 वर्षों के प्रश्न पत्र हल\nDay 60: 10 पूर्ण मॉक टेस्ट व समय प्रबंधन",
  phase1Title: "आधारभूत अवधारणाएं व राजस्थान सामान्य ज्ञान",
  phase1Weeks: 3,
  phase2Title: "गणित, रीजनिंग, सामान्य हिंदी व अंग्रेजी",
  phase2Weeks: 3,
  phase3Title: "मॉक टेस्ट, पूर्व प्रश्न व गहन पुनरावृत्ति",
  phase3Weeks: 2,
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

export default function StudyPlannerPage() {
  const [items, setItems] = useState<StudyPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudyPlanRecord | null>(null);
  const [form, setForm] = useState<StudyPlanFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<StudyPlanRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/study-planner");
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch {
      setFeedback({ message: "Network error fetching study plans.", type: "error" });
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
    setFormOpen(true);
  };

  const openEdit = (item: StudyPlanRecord) => {
    setEditingItem(item);
    const p1 = item.phases?.[0];
    const p2 = item.phases?.[1];
    const p3 = item.phases?.[2];

    setForm({
      examTitleHi: item.examTitleHi,
      examTitleEn: item.examTitleEn,
      agencyId: item.agencyId || "rssb",
      targetDate: item.targetDate || "2026-12-31",
      durationDays: item.durationDays || 60,
      dailyHoursTarget: item.dailyHoursTarget || 6,
      milestonesStr: (item.keyMilestones || []).join("\n"),
      phase1Title: p1?.title || "Phase 1: Foundation",
      phase1Weeks: p1?.durationWeeks || 3,
      phase2Title: p2?.title || "Phase 2: Practice",
      phase2Weeks: p2?.durationWeeks || 3,
      phase3Title: p3?.title || "Phase 3: Mock Tests & Revision",
      phase3Weeks: p3?.durationWeeks || 2,
      isActive: item.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.examTitleHi.trim() || !form.examTitleEn.trim()) {
      setFeedback({ message: "Please provide Hindi and English Exam Titles.", type: "error" });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const milestones = form.milestonesStr
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean);

    const phases = [
      {
        phaseNumber: 1,
        title: form.phase1Title.trim() || "Phase 1: Foundation",
        durationWeeks: Number(form.phase1Weeks) || 3,
        focusAreas: ["आधारभूत पाठ्यक्रम एवं मुख्य सिद्धांत"],
      },
      {
        phaseNumber: 2,
        title: form.phase2Title.trim() || "Phase 2: Application",
        durationWeeks: Number(form.phase2Weeks) || 3,
        focusAreas: ["प्रश्नोत्तरी एवं अध्यायवार अभ्यास"],
      },
      {
        phaseNumber: 3,
        title: form.phase3Title.trim() || "Phase 3: Revision",
        durationWeeks: Number(form.phase3Weeks) || 2,
        focusAreas: ["मॉक टेस्ट एवं त्वरित पुनरावृत्ति"],
      },
    ];

    const payload = {
      examTitleHi: form.examTitleHi.trim(),
      examTitleEn: form.examTitleEn.trim(),
      agencyId: form.agencyId,
      targetDate: form.targetDate,
      durationDays: Number(form.durationDays) || 60,
      dailyHoursTarget: Number(form.dailyHoursTarget) || 6,
      phases,
      keyMilestones: milestones,
      recommendedResources: [
        { title: "मानक आरबीएसई व एनसीईआरटी पुस्तकें", type: "book" as const },
        { title: "राज सूचना मोबाइल मॉडल पेपर्स", type: "link" as const },
      ],
      isActive: form.isActive,
    };

    try {
      const url = editingItem
        ? `/api/v1/admin/study-planner/${editingItem.id}`
        : "/api/v1/admin/study-planner";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || "Failed to save study plan.", type: "error" });
      } else {
        setFeedback({
          message: editingItem ? "Study plan updated successfully." : "Study plan published to mobile app.",
          type: "success",
        });
        setFormOpen(false);
        await fetchItems();
      }
    } catch {
      setFeedback({ message: "Network error saving study plan.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/study-planner/${itemToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: "Study plan deleted successfully.", type: "success" });
        setItemToDelete(null);
        await fetchItems();
      } else {
        setFeedback({ message: data.error || "Failed to delete study plan.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error deleting study plan.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<StudyPlanRecord>[] = [
    {
      header: "Target Exam & Agency",
      cell: (item) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
            {item.examTitleEn}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            {item.examTitleHi}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="inline-block text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
              {item.agencyId.toUpperCase()}
            </span>
            {item.targetDate && (
              <span className="inline-block text-[10px] text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Target: {item.targetDate}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Timeline",
      cell: (item) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>{item.durationDays} Days Plan</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{item.dailyHoursTarget || 6} hours / day</span>
          </p>
        </div>
      ),
    },
    {
      header: "Structured Phases",
      cell: (item) => (
        <div className="text-xs space-y-1">
          {(item.phases || []).map((phase, idx) => (
            <div key={idx} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[9px] text-slate-700 dark:text-slate-300">
                {phase.phaseNumber}
              </span>
              <span className="truncate max-w-[200px]">{phase.title}</span>
            </div>
          ))}
        </div>
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
            title="Edit Study Plan"
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setItemToDelete(item)}
            title="Delete Study Plan"
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
            eyebrow="Candidate Preparation Timelines"
            title="Study Planner & Strategies"
            description="Manage 30/60/90-day structured exam preparation roadmaps, subject milestones, and daily study hour targets synced to the mobile app."
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
                  Add Study Plan
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
              title="Total Study Plans"
              value={items.length}
              description="Guided roadmaps"
              icon={<CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              borderColor="border-l-slate-500"
            />
            <StatCard
              title="Active Roadmaps"
              value={items.filter((i) => i.isActive).length}
              description="Visible to mobile users"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
            <StatCard
              title="Average Duration"
              value={
                items.length > 0
                  ? `${Math.round(items.reduce((acc, cur) => acc + (cur.durationDays || 60), 0) / items.length)} Days`
                  : "60 Days"
              }
              description="Typical preparation cycle"
              icon={<Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
            <StatCard
              title="Daily Target"
              value="6–8 Hours"
              description="Recommended focus"
              icon={<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              borderColor="border-l-blue-500"
            />
          </div>

          {/* Reusable DataTable with Multi-select */}
          <DataTable
            columns={columns}
            data={items}
            isLoading={loading}
            searchKey="examTitleEn"
            searchPlaceholder="Search study plans by exam title..."
            pageSize={10}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            getRowId={(i) => i.id}
            emptyTitle="No study plans configured yet"
            emptyDescription="Click 'Add Study Plan' above to create the first 30/60/90-day preparation roadmap."
          />
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        title="Delete Study Plan"
        description="Are you sure you want to permanently delete this preparation roadmap? Mobile candidates will no longer have access to this study schedule."
        itemName={itemToDelete?.examTitleEn || itemToDelete?.examTitleHi}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Study Preparation Plan" : "Add Exam Study Preparation Plan"}</DialogTitle>
            <DialogDescription>
              Create structured timelines, daily targets, and milestone checklists for mobile candidates.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Exam Title (English) *</Label>
              <Input
                required
                value={form.examTitleEn}
                onChange={(e) => setForm((f) => ({ ...f, examTitleEn: e.target.value }))}
                placeholder="e.g. RSSB CET Graduate Level 60-Day Master Study Plan"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Exam Title (Hindi) *</Label>
              <Input
                required
                value={form.examTitleHi}
                onChange={(e) => setForm((f) => ({ ...f, examTitleHi: e.target.value }))}
                placeholder="उदा. आरएसएसबी सीईटी (स्नातक स्तर) 60-दिवसीय व्यवस्थित अध्ययन योजना"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs font-semibold">Agency</Label>
                <Select
                  value={form.agencyId}
                  onValueChange={(val) => setForm((f) => ({ ...f, agencyId: val }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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

              <div>
                <Label className="text-xs font-semibold">Target Date</Label>
                <Input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Duration (Days)</Label>
                <Input
                  type="number"
                  value={form.durationDays}
                  onChange={(e) => setForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Daily Hours</Label>
                <Input
                  type="number"
                  value={form.dailyHoursTarget}
                  onChange={(e) => setForm((f) => ({ ...f, dailyHoursTarget: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Preparation Phases */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>3-Stage Structured Roadmap</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] font-semibold">Phase 1 Title & Duration</Label>
                  <Input
                    value={form.phase1Title}
                    onChange={(e) => setForm((f) => ({ ...f, phase1Title: e.target.value }))}
                    placeholder="Foundation Phase"
                    className="mt-1 text-xs"
                  />
                  <Input
                    type="number"
                    value={form.phase1Weeks}
                    onChange={(e) => setForm((f) => ({ ...f, phase1Weeks: Number(e.target.value) }))}
                    placeholder="Weeks"
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold">Phase 2 Title & Duration</Label>
                  <Input
                    value={form.phase2Title}
                    onChange={(e) => setForm((f) => ({ ...f, phase2Title: e.target.value }))}
                    placeholder="Application Phase"
                    className="mt-1 text-xs"
                  />
                  <Input
                    type="number"
                    value={form.phase2Weeks}
                    onChange={(e) => setForm((f) => ({ ...f, phase2Weeks: Number(e.target.value) }))}
                    placeholder="Weeks"
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold">Phase 3 Title & Duration</Label>
                  <Input
                    value={form.phase3Title}
                    onChange={(e) => setForm((f) => ({ ...f, phase3Title: e.target.value }))}
                    placeholder="Mock Tests Phase"
                    className="mt-1 text-xs"
                  />
                  <Input
                    type="number"
                    value={form.phase3Weeks}
                    onChange={(e) => setForm((f) => ({ ...f, phase3Weeks: Number(e.target.value) }))}
                    placeholder="Weeks"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Milestones Checklist (One per line)</Label>
              <Textarea
                rows={4}
                value={form.milestonesStr}
                onChange={(e) => setForm((f) => ({ ...f, milestonesStr: e.target.value }))}
                placeholder="Day 15: सम्पूर्ण राजस्थान GK पाठ्यक्रम पूरा&#10;Day 35: तार्किक क्षमता व गणित अभ्यास..."
                className="mt-1 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="spActive"
                checked={form.isActive}
                onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: !!c }))}
              />
              <Label htmlFor="spActive" className="text-xs font-medium cursor-pointer">
                Publish immediately to mobile app Study Planner
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
                {isSaving ? "Saving..." : editingItem ? "Update Plan" : "Publish Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
