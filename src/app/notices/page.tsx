"use client";

import { apiGet, invalidateClientApiCache } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import {
  PageHeader,
  DataTable,
  Column,
  DeleteConfirmationModal,
  FormattedTimestamp
} from '@/components/reusable';
import {
  CheckCircle2,
  Eye,
  Pencil,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Trash2,
  Plus,
} from 'lucide-react';

interface NoticeLink {
  label: string;
  url: string;
  kind: string;
}

interface NoticeSection {
  key: string;
  title: string;
  body: string;
  rows?: Record<string, string>;
  pageRef?: string;
}

interface NoticeFacts {
  postsCount?: number;
  applicationStart?: string;
  applicationEnd?: string;
  feeEndDate?: string;
  examDate?: string;
  feeGeneralObc?: string;
  feeScSt?: string;
  qualification: string;
  ageMin?: number;
  ageMax?: number;
  selectionProcess: string;
  sourceUrl: string;
  sourceDate: string;
  verifiedAt: string;
  verifiedBy: string;
}

interface NoticeItem {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  agencyId: string;
  agencyName: string;
  categoryId: string;
  categoryName: string;
  state: 'rajasthan' | 'central';
  noticeType: string;
  status: 'active' | 'inactive';
  revisionNumber: number;
  summaryHi: string;
  summaryEn: string;
  editorId: string;
  editorName: string;
  publishedAt?: string;
  expiresAt?: string;
  isFeatured: boolean;
  isBreaking: boolean;
  updatedAt: string;
  facts: NoticeFacts;
  sections: NoticeSection[];
  links: NoticeLink[];
}

interface Option {
  id: string;
  nameHi: string;
  nameEn: string;
  parentGroup?: string;
}

interface NoticeForm {
  titleHi: string;
  titleEn: string;
  summaryHi: string;
  summaryEn: string;
  agencyId: string;
  categoryId: string;
  state: 'rajasthan' | 'central';
  noticeType: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  isBreaking: boolean;
  expiresAt: string;
  postsCount: string;
  qualification: string;
  ageMin: string;
  ageMax: string;
  applicationStart: string;
  applicationEnd: string;
  feeEndDate: string;
  examDate: string;
  feeGeneralObc: string;
  feeScSt: string;
  selectionProcess: string;
  sourceUrl: string;
  sourceDate: string;
  verifiedAt: string;
  verifiedBy: string;
  notificationPdfUrl: string;
  applyOnlineUrl: string;
  officialSiteUrl: string;
}

const NOTICE_TYPES = [
  { value: 'vacancy', label: 'Vacancy' },
  { value: 'admitCard', label: 'Admit Card' },
  { value: 'result', label: 'Result' },
  { value: 'answerKey', label: 'Answer Key' },
  { value: 'scheme', label: 'Government Scheme' },
];

const today = () => new Date().toISOString().split('T')[0];

const emptyForm = (): NoticeForm => ({
  titleHi: '',
  titleEn: '',
  summaryHi: '',
  summaryEn: '',
  agencyId: '',
  categoryId: '',
  state: 'rajasthan',
  noticeType: 'vacancy',
  status: 'active',
  isFeatured: false,
  isBreaking: false,
  expiresAt: '',
  postsCount: '',
  qualification: '',
  ageMin: '',
  ageMax: '',
  applicationStart: '',
  applicationEnd: '',
  feeEndDate: '',
  examDate: '',
  feeGeneralObc: '',
  feeScSt: '',
  selectionProcess: '',
  sourceUrl: '',
  sourceDate: '',
  verifiedAt: '',
  verifiedBy: 'Rajasthan Suchna Editorial Board',
  notificationPdfUrl: '',
  applyOnlineUrl: '',
  officialSiteUrl: '',
});

const dateOnly = (value?: string) => (value ? value.split('T')[0] : '');

function linkValue(links: NoticeLink[] | undefined, kind: string): string {
  return links?.find((l) => l.kind === kind)?.url || '';
}

