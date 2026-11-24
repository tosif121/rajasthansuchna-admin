"use client";

import React, { useEffect, useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="mb-1.5">
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0">{label}</Label>
      </div>
      {children}
    </div>
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
  const [langTab, setLangTab] = useState<"hi" | "en">("hi");
  const [testToDelete, setTestToDelete] = useState<McqTestSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/mcq-tests?_t=${Date.now()}`, { cache: "no-store" });
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
    setLangTab("hi");
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
      setLangTab("hi");
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
      await fetchTests();
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
      await fetchTests();
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
            eyebrow="Practice, Test Series & Mock Exams"
            title="Test Series & Quizzes"
            description="Create, publish, and manage interactive objective mock tests and full-length test series for mobile candidates."
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
              These questions appear in the mobile app under the MCQ Test section.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="space-y-4 py-2">
            {/* Language Content Switcher */}
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
                <FormField label="टेस्ट शीर्षक (Hindi) *">
                  <Input
                    value={form.titleHi}
                    onChange={(e) => setForm((prev) => ({ ...prev, titleHi: e.target.value }))}
                    placeholder="उदा. राजस्थान सामान्य ज्ञान - सेट 1"
                    className="font-sans"
                  />
                </FormField>
                <FormField label="विवरण (Hindi)">
                  <Textarea
                    rows={2}
                    value={form.descriptionHi}
                    onChange={(e) => setForm((prev) => ({ ...prev, descriptionHi: e.target.value }))}
                    placeholder="उदा. आरपीएससी व आरएसएसबी परीक्षाओं हेतु राजस्थान इतिहास व भूगोल प्रश्नोत्तरी..."
                    className="font-sans"
                  />
                </FormField>
              </div>
            )}

            {/* English Tab Content */}
            {langTab === "en" && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <FormField label="Test Title (English) *">
                  <Input
                    value={form.titleEn}
                    onChange={(e) => setForm((prev) => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="e.g. Rajasthan GK Mock Test - Set 1"
                    className="font-sans"
                  />
                </FormField>
                <FormField label="Description (English)">
                  <Textarea
                    rows={2}
                    value={form.descriptionEn}
                    onChange={(e) => setForm((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                    placeholder="e.g. High-yield practice quiz covering Rajasthan History, Polity and Geography..."
                    className="font-sans"
                  />
                </FormField>
              </div>
            )}

            {/* Common Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <FormField label="Duration (minutes)">
                <Input
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                />
              </FormField>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-input bg-background h-9">
                <Checkbox
                  id="mcq-active"
                  checked={form.isActive}
                  onCheckedChange={(val) => setForm((prev) => ({ ...prev, isActive: Boolean(val) }))}
                />
                <label htmlFor="mcq-active" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Active (show in mobile app)
                </label>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Questions & Options</h3>
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
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {langTab === "hi" ? (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <FormField label="प्रश्न विवरण (Hindi) *">
                        <Textarea
                          rows={2}
                          value={question.questionHi}
                          onChange={(e) => updateQuestion(questionIndex, "questionHi", e.target.value)}
                          placeholder="उदा. राजस्थान का राज्य वृक्ष कौनसा है?"
                          className="font-sans"
                        />
                      </FormField>

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                          विकल्प (सही उत्तर चिन्हित करें)
                        </span>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="grid grid-cols-[auto_1fr] items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctOption === optionIndex}
                              onChange={() => updateQuestion(questionIndex, "correctOption", optionIndex)}
                              className="h-4 w-4 accent-[#A30B0B] cursor-pointer"
                              title="सही उत्तर चिन्हित करें"
                            />
                            <Input
                              value={option.hi}
                              onChange={(e) => updateOption(questionIndex, optionIndex, "hi", e.target.value)}
                              placeholder={`विकल्प ${optionIndex + 1} (Hindi)`}
                              className="font-sans"
                            />
                          </div>
                        ))}
                      </div>

                      <FormField label="उत्तर व्याख्या (Hindi)">
                        <Input
                          value={question.explanationHi}
                          onChange={(e) => updateQuestion(questionIndex, "explanationHi", e.target.value)}
                          placeholder="उदा. खेजड़ी को 1983 में राज्य वृक्ष घोषित किया गया था..."
                          className="font-sans"
                        />
                      </FormField>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <FormField label="Question Text (English) *">
                        <Textarea
                          rows={2}
                          value={question.questionEn}
                          onChange={(e) => updateQuestion(questionIndex, "questionEn", e.target.value)}
                          placeholder="e.g. Which is the state tree of Rajasthan?"
                          className="font-sans"
                        />
                      </FormField>

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                          Options (Select correct radio)
                        </span>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="grid grid-cols-[auto_1fr] items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctOption === optionIndex}
                              onChange={() => updateQuestion(questionIndex, "correctOption", optionIndex)}
                              className="h-4 w-4 accent-[#A30B0B] cursor-pointer"
                              title="Mark as correct answer"
                            />
                            <Input
                              value={option.en}
                              onChange={(e) => updateOption(questionIndex, optionIndex, "en", e.target.value)}
                              placeholder={`Option ${optionIndex + 1} (English)`}
                              className="font-sans"
                            />
                          </div>
                        ))}
                      </div>

                      <FormField label="Answer Explanation (English)">
                        <Input
                          value={question.explanationEn}
                          onChange={(e) => updateQuestion(questionIndex, "explanationEn", e.target.value)}
                          placeholder="e.g. Khejri (Prosopis cineraria) was declared state tree in 1983..."
                          className="font-sans"
                        />
                      </FormField>
                    </div>
                  )}
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
