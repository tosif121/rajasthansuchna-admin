"use client";

import { apiGet, invalidateClientApiCache } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import {
  PageHeader,
  StatCard,
  DataTable,
  Column,
  DeleteConfirmationModal,
  FormattedTimestamp,
  DatePicker,
} from '@/components/reusable';
import {
  CheckCircle2,
  Pencil,
  RefreshCw,
  AlertCircle,
  Trash2,
  Plus,
  Globe,
  Clock,
  Building,
  FileText,
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
  feePh?: string;
  qualification: string;
  ageMin?: number;
  ageMax?: number;
  ageAsOnDate?: string;
  ageRelaxation?: string;
  categoryVacancies?: Record<string, string | number>;
  howToApply?: string;
  howToDownloadAdmitCard?: string;
  howToCheckResult?: string;
  telegramUrl?: string;
  whatsappUrl?: string;
  syllabusUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;
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
  feePh: string;
  selectionProcess: string;
  howToApply?: string;
  howToDownloadAdmitCard?: string;
  howToCheckResult?: string;
  sourceUrl: string;
  sourceDate: string;
  verifiedAt: string;
  verifiedBy: string;
  ageAsOnDate: string;
  ageRelaxation: string;
  categoryVacancies: string;
  telegramUrl: string;
  whatsappUrl: string;
  syllabusUrl: string;
  faqs: string;
  notificationPdfUrl: string;
  applyOnlineUrl: string;
  officialSiteUrl: string;
}

const DEFAULT_JURISDICTIONS: Option[] = [
  { id: 'rajasthan', nameEn: 'Rajasthan', nameHi: 'राजस्थान' },
  { id: 'central', nameEn: 'Central', nameHi: 'केन्द्र' },
];

const DEFAULT_NOTICE_TYPES: Option[] = [
  { id: 'vacancy', nameEn: 'Vacancy', nameHi: 'भर्ती विज्ञप्ति' },
  { id: 'admitCard', nameEn: 'Admit Card', nameHi: 'प्रवेश पत्र' },
  { id: 'result', nameEn: 'Result', nameHi: 'परीक्षा परिणाम' },
  { id: 'answerKey', nameEn: 'Answer Key', nameHi: 'उत्तर कुंजी' },
  { id: 'scheme', nameEn: 'Government Scheme', nameHi: 'सरकारी योजना' },
  { id: 'current_affairs', nameEn: 'Current Affairs & Schemes', nameHi: 'करंट अफेयर्स व योजनाएं' },
  { id: 'calendar', nameEn: 'Exam Calendar', nameHi: 'परीक्षा कैलेंडर' },
  { id: 'career_guide', nameEn: 'Career Guide & Rules', nameHi: 'करियर गाइड व नियम' },
  { id: 'pyq', nameEn: 'Previous Year Papers (PYQ)', nameHi: 'पूर्व वर्ष प्रश्न पत्र' },
  { id: 'syllabus', nameEn: 'Syllabus & Exam Pattern', nameHi: 'पाठ्यक्रम व परीक्षा पैटर्न' },
];

const today = () => new Date().toISOString().split('T')[0];

function parseCategoryVacancies(str?: string): Record<string, string> | undefined {
  if (!str || !str.trim()) return undefined;
  try {
    if (str.trim().startsWith('{')) return JSON.parse(str.trim());
  } catch {}
  const result: Record<string, string> = {};
  const parts = str.split(/[,\n]+/);
  for (const p of parts) {
    const [k, v] = p.split(/[:=-]+/);
    if (k && v) {
      result[k.trim()] = v.trim();
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function parseFaqs(str?: string): Array<{ question: string; answer: string }> | undefined {
  if (!str || !str.trim()) return undefined;
  try {
    if (str.trim().startsWith('[')) return JSON.parse(str.trim());
  } catch {}
  const items: Array<{ question: string; answer: string }> = [];
  const blocks = str.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    let q = '';
    let a = '';
    for (const line of lines) {
      if (/^(Q|प्रश्न)[:.-]?\s*/i.test(line)) {
        q = line.replace(/^(Q|प्रश्न)[:.-]?\s*/i, '');
      } else if (/^(A|उत्तर)[:.-]?\s*/i.test(line)) {
        a = line.replace(/^(A|उत्तर)[:.-]?\s*/i, '');
      } else if (!q) {
        q = line;
      } else {
        a = a ? `${a} ${line}` : line;
      }
    }
    if (q && a) items.push({ question: q, answer: a });
  }
  return items.length > 0 ? items : undefined;
}

function formatCategoryVacancies(obj?: Record<string, any>): string {
  if (!obj) return '';
  return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
}

function formatFaqs(faqs?: Array<{ question: string; answer: string }>): string {
  if (!faqs || faqs.length === 0) return '';
  return faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
}

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
  ageAsOnDate: '01/01/2026',
  ageRelaxation: 'राज्य सरकार के नियमानुसार आरक्षित वर्गों (SC/ST/OBC/MBC/EWS) एवं महिला अभ्यर्थियों को अधिकतम आयु सीमा में 5 से 10 वर्ष की छूट देय होगी।',
  categoryVacancies: '',
  telegramUrl: 'https://t.me/Raj_Suchna',
  whatsappUrl: 'https://whatsapp.com/channel/0029Vakea9U89inpSSjnR82N',
  syllabusUrl: '',
  faqs: '',
  applicationStart: '',
  applicationEnd: '',
  feeEndDate: '',
  examDate: '',
  feeGeneralObc: '',
  feeScSt: '',
  feePh: '',
  selectionProcess: '',
  howToApply: '',
  howToDownloadAdmitCard: '',
  howToCheckResult: '',
  sourceUrl: '',
  sourceDate: '',
  verifiedAt: '',
  verifiedBy: 'Raj Suchna Editorial Board',
  notificationPdfUrl: '',
  applyOnlineUrl: '',
  officialSiteUrl: '',
});

