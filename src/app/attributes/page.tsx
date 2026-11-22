"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import {
  PageHeader,
  StatCard,
  DataTable,
  Column,
  DeleteConfirmationModal,
  ToggleSwitch,
} from "@/components/reusable";
import {
  FileText,
  Building2,
  Tags,
  Globe,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Landmark,
  GraduationCap,
  Briefcase,
  Flag,
  Award,
  BookOpen,
  Sparkles,
  Tag,
} from "lucide-react";

// --- Models ---
interface NoticeTypeItem {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  code: string;
  description?: string;
  isActive: boolean;
}

interface JurisdictionItem {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  code: string;
  description?: string;
  isActive: boolean;
}

interface CategoryItem {
  id: string;
  slug: string;
  nameHi: string;
  nameEn: string;
  icon?: string | null;
  isActive?: boolean;
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

function MasterAttributesContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "types";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Data lists
  const [noticeTypes, setNoticeTypes] = useState<NoticeTypeItem[]>([]);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Modal states
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<NoticeTypeItem | null>(null);

  const [isJurisdictionModalOpen, setIsJurisdictionModalOpen] = useState(false);
  const [editingJurisdiction, setEditingJurisdiction] = useState<JurisdictionItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "type" | "jurisdiction" | "category";
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states for Notice Type
  const [typeFormNameEn, setTypeFormNameEn] = useState("");
  const [typeFormNameHi, setTypeFormNameHi] = useState("");
  const [typeFormCode, setTypeFormCode] = useState("");
  const [typeFormDesc, setTypeFormDesc] = useState("");
  const [typeFormActive, setTypeFormActive] = useState(true);

  // Form states for Jurisdiction
  const [jurFormNameEn, setJurFormNameEn] = useState("");
  const [jurFormNameHi, setJurFormNameHi] = useState("");
  const [jurFormCode, setJurFormCode] = useState("");
  const [jurFormDesc, setJurFormDesc] = useState("");
  const [jurFormActive, setJurFormActive] = useState(true);

  // Form states for Category
  const [catFormNameEn, setCatFormNameEn] = useState("");
  const [catFormNameHi, setCatFormNameHi] = useState("");
  const [catFormSlug, setCatFormSlug] = useState("");
  const [catFormIcon, setCatFormIcon] = useState("tag");
  const [catFormActive, setCatFormActive] = useState(true);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [typesRes, jurRes, catRes] = await Promise.all([
        fetch("/api/v1/notice-types?all=true").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/v1/jurisdictions?all=true").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/v1/categories?all=true").then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      if (typesRes?.success && Array.isArray(typesRes.data)) setNoticeTypes(typesRes.data);
      if (jurRes?.success && Array.isArray(jurRes.data)) setJurisdictions(jurRes.data);
      if (catRes?.success && Array.isArray(catRes.data)) setCategories(catRes.data);
    } catch {
      setFeedback({ message: "Failed to load master attributes data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Handlers: Notice Types ---
  const openCreateType = () => {
    setEditingType(null);
    setTypeFormNameEn("");
    setTypeFormNameHi("");
    setTypeFormCode("");
    setTypeFormDesc("");
    setTypeFormActive(true);
    setIsTypeModalOpen(true);
  };

  const openEditType = (item: NoticeTypeItem) => {
    setEditingType(item);
    setTypeFormNameEn(item.nameEn);
    setTypeFormNameHi(item.nameHi || "");
    setTypeFormCode(item.code || item.slug.toUpperCase());
    setTypeFormDesc(item.description || "");
    setTypeFormActive(item.isActive !== false);
    setIsTypeModalOpen(true);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/notice-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingType ? editingType.id : undefined,
          slug: editingType ? editingType.slug : undefined,
          nameEn: typeFormNameEn.trim(),
          nameHi: typeFormNameHi.trim() || typeFormNameEn.trim(),
          code: typeFormCode.trim().toUpperCase(),
          description: typeFormDesc.trim(),
          isActive: typeFormActive,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({
          message: editingType ? `Notice type "${typeFormNameEn}" updated.` : `Notice type "${typeFormNameEn}" created.`,
          type: "success",
        });
        setIsTypeModalOpen(false);
        loadAllData();
      } else {
        setFeedback({ message: res.error || "Failed to save notice type.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error saving notice type.", type: "error" });
    }
  };

  // --- Handlers: Jurisdictions ---
  const openCreateJurisdiction = () => {
    setEditingJurisdiction(null);
    setJurFormNameEn("");
    setJurFormNameHi("");
    setJurFormCode("");
    setJurFormDesc("");
    setJurFormActive(true);
    setIsJurisdictionModalOpen(true);
  };

  const openEditJurisdiction = (item: JurisdictionItem) => {
    setEditingJurisdiction(item);
    setJurFormNameEn(item.nameEn);
    setJurFormNameHi(item.nameHi || "");
    setJurFormCode(item.code || item.slug.toUpperCase());
    setJurFormDesc(item.description || "");
    setJurFormActive(item.isActive !== false);
    setIsJurisdictionModalOpen(true);
  };

  const handleSaveJurisdiction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/jurisdictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingJurisdiction ? editingJurisdiction.id : undefined,
          slug: editingJurisdiction ? editingJurisdiction.slug : undefined,
          nameEn: jurFormNameEn.trim(),
          nameHi: jurFormNameHi.trim() || jurFormNameEn.trim(),
          code: jurFormCode.trim().toUpperCase(),
          description: jurFormDesc.trim(),
          isActive: jurFormActive,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({
          message: editingJurisdiction ? `Jurisdiction "${jurFormNameEn}" updated.` : `Jurisdiction "${jurFormNameEn}" created.`,
          type: "success",
        });
        setIsJurisdictionModalOpen(false);
        loadAllData();
      } else {
        setFeedback({ message: res.error || "Failed to save jurisdiction.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error saving jurisdiction.", type: "error" });
    }
  };

