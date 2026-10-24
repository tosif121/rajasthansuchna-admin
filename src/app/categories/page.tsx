"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Edit3,
  CheckCircle2, 
  AlertCircle,
  Tag,
  Upload,
  Image as ImageIcon,
  X,
  Shield,
  Landmark,
  GraduationCap,
  Briefcase,
  Flag,
  Award,
  BookOpen,
  Sparkles,
  Building2
} from "lucide-react";

interface CategoryItem {
  id: string;
  slug: string;
  nameHi: string;
  nameEn: string;
  icon?: string | null;
  activeNotices?: number;
}

const PRESET_ICONS = [
  { name: "shield", label: "Police / Defence", Icon: Shield },
  { name: "landmark", label: "Revenue / Govt", Icon: Landmark },
  { name: "graduationCap", label: "Teaching / REET", Icon: GraduationCap },
  { name: "briefcase", label: "Admin / RAS", Icon: Briefcase },
  { name: "flag", label: "Central Govt", Icon: Flag },
  { name: "award", label: "Results / Merit", Icon: Award },
  { name: "bookOpen", label: "Answer Key", Icon: BookOpen },
  { name: "building", label: "Board / Agency", Icon: Building2 },
  { name: "sparkles", label: "Special / Schemes", Icon: Sparkles },
  { name: "tag", label: "General", Icon: Tag },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [nameEn, setNameEn] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedPresetIcon, setSelectedPresetIcon] = useState("tag");
  const [logoImage, setLogoImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openAddModal = () => {
    setEditingCategory(null);
    setNameEn("");
    setNameHi("");
    setSlug("");
    setSelectedPresetIcon("tag");
    setLogoImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setNameEn(cat.nameEn);
    setNameHi(cat.nameHi || "");
    setSlug(cat.slug || cat.id);
    if (cat.icon?.startsWith("data:image") || cat.icon?.startsWith("http")) {
      setLogoImage(cat.icon);
      setSelectedPresetIcon("tag");
    } else {
      setLogoImage(null);
      setSelectedPresetIcon(cat.icon || "tag");
    }
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ message: "Image must be under 2MB", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) return;

    try {
      setIsSubmitting(true);
      const iconValue = logoImage || selectedPresetIcon;

      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: nameEn.trim(),
          nameHi: nameHi.trim() || nameEn.trim(),
          slug: slug.trim() || undefined,
          icon: iconValue,
        }),
      }).then(r => r.json());

      if (res.success) {
        setFeedback({ 
          message: editingCategory ? `Category "${nameEn}" updated!` : `Category "${nameEn}" created!`, 
          type: "success" 
        });
        setIsModalOpen(false);
        loadData();
      } else {
        setFeedback({ message: res.error || "Failed to save category", type: "error" });
      }
    } catch (e: any) {
      setFeedback({ message: e.message || "Failed to save category", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
    setFeedback({ message: `Category "${categoryToDelete.nameEn}" removed.`, type: "success" });
    setCategoryToDelete(null);
    setIsDeleting(false);
  };

  const totalNotices = categories.reduce((acc, curr) => acc + (curr.activeNotices || 0), 0);

  const renderCategoryIcon = (iconValue?: string | null, name?: string) => {
    if (iconValue?.startsWith("data:image") || iconValue?.startsWith("http")) {
      return (
        <img 
          src={iconValue} 
          alt={name || "category logo"} 
          className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0" 
        />
      );
    }

    const matchedPreset = PRESET_ICONS.find(p => p.name.toLowerCase() === (iconValue || "").toLowerCase());
    const IconComp = matchedPreset ? matchedPreset.Icon : Tag;

    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A30B0B] to-[#7A0606] text-white flex items-center justify-center shadow-xs shrink-0">
        <IconComp className="w-5 h-5 text-amber-200" />
      </div>
    );
  };

  const columns: Column<CategoryItem>[] = [
    {
      header: "Icon / Logo",
      cell: (cat) => (
        <div className="flex items-center">
          {renderCategoryIcon(cat.icon, cat.nameEn)}
        </div>
      ),
    },
    {
      header: "Category & Taxonomy",
      accessorKey: "nameEn",
      cell: (cat) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white text-sm">
            {cat.nameEn}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-hindi">
            {cat.nameHi || "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Code / Slug",
      accessorKey: "slug",
      cell: (cat) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
          {cat.slug || cat.id}
        </span>
      ),
    },
    {
      header: "Live Notices",
      cell: (cat) => (
        <Badge variant={cat.activeNotices ? "default" : "outline"} className={cat.activeNotices ? "bg-red-700 text-white font-medium" : "text-slate-500"}>
          {cat.activeNotices || 0} active
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
            onClick={() => openEditModal(cat)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Edit category"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCategoryToDelete(cat)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
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
              eyebrow="TAXONOMY & EXAM CLASSIFICATION"
              title="Recruitment Categories"
              description="Manage exam categories, upload logos/icons, and organize live recruitment notices."
            />
            <Button
              onClick={openAddModal}
              className="bg-[#A30B0B] hover:bg-[#850808] text-white shrink-0 gap-2 cursor-pointer shadow-sm"
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
              subtitle="Active job filters in Mobile App"
              icon={FolderTree}
            />
            <StatCard
              title="Live Vacancies Linked"
              value={totalNotices}
              subtitle="Across all exam categories"
              icon={FileText}
            />
            <StatCard
              title="Database Status"
              value="Neon PostgreSQL"
              subtitle="Real-time Mobile API synchronization"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-[#A30B0B] dark:text-red-400 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a custom logo or pick an icon for mobile app category tabs.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Category Logo Upload & Preview */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Category Logo / Image (Optional)
                </label>
                
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                  {/* Current Preview */}
                  <div className="relative">
                    {logoImage ? (
                      <div className="relative group">
                        <img 
                          src={logoImage} 
                          alt="Category logo" 
                          className="w-14 h-14 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 shadow-xs" 
                        />
                        <button
                          type="button"
                          onClick={() => setLogoImage(null)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm hover:bg-red-700 cursor-pointer"
                          title="Remove custom image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      renderCategoryIcon(selectedPresetIcon, nameEn)
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2 text-xs h-8 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {logoImage ? "Change Image" : "Upload Logo Image"}
                    </Button>
                    <p className="text-[11px] text-slate-400">
                      Supports PNG, SVG, WebP, JPG (Max 2MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Or Preset Icon Picker */}
              {!logoImage && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Or Select Preset Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_ICONS.map((p) => {
                      const Icon = p.Icon;
                      const isSelected = selectedPresetIcon === p.name;
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setSelectedPresetIcon(p.name)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-red-50 dark:bg-red-950/40 border-[#A30B0B] text-[#A30B0B] dark:text-red-400 shadow-2xs font-semibold"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-[10px] truncate max-w-full">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category Name (English) *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Police & Defence"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category Name (Hindi)
                  </label>
                  <Input
                    placeholder="e.g. पुलिस एवं सुरक्षा"
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Unique Code / Slug (Optional)
                </label>
                <Input
                  placeholder="e.g. police_defence"
                  value={slug}
                  disabled={Boolean(editingCategory)}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !nameEn.trim()}
                  className="bg-[#A30B0B] hover:bg-[#850808] text-white cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : (editingCategory ? "Update Category" : "Save Category")}
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