const dateOnly = (value?: string) => (value ? value.split('T')[0] : '');

function linkValue(links: NoticeLink[] | undefined, kind: string): string {
  return links?.find((l) => l.kind === kind)?.url || '';
}

const truncateText = (text: string, limit: number): string => {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

function defaultHowToApply(noticeType: string): string {
  if (noticeType === 'admitCard') {
    return '1. संबंधित भर्ती बोर्ड अथवा आयोग के आधिकारिक पोर्टल पर जाएं।\n2. प्रवेश पत्र (एडमिट कार्ड) डाउनलोड लिंक पर क्लिक करें।\n3. अपना आवेदन क्रमांक एवं जन्मतिथि दर्ज करें।\n4. स्क्रीन पर प्रदर्शित प्रवेश पत्र डाउनलोड कर प्रिंट निकालें।';
  }
  if (noticeType === 'result') {
    return '1. आधिकारिक पोर्टल के परिणाम अनुभाग में जाएं।\n2. संबंधित भर्ती परिणाम व चयन सूची (पीडीएफ) पर क्लिक करें।\n3. सूची में अपना रोल नंबर खोजें।\n4. कट-ऑफ अंक व चयन स्थिति की जांच करें।';
  }
  if (noticeType === 'syllabus') {
    return '1. आधिकारिक वेबसाइट के पाठ्यक्रम अनुभाग में जाएं।\n2. संबंधित परीक्षा योजना एवं पाठ्यक्रम लिंक पर क्लिक करें।\n3. विस्तृत विषयवार पाठ्यक्रम व अंक विभाजन डाउनलोड कर सुरक्षित रखें।';
  }
  if (noticeType === 'answerKey') {
    return '1. आयोग अथवा चयन बोर्ड के उत्तर कुंजी पोर्टल पर जाएं।\n2. संबंधित प्रश्न पत्र व मास्टर उत्तर कुंजी डाउनलोड करें।\n3. अपने उत्तरों का मिलान करें और निर्धारित तिथि तक पोर्टल से ऑनलाइन आपत्ति दर्ज करें।';
  }
  // Default recruitment vacancy
  return '1. राजस्थान एसएसओ पोर्टल (sso.rajasthan.gov.in) अथवा आधिकारिक वेबसाइट पर लॉगिन करें।\n2. भर्ती पोर्टल का चयन करें एवं अपनी ओटीआर प्रोफाइल जांचें।\n3. चालू भर्तियों में संबंधित पद के ऑनलाइन आवेदन लिंक पर क्लिक करें।\n4. अपनी शैक्षणिक योग्यता, व्यक्तिगत विवरण व फोटो-हस्ताक्षर अपलोड करें।\n5. निर्धारित आवेदन शुल्क का भुगतान कर अंतिम रूप से फॉर्म सबमिट करें।\n6. आवेदन पूर्ण होने के बाद पुष्टिकरण रसीद (कन्फर्मेशन पेज) का प्रिंट सुरक्षित रखें।';
}

function buildSections(form: NoticeForm, existing?: NoticeSection[]): NoticeSection[] {
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
  if (form.feePh) feeRows['PH / Divyang'] = form.feePh;
  if (Object.keys(feeRows).length > 0) {
    sections.push({ key: 'fee', title: 'Application Fee', body: '', rows: feeRows });
  }

  if (form.selectionProcess) {
    sections.push({ key: 'selectionProcess', title: 'Selection Process', body: form.selectionProcess });
  }

  if (form.howToApply?.trim()) {
    sections.push({
      key: 'howToApply',
      title: 'How to Apply / आवेदन कैसे करें',
      body: form.howToApply.trim(),
    });
  }

  if (form.howToDownloadAdmitCard?.trim()) {
    sections.push({
      key: 'howToDownloadAdmitCard',
      title: 'How to Download Admit Card / एडमिट कार्ड कैसे डाउनलोड करें',
      body: form.howToDownloadAdmitCard.trim(),
    });
  }

  if (form.howToCheckResult?.trim()) {
    sections.push({
      key: 'howToCheckResult',
      title: 'How to Check Result / रिजल्ट कैसे चेक करें',
      body: form.howToCheckResult.trim(),
    });
  }

  // Preserve any custom sections from existing that aren't the standard keys
  if (existing) {
    const standardKeys = new Set(['overview', 'importantDates', 'eligibility', 'fee', 'selectionProcess', 'howToApply', 'howToDownloadAdmitCard', 'howToCheckResult']);
    for (const s of existing) {
      if (!standardKeys.has(s.key)) {
        sections.push(s);
      }
    }
  }

  return sections;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [agencyOptions, setAgencyOptions] = useState<Option[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [jurisdictionOptions, setJurisdictionOptions] = useState<Option[]>([]);
  const [noticeTypeOptions, setNoticeTypeOptions] = useState<Option[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [form, setForm] = useState<NoticeForm>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal State
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotices = async (forceFresh: boolean = false) => {
    try {
      setLoading(true);
      let list: NoticeItem[] = [];
      try {
        if (forceFresh) {
          invalidateClientApiCache('/api/v1/admin/notices');
        }
        const endpoint = forceFresh ? `/api/v1/admin/notices?_t=${Date.now()}` : '/api/v1/admin/notices';
        const data = await apiGet<{ success: boolean; data: NoticeItem[] }>(endpoint, {
          ttlSeconds: forceFresh ? 0 : 5,
          skipCache: forceFresh,
        });
        if (data.success && Array.isArray(data.data)) {
          list = data.data;
        }
      } catch {
        // Fall back to public endpoint
      }

      if (list.length === 0) {
        const publicRes = await fetch(`/api/v1/notices?limit=100&_t=${Date.now()}`, { cache: 'no-store' })
          .then((r) => r.json())
          .catch(() => null);
        const sourceList = publicRes?.data || publicRes?.vacancies;
        if (publicRes?.success && Array.isArray(sourceList)) {
          list = sourceList.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            titleHi: item.titleHi || '',
            titleEn: item.titleEn || '',
            agencyId: item.agencyId || '',
            agencyName: item.agencyName || (item.agencyId || '').toUpperCase(),
            categoryId: item.categoryId || '',
            categoryName: item.categoryName || item.categoryId || '',
            state: item.state === 'central' ? 'central' : 'rajasthan',
            noticeType: item.noticeType || item.type || 'vacancy',
            status: item.status === 'inactive' ? 'inactive' : 'active',
            revisionNumber: item.revisionNumber || 1,
            summaryHi: item.summaryHi || '',
            summaryEn: item.summaryEn || '',
            editorId: 'admin',
            editorName: 'Administrator',
            publishedAt: item.publishedAt,
            expiresAt: item.expiresAt,
            isFeatured: Boolean(item.isFeatured),
            isBreaking: Boolean(item.isBreaking),
            updatedAt: item.updatedAt || new Date().toISOString(),
            facts: item.facts || {
              qualification: 'Graduate / 12th Pass',
              selectionProcess: 'Written Exam',
              sourceUrl: 'https://rajasthan.gov.in',
              sourceDate: today(),
              verifiedAt: today(),
              verifiedBy: 'Raj Suchna',
            },
            sections: item.sections || [],
            links: item.links || [],
          }));
        }
      }

      setNotices(list);
    } catch {
      setFeedback({ message: 'Failed to fetch recruitment notices', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [agenciesRes, categoriesRes, jurRes, typesRes] = await Promise.all([
        apiGet<{ success: boolean; data: Option[] }>('/api/v1/agencies', { ttlSeconds: 60 }),
        apiGet<{ success: boolean; data: Option[] }>('/api/v1/categories?all=true', { ttlSeconds: 60 }),
        apiGet<{ success: boolean; data: Option[] }>('/api/v1/jurisdictions', { ttlSeconds: 60 }),
        apiGet<{ success: boolean; data: Option[] }>('/api/v1/notice-types', { ttlSeconds: 60 }),
      ]);
      if (agenciesRes.success && Array.isArray(agenciesRes.data)) setAgencyOptions(agenciesRes.data);
      if (categoriesRes.success && Array.isArray(categoriesRes.data)) setCategoryOptions(categoriesRes.data);
      if (jurRes?.success && Array.isArray(jurRes.data)) setJurisdictionOptions(jurRes.data);
      if (typesRes?.success && Array.isArray(typesRes.data)) setNoticeTypeOptions(typesRes.data);
    } catch {
      // Options fallback to defaults
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
      ageAsOnDate: notice.facts?.ageAsOnDate || '01/01/2026',
      ageRelaxation: notice.facts?.ageRelaxation || 'राज्य सरकार के नियमानुसार आरक्षित वर्गों (SC/ST/OBC/MBC/EWS) एवं महिला अभ्यर्थियों को अधिकतम आयु सीमा में 5 से 10 वर्ष की छूट देय होगी।',
      categoryVacancies: formatCategoryVacancies(notice.facts?.categoryVacancies),
      telegramUrl: notice.facts?.telegramUrl || linkValue(notice.links, 'telegram') || 'https://t.me/Raj_Suchna',
      whatsappUrl: notice.facts?.whatsappUrl || linkValue(notice.links, 'whatsapp') || 'https://whatsapp.com/channel/0029Vakea9U89inpSSjnR82N',
      syllabusUrl: notice.facts?.syllabusUrl || linkValue(notice.links, 'syllabus'),
      faqs: formatFaqs(notice.facts?.faqs),
      applicationStart: dateOnly(notice.facts?.applicationStart),
      applicationEnd: dateOnly(notice.facts?.applicationEnd),
      feeEndDate: dateOnly(notice.facts?.feeEndDate),
      examDate: dateOnly(notice.facts?.examDate),
      feeGeneralObc: notice.facts?.feeGeneralObc || '',
      feeScSt: notice.facts?.feeScSt || '',
      feePh: notice.facts?.feePh || (notice.sections?.find((s) => s.key === 'fee')?.rows?.['PH / Divyang'] || notice.sections?.find((s) => s.key === 'fee')?.rows?.['PH'] || ''),
      selectionProcess: notice.facts?.selectionProcess || '',
      howToApply: notice.facts?.howToApply || notice.sections?.find((s) => s.key === 'howToApply')?.body || '',
      howToDownloadAdmitCard: notice.facts?.howToDownloadAdmitCard || notice.sections?.find((s) => s.key === 'howToDownloadAdmitCard')?.body || '',
      howToCheckResult: notice.facts?.howToCheckResult || notice.sections?.find((s) => s.key === 'howToCheckResult')?.body || '',
      sourceUrl: notice.facts?.sourceUrl || '',
      sourceDate: dateOnly(notice.facts?.sourceDate) || today(),
      verifiedAt: dateOnly(notice.facts?.verifiedAt) || today(),
      verifiedBy: notice.facts?.verifiedBy || 'Raj Suchna Editorial Board',
      notificationPdfUrl: linkValue(notice.links, 'notificationPdf'),
      applyOnlineUrl: linkValue(notice.links, 'applyOnline'),
      officialSiteUrl: linkValue(notice.links, 'officialSite'),
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    const defaultTitleEn = form.titleEn.trim() || form.titleHi.trim() || 'New Recruitment Notice';
    const defaultTitleHi = form.titleHi.trim() || form.titleEn.trim() || 'नई भर्ती अधिसूचना';
    const defaultAgency = form.agencyId || (agencyOptions[0]?.id ?? 'rpsc');
    const defaultCategory = form.categoryId || (categoryOptions[0]?.id ?? 'general');

    const links: NoticeLink[] = [];
    if (form.notificationPdfUrl.trim()) {
      links.push({ label: 'Official Notification (PDF)', url: form.notificationPdfUrl.trim(), kind: 'notificationPdf' });
    }
    if (form.applyOnlineUrl.trim()) {
      links.push({ label: 'Apply Online', url: form.applyOnlineUrl.trim(), kind: 'applyOnline' });
    }
    if (form.syllabusUrl.trim()) {
      links.push({ label: 'Download Syllabus (PDF)', url: form.syllabusUrl.trim(), kind: 'syllabus' });
    }
    if (form.officialSiteUrl.trim()) {
      links.push({ label: 'Official Website', url: form.officialSiteUrl.trim(), kind: 'officialSite' });
    }
    if (form.telegramUrl.trim()) {
      links.push({ label: 'Join Telegram Channel', url: form.telegramUrl.trim(), kind: 'telegram' });
    }
    if (form.whatsappUrl.trim()) {
      links.push({ label: 'Join WhatsApp Channel', url: form.whatsappUrl.trim(), kind: 'whatsapp' });
    }

    const categoryVacancies = parseCategoryVacancies(form.categoryVacancies);
    const faqs = parseFaqs(form.faqs);

    const facts: NoticeFacts = {
      qualification: form.qualification.trim(),
      selectionProcess: form.selectionProcess.trim(),
      sourceUrl: form.sourceUrl.trim(),
      sourceDate: form.sourceDate || today(),
      verifiedAt: form.verifiedAt || today(),
      verifiedBy: form.verifiedBy.trim() || 'Raj Suchna Editorial Board',
      ...(form.ageAsOnDate ? { ageAsOnDate: form.ageAsOnDate.trim() } : {}),
      ...(form.ageRelaxation ? { ageRelaxation: form.ageRelaxation.trim() } : {}),
      ...(categoryVacancies ? { categoryVacancies } : {}),
      ...(form.telegramUrl ? { telegramUrl: form.telegramUrl.trim() } : {}),
      ...(form.whatsappUrl ? { whatsappUrl: form.whatsappUrl.trim() } : {}),
      ...(form.syllabusUrl ? { syllabusUrl: form.syllabusUrl.trim() } : {}),
      ...(faqs ? { faqs } : {}),
      ...(form.postsCount ? { postsCount: Number(form.postsCount) } : {}),
      ...(form.ageMin ? { ageMin: Number(form.ageMin) } : {}),
      ...(form.ageMax ? { ageMax: Number(form.ageMax) } : {}),
      ...(form.applicationStart ? { applicationStart: form.applicationStart } : {}),
      ...(form.applicationEnd ? { applicationEnd: form.applicationEnd } : {}),
      ...(form.feeEndDate ? { feeEndDate: form.feeEndDate } : {}),
      ...(form.examDate ? { examDate: form.examDate } : {}),
      ...(form.feeGeneralObc ? { feeGeneralObc: form.feeGeneralObc } : {}),
      ...(form.feeScSt ? { feeScSt: form.feeScSt } : {}),
      ...(form.feePh ? { feePh: form.feePh } : {}),
      ...(form.howToApply ? { howToApply: form.howToApply.trim() } : {}),
      ...(form.howToDownloadAdmitCard ? { howToDownloadAdmitCard: form.howToDownloadAdmitCard.trim() } : {}),
      ...(form.howToCheckResult ? { howToCheckResult: form.howToCheckResult.trim() } : {}),
    };

    const payload = {
      titleHi: defaultTitleHi,
      titleEn: defaultTitleEn,
      summaryHi: form.summaryHi.trim(),
      summaryEn: form.summaryEn.trim(),
      agencyId: defaultAgency,
      categoryId: defaultCategory,
      state: form.state || 'rajasthan',
      noticeType: form.noticeType || 'vacancy',
      status: form.status || 'active',
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
      await fetchNotices(true);
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
        await fetchNotices(true);
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
        await fetchNotices(true);
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
      cell: (notice) => {
        const fullTitle = notice.titleEn && notice.titleHi && notice.titleEn !== notice.titleHi
          ? `${notice.titleEn} (${notice.titleHi})`
          : (notice.titleEn || notice.titleHi || '');
        const titleText = notice.titleEn || notice.titleHi || '';
        const displayTitle = truncateText(titleText, 45);

        const fullAgency = notice.agencyName || '';
        const displayAgency = truncateText(fullAgency, 20);

        return (
          <div className="max-w-sm">
            <p 
              className="font-semibold text-slate-900 dark:text-white text-xs cursor-default hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title={fullTitle}
            >
              {displayTitle}
            </p>
            <div className="flex flex-wrap items-center gap-1 mt-1">
              <span 
                className="inline-block text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 cursor-default hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                title={fullAgency}
              >
                {displayAgency}
              </span>
              <span className="inline-block text-[10px] text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {noticeTypeOptions.find((t) => t.id === notice.noticeType)?.nameEn ||
                  DEFAULT_NOTICE_TYPES.find((t) => t.id === notice.noticeType)?.nameEn ||
                  notice.noticeType}
              </span>
              {notice.isBreaking && (
                <span className="inline-block text-[10px] text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                  BREAKING
                </span>
              )}
            </div>
          </div>
        );
      },
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
        return (
          <button
            type="button"
            onClick={() => handleToggleStatus(notice.id)}
            title={isActive ? "Click to deactivate" : "Click to activate"}
            className="group cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#A30B0B] rounded-md transition-transform active:scale-95"
          >
            {isActive ? (
              <Badge variant="success" className="gap-1.5 font-bold text-[10px] cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5 font-bold text-[10px] cursor-pointer bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                INACTIVE
              </Badge>
            )}
          </button>
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
              onClick={() => openEdit(notice)}
              title="Edit Notice Details"
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

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
                  onClick={() => fetchNotices(true)}
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

          {/* Quick Metrics & Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Notices"
              value={notices.length}
              description="All circulars in system"
              icon={<FileText className="w-4 h-4 text-[#A30B0B] dark:text-red-400" />}
              borderColor="border-l-[#A30B0B]"
            />
            <StatCard
              title="Active Circulars"
              value={notices.filter(n => n.status === 'active').length}
              description="Live in Flutter App Feed"
              icon={<Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              borderColor="border-l-emerald-500"
            />
            <StatCard
              title="Inactive Circulars"
              value={notices.filter(n => n.status === 'inactive').length}
              description="Drafts & Retracted"
              icon={<Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
              borderColor="border-l-slate-400"
            />
            <StatCard
              title="Commissions / Agencies"
              value={new Set(notices.map(n => n.agencyId || n.agencyName)).size}
              description="RPSC, RSSB, SSC, etc."
              icon={<Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              borderColor="border-l-amber-500"
            />
          </div>

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
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Edit Recruitment Notice' : 'Create Recruitment Notice'}</DialogTitle>
            <DialogDescription>
              Content saved here is published to the Raj Suchna mobile feed.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Title (English) *">
                <Textarea
                  rows={2}
                  value={form.titleEn}
                  onChange={(e) => updateForm('titleEn', e.target.value)}
                  placeholder="Rajasthan Patwari Recruitment 2026"
                />
              </FormField>
              <FormField label="Title (Hindi) *">
                <Textarea
                  rows={2}
                  value={form.titleHi}
                  onChange={(e) => updateForm('titleHi', e.target.value)}
                  placeholder="राजस्थान पटवारी भर्ती 2026"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Summary (English)">
                <Textarea
                  rows={3}
                  value={form.summaryEn}
                  onChange={(e) => updateForm('summaryEn', e.target.value)}
                  placeholder="Brief recruitment summary in English..."
                />
              </FormField>
              <FormField label="Summary (Hindi)">
                <Textarea
                  rows={3}
                  value={form.summaryHi}
                  onChange={(e) => updateForm('summaryHi', e.target.value)}
                  placeholder="संक्षिप्त विवरण हिन्दी में..."
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormField label="Agency *">
                <Select value={form.agencyId} onValueChange={(val) => updateForm('agencyId', val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencyOptions.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Category *">
                <Select value={form.categoryId} onValueChange={(val) => updateForm('categoryId', val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Jurisdiction">
                <Select value={form.state} onValueChange={(val) => updateForm('state', val as NoticeForm['state'])}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {(jurisdictionOptions.length > 0 ? jurisdictionOptions : DEFAULT_JURISDICTIONS).map((j) => (
                      <SelectItem key={j.id} value={j.id}>{j.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Notice Type">
                <Select value={form.noticeType} onValueChange={(val) => updateForm('noticeType', val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Notice type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(noticeTypeOptions.length > 0 ? noticeTypeOptions : DEFAULT_NOTICE_TYPES).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormField label="Status">
                <Select value={form.status} onValueChange={(val) => updateForm('status', val as NoticeForm['status'])}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (live)</SelectItem>
                    <SelectItem value="inactive">Inactive (hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Expires On">
                <DatePicker
                  date={form.expiresAt}
                  onChange={(val) => updateForm('expiresAt', val)}
                  placeholder="Select expiry date"
                />
              </FormField>
              <FormCheckbox label="Featured" checked={form.isFeatured} onChange={(v) => updateForm('isFeatured', v)} />
              <FormCheckbox label="Breaking" checked={form.isBreaking} onChange={(v) => updateForm('isBreaking', v)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Total Posts">
                <Textarea
                  rows={1}
                  value={form.postsCount}
                  onChange={(e) => updateForm('postsCount', e.target.value)}
                  placeholder="e.g. 2998"
                />
              </FormField>
              <FormField label="Age Min">
                <Textarea
                  rows={1}
                  value={form.ageMin}
                  onChange={(e) => updateForm('ageMin', e.target.value)}
                  placeholder="18"
                />
              </FormField>
              <FormField label="Age Max">
                <Textarea
                  rows={1}
                  value={form.ageMax}
                  onChange={(e) => updateForm('ageMax', e.target.value)}
                  placeholder="40"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Age Calculation Date (आयु गणना आधार तिथि)" hint="e.g. 01/01/2026">
                <Textarea
                  rows={1}
                  value={form.ageAsOnDate}
                  onChange={(e) => updateForm('ageAsOnDate', e.target.value)}
                  placeholder="01/01/2026"
                />
              </FormField>
              <FormField label="Age Relaxation (आयु सीमा में छूट)">
                <Textarea
                  rows={2}
                  value={form.ageRelaxation}
                  onChange={(e) => updateForm('ageRelaxation', e.target.value)}
                  placeholder="SC/ST/OBC/MBC/EWS को नियमानुसार 5 से 10 वर्ष की छूट देय होगी।"
                />
              </FormField>
            </div>

            <FormField 
              label="Category-Wise Vacancies (वर्गवार रिक्तियों का विवरण)"
              hint="Format: UR: 450, EWS: 105, OBC: 210, MBC: 52, SC: 168, ST: 135"
            >
              <Textarea
                rows={2}
                value={form.categoryVacancies}
                onChange={(e) => updateForm('categoryVacancies', e.target.value)}
                placeholder="UR: 450, EWS: 105, OBC: 210, MBC: 52, SC: 168, ST: 135"
              />
            </FormField>

            <FormField label="Qualification *">
              <Textarea
                rows={2}
                value={form.qualification}
                onChange={(e) => updateForm('qualification', e.target.value)}
                placeholder="Graduate / 12th Pass with RSCIT Diploma"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormField label="Application Start">
                <DatePicker
                  date={form.applicationStart}
                  onChange={(val) => updateForm('applicationStart', val)}
                  placeholder="Application start date"
                />
              </FormField>
              <FormField label="Application Last Date">
                <DatePicker
                  date={form.applicationEnd}
                  onChange={(val) => updateForm('applicationEnd', val)}
                  placeholder="Application end date"
                />
              </FormField>
              <FormField label="Fee Last Date">
                <DatePicker
                  date={form.feeEndDate}
                  onChange={(val) => updateForm('feeEndDate', val)}
                  placeholder="Fee last date"
                />
              </FormField>
              <FormField label="Exam Date">
                <DatePicker
                  date={form.examDate}
                  onChange={(val) => updateForm('examDate', val)}
                  placeholder="Exam date"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Fee - General / OBC">
                <Textarea
                  rows={2}
                  value={form.feeGeneralObc}
                  onChange={(e) => updateForm('feeGeneralObc', e.target.value)}
                  placeholder="₹600 (General / OBC / EWS)"
                />
              </FormField>
              <FormField label="Fee - SC / ST">
                <Textarea
                  rows={2}
                  value={form.feeScSt}
                  onChange={(e) => updateForm('feeScSt', e.target.value)}
                  placeholder="₹400 (SC / ST / Women)"
                />
              </FormField>
              <FormField label="Fee - PH Category">
                <Textarea
                  rows={2}
                  value={form.feePh}
                  onChange={(e) => updateForm('feePh', e.target.value)}
                  placeholder="₹0 / ₹250 (PH / Divyang / Nil)"
                />
              </FormField>
            </div>

            <FormField label="Selection Process">
              <Textarea
                rows={2}
                value={form.selectionProcess}
                onChange={(e) => updateForm('selectionProcess', e.target.value)}
                placeholder="Written Exam, Interview & Document Verification"
              />
            </FormField>

            <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Step-by-Step Candidate Guides (How to Apply, Admit Card & Results)
                </span>
                <span className="text-[11px] text-slate-400">
                  (Only filled guides appear in the app; blank ones are hidden)
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>1. How to Apply / आवेदन प्रक्रिया</Label>
                  <button
                    type="button"
                    onClick={() => updateForm('howToApply', defaultHowToApply('vacancy'))}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    + Insert Standard Steps
                  </button>
                </div>
                <Textarea
                  rows={3}
                  value={form.howToApply}
                  onChange={(e) => updateForm('howToApply', e.target.value)}
                  placeholder="Leave empty if not available yet. Or click '+ Insert Standard Steps' above."
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>2. How to Download Admit Card / प्रवेश पत्र डाउनलोड प्रक्रिया</Label>
                  <button
                    type="button"
                    onClick={() => updateForm('howToDownloadAdmitCard', defaultHowToApply('admitCard'))}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    + Insert Standard Steps
                  </button>
                </div>
                <Textarea
                  rows={3}
                  value={form.howToDownloadAdmitCard}
                  onChange={(e) => updateForm('howToDownloadAdmitCard', e.target.value)}
                  placeholder="Leave empty if admit card is not yet released. Or click '+ Insert Standard Steps'."
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>3. How to Check Result / रिजल्ट चेक करने की प्रक्रिया</Label>
                  <button
                    type="button"
                    onClick={() => updateForm('howToCheckResult', defaultHowToApply('result'))}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    + Insert Standard Steps
                  </button>
                </div>
                <Textarea
                  rows={3}
                  value={form.howToCheckResult}
                  onChange={(e) => updateForm('howToCheckResult', e.target.value)}
                  placeholder="Leave empty if result is not yet declared. Or click '+ Insert Standard Steps'."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Official Notification PDF URL">
                <Textarea
                  rows={2}
                  value={form.notificationPdfUrl}
                  onChange={(e) => updateForm('notificationPdfUrl', e.target.value)}
                  placeholder="https://..."
                />
              </FormField>
              <FormField label="Apply Online URL">
                <Textarea
                  rows={2}
                  value={form.applyOnlineUrl}
                  onChange={(e) => updateForm('applyOnlineUrl', e.target.value)}
                  placeholder="https://..."
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Official Website URL">
                <Textarea
                  rows={2}
                  value={form.officialSiteUrl}
                  onChange={(e) => updateForm('officialSiteUrl', e.target.value)}
                  placeholder="https://..."
                />
              </FormField>
              <FormField label="Syllabus PDF URL (पाठ्यक्रम लिंक)">
                <Textarea
                  rows={2}
                  value={form.syllabusUrl}
                  onChange={(e) => updateForm('syllabusUrl', e.target.value)}
                  placeholder="https://..."
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Telegram Channel / Group URL">
                <Textarea
                  rows={2}
                  value={form.telegramUrl}
                  onChange={(e) => updateForm('telegramUrl', e.target.value)}
                  placeholder="https://t.me/Raj_Suchna"
                />
              </FormField>
              <FormField label="WhatsApp Community / Channel URL">
                <Textarea
                  rows={2}
                  value={form.whatsappUrl}
                  onChange={(e) => updateForm('whatsappUrl', e.target.value)}
                  placeholder="https://whatsapp.com/channel/0029Vakea9U89inpSSjnR82N"
                />
              </FormField>
            </div>

            <FormField 
              label="FAQs / अक्सर पूछे जाने वाले प्रश्न (Candidate Doubts)"
              hint="Format: Q: प्रश्न? \n A: उत्तर।"
            >
              <Textarea
                rows={4}
                value={form.faqs}
                onChange={(e) => updateForm('faqs', e.target.value)}
                placeholder="Q: क्या ओटीआर अनिवार्य है?&#10;A: हाँ, राजस्थान की सभी राज्यस्तरीय भर्तियों के लिए ओटीआर अनिवार्य है।&#10;&#10;Q: आयु सीमा में कितनी छूट मिलेगी?&#10;A: नियमानुसार आरक्षित वर्गों को 5 से 10 वर्ष की छूट देय होगी।"
              />
            </FormField>

            <FormField label="Source URL (used for AI citations)">
              <Textarea
                rows={2}
                value={form.sourceUrl}
                onChange={(e) => updateForm('sourceUrl', e.target.value)}
                placeholder="https://..."
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Source Date">
                <DatePicker
                  date={form.sourceDate}
                  onChange={(val) => updateForm('sourceDate', val)}
                  placeholder="Source date"
                />
              </FormField>
              <FormField label="Verified On">
                <DatePicker
                  date={form.verifiedAt}
                  onChange={(val) => updateForm('verifiedAt', val)}
                  placeholder="Verified date"
                />
              </FormField>
              <FormField label="Verified By">
                <Textarea
                  rows={1}
                  value={form.verifiedBy}
                  onChange={(e) => updateForm('verifiedBy', e.target.value)}
                  placeholder="Raj Suchna Editorial Board"
                />
              </FormField>
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

    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0">
          {label}
        </Label>
        {hint && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function FormCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-input bg-background text-xs font-semibold text-foreground h-9 self-end">
      <Checkbox
        id={`notice-check-${label.toLowerCase()}`}
        checked={checked}
        onCheckedChange={(val) => onChange(Boolean(val))}
      />
      <label
        htmlFor={`notice-check-${label.toLowerCase()}`}
        className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}