function buildSections(form: NoticeForm, existing?: NoticeSection[]): NoticeSection[] {
  if (existing && existing.length > 0) return existing;

  const sections: NoticeSection[] = [];
  const overview = form.summaryEn || form.summaryHi;
  if (overview) sections.push({ key: 'overview', title: 'Overview', body: overview });

  const dateRows: Record<string, string> = {};
  if (form.applicationStart) dateRows['Application Start'] = form.applicationStart;
  if (form.applicationEnd) dateRows['Application Last Date'] = form.applicationEnd;
  if (form.feeEndDate) dateRows['Fee Payment Last Date'] = form.feeEndDate;
  if (form.examDate) dateRows['Exam Date'] = form.examDate;
  if (Object.keys(dateRows).length > 0) {
    sections.push({ key: 'importantDates', title: 'Important Dates', body: '', rows: dateRows });
  }

  if (form.qualification || form.ageMin || form.ageMax) {
    const rows: Record<string, string> = {};
    if (form.qualification) rows['Qualification'] = form.qualification;
    if (form.ageMin || form.ageMax) rows['Age Limit'] = `${form.ageMin || '-'} to ${form.ageMax || '-'} years`;
    sections.push({ key: 'eligibility', title: 'Eligibility Criteria', body: form.qualification, rows });
  }

  const feeRows: Record<string, string> = {};
  if (form.feeGeneralObc) feeRows['General / OBC'] = form.feeGeneralObc;
  if (form.feeScSt) feeRows['SC / ST'] = form.feeScSt;
  if (Object.keys(feeRows).length > 0) {
    sections.push({ key: 'fee', title: 'Application Fee', body: '', rows: feeRows });
  }

  if (form.selectionProcess) {
    sections.push({ key: 'selectionProcess', title: 'Selection Process', body: form.selectionProcess });
  }

  sections.push({
    key: 'howToApply',
    title: 'How to Apply',
    body: 'Read the official notification carefully and submit the online application before the last date.',
  });

  return sections;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [inspectNotice, setInspectNotice] = useState<NoticeItem | null>(null);

  const [agencyOptions, setAgencyOptions] = useState<Option[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [form, setForm] = useState<NoticeForm>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal State
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ success: boolean; data: NoticeItem[] }>('/api/v1/admin/notices', { ttlSeconds: 10 });
      if (data.success) {
        setNotices(data.data);
      }
    } catch {
      setFeedback({ message: 'Failed to fetch recruitment notices', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [agenciesRes, categoriesRes] = await Promise.all([
        apiGet<{ success: boolean; data: Option[] }>('/api/v1/agencies', { ttlSeconds: 60 }),
        apiGet<{ success: boolean; data: Option[] }>('/api/v1/categories?all=true', { ttlSeconds: 60 }),
      ]);
      if (agenciesRes.success) setAgencyOptions(agenciesRes.data || []);
      if (categoriesRes.success) setCategoryOptions(categoriesRes.data || []);
    } catch {
      // Options fallback to empty; server will reject invalid ids with a clear message.
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotices();
    fetchOptions();
  }, []);

  const updateForm = <K extends keyof NoticeForm>(key: K, value: NoticeForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreate = () => {
    const next = emptyForm();
    next.sourceDate = today();
    next.verifiedAt = today();
    next.agencyId = agencyOptions[0]?.id || '';
    next.categoryId = categoryOptions[0]?.id || '';
    setEditingNotice(null);
    setForm(next);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setForm({
      titleHi: notice.titleHi || '',
      titleEn: notice.titleEn || '',
      summaryHi: notice.summaryHi || '',
      summaryEn: notice.summaryEn || '',
      agencyId: notice.agencyId || '',
      categoryId: notice.categoryId || '',
      state: notice.state === 'central' ? 'central' : 'rajasthan',
      noticeType: notice.noticeType || 'vacancy',
      status: notice.status || 'active',
      isFeatured: Boolean(notice.isFeatured),
      isBreaking: Boolean(notice.isBreaking),
      expiresAt: dateOnly(notice.expiresAt),
      postsCount: notice.facts?.postsCount?.toString() || '',
      qualification: notice.facts?.qualification || '',
      ageMin: notice.facts?.ageMin?.toString() || '',
      ageMax: notice.facts?.ageMax?.toString() || '',
      applicationStart: dateOnly(notice.facts?.applicationStart),
      applicationEnd: dateOnly(notice.facts?.applicationEnd),
      feeEndDate: dateOnly(notice.facts?.feeEndDate),
      examDate: dateOnly(notice.facts?.examDate),
      feeGeneralObc: notice.facts?.feeGeneralObc || '',
      feeScSt: notice.facts?.feeScSt || '',
      selectionProcess: notice.facts?.selectionProcess || '',
      sourceUrl: notice.facts?.sourceUrl || '',
      sourceDate: dateOnly(notice.facts?.sourceDate) || today(),
      verifiedAt: dateOnly(notice.facts?.verifiedAt) || today(),
      verifiedBy: notice.facts?.verifiedBy || 'Rajasthan Suchna Editorial Board',
      notificationPdfUrl: linkValue(notice.links, 'notificationPdf'),
      applyOnlineUrl: linkValue(notice.links, 'applyOnline'),
      officialSiteUrl: linkValue(notice.links, 'officialSite'),
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.titleEn.trim() && !form.titleHi.trim()) {
      setFormError('Please enter the notice title in English or Hindi.');
      return;
    }
    if (!form.agencyId || !form.categoryId) {
      setFormError('Please select both a recruiting agency and a category.');
      return;
    }

    const links: NoticeLink[] = [];
    if (form.notificationPdfUrl.trim()) {
      links.push({ label: 'Official Notification (PDF)', url: form.notificationPdfUrl.trim(), kind: 'notificationPdf' });
    }
    if (form.applyOnlineUrl.trim()) {
      links.push({ label: 'Apply Online', url: form.applyOnlineUrl.trim(), kind: 'applyOnline' });
    }
    if (form.officialSiteUrl.trim()) {
      links.push({ label: 'Official Website', url: form.officialSiteUrl.trim(), kind: 'officialSite' });
    }

    const facts: NoticeFacts = {
      qualification: form.qualification.trim(),
      selectionProcess: form.selectionProcess.trim(),
      sourceUrl: form.sourceUrl.trim(),
      sourceDate: form.sourceDate || today(),
      verifiedAt: form.verifiedAt || today(),
      verifiedBy: form.verifiedBy.trim() || 'Rajasthan Suchna Editorial Board',
      ...(form.postsCount ? { postsCount: Number(form.postsCount) } : {}),
      ...(form.ageMin ? { ageMin: Number(form.ageMin) } : {}),
      ...(form.ageMax ? { ageMax: Number(form.ageMax) } : {}),
      ...(form.applicationStart ? { applicationStart: form.applicationStart } : {}),
      ...(form.applicationEnd ? { applicationEnd: form.applicationEnd } : {}),
      ...(form.feeEndDate ? { feeEndDate: form.feeEndDate } : {}),
      ...(form.examDate ? { examDate: form.examDate } : {}),
      ...(form.feeGeneralObc ? { feeGeneralObc: form.feeGeneralObc } : {}),
      ...(form.feeScSt ? { feeScSt: form.feeScSt } : {}),
    };

    const payload = {
      titleHi: form.titleHi.trim() || form.titleEn.trim(),
      titleEn: form.titleEn.trim() || form.titleHi.trim(),
      summaryHi: form.summaryHi.trim(),
      summaryEn: form.summaryEn.trim(),
      agencyId: form.agencyId,
      categoryId: form.categoryId,
      state: form.state,
      noticeType: form.noticeType,
      status: form.status,
      isFeatured: form.isFeatured,
      isBreaking: form.isBreaking,
      expiresAt: form.expiresAt || undefined,
      facts,
      links,
      sections: buildSections(form, editingNotice?.sections),
    };

    try {
      setIsSaving(true);
      setFormError(null);
      invalidateClientApiCache('/api/v1/admin/notices');
      const res = await fetch(
        editingNotice ? `/api/v1/admin/notices/${editingNotice.id}` : '/api/v1/admin/notices',
        {
          method: editingNotice ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json', 'x-actor-name': 'Admin' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to save notice.');
        return;
      }
      setFeedback({
        message: editingNotice ? 'Notice updated and live feed refreshed.' : 'Notice created and published to the mobile feed.',
        type: 'success',
      });
      setFormOpen(false);
      fetchNotices();
    } catch {
      setFormError('Network error while saving the notice.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (noticeId: string) => {
    setFeedback(null);
    try {
      invalidateClientApiCache('/api/v1/admin/notices');
      const res = await fetch(`/api/v1/admin/notices/${noticeId}/status`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ message: data.error || 'Failed to update status.', type: 'error' });
      } else {
        setFeedback({ message: data.message || `Notice status updated to ${data.status}.`, type: 'success' });
        fetchNotices();
      }
    } catch {
      setFeedback({ message: 'Network error updating notice status.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!noticeToDelete) return;
    setIsDeleting(true);
    try {
      invalidateClientApiCache('/api/v1/admin/notices');
      const res = await fetch(`/api/v1/admin/notices/${noticeToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: 'Recruitment notice deleted successfully.', type: 'success' });
        setNoticeToDelete(null);
        fetchNotices();
      } else {
        setFeedback({ message: data.error || 'Failed to delete notice.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Network error deleting notice.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredNotices = notices.filter(n => {
    return statusFilter === 'all' || n.status === statusFilter;
  });

  const columns: Column<NoticeItem>[] = [
    {
      header: 'Title & Commission',
      cell: (notice) => (
        <div className="max-w-sm">
          <p className="font-semibold text-slate-900 dark:text-white text-xs">{notice.titleEn || notice.titleHi}</p>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            <span className="inline-block text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
              {notice.agencyName}
            </span>
            <span className="inline-block text-[10px] text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {NOTICE_TYPES.find(t => t.value === notice.noticeType)?.label || notice.noticeType}
            </span>
            {notice.isBreaking && (
              <span className="inline-block text-[10px] text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                BREAKING
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Vacancies',
      cell: (notice) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {notice.facts?.postsCount?.toLocaleString() || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Eligibility',
      cell: (notice) => (
        <span className="text-slate-600 dark:text-slate-300 text-[11px] max-w-xs block truncate">
          {notice.facts?.qualification || 'Not specified'}
        </span>
      ),
    },
    {
      header: 'Deadline',
      cell: (notice) => (
        <FormattedTimestamp value={notice.facts?.applicationEnd || ""} fallback="To be announced" />
      ),
    },
    {
      header: 'Status',
      cell: (notice) => {
        const isActive = notice.status === 'active';
        if (isActive) {
          return (
            <Badge variant="success" className="gap-1.5 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ACTIVE
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="gap-1.5 font-bold text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            INACTIVE
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (notice) => {
        const isActive = notice.status === 'active';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setInspectNotice(notice)}
              title="Inspect JSON Model"
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => openEdit(notice)}
              title="Edit Notice Details"
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {isActive ? (
              <button
                onClick={() => handleToggleStatus(notice.id)}
                className="flex items-center gap-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded transition-colors"
                title="Deactivate notice"
              >
                Deactivate
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus(notice.id)}
                className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-1 rounded transition-colors"
                title="Activate notice"
              >
                <CheckCircle2 className="w-3 h-3" /> Activate
              </button>
            )}

            {isActive && (
              <a
                href={`/api/v1/notices/${notice.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-1"
              >
                Live <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setNoticeToDelete(notice)}
              title="Delete Notice"
              className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          <PageHeader
            eyebrow="Recruitment Management"
            title="All Notices"
            description="Create, edit, activate/deactivate and delete government recruitment notices published to the mobile app."
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#A30B0B] text-white text-xs font-bold hover:bg-[#850909] shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Notice
                </button>
                <button
                  onClick={fetchNotices}
                  title="Refresh notices"
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            }
          />

          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80'
                  : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <span className="font-semibold">{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 font-bold px-2">✕</button>
            </div>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { label: 'All Notices', value: 'all', count: notices.length },
              { label: 'Active', value: 'active', count: notices.filter(n => n.status === 'active').length },
              { label: 'Inactive', value: 'inactive', count: notices.filter(n => n.status === 'inactive').length },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as 'all' | 'active' | 'inactive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  statusFilter === tab.value
                    ? 'bg-[#A30B0B] text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <DataTable
            columns={columns}
            data={filteredNotices}
            isLoading={loading}
            searchKey="titleEn"
            searchPlaceholder="Search notices by recruitment title..."
            pageSize={10}
            emptyTitle="No recruitment notices found"
            emptyDescription={
              statusFilter !== 'all'
                ? `No notices currently in ${statusFilter} status.`
                : 'No recruitment circulars have been registered in the system yet.'
            }
          />
        </main>
      </div>

      <DeleteConfirmationModal
        isOpen={!!noticeToDelete}
        title="Delete Notice"
        description="Are you sure you want to permanently delete this recruitment notice? This will revoke mobile feed availability."
        itemName={noticeToDelete?.titleEn || noticeToDelete?.titleHi}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setNoticeToDelete(null)}
      />

      {/* Create / Edit Notice Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Edit Recruitment Notice' : 'Create Recruitment Notice'}</DialogTitle>
            <DialogDescription>
              Content saved here is published to the Rajasthan Suchna mobile feed.
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
                <input className={inputClass} value={form.titleEn} onChange={(e) => updateForm('titleEn', e.target.value)} placeholder="Rajasthan Patwari Recruitment 2026" />
              </Field>
              <Field label="Title (Hindi) *">
                <input className={inputClass} value={form.titleHi} onChange={(e) => updateForm('titleHi', e.target.value)} placeholder="राजस्थान पटवारी भर्ती 2026" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Summary (English)">
                <textarea rows={3} className={inputClass} value={form.summaryEn} onChange={(e) => updateForm('summaryEn', e.target.value)} />
              </Field>
              <Field label="Summary (Hindi)">
                <textarea rows={3} className={inputClass} value={form.summaryHi} onChange={(e) => updateForm('summaryHi', e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Agency *">
                <select className={inputClass} value={form.agencyId} onChange={(e) => updateForm('agencyId', e.target.value)}>
                  <option value="">Select agency</option>
                  {agencyOptions.map((a) => (
                    <option key={a.id} value={a.id}>{a.nameEn}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category *">
                <select className={inputClass} value={form.categoryId} onChange={(e) => updateForm('categoryId', e.target.value)}>
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameEn}</option>
                  ))}
                </select>
              </Field>
              <Field label="Jurisdiction">
                <select className={inputClass} value={form.state} onChange={(e) => updateForm('state', e.target.value as NoticeForm['state'])}>
                  <option value="rajasthan">Rajasthan</option>
                  <option value="central">Central</option>
                </select>
              </Field>
              <Field label="Notice Type">
                <select className={inputClass} value={form.noticeType} onChange={(e) => updateForm('noticeType', e.target.value)}>
                  {NOTICE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => updateForm('status', e.target.value as NoticeForm['status'])}>
                  <option value="active">Active (live)</option>
                  <option value="inactive">Inactive (hidden)</option>
                </select>
              </Field>
              <Field label="Expires On">
                <input type="date" className={inputClass} value={form.expiresAt} onChange={(e) => updateForm('expiresAt', e.target.value)} />
              </Field>
              <CheckField label="Featured" checked={form.isFeatured} onChange={(v) => updateForm('isFeatured', v)} />
              <CheckField label="Breaking" checked={form.isBreaking} onChange={(v) => updateForm('isBreaking', v)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Total Posts">
                <input type="number" className={inputClass} value={form.postsCount} onChange={(e) => updateForm('postsCount', e.target.value)} placeholder="2998" />
              </Field>
              <Field label="Age Min">
                <input type="number" className={inputClass} value={form.ageMin} onChange={(e) => updateForm('ageMin', e.target.value)} placeholder="18" />
              </Field>
              <Field label="Age Max">
                <input type="number" className={inputClass} value={form.ageMax} onChange={(e) => updateForm('ageMax', e.target.value)} placeholder="40" />
              </Field>
            </div>

            <Field label="Qualification">
              <input className={inputClass} value={form.qualification} onChange={(e) => updateForm('qualification', e.target.value)} placeholder="Graduate / 12th Pass" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Application Start">
                <input type="date" className={inputClass} value={form.applicationStart} onChange={(e) => updateForm('applicationStart', e.target.value)} />
              </Field>
              <Field label="Application Last Date">
                <input type="date" className={inputClass} value={form.applicationEnd} onChange={(e) => updateForm('applicationEnd', e.target.value)} />
              </Field>
              <Field label="Fee Last Date">
                <input type="date" className={inputClass} value={form.feeEndDate} onChange={(e) => updateForm('feeEndDate', e.target.value)} />
              </Field>
              <Field label="Exam Date">
                <input type="date" className={inputClass} value={form.examDate} onChange={(e) => updateForm('examDate', e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Fee - General / OBC">
                <input className={inputClass} value={form.feeGeneralObc} onChange={(e) => updateForm('feeGeneralObc', e.target.value)} placeholder="₹600" />
              </Field>
              <Field label="Fee - SC / ST">
                <input className={inputClass} value={form.feeScSt} onChange={(e) => updateForm('feeScSt', e.target.value)} placeholder="₹400" />
              </Field>
            </div>

            <Field label="Selection Process">
              <input className={inputClass} value={form.selectionProcess} onChange={(e) => updateForm('selectionProcess', e.target.value)} placeholder="Written Exam, Interview & Document Verification" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Official Notification PDF URL">
                <input className={inputClass} value={form.notificationPdfUrl} onChange={(e) => updateForm('notificationPdfUrl', e.target.value)} placeholder="https://..." />
              </Field>
              <Field label="Apply Online URL">
                <input className={inputClass} value={form.applyOnlineUrl} onChange={(e) => updateForm('applyOnlineUrl', e.target.value)} placeholder="https://..." />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Official Website URL">
                <input className={inputClass} value={form.officialSiteUrl} onChange={(e) => updateForm('officialSiteUrl', e.target.value)} placeholder="https://..." />
              </Field>
              <Field label="Source URL (used for AI citations)">
                <input className={inputClass} value={form.sourceUrl} onChange={(e) => updateForm('sourceUrl', e.target.value)} placeholder="https://..." />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Source Date">
                <input type="date" className={inputClass} value={form.sourceDate} onChange={(e) => updateForm('sourceDate', e.target.value)} />
              </Field>
              <Field label="Verified On">
                <input type="date" className={inputClass} value={form.verifiedAt} onChange={(e) => updateForm('verifiedAt', e.target.value)} />
              </Field>
              <Field label="Verified By">
                <input className={inputClass} value={form.verifiedBy} onChange={(e) => updateForm('verifiedBy', e.target.value)} />
              </Field>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingNotice ? 'Save Changes' : 'Create & Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspect Notice Modal */}
      <Dialog open={!!inspectNotice} onOpenChange={(open) => { if (!open) setInspectNotice(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flutter Mobile Feed Notice</DialogTitle>
            <DialogDescription>
              Parsed JSON payload transmitted to Rajasthan Suchna client
            </DialogDescription>
          </DialogHeader>

          <pre className="bg-slate-900 p-4 rounded-xl text-[11px] font-mono text-amber-400 dark:text-amber-300 overflow-x-auto max-h-96 border border-slate-800">
            {JSON.stringify(inspectNotice, null, 2)}
          </pre>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInspectNotice(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#A30B0B]';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer h-[38px] self-end">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[#A30B0B]" />
      {label}
    </label>
  );
}
