"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  FolderTree, 
  Plus, 
  Layers, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Tag
} from "lucide-react";
import { apiGet } from "@/lib/api-client";

interface CategoryItem {
  id: string;
  slug: string;
  nameHi: string;
  nameEn: string;
  icon?: string | null;
  activeNotices?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [newNameEn, setNewNameEn] = useState("");
  const [newNameHi, setNewNameHi] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, noticesRes] = await Promise.all([
        fetch("/api/v1/categories").then(r => r.json()),
        fetch("/api/v1/notices?limit=100").then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      const catList: CategoryItem[] = catRes.success && Array.isArray(catRes.data) ? catRes.data : [];
      const notices: any[] = noticesRes.success && Array.isArray(noticesRes.data) ? noticesRes.data : [];

      const mapped = catList.map(cat => ({
        ...cat,
        activeNotices: notices.filter(n => n.categoryId === cat.id || n.categoryId === cat.slug).length,
      }));

      setCategories(mapped);
    } catch (e: any) {
      setFeedback({ message: "Failed to load categories: " + e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameEn.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: newNameEn.trim(),
          nameHi: newNameHi.trim() || newNameEn.trim(),
          slug: newSlug.trim() || undefined,
        }),
      }).then(r => r.json());

      if (res.success) {
        setFeedback({ message: `Category "${newNameEn}" added successfully!`, type: "success" });
        setIsAddModalOpen(false);
        setNewNameEn("");
        setNewNameHi("");
        setNewSlug("");
        loadData();
      } else {
        setFeedback({ message: res.error || "Failed to add category", type: "error" });
      }
    } catch (e: any) {
      setFeedback({ message: e.message || "Failed to add category", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    // Optimistic delete
    setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
    setFeedback({ message: `Category "${categoryToDelete.nameEn}" removed.`, type: "success" });
    setCategoryToDelete(null);
    setIsDeleting(false);
  };

  const totalNotices = categories.reduce((acc, curr) => acc + (curr.activeNotices || 0), 0);

  const columns: Column<CategoryItem>[] = [
    {
      header: "Category ID / Code",
      accessorKey: "slug",
      cell: (cat) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {cat.slug || cat.id}
        </span>
      ),
    },
    {
      header: "English Name",
      accessorKey: "nameEn",
      cell: (cat) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {cat.nameEn}
        </span>
      ),
    },
    {
      header: "Hindi Name (हिंदी)",
      accessorKey: "nameHi",
      cell: (cat) => (
        <span className="text-slate-700 dark:text-slate-300">
          {cat.nameHi || "—"}
        </span>
      ),
    },
    {
      header: "Active Notices",
      cell: (cat) => (
        <Badge variant={cat.activeNotices ? "default" : "outline"} className={cat.activeNotices ? "bg-red-700 text-white" : ""}>
          {cat.activeNotices || 0} notices
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (cat) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCategoryToDelete(cat)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <PageHeader
              eyebrow="TAXONOMY & JOB CATEGORIES"
              title="Recruitment Categories"
              description="Manage exam classification categories and track recruitment notices."
            />
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#A30B0B] hover:bg-[#850808] text-white shrink-0 gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm border ${
              feedback.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
              <button 
                onClick={() => setFeedback(null)} 
                className="text-xs font-semibold hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Categories"
              value={categories.length}
              subtitle="Active job filters"
              icon={FolderTree}
            />
            <StatCard
              title="Live Vacancies Linked"
              value={totalNotices}
              subtitle="Across all categories"
              icon={FileText}
            />
            <StatCard
              title="Taxonomy Engine"
              value="Neon PostgreSQL"
              subtitle="Synced with Mobile App"
              icon={Layers}
            />
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={categories}
            searchPlaceholder="Search category name or code..."
            searchKey="nameEn"
            emptyTitle="No categories found"
            emptyDescription="Add a category using the Add Category button above."
          />
        </main>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Add New Category</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add an exam/job taxonomy category for app filters.</p>
              </div>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Name (English) *
                </label>
                <Input
                  required
                  placeholder="e.g. Police & Defence"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Name (Hindi)
                </label>
                <Input
                  placeholder="e.g. पुलिस एवं सुरक्षा"
                  value={newNameHi}
                  onChange={(e) => setNewNameHi(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Slug / Code (Optional)
                </label>
                <Input
                  placeholder="e.g. police_defence"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newNameEn.trim()}
                  className="bg-[#A30B0B] hover:bg-[#850808] text-white"
                >
                  {isSubmitting ? "Saving..." : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category"
        description={`Are you sure you want to remove "${categoryToDelete?.nameEn}"?`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
