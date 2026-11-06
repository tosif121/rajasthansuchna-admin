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
} from "lucide-react";

interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  targetExam?: string;
  preferredCategoryIds?: string[];
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string;
}

function UsersPageContent() {
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Inspector, Edit & Delete modal states
  const [inspectedUser, setInspectedUser] = useState<StudentUser | null>(null);
  const [userToEdit, setUserToEdit] = useState<StudentUser | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [userToDelete, setUserToDelete] = useState<StudentUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/users").then((r) => r.json());
      if (res.success && res.data) {
        setUsers(res.data.users || []);
      }
    } catch {
      setFeedback({ message: "Failed to load registered candidates.", type: "error" });
    } finally {
      setLoading(false);
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

  const exportCsv = () => {
    if (users.length === 0) return;
    const headers = ["ID", "Name", "Mobile Number", "Joined Date", "Status"];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.phone || "",
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

  const activeUsers = users.filter((u) => u.isActive);
  const suspendedUsers = users.filter((u) => !u.isActive);
  const verifiedPhoneCount = users.filter((u) => u.phone && u.phone.trim().length > 0).length;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          <PageHeader
            eyebrow="Candidate Management"
            title="Registered Candidates & Students"
            description="View registered student accounts, verify contact details, and manage portal access."
            actions={
              <Button onClick={exportCsv} variant="outline" className="gap-2">
                <Download className="w-4 h-4" /> Export Candidates CSV
              </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              title="Phone Verified"
              value={verifiedPhoneCount}
              description="Mobile numbers linked"
              icon={<ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
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
          </Tabs>

          {/* Student Profile Detail Dialog */}
          <Dialog open={!!inspectedUser} onOpenChange={(open) => !open && setInspectedUser(null)}>
            <DialogContent className="sm:max-w-md">
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
            <DialogContent className="max-w-md">
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
