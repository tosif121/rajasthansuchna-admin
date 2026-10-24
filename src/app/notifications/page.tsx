"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { PageHeader, StatCard, DeleteConfirmationModal } from "@/components/reusable";
import { 
  Bell, 
  Send, 
  Trash2, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  X,
  Search,
  Filter,
  Sparkles
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
    agencyName: "राजस्थान सूचना",
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

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) setIsModalOpen(false);
        if (deleteModalState.isOpen) setDeleteModalState({ isOpen: false, id: "", title: "" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, deleteModalState]);

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
          vacancyId: formData.noticeId || "vac_01",
          vacancySlug: formData.noticeSlug || "sample-slug",
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
          agencyName: "राजस्थान सूचना",
        });
        await loadNotifications();
      } else {
        alert(json.error || "सूचना भेजने में विफल");
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
        return { label: "नई विज्ञप्ति (New Vacancy)", bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "admitCard":
        return { label: "एडमिट कार्ड (Admit Card)", bg: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "result":
        return { label: "परिणाम (Result)", bg: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
      case "closingSoon":
        return { label: "अंतिम तिथि (Closing Soon)", bg: "bg-red-500/10 text-red-600 border-red-500/20" };
      case "correction":
        return { label: "त्रुटि सुधार (Correction)", bg: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      default:
        return { label: "सूचना (Alert)", bg: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
    }
  };

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
              description="विद्यार्थियों को नई भर्ती, एडमिट कार्ड व परीक्षा अपडेट्स के लिए सीधे मोबाइल पुश और इन-ऐप नोटिफिकेशन प्रसारित करें।"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#A30B0B] hover:bg-[#850909] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              नई सूचना भेजें (Broadcast)
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Broadcasts"
              value={notifications.length}
              subtitle="कुल प्रसारित सूचनाएं"
              icon={<Bell className="w-5 h-5 text-red-600" />}
            />
            <StatCard
              title="New Vacancy Alerts"
              value={notifications.filter((n) => n.type === "newVacancy").length}
              subtitle="भर्ती विज्ञप्ति अलर्ट्स"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              title="Admit Card & Exam"
              value={notifications.filter((n) => n.type === "admitCard" || n.type === "closingSoon").length}
              subtitle="प्रवेश पत्र व अंतिम तिथि"
              icon={<Clock className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Push Engine Status"
              value="Active"
              subtitle="FCM + In-App Live Sync"
              icon={<Sparkles className="w-5 h-5 text-amber-600" />}
            />
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="सूचना या एजेंसी खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
              >
                <option value="all">सभी प्रकार (All Types)</option>
                <option value="newVacancy">नई विज्ञप्ति (New Vacancy)</option>
                <option value="admitCard">एडमिट कार्ड (Admit Card)</option>
                <option value="result">परिणाम (Result)</option>
                <option value="closingSoon">अंतिम तिथि (Closing Soon)</option>
                <option value="correction">त्रुटि सुधार (Correction)</option>
              </select>
            </div>
          </div>

          {/* Notifications Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#A30B0B]" />
                हालिया सूचना इतिहास ({filteredNotifications.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-500">सूचनाएं लोड हो रही हैं...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">कोई सूचना नहीं मिली</h3>
                <p className="text-xs text-slate-500 mt-1">नई सूचना प्रसारित करने के लिए ऊपर दिए बटन पर क्लिक करें।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">प्रकार (Type)</th>
                      <th className="py-3.5 px-4">शीर्षक व विवरण (Title & Message)</th>
                      <th className="py-3.5 px-4">एजेंसी / लिंक (Target Notice)</th>
                      <th className="py-3.5 px-4">समय (Sent Date)</th>
                      <th className="py-3.5 px-4 text-right">कार्रवाई (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredNotifications.map((notif) => {
                      const badge = getTypeBadge(notif.type);
                      return (
                        <tr key={notif.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-md">
                            <p className="font-semibold text-slate-900 dark:text-white leading-snug">{notif.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800 dark:text-slate-200">{notif.agencyName}</span>
                              <span className="text-xs text-slate-400 font-mono truncate max-w-[180px]">{notif.vacancySlug}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString("hi-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setDeleteModalState({ isOpen: true, id: notif.id, title: notif.title })}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="हटाएं"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Broadcast Modal with Mobile Push Live Preview */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#A30B0B]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    नई अधिसूचना प्रसारित करें (Send Broadcast Alert)
                  </h3>
                  <p className="text-xs text-slate-500">सभी पंजीकृत विद्यार्थियों को तुरंत मोबाइल सूचना प्राप्त होगी।</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
              {/* Form Input Section */}
              <form onSubmit={handleSendNotification} className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    सूचना प्रकार (Notification Type) *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="newVacancy">नई भर्ती विज्ञप्ति (New Vacancy)</option>
                    <option value="admitCard">एडमिट कार्ड जारी (Admit Card)</option>
                    <option value="result">परीक्षा परिणाम (Result Announcement)</option>
                    <option value="closingSoon">अंतिम तिथि चेतावनी (Application Deadline Alert)</option>
                    <option value="correction">ऑनलाइन त्रुटि सुधार (Correction Window)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    संबंधित विज्ञप्ति चुनें (Link Target Vacancy)
                  </label>
                  <select
                    value={formData.noticeId}
                    onChange={(e) => handleNoticeSelect(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- सामान्य सूचना (General Alert without direct link) --</option>
                    {notices.map((n) => (
                      <option key={n.id} value={n.id}>
                        [{n.agencyId}] {n.titleHi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    अधिसूचना शीर्षक (Title in Hindi / English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. राजस्थान पटवारी भर्ती 2026: 2998 पदों पर विज्ञप्ति जारी"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    विस्तृत संदेश (Message Body) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="उदा. राजस्व विभाग द्वारा ऑनलाइन आवेदन पोर्टल सक्रिय कर दिया गया है। अंतिम तिथि से पहले आवेदन करें।"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    एजेंसी नाम (Display Agency / Authority)
                  </label>
                  <input
                    type="text"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium cursor-pointer"
                  >
                    रद्द करें (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex items-center gap-2 bg-[#A30B0B] hover:bg-[#850909] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSending ? "भेजा जा रहा है..." : "अभी भेजें (Broadcast Now)"}
                  </button>
                </div>
              </form>

              {/* Realistic Smartphone Live Push Notification Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-[#A30B0B]" /> Live Mobile Push Preview
                </div>

                {/* Phone Mockup Window */}
                <div className="w-full max-w-[310px] bg-slate-900 text-white rounded-3xl p-3.5 shadow-2xl border-4 border-slate-800 relative">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300 px-2 pt-1 pb-3">
                    <span className="font-semibold">09:41</span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Android / iOS Push Notification Banner Card */}
                  <div className="bg-slate-800/95 backdrop-blur-md text-white rounded-2xl p-3.5 border border-slate-700/60 shadow-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-[#A30B0B] flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                          RS
                        </div>
                        <span className="text-xs font-semibold tracking-wide text-slate-200">
                          राजस्थान सूचना
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">अभी-अभी</span>
                    </div>

                    <p className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {formData.title || "अधिसूचना का शीर्षक यहाँ दिखेगा"}
                    </p>

                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-3 leading-normal">
                      {formData.message || "आपके संदेश का विवरण यहाँ लाइव दिखेगा जैसा विद्यार्थी को स्क्रीन पर प्राप्त होगा।"}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-amber-400">
                      <span>{formData.agencyName || "राजस्थान सूचना मंच"}</span>
                      <span className="text-slate-400 font-mono">टैप करके खोलें →</span>
                    </div>
                  </div>

                  {/* Phone Notch / Indicator */}
                  <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        title="अधिसूचना हटाएं?"
        description={`क्या आप सुनिश्चित हैं कि आप "${deleteModalState.title}" को हटाना चाहते हैं? यह सभी विद्यार्थियों की सूची से हट जाएगी।`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, id: "", title: "" })}
      />
    </div>
  );
}
