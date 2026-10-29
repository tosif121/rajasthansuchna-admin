"use client";

import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/components/reusable";
import {
  AlertCircle,
  CheckCircle2,
  ListChecks,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface McqOption {
  hi: string;
  en: string;
}

interface McqQuestion {
  questionHi: string;
  questionEn: string;
  options: McqOption[];
  correctOption: number;
  explanationHi: string;
  explanationEn: string;
}

interface McqTestSummary {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  durationMinutes: number;
  isActive: boolean;
  questionCount: number;
}

interface McqTest extends McqTestSummary {
  questions: McqQuestion[];
}

interface TestForm {
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  durationMinutes: string;
  isActive: boolean;
  questions: McqQuestion[];
}

const inputClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#A30B0B] focus:ring-1 focus:ring-[#A30B0B]/30";

const emptyOptions = (): McqOption[] => [
  { hi: "", en: "" },
  { hi: "", en: "" },
  { hi: "", en: "" },
  { hi: "", en: "" },
];

const emptyQuestion = (): McqQuestion => ({
  questionHi: "",
  questionEn: "",
  options: emptyOptions(),
  correctOption: 0,
  explanationHi: "",
  explanationEn: "",
});

const emptyForm = (): TestForm => ({
  titleHi: "",
  titleEn: "",
  descriptionHi: "",
  descriptionEn: "",
  durationMinutes: "10",
  isActive: true,
  questions: [emptyQuestion()],
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export default function McqTestsPage() {
  const [tests, setTests] = useState<McqTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<McqTest | null>(null);
  const [form, setForm] = useState<TestForm>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [testToDelete, setTestToDelete] = useState<McqTestSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/mcq-tests", { cache: "no-store" });
      const data = await res.json();
      setTests(data.success && Array.isArray(data.data) ? data.data : []);
    } catch {
      setFeedback({ message: "Failed to load MCQ tests.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTests();
  }, []);

  const updateQuestion = <K extends keyof McqQuestion>(index: number, key: K, value: McqQuestion[K]) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [key]: value } : question
      ),
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, key: keyof McqOption, value: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) => {
        if (index !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? { ...option, [key]: value } : option
          ),
        };
      }),
    }));
  };

  const openCreate = () => {
    setEditingTest(null);
    setForm(emptyForm());
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = async (test: McqTestSummary) => {
    setFormError(null);
    try {
      const res = await fetch(`/api/v1/admin/mcq-tests/${test.id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || "Failed to load test.", type: "error" });
        return;
      }
      const full = data.data as McqTest;
      setEditingTest(full);
      setForm({
        titleHi: full.titleHi || "",
        titleEn: full.titleEn || "",
        descriptionHi: full.descriptionHi || "",
        descriptionEn: full.descriptionEn || "",
        durationMinutes: String(full.durationMinutes || 10),
        isActive: full.isActive !== false,
        questions: (full.questions || []).map((question) => ({
          questionHi: question.questionHi || "",
          questionEn: question.questionEn || "",
          options: (question.options || []).map((option) => ({ hi: option.hi || "", en: option.en || "" })),
          correctOption: question.correctOption || 0,
          explanationHi: question.explanationHi || "",
          explanationEn: question.explanationEn || "",
        })),
      });
      setFormOpen(true);
    } catch {
      setFeedback({ message: "Network error while loading the test.", type: "error" });
    }
  };

  const handleSave = async () => {
    if (!form.titleEn.trim() && !form.titleHi.trim()) {
      setFormError("Please enter the test title.");
      return;
    }
    if (form.questions.length === 0) {
      setFormError("Add at least one question.");
      return;
    }
    for (let index = 0; index < form.questions.length; index++) {
      const question = form.questions[index];
      if (!question.questionHi.trim() && !question.questionEn.trim()) {
        setFormError(`Question ${index + 1} is missing text.`);
        return;
      }
      if (question.options.some((option) => !option.hi.trim() && !option.en.trim())) {
        setFormError(`Question ${index + 1} has an empty option.`);
        return;
      }
    }

    const payload = {
      titleHi: form.titleHi.trim(),
      titleEn: form.titleEn.trim(),
      descriptionHi: form.descriptionHi.trim(),
      descriptionEn: form.descriptionEn.trim(),
      durationMinutes: Number(form.durationMinutes) || 10,
      isActive: form.isActive,
      questions: form.questions,
    };

    try {
      setIsSaving(true);
      setFormError(null);
      const res = await fetch(
        editingTest ? `/api/v1/admin/mcq-tests/${editingTest.id}` : "/api/v1/admin/mcq-tests",
        {
          method: editingTest ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", "x-actor-name": "Admin" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to save MCQ test.");
        return;
      }
      setFeedback({
        message: editingTest ? "MCQ test updated." : "MCQ test created.",
        type: "success",
      });
      setFormOpen(false);
      fetchTests();
    } catch {
      setFormError("Network error while saving the MCQ test.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/mcq-tests/${testToDelete.id}`, {
        method: "DELETE",
        headers: { "x-actor-name": "Admin" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || "Failed to delete test.", type: "error" });
        return;
      }
      setFeedback({ message: "MCQ test deleted.", type: "success" });
      setTestToDelete(null);
      fetchTests();
    } catch {
      setFeedback({ message: "Network error while deleting the test.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<McqTestSummary>[] = [
    {
      header: "Test",
      cell: (test) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#A30B0B] dark:text-red-400 flex items-center justify-center">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-xs">{test.titleEn || test.titleHi}</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{test.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Questions",
      cell: (test) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{test.questionCount}</span>,
    },
    {
      header: "Duration",
      cell: (test) => <span className="text-xs text-slate-600 dark:text-slate-400">{test.durationMinutes} min</span>,
    },
    {
      header: "Status",
      cell: (test) => (
        <Badge variant={test.isActive ? "success" : "secondary"}>
          {test.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (test) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEdit(test)}
            title="Edit test"
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTestToDelete(test)}
            title="Delete test"
            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
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
            eyebrow="Practice & Mock Tests"
            title="MCQ Tests"
            description="Create and manage objective practice tests delivered to the mobile app."
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#A30B0B] text-white text-xs font-bold hover:bg-[#850909] shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Test
                </button>
                <button
                  onClick={fetchTests}
                  title="Refresh tests"
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            }
          />

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

          <DataTable
            columns={columns}
            data={tests}
            isLoading={loading}
            searchKey="titleEn"
            searchPlaceholder="Search MCQ tests..."
            pageSize={10}
            emptyTitle="No MCQ tests found"
            emptyDescription="Create a practice test to publish it to the mobile app."
          />
        </main>
      </div>

      <DeleteConfirmationModal
        isOpen={!!testToDelete}
        title="Delete MCQ Test"
        description="Are you sure you want to permanently delete this test and all of its questions?"
        itemName={testToDelete?.titleEn || testToDelete?.titleHi}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setTestToDelete(null)}
      />

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false); }}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTest ? "Edit MCQ Test" : "Create MCQ Test"}</DialogTitle>
            <DialogDescription>
              These questions appear in the mobile app under the MOQ Test section.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Title (English) *">
                <input className={inputClass} value={form.titleEn} onChange={(e) => setForm((prev) => ({ ...prev, titleEn: e.target.value }))} placeholder="Rajasthan GK - Set 1" />
              </Field>
              <Field label="Title (Hindi) *">
                <input className={inputClass} value={form.titleHi} onChange={(e) => setForm((prev) => ({ ...prev, titleHi: e.target.value }))} placeholder="राजस्थान सामान्य ज्ञान - सेट 1" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Description (English)">
                <textarea rows={2} className={inputClass} value={form.descriptionEn} onChange={(e) => setForm((prev) => ({ ...prev, descriptionEn: e.target.value }))} />
              </Field>
              <Field label="Description (Hindi)">
                <textarea rows={2} className={inputClass} value={form.descriptionHi} onChange={(e) => setForm((prev) => ({ ...prev, descriptionHi: e.target.value }))} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Duration (minutes)">
                <input type="number" min={1} className={inputClass} value={form.durationMinutes} onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))} />
              </Field>
              <label className="flex items-center gap-2 pt-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 accent-[#A30B0B]"
                />
                Active (show in mobile app)
              </label>
            </div>

            <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Questions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }))}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
                </Button>
              </div>

              {form.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/60 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#A30B0B] dark:text-red-400">Question {questionIndex + 1}</span>
                    {form.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, questions: prev.questions.filter((_, index) => index !== questionIndex) }))}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Question (English)">
                      <textarea rows={2} className={inputClass} value={question.questionEn} onChange={(e) => updateQuestion(questionIndex, "questionEn", e.target.value)} />
                    </Field>
                    <Field label="Question (Hindi)">
                      <textarea rows={2} className={inputClass} value={question.questionHi} onChange={(e) => updateQuestion(questionIndex, "questionHi", e.target.value)} />
                    </Field>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Options</span>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctOption === optionIndex}
                          onChange={() => updateQuestion(questionIndex, "correctOption", optionIndex)}
                          className="h-4 w-4 accent-[#A30B0B]"
                          title="Mark as correct answer"
                        />
                        <input className={inputClass} value={option.en} onChange={(e) => updateOption(questionIndex, optionIndex, "en", e.target.value)} placeholder={`Option ${optionIndex + 1} (English)`} />
                        <input className={inputClass} value={option.hi} onChange={(e) => updateOption(questionIndex, optionIndex, "hi", e.target.value)} placeholder={`विकल्प ${optionIndex + 1} (Hindi)`} />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Explanation (English)">
                      <input className={inputClass} value={question.explanationEn} onChange={(e) => updateQuestion(questionIndex, "explanationEn", e.target.value)} />
                    </Field>
                    <Field label="Explanation (Hindi)">
                      <input className={inputClass} value={question.explanationHi} onChange={(e) => updateQuestion(questionIndex, "explanationHi", e.target.value)} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingTest ? "Save Changes" : "Create Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