  // --- Handlers: Categories ---
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatFormNameEn("");
    setCatFormNameHi("");
    setCatFormSlug("");
    setCatFormIcon("tag");
    setCatFormActive(true);
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (item: CategoryItem) => {
    setEditingCategory(item);
    setCatFormNameEn(item.nameEn);
    setCatFormNameHi(item.nameHi || "");
    setCatFormSlug(item.slug || item.id);
    setCatFormIcon(item.icon || "tag");
    setCatFormActive(item.isActive !== false);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: catFormNameEn.trim(),
          nameHi: catFormNameHi.trim() || catFormNameEn.trim(),
          slug: catFormSlug.trim() || undefined,
          icon: catFormIcon,
          isActive: catFormActive,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({
          message: editingCategory ? `Category "${catFormNameEn}" updated.` : `Category "${catFormNameEn}" created.`,
          type: "success",
        });
        setIsCategoryModalOpen(false);
        loadAllData();
      } else {
        setFeedback({ message: res.error || "Failed to save category.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error saving category.", type: "error" });
    }
  };

  // --- Unified Delete Action ---
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      let endpoint = "";
      if (itemToDelete.type === "type") endpoint = `/api/v1/notice-types?id=${itemToDelete.id}`;
      else if (itemToDelete.type === "jurisdiction") endpoint = `/api/v1/jurisdictions?id=${itemToDelete.id}`;
      else if (itemToDelete.type === "category") endpoint = `/api/v1/categories?id=${itemToDelete.id}`;

      const res = await fetch(endpoint, { method: "DELETE" }).then((r) => r.json());
      if (res.success) {
        setFeedback({ message: `"${itemToDelete.name}" removed successfully.`, type: "success" });
        loadAllData();
      } else {
        setFeedback({ message: res.error || "Failed to delete item.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error deleting item.", type: "error" });
    } finally {
      setItemToDelete(null);
      setIsDeleting(false);
    }
  };

  // --- Column Definitions ---
  const typeColumns: Column<NoticeTypeItem>[] = [
    {
      header: "Notice Type",
      accessorKey: "nameEn",
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs">{item.nameEn}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi">{item.nameHi}</span>
        </div>
      ),
    },
    {
      header: "Code / Slug",
      accessorKey: "code",
      cell: (item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {item.code || item.slug}
        </span>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
          {item.description || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (item) => (
        <Badge variant={item.isActive !== false ? "success" : "secondary"}>
          {item.isActive !== false ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEditType(item)} title="Edit Notice Type">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItemToDelete({ id: item.id, name: item.nameEn, type: "type" })}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Delete Notice Type"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const jurisdictionColumns: Column<JurisdictionItem>[] = [
    {
      header: "Jurisdiction",
      accessorKey: "nameEn",
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs">{item.nameEn}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi">{item.nameHi}</span>
        </div>
      ),
    },
    {
      header: "Code / Slug",
      accessorKey: "code",
      cell: (item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {item.code || item.slug}
        </span>
      ),
    },
    {
      header: "Scope Description",
      accessorKey: "description",
      cell: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
          {item.description || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (item) => (
        <Badge variant={item.isActive !== false ? "success" : "secondary"}>
          {item.isActive !== false ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEditJurisdiction(item)} title="Edit Jurisdiction">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItemToDelete({ id: item.id, name: item.nameEn, type: "jurisdiction" })}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Delete Jurisdiction"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const categoryColumns: Column<CategoryItem>[] = [
    {
      header: "Category",
      accessorKey: "nameEn",
      cell: (item) => {
        const preset = PRESET_ICONS.find((p) => p.name === item.icon);
        const IconCmp = preset ? preset.Icon : Tag;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-[#A30B0B] dark:text-red-400 flex items-center justify-center shrink-0">
              <IconCmp className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">{item.nameEn}</p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-hindi">{item.nameHi}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category Slug",
      accessorKey: "slug",
      cell: (item) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {item.slug || item.id}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (item) => (
        <Badge variant={item.isActive !== false ? "success" : "secondary"}>
          {item.isActive !== false ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEditCategory(item)} title="Edit Category">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItemToDelete({ id: item.id || item.slug, name: item.nameEn, type: "category" })}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
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
            eyebrow="Master Taxonomy & Fields"
            title="Notice Attributes & Options"
            description="Manage circular classifications, administrative jurisdictions, and departmental categories powering the app's taxonomy."
          />

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
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
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold px-2">
                ✕
              </button>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Notice Types"
              value={noticeTypes.length}
              description="Vacancy, Result, Admit Card..."
              icon={<FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              borderColor="border-l-blue-500"
            />
            <StatCard
              title="Jurisdictions"
              value={jurisdictions.length}
              description="Rajasthan State & Central"
              icon={<Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
            <StatCard
              title="Recruitment Categories"
              value={categories.length}
              description="Teaching, Police, Defence..."
              icon={<Tags className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
          </div>

          {/* Tabbed Attributes Manager */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <TabsTrigger value="types" className="gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notice Types</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                    {noticeTypes.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="jurisdictions" className="gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Jurisdictions</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                    {jurisdictions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="categories" className="gap-2">
                  <Tags className="w-3.5 h-3.5" />
                  <span>Categories</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                    {categories.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div>
                {activeTab === "types" && (
                  <Button onClick={openCreateType} className="bg-[#A30B0B] hover:bg-[#850909] text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Notice Type
                  </Button>
                )}
                {activeTab === "jurisdictions" && (
                  <Button onClick={openCreateJurisdiction} className="bg-[#A30B0B] hover:bg-[#850909] text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Jurisdiction
                  </Button>
                )}
                {activeTab === "categories" && (
                  <Button onClick={openCreateCategory} className="bg-[#A30B0B] hover:bg-[#850909] text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Category
                  </Button>
                )}
              </div>
            </div>

            {/* TAB 1: NOTICE TYPES */}
            <TabsContent value="types" className="space-y-4">
              <DataTable
                columns={typeColumns}
                data={noticeTypes}
                searchKey="nameEn"
                searchPlaceholder="Search notice types by name..."
                emptyTitle="No notice types found"
                emptyDescription="Add a notice type like Vacancy, Admit Card, or Result."
              />
            </TabsContent>

            {/* TAB 2: JURISDICTIONS */}
            <TabsContent value="jurisdictions" className="space-y-4">
              <DataTable
                columns={jurisdictionColumns}
                data={jurisdictions}
                searchKey="nameEn"
                searchPlaceholder="Search jurisdictions..."
                emptyTitle="No jurisdictions found"
                emptyDescription="Add a jurisdiction like Rajasthan State or Central Govt."
              />
            </TabsContent>

            {/* TAB 3: CATEGORIES */}
            <TabsContent value="categories" className="space-y-4">
              <DataTable
                columns={categoryColumns}
                data={categories}
                searchKey="nameEn"
                searchPlaceholder="Search categories..."
                emptyTitle="No categories found"
                emptyDescription="Add a category like Teaching, Police, Revenue..."
              />
            </TabsContent>
          </Tabs>

          {/* Dialog: Notice Type */}
          <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingType ? "Edit Notice Type" : "Add Notice Type"}</DialogTitle>
                <DialogDescription>
                  Define a selectable circular classification (e.g. Vacancy, Result, Admit Card).
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveType} className="space-y-3.5 py-2 text-xs">
                <div>
                  <Label className="mb-2 block">Type Name (English) *</Label>
                  <Input
                    required
                    placeholder="e.g. Syllabus / Exam Pattern"
                    value={typeFormNameEn}
                    onChange={(e) => setTypeFormNameEn(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Type Name (Hindi)</Label>
                  <Input
                    placeholder="e.g. पाठ्यक्रम / परीक्षा पैटर्न"
                    value={typeFormNameHi}
                    onChange={(e) => setTypeFormNameHi(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block">Code / Slug</Label>
                    <Input
                      placeholder="e.g. SYLLABUS"
                      value={typeFormCode}
                      onChange={(e) => setTypeFormCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Status</Label>
                    <Select value={typeFormActive ? "active" : "inactive"} onValueChange={(val) => setTypeFormActive(val === "active")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active (Visible)</SelectItem>
                        <SelectItem value="inactive">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Description</Label>
                  <Textarea
                    rows={2}
                    placeholder="Brief description for mobile users..."
                    value={typeFormDesc}
                    onChange={(e) => setTypeFormDesc(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsTypeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#A30B0B] hover:bg-[#850909] text-white">
                    {editingType ? "Update Type" : "Create Type"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog: Jurisdiction */}
          <Dialog open={isJurisdictionModalOpen} onOpenChange={setIsJurisdictionModalOpen}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJurisdiction ? "Edit Jurisdiction" : "Add Jurisdiction"}</DialogTitle>
                <DialogDescription>
                  Define territorial or administrative jurisdictions (e.g. Rajasthan State, Central).
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveJurisdiction} className="space-y-3.5 py-2 text-xs">
                <div>
                  <Label className="mb-2 block">Jurisdiction Name (English) *</Label>
                  <Input
                    required
                    placeholder="e.g. Rajasthan State"
                    value={jurFormNameEn}
                    onChange={(e) => setJurFormNameEn(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Jurisdiction Name (Hindi)</Label>
                  <Input
                    placeholder="e.g. राजस्थान राज्य"
                    value={jurFormNameHi}
                    onChange={(e) => setJurFormNameHi(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block">Code / Key</Label>
                    <Input
                      placeholder="e.g. RAJASTHAN"
                      value={jurFormCode}
                      onChange={(e) => setJurFormCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Status</Label>
                    <Select value={jurFormActive ? "active" : "inactive"} onValueChange={(val) => setJurFormActive(val === "active")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active (Visible)</SelectItem>
                        <SelectItem value="inactive">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Scope Description</Label>
                  <Textarea
                    rows={2}
                    placeholder="Territorial scope description..."
                    value={jurFormDesc}
                    onChange={(e) => setJurFormDesc(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsJurisdictionModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#A30B0B] hover:bg-[#850909] text-white">
                    {editingJurisdiction ? "Update Jurisdiction" : "Create Jurisdiction"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog: Category */}
          <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add Recruitment Category"}</DialogTitle>
                <DialogDescription>
                  Categories categorize recruitment posts on the mobile home feed and chips filter.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveCategory} className="space-y-3.5 py-2 text-xs">
                <div>
                  <Label className="mb-2 block">Category Name (English) *</Label>
                  <Input
                    required
                    placeholder="e.g. Veterinary & Animal Husbandry"
                    value={catFormNameEn}
                    onChange={(e) => setCatFormNameEn(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Category Name (Hindi)</Label>
                  <Input
                    placeholder="e.g. पशुपालन एवं पशुचिकित्सा भर्ती"
                    value={catFormNameHi}
                    onChange={(e) => setCatFormNameHi(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block">Slug / ID</Label>
                    <Input
                      placeholder="auto-generated if empty"
                      value={catFormSlug}
                      onChange={(e) => setCatFormSlug(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Preset Icon</Label>
                    <Select value={catFormIcon} onValueChange={setCatFormIcon}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESET_ICONS.map((p) => (
                          <SelectItem key={p.name} value={p.name}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Status</Label>
                  <Select value={catFormActive ? "active" : "inactive"} onValueChange={(val) => setCatFormActive(val === "active")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Visible)</SelectItem>
                      <SelectItem value="inactive">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#A30B0B] hover:bg-[#850909] text-white">
                    {editingCategory ? "Update Category" : "Create Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={!!itemToDelete}
            title={`Delete ${itemToDelete?.type === "type" ? "Notice Type" : itemToDelete?.type === "jurisdiction" ? "Jurisdiction" : "Category"}`}
            description="Are you sure you want to permanently delete this option? Notices referencing this option may lose their direct categorization."
            itemName={itemToDelete?.name}
            isDeleting={isDeleting}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setItemToDelete(null)}
          />
        </main>
      </div>
    </div>
  );
}

export default function MasterAttributesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm text-slate-500 font-medium">Loading attributes...</div>}>
      <MasterAttributesContent />
    </Suspense>
  );
}

