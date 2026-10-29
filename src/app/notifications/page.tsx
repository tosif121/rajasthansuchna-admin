"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  PageHeader, 
  StatCard, 
  DeleteConfirmationModal,
  DataTable,
  Column,
  FormattedTimestamp 
} from "@/components/reusable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Bell, 
  Send, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Sparkles,
  Plus
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  vacancyId: string;
  vacancySlug: string;
  agencyName: string;
  type: "newVacancy" | "admitCard" | "result" | "correction" | "closingSoon";
  createdAt: string;
  fcmStatus?: "sent" | "skipped_no_credentials" | "failed";
}

interface NoticeOption {
  id: string;
  titleHi: string;
  slug: string;
  agencyId: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notices, setNotices] = useState<NoticeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: "",
    title: "",
  });

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "newVacancy" as NotificationItem["type"],
    noticeId: "",
    noticeSlug: "",
    agencyName: "Rajasthan Suchna",
  });

  // Fetch Notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/notifications");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Notices for dropdown link
  const loadNotices = async () => {
    try {
      const res = await fetch("/api/v1/notices?limit=50");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotices(
          json.data.map((n: any) => ({
            id: n.id,
            titleHi: n.titleHi,
            slug: n.slug,
            agencyId: (n.agencyId || "").toUpperCase(),
          }))
        );
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadNotifications();
    loadNotices();
  }, []);

  // Notice dropdown selection
  const handleNoticeSelect = (noticeId: string) => {
    const found = notices.find((n) => n.id === noticeId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        noticeId: found.id,
        noticeSlug: found.slug,
        agencyName: found.agencyId || prev.agencyName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        noticeId: "",
        noticeSlug: "",
      }));
    }
  };

  // Submit Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    try {
      setIsSending(true);
      const res = await fetch("/api/v1/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          vacancyId: formData.noticeId || "",
          vacancySlug: formData.noticeSlug || "",
          agencyName: formData.agencyName,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setFormData({
          title: "",
          message: "",
          type: "newVacancy",
          noticeId: "",
          noticeSlug: "",
          agencyName: "Rajasthan Suchna",
        });
        await loadNotifications();
      } else {
        alert(json.error || "Failed to broadcast notification");
      }
    } catch (err: any) {
      alert("Error: " + err?.message);
    } finally {
      setIsSending(false);
    }
  };

  // Delete Notification
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/v1/notifications/${deleteModalState.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== deleteModalState.id));
        setDeleteModalState({ isOpen: false, id: "", title: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter((n) => {
    const matchesQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.agencyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === "all" || n.type === selectedTypeFilter;
    return matchesQuery && matchesType;
  });

  const getTypeBadge = (type: NotificationItem["type"]) => {
    switch (type) {
      case "newVacancy":
        return { label: "New Vacancy", bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "admitCard":
        return { label: "Admit Card", bg: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "result":
        return { label: "Result", bg: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
      case "closingSoon":
        return { label: "Closing Soon", bg: "bg-red-500/10 text-red-600 border-red-500/20" };
      case "correction":
        return { label: "Correction Window", bg: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      default:
        return { label: "Alert", bg: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
    }
  };

  const columns: Column<NotificationItem>[] = [
    {
      header: "Type",
      cell: (notif) => {
        const badge = getTypeBadge(notif.type);
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      header: "Title & Content",
      cell: (notif) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 dark:text-white leading-snug">{notif.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
        </div>
      ),
    },
    {
      header: "Target Agency / Notice",
      cell: (notif) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-slate-200">{notif.agencyName}</span>
          <span className="text-xs text-slate-400 font-mono truncate max-w-[180px]">{notif.vacancySlug}</span>
        </div>
      ),
    },
    {
      header: "FCM Push",
      cell: (notif) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${notif.fcmStatus === "sent" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
          {notif.fcmStatus === "sent" ? "FCM Delivered" : "In-App Live"}
        </span>
      ),
    },
    {
      header: "Sent Date",
      cell: (notif) => (
        <FormattedTimestamp value={notif.createdAt} />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (notif) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteModalState({ isOpen: true, id: notif.id, title: notif.title })}
          className="p-1.5 h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          title="Delete notification"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
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
              eyebrow="STUDENT ENGAGEMENT & ALERTS"
              title="App Push Notifications"
              description="Broadcast instant mobile push notifications and in-app alerts directly to student devices for recruitments, admit cards, and exam deadlines."
            />
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#A30B0B] hover:bg-[#850909] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Broadcast Notification
            </Button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Broadcasts"
              value={notifications.length}
              subtitle="All sent notifications"
              icon={<Bell className="w-5 h-5 text-red-600" />}
            />
            <StatCard
              title="New Vacancy Alerts"
              value={notifications.filter((n) => n.type === "newVacancy").length}
              subtitle="Recruitment releases"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              title="Admit Card & Exam"
              value={notifications.filter((n) => n.type === "admitCard" || n.type === "closingSoon").length}
              subtitle="Hall tickets & deadlines"
              icon={<Clock className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Push Engine Status"
              value="Active"
              subtitle="FCM & in-app live sync"
              icon={<Sparkles className="w-5 h-5 text-amber-600" />}
            />
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search notification title, message, or agency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <Select
                value={selectedTypeFilter}
                onValueChange={(val) => setSelectedTypeFilter(val)}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="All Notification Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notification Types</SelectItem>
                  <SelectItem value="newVacancy">New Vacancy</SelectItem>
                  <SelectItem value="admitCard">Admit Card</SelectItem>
                  <SelectItem value="result">Result</SelectItem>
                  <SelectItem value="closingSoon">Closing Soon</SelectItem>
                  <SelectItem value="correction">Correction Window</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notifications DataTable */}
          <DataTable
            columns={columns}
            data={filteredNotifications}
            isLoading={isLoading}
            searchKey="title"
            searchPlaceholder="Search broadcasts by title or message..."
            pageSize={10}
            emptyTitle="No notifications found"
            emptyDescription="Click 'Broadcast Notification' above to send a new alert to students."
          />
        </main>
      </div>

      {/* shadcn Dialog: Broadcast Push Notification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl! max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#A30B0B]">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-bold text-lg text-slate-900 dark:text-white">
                  Broadcast Push Notification
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Send instant recruitment updates directly to all active mobile app users.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSendNotification} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label required>Notification Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val as any })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Notification Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newVacancy">New Vacancy (Recruitment Notification)</SelectItem>
                    <SelectItem value="admitCard">Admit Card Released (Hall Ticket)</SelectItem>
                    <SelectItem value="result">Exam Result Announcement</SelectItem>
                    <SelectItem value="closingSoon">Application Deadline Alert (Closing Soon)</SelectItem>
                    <SelectItem value="correction">Correction Window Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Link Target Vacancy (Optional)</Label>
                <Select
                  value={formData.noticeId || "general"}
                  onValueChange={(val) => handleNoticeSelect(val === "general" ? "" : val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="General Announcement (No link)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">-- General Announcement (No specific notice link) --</SelectItem>
                    {notices.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        [{n.agencyId}] {n.titleHi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label required>Notification Title</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Rajasthan Patwari Recruitment 2026: 2998 Posts Notification Released"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label required>Notification Message Body</Label>
                <Textarea
                  rows={3}
                  required
                  placeholder="e.g. Online application portal is now active on SSO Rajasthan. Apply before last date."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Issuing Agency / Authority Name</Label>
                <Input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-2 bg-[#A30B0B] hover:bg-[#850909] text-white cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? "Sending Broadcast..." : "Broadcast Now"}
                </Button>
              </div>
            </form>

        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        title="Delete Notification"
        description={`Are you sure you want to delete "${deleteModalState.title}"? It will be removed from all student device feeds.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, id: "", title: "" })}
      />
    </div>
  );
}
