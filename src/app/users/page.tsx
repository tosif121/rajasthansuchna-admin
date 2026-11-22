"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import {
  PageHeader,
  StatCard,
  DataTable,
  Column,
  FormattedTimestamp,
  DeleteConfirmationModal,
} from "@/components/reusable";
import {
  Users,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Pencil,
  Phone,
  ShieldCheck,
  UserCheck,
  UserX,
  Zap,
  Gift,
  Coins,
  Plus,
  Check,
  X,
  Clock,
  Sparkles,
} from "lucide-react";

interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  targetExam?: string;
  preferredCategoryIds?: string[];
  credits?: number;
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string;
}

interface CreditRequestItem {
  id: string;
  userId: string;
  candidateName: string;
  phone?: string;
  email?: string;
  amount: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

function UsersPageContent() {
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequestItem[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Inspector, Edit & Delete modal states
  const [inspectedUser, setInspectedUser] = useState<StudentUser | null>(null);
  const [userToEdit, setUserToEdit] = useState<StudentUser | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [userToDelete, setUserToDelete] = useState<StudentUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Credits modal states
  const [userToManageCredits, setUserToManageCredits] = useState<StudentUser | null>(null);
  const [creditAdjustmentType, setCreditAdjustmentType] = useState<"add" | "set">("add");
  const [creditsAmount, setCreditsAmount] = useState<number>(10);
  const [isSavingCredits, setIsSavingCredits] = useState(false);

  const [isGiftAllOpen, setIsGiftAllOpen] = useState(false);
  const [giftAllAmount, setGiftAllAmount] = useState<number>(10);
  const [isGiftingAll, setIsGiftingAll] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, requestsRes] = await Promise.all([
        fetch("/api/v1/admin/users").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/v1/admin/credit-requests").then((r) => r.json()).catch(() => ({ success: false })),
      ]);
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.users || []);
      }
      if (requestsRes.success && requestsRes.data) {
        setCreditRequests(requestsRes.data.requests || []);
      }
    } catch {
      setFeedback({ message: "Failed to load registered candidates and requests.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCreditRequest = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      setProcessingRequestId(id);
      const res = await fetch("/api/v1/admin/credit-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({
          message: res.message || `Request ${action.toLowerCase()}d successfully.`,
          type: "success",
        });
        loadData();
      } else {
        setFeedback({ message: res.error || "Action failed.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error processing credit request.", type: "error" });
    } finally {
      setProcessingRequestId(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (user: StudentUser) => {
    try {
      const nextActive = !user.isActive;
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: nextActive }),
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({
          message: `User ${user.name} is now ${nextActive ? "Active" : "Suspended"}.`,
          type: "success",
        });
        loadData();
      }
    } catch {
      setFeedback({ message: "Network error updating user status.", type: "error" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/v1/admin/users?id=${userToDelete.id}`, {
        method: "DELETE",
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({ message: `Student account ${userToDelete.name} deleted.`, type: "success" });
        loadData();
      }
    } catch {
      setFeedback({ message: "Network error deleting user.", type: "error" });
    } finally {
      setUserToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleSaveName = async () => {
    if (!userToEdit || !editedName.trim()) return;
    const cleanName = editedName.trim().slice(0, 30);
    try {
      setIsSavingName(true);
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userToEdit.id, name: cleanName }),
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({ message: `Candidate name updated to "${cleanName}".`, type: "success" });
        setUserToEdit(null);
        loadData();
      } else {
        setFeedback({ message: res.error || "Failed to update name.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error updating candidate name.", type: "error" });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUpdateUserCredits = async () => {
    if (!userToManageCredits) return;
    try {
      setIsSavingCredits(true);
      const payload =
        creditAdjustmentType === "add"
          ? { id: userToManageCredits.id, addCredits: Number(creditsAmount) }
          : { id: userToManageCredits.id, credits: Math.max(0, Number(creditsAmount)) };

      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({
          message: `Updated AI credits for ${userToManageCredits.name} to ${res.credits ?? creditsAmount} credits.`,
          type: "success",
        });
        setUserToManageCredits(null);
        loadData();
      } else {
        setFeedback({ message: res.error || "Failed to update credits.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error updating credits.", type: "error" });
    } finally {
      setIsSavingCredits(false);
    }
  };

  const handleGiftCreditsToAll = async () => {
    if (giftAllAmount <= 0) return;
    try {
      setIsGiftingAll(true);
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addCreditsToAll: Number(giftAllAmount) }),
      }).then((r) => r.json());

      if (res.success) {
        setFeedback({
          message: res.message || `Granted +${giftAllAmount} credits to all candidates!`,
          type: "success",
        });
        setIsGiftAllOpen(false);
        loadData();
      } else {
        setFeedback({ message: res.error || "Failed to gift credits.", type: "error" });
      }
    } catch {
      setFeedback({ message: "Network error gifting credits.", type: "error" });
    } finally {
      setIsGiftingAll(false);
    }
  };

  const exportCsv = () => {
    if (users.length === 0) return;
    const headers = ["ID", "Name", "Mobile Number", "AI Credits", "Joined Date", "Status"];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.phone || "",
      u.credits ?? 10,
      u.createdAt,
      u.isActive ? "Active" : "Suspended",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rajasthan_suchna_candidates_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Columns for Registered Users
  const userColumns: Column<StudentUser>[] = [
    {
      header: "Candidate Name",
      accessorKey: "name",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-xs">{user.name}</p>
            <span className="text-[11px] text-slate-500 font-mono">ID: {user.id}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Mobile Number",
      accessorKey: "phone",
      cell: (user) => (
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">
          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{user.phone ? `+91 ${user.phone.replace(/\D/g, '').slice(-10)}` : "Not provided"}</span>
        </div>
      ),
    },
    {
      header: "AI Credits",
      accessorKey: "credits",
      cell: (user) => (
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            {user.credits ?? 10} Credits
          </span>
        </div>
      ),
    },
    {
      header: "Joined Date",
      accessorKey: "createdAt",
      cell: (user) => <FormattedTimestamp value={user.createdAt} />,
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (user) => (
        <Badge variant={user.isActive ? "success" : "secondary"}>
          {user.isActive ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setUserToManageCredits(user);
              setCreditsAmount(10);
              setCreditAdjustmentType("add");
            }}
            title="Gift / Manage AI Credits"
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            <Zap className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInspectedUser(user)}
            title="View Candidate Profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setUserToEdit(user);
              setEditedName(user.name);
            }}
            title="Edit Candidate Name"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleActive(user)}
            title={user.isActive ? "Suspend Account" : "Activate Account"}
            className="text-amber-600 hover:text-amber-700"
          >
            {user.isActive ? "Suspend" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUserToDelete(user)}
            title="Delete Account"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Candidate Credit Requests
  const requestColumns: Column<CreditRequestItem>[] = [
    {
      header: "Candidate Name & Contact",
      accessorKey: "candidateName",
      cell: (req) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0">
            {req.candidateName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-xs">{req.candidateName}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{req.phone ? `+91 ${req.phone.replace(/\D/g, '').slice(-10)}` : req.email || req.userId}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Requested Credits",
      accessorKey: "amount",
      cell: (req) => (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            +{req.amount} Credits
          </span>
        </div>
      ),
    },
    {
      header: "Purpose / Note",
      accessorKey: "reason",
      cell: (req) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {req.reason || "App AI Assistant Query Recharge"}
        </span>
      ),
    },
    {
      header: "Request Time",
      accessorKey: "createdAt",
      cell: (req) => <FormattedTimestamp value={req.createdAt} />,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (req) => {
        if (req.status === "PENDING") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Pending Review
            </span>
          );
        }
        if (req.status === "APPROVED") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Approved (+{req.amount})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <X className="w-3.5 h-3.5 text-slate-500" />
            Rejected
          </span>
        );
      },
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (req) => {
        if (req.status !== "PENDING") {
          return (
            <span className="text-[11px] text-slate-400 font-mono">
              {req.reviewedBy ? `Reviewed by ${req.reviewedBy.split('@')[0]}` : "Processed"}
            </span>
          );
        }
        const isBusy = processingRequestId === req.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              disabled={isBusy}
              onClick={() => handleReviewCreditRequest(req.id, "APPROVE")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 font-bold cursor-pointer gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Approve (+{req.amount})
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => handleReviewCreditRequest(req.id, "REJECT")}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs h-7 px-2.5 cursor-pointer gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  const activeUsers = users.filter((u) => u.isActive);
  const suspendedUsers = users.filter((u) => !u.isActive);
  const verifiedPhoneCount = users.filter((u) => u.phone && u.phone.trim().length > 0).length;
  const totalAiCredits = users.reduce((acc, u) => acc + (u.credits ?? 10), 0);
  const pendingRequestsCount = creditRequests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          <PageHeader
            eyebrow="Candidate Management"
            title="Registered Candidates & Students"
            description="View registered student accounts, manage AI question credits, and control portal access."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setGiftAllAmount(10);
                    setIsGiftAllOpen(true);
                  }}
                  variant="outline"
                  className="gap-2 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-amber-500" /> Gift Credits to All
                </Button>
                <Button onClick={exportCsv} variant="outline" className="gap-2 cursor-pointer">
                  <Download className="w-4 h-4" /> Export CSV
                </Button>
              </div>
            }
          />

          {/* Feedback Banner */}
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

          {/* Audience Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Registered Candidates"
              value={users.length}
              description="Total student accounts"
              icon={<Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              borderColor="border-l-blue-500"
            />
            <StatCard
              title="Active Candidates"
              value={activeUsers.length}
              description="Candidates with active access"
              icon={<UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
            <StatCard
              title="Total AI Credits"
              value={totalAiCredits}
              description="Active question balance"
              icon={<Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
            <StatCard
              title="Phone Verified"
              value={verifiedPhoneCount}
              description="Mobile numbers linked"
              icon={<ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              borderColor="border-l-purple-500"
            />
          </div>

          {/* Candidate Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="all" className="gap-2">
                <Users className="w-3.5 h-3.5" />
                <span>All Candidates</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                  {users.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="gap-2">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Active</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                  {activeUsers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="suspended" className="gap-2">
                <UserX className="w-3.5 h-3.5" />
                <span>Suspended</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                  {suspendedUsers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Credit Requests</span>
                {pendingRequestsCount > 0 ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white ml-1 animate-pulse">
                    {pendingRequestsCount} Pending
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                    {creditRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <DataTable
                columns={userColumns}
                data={users}
                searchKey="name"
                searchPlaceholder="Search candidates by name, mobile, or ID..."
                emptyTitle="No candidates found"
                emptyDescription="When students create accounts in the mobile app, their profiles appear here."
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <DataTable
                columns={userColumns}
                data={activeUsers}
                searchKey="name"
                searchPlaceholder="Search active candidates..."
                emptyTitle="No active candidates"
                emptyDescription="There are currently no active candidate accounts."
              />
            </TabsContent>

            <TabsContent value="suspended" className="space-y-4">
              <DataTable
                columns={userColumns}
                data={suspendedUsers}
                searchKey="name"
                searchPlaceholder="Search suspended candidates..."
                emptyTitle="No suspended candidates"
                emptyDescription="There are no suspended accounts."
              />
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <DataTable
                columns={requestColumns}
                data={creditRequests}
                searchKey="candidateName"
                searchPlaceholder="Search credit requests by candidate name or phone..."
                emptyTitle="No Credit Requests"
                emptyDescription="When candidates submit AI credit top-up requests from the mobile app, they will appear here for one-click approval."
              />
            </TabsContent>
          </Tabs>

          {/* Student Profile Detail Dialog */}
          <Dialog open={!!inspectedUser} onOpenChange={(open) => !open && setInspectedUser(null)}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Candidate Profile Details</DialogTitle>
                <DialogDescription>
                  Verified student credentials and account information.
                </DialogDescription>
              </DialogHeader>

              {inspectedUser && (
                <div className="space-y-3.5 py-2 text-xs">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-[#A30B0B] text-white flex items-center justify-center font-bold text-sm">
                      {inspectedUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{inspectedUser.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">UID: {inspectedUser.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mobile Phone:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {inspectedUser.phone ? `+91 ${inspectedUser.phone.replace(/\D/g, '').slice(-10)}` : "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">AI Credits:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {inspectedUser.credits ?? 10} Credits
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Status:</span>
                      <Badge variant={inspectedUser.isActive ? "success" : "secondary"}>
                        {inspectedUser.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registration Date:</span>
                      <FormattedTimestamp value={inspectedUser.createdAt} />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setInspectedUser(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete User Modal */}
          <DeleteConfirmationModal
            isOpen={!!userToDelete}
            title="Delete Candidate Account"
            description="Are you sure you want to permanently delete this student account? This will revoke access to their study planner and saved notices."
            itemName={userToDelete?.name}
            isDeleting={isDeleting}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setUserToDelete(null)}
          />

          {/* Edit Candidate Name Modal */}
          <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Candidate Name</DialogTitle>
                <DialogDescription>
                  Update the candidate's displayed name in the database and portal directory.
                </DialogDescription>
              </DialogHeader>

              {userToEdit && (
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Candidate Full Name
                      </label>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {editedName.length}/30
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editedName}
                      maxLength={30}
                      onChange={(e) => setEditedName(e.target.value.slice(0, 30))}
                      placeholder="e.g. Tosif Raza"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#A30B0B]"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <p>Phone: {userToEdit.phone ? `+91 ${userToEdit.phone}` : "N/A"}</p>
                    <p className="mt-0.5">UID: {userToEdit.id}</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setUserToEdit(null)} disabled={isSavingName}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveName}
                  disabled={isSavingName || !editedName.trim()}
                  className="bg-[#A30B0B] hover:bg-[#850808] text-white"
                >
                  {isSavingName ? "Saving..." : "Save Name"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Manage Candidate AI Credits Dialog */}
          <Dialog open={!!userToManageCredits} onOpenChange={(open) => !open && setUserToManageCredits(null)}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Zap className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <DialogTitle>Manage Candidate AI Credits</DialogTitle>
                    <DialogDescription>
                      Gift bonus credits or adjust the question balance for this candidate.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {userToManageCredits && (
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{userToManageCredits.name}</p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        {userToManageCredits.phone ? `+91 ${userToManageCredits.phone}` : userToManageCredits.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Current Balance</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm flex items-center justify-end gap-1">
                        <Zap className="w-3.5 h-3.5 fill-amber-500" />
                        {userToManageCredits.credits ?? 10} Credits
                      </span>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setCreditAdjustmentType("add")}
                      className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                        creditAdjustmentType === "add"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      + Add Bonus Credits
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreditAdjustmentType("set")}
                      className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                        creditAdjustmentType === "set"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      = Set Exact Total
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {creditAdjustmentType === "add" ? "Credits to Add" : "New Total Balance"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={creditsAmount}
                        onChange={(e) => setCreditsAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">Credits</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Quick Select:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[5, 10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCreditsAmount(amt)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
                            creditsAmount === amt
                              ? "bg-amber-500 text-white border-amber-600"
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                          }`}
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {creditAdjustmentType === "add"
                      ? `Candidate will receive +${creditsAmount} credits. New total will be ${(userToManageCredits.credits ?? 10) + creditsAmount} credits.`
                      : `Candidate's credit balance will be set directly to ${creditsAmount} credits.`}
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setUserToManageCredits(null)} disabled={isSavingCredits}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUserCredits}
                  disabled={isSavingCredits || creditsAmount <= 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {isSavingCredits ? "Updating..." : "Save AI Credits"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Gift Credits To All Candidates Dialog */}
          <Dialog open={isGiftAllOpen} onOpenChange={(open) => !open && setIsGiftAllOpen(false)}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Gift className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <DialogTitle>Gift Credits to All Candidates</DialogTitle>
                    <DialogDescription>
                      Distribute bonus AI question credits to every registered candidate.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    Target: All {users.length} Registered Candidates
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Every active and registered candidate in the database will have this credit bonus added to their current balance.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bonus Credits per Candidate
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={giftAllAmount}
                      onChange={(e) => setGiftAllAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-500 shrink-0">Credits each</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Quick Select:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[5, 10, 15, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setGiftAllAmount(amt)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
                          giftAllAmount === amt
                            ? "bg-amber-500 text-white border-amber-600"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                        }`}
                      >
                        +{amt} Credits
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGiftAllOpen(false)} disabled={isGiftingAll}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGiftCreditsToAll}
                  disabled={isGiftingAll || giftAllAmount <= 0}
                  className="bg-gradient-to-r from-[#A30B0B] to-[#7A0606] text-white font-bold"
                >
                  {isGiftingAll ? "Granting Credits..." : `Grant +${giftAllAmount} to All Candidates`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm text-slate-500 font-medium">Loading user metrics...</div>}>
      <UsersPageContent />
    </Suspense>
  );
}
