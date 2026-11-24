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
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from "@/lib/utils";
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
  correctionEndDate?: string;
  examCityDate?: string;
  admitCardDate?: string;
  examDate?: string;
  answerKeyDate?: string;
  feeGeneralObc?: string;
  feeScSt?: string;
  feePh?: string;
  qualification: string;
  qualificationHi?: string;
  qualificationEn?: string;
  ageMin?: number;
  ageMax?: number;
  ageAsOnDate?: string;
  ageRelaxation?: string;
  ageRelaxationHi?: string;
  ageRelaxationEn?: string;
  categoryVacancies?: Record<string, string | number>;
  howToApply?: string;
  howToApplyHi?: string;
  howToApplyEn?: string;
  howToDownloadAdmitCard?: string;
  howToCheckResult?: string;
  telegramUrl?: string;
  whatsappUrl?: string;
  applyOnlineUrl?: string;
  shortNoticeUrl?: string;
  notificationPdfUrl?: string;
  syllabusUrl?: string;
  correctionUrl?: string;
  admitCardUrl?: string;
  examCityUrl?: string;
  answerKeyUrl?: string;
  scoreCardUrl?: string;
  resultUrl?: string;
  officialSiteUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;
  faqsHi?: Array<{ question: string; answer: string }>;
  faqsEn?: Array<{ question: string; answer: string }>;
  selectionProcess: string;
  selectionProcessHi?: string;
  selectionProcessEn?: string;
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
  qualificationHi: string;
  qualificationEn: string;
  ageMin: string;
  ageMax: string;
  applicationStart: string;
  applicationEnd: string;
  feeEndDate: string;
  correctionEndDate: string;
  examCityDate: string;
  admitCardDate: string;
  examDate: string;
  answerKeyDate: string;
  feeGeneralObc: string;
  feeScSt: string;
  feePh: string;
  selectionProcess: string;
  selectionProcessHi: string;
  selectionProcessEn: string;
  howToApply?: string;
  howToApplyHi: string;
  howToApplyEn: string;
  howToDownloadAdmitCard?: string;
  howToCheckResult?: string;
  sourceUrl: string;
  sourceDate: string;
  verifiedAt: string;
  verifiedBy: string;
  ageAsOnDate: string;
  ageRelaxation: string;
  ageRelaxationHi: string;
  ageRelaxationEn: string;
  categoryVacancies: string;
  telegramUrl: string;
  whatsappUrl: string;
  applyOnlineUrl: string;
  shortNoticeUrl: string;
  notificationPdfUrl: string;
  syllabusUrl: string;
  correctionUrl: string;
  admitCardUrl: string;
  examCityUrl: string;
  answerKeyUrl: string;
  scoreCardUrl: string;
  resultUrl: string;
  officialSiteUrl: string;
  faqs: string;
  faqsHi: string;
  faqsEn: string;
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
  } catch { }
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
  } catch { }
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

function defaultHowToApplyEn(noticeType: string): string {
  if (noticeType === 'admitCard') {
    return '1. Visit the official website or recruitment board portal.\n2. Click on the Admit Card / Hall Ticket download link.\n3. Enter your Application Number and Date of Birth / Password.\n4. Download and print the admit card for the examination.';
  }
  if (noticeType === 'result') {
    return '1. Visit the official portal result section.\n2. Click on the relevant recruitment Result & Merit List PDF.\n3. Search your Roll Number in the qualified candidate list.\n4. Check cut-off marks and document verification schedule.';
  }
  if (noticeType === 'syllabus') {
    return '1. Navigate to the official website syllabus & examination scheme portal.\n2. Click on the detailed syllabus PDF link.\n3. Review the exam pattern, subject-wise weightage and marking scheme.';
  }
  if (noticeType === 'answerKey') {
    return '1. Visit the Answer Key section of the commission / board portal.\n2. Download the question paper and master answer key.\n3. Verify your responses and submit online representations within the deadline.';
  }
  return '1. Visit the official portal / SSO Rajasthan (sso.rajasthan.gov.in) and log in.\n2. Navigate to Recruitment Portal and verify your OTR profile.\n3. Select the ongoing recruitment notification and click on Apply Online.\n4. Fill in required educational qualifications and upload photograph/signature.\n5. Pay the required application fee online and submit the final form.\n6. Print and safely preserve the application confirmation page.';
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
  qualificationHi: '',
  qualificationEn: '',
  ageMin: '',
  ageMax: '',
  ageAsOnDate: '01/01/2026',
  ageRelaxation: 'राज्य सरकार के नियमानुसार आरक्षित वर्गों (SC/ST/OBC/MBC/EWS) एवं महिला अभ्यर्थियों को अधिकतम आयु सीमा में 5 से 10 वर्ष की छूट देय होगी।',
  ageRelaxationHi: 'राज्य सरकार के नियमानुसार आरक्षित वर्गों (SC/ST/OBC/MBC/EWS) एवं महिला अभ्यर्थियों को अधिकतम आयु सीमा में 5 से 10 वर्ष की छूट देय होगी।',
  ageRelaxationEn: 'Age relaxation of 5 to 10 years admissible for reserved categories (SC/ST/OBC/MBC/EWS) and female candidates as per State Government rules.',
  categoryVacancies: '',
  telegramUrl: 'https://t.me/Raj_Suchna',
  whatsappUrl: 'https://whatsapp.com/channel/0029Vakea9U89inpSSjnR82N',
  applicationStart: '',
  applicationEnd: '',
  feeEndDate: '',
  correctionEndDate: '',
  examCityDate: '',
  admitCardDate: 'एग्जाम से पहले जारी किया जाएगा।',
  examDate: 'जल्द ही यहां अपडेट किया जाएगा।',
  answerKeyDate: '',
  feeGeneralObc: '',
  feeScSt: '',
  feePh: '',
  selectionProcess: '',
  selectionProcessHi: '',
  selectionProcessEn: '',
  howToApply: '',
  howToApplyHi: defaultHowToApply('vacancy'),
  howToApplyEn: defaultHowToApplyEn('vacancy'),
  howToDownloadAdmitCard: '',
  howToCheckResult: '',
  sourceUrl: '',
  sourceDate: '',
  verifiedAt: '',
  verifiedBy: 'Raj Suchna Editorial Board',
  applyOnlineUrl: '',
  shortNoticeUrl: '',
  notificationPdfUrl: '',
  syllabusUrl: '',
  correctionUrl: '',
  admitCardUrl: '',
  examCityUrl: '',
  answerKeyUrl: '',
  scoreCardUrl: '',
  resultUrl: '',
  officialSiteUrl: '',
  faqs: '',
  faqsHi: '',
  faqsEn: '',
});

const dateOnly = (value?: string) => (value ? value.split('T')[0] : '');

function linkValue(links: NoticeLink[] | undefined, kind: string): string {
  return links?.find((l) => l.kind === kind)?.url || '';
}

const truncateText = (text: string, limit: number): string => {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

function buildSections(form: NoticeForm, existing?: NoticeSection[]): NoticeSection[] {
  const sections: NoticeSection[] = [];
  const overview = form.summaryHi || form.summaryEn;
  if (overview) sections.push({ key: 'overview', title: 'Overview', body: overview });
  if (form.summaryEn && form.summaryEn !== form.summaryHi) {
    sections.push({ key: 'overview_en', title: 'Overview (English)', body: form.summaryEn });
  }

  const dateRows: Record<string, string> = {};
  if (form.applicationStart) dateRows['Application Start'] = form.applicationStart;
  if (form.applicationEnd) dateRows['Application Last Date'] = form.applicationEnd;
  if (form.feeEndDate) dateRows['Fee Payment Last Date'] = form.feeEndDate;
  if (form.examDate) dateRows['Exam Date'] = form.examDate;
  if (Object.keys(dateRows).length > 0) {
    sections.push({ key: 'importantDates', title: 'Important Dates', body: '', rows: dateRows });
  }

  const qualHi = form.qualificationHi?.trim() || form.qualification?.trim();
  const qualEn = form.qualificationEn?.trim();
  if (qualHi || form.ageMin || form.ageMax) {
    const rows: Record<string, string> = {};
    if (qualHi) rows['Qualification'] = qualHi;
    if (form.ageMin || form.ageMax) rows['Age Limit'] = `${form.ageMin || '-'} to ${form.ageMax || '-'} years`;
    sections.push({ key: 'eligibility', title: 'Eligibility Criteria', body: qualHi || qualEn || '', rows });
  }
  if (qualEn) {
    sections.push({ key: 'eligibility_en', title: 'Eligibility Criteria (English)', body: qualEn });
  }

  const feeRows: Record<string, string> = {};
  if (form.feeGeneralObc) feeRows['General / OBC'] = form.feeGeneralObc;
  if (form.feeScSt) feeRows['SC / ST'] = form.feeScSt;
  if (form.feePh) feeRows['PH / Divyang'] = form.feePh;
  if (Object.keys(feeRows).length > 0) {
    sections.push({ key: 'fee', title: 'Application Fee', body: '', rows: feeRows });
  }

  const selHi = form.selectionProcessHi?.trim() || form.selectionProcess?.trim();
  if (selHi) {
    sections.push({ key: 'selectionProcess', title: 'Selection Process', body: selHi });
  }
  if (form.selectionProcessEn?.trim()) {
    sections.push({ key: 'selectionProcess_en', title: 'Selection Process (English)', body: form.selectionProcessEn.trim() });
  }

  const applyHi = form.howToApplyHi?.trim() || form.howToApply?.trim();
  if (applyHi) {
    sections.push({
      key: 'howToApply',
      title: 'How to Apply / आवेदन कैसे करें',
      body: applyHi,
    });
  }
  if (form.howToApplyEn?.trim()) {
    sections.push({
      key: 'howToApply_en',
      title: 'How to Apply (English)',
      body: form.howToApplyEn.trim(),
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
    const standardKeys = new Set(['overview', 'overview_en', 'importantDates', 'eligibility', 'eligibility_en', 'fee', 'selectionProcess', 'selectionProcess_en', 'howToApply', 'howToApply_en', 'howToDownloadAdmitCard', 'howToCheckResult']);
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
  const [formLangTab, setFormLangTab] = useState<'hi' | 'en'>('hi');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredAgencies = useMemo(() => {
    const isCentral = form.state === 'central';
    return agencyOptions.filter((a) => {
      const grp = (a.parentGroup || '').trim().toLowerCase();
      if (isCentral) {
        return grp === 'central' || ['ssc', 'upsc', 'railway', 'banking', 'defence', 'teaching', 'rbi', 'crpf_bsf_cisf_itbp_ssb', 'aiims', 'lic_niacl_nicl_uiic', 'drdo', 'fci', 'aai', 'nabard', 'bhel'].includes(a.id);
      } else {
        return (grp === 'state' || grp === 'rajasthan' || !grp) && grp !== 'central' && !['ssc', 'upsc', 'railway', 'banking', 'defence', 'teaching', 'rbi', 'crpf_bsf_cisf_itbp_ssb', 'aiims', 'lic_niacl_nicl_uiic', 'drdo', 'fci', 'aai', 'nabard', 'bhel'].includes(a.id);
      }
    });
  }, [agencyOptions, form.state]);

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
    const initialAgencies = agencyOptions.filter((a) => {
      const grp = (a.parentGroup || '').trim().toLowerCase();
      return (grp === 'state' || grp === 'rajasthan' || !grp) && grp !== 'central';
    });
    next.agencyId = initialAgencies[0]?.id || agencyOptions[0]?.id || 'rssb';
    next.categoryId = categoryOptions[0]?.id || '';
    setEditingNotice(null);
    setForm(next);
    setFormLangTab('hi');
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (notice: NoticeItem) => {
    setEditingNotice(notice);
    const facts = (notice.facts || {}) as any;
    const qualHi = facts?.qualificationHi || facts?.qualification || '';
    const qualEn = facts?.qualificationEn || (notice.sections?.find((s) => s.key === 'eligibility_en')?.body) || '';
    const selHi = facts?.selectionProcessHi || facts?.selectionProcess || '';
    const selEn = facts?.selectionProcessEn || (notice.sections?.find((s) => s.key === 'selectionProcess_en')?.body) || '';
    const applyHi = facts?.howToApplyHi || facts?.howToApply || notice.sections?.find((s) => s.key === 'howToApply')?.body || '';
    const applyEn = facts?.howToApplyEn || notice.sections?.find((s) => s.key === 'howToApply_en')?.body || '';
    const relaxHi = facts?.ageRelaxationHi || facts?.ageRelaxation || 'राज्य सरकार के नियमानुसार आरक्षित वर्गों (SC/ST/OBC/MBC/EWS) एवं महिला अभ्यर्थियों को अधिकतम आयु सीमा में 5 से 10 वर्ष की छूट देय होगी।';
    const relaxEn = facts?.ageRelaxationEn || 'Age relaxation of 5 to 10 years admissible for reserved categories (SC/ST/OBC/MBC/EWS) and female candidates as per State Government rules.';
    const faqsHi = facts?.faqsHi ? formatFaqs(facts.faqsHi) : formatFaqs(facts?.faqs);
    const faqsEn = facts?.faqsEn ? formatFaqs(facts.faqsEn) : '';

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
      qualification: qualHi || qualEn,
      qualificationHi: qualHi,
      qualificationEn: qualEn,
      ageMin: notice.facts?.ageMin?.toString() || '',
      ageMax: notice.facts?.ageMax?.toString() || '',
      ageAsOnDate: notice.facts?.ageAsOnDate || '01/01/2026',
      ageRelaxation: relaxHi || relaxEn,
      ageRelaxationHi: relaxHi,
      ageRelaxationEn: relaxEn,
      categoryVacancies: formatCategoryVacancies(notice.facts?.categoryVacancies),
      telegramUrl: notice.facts?.telegramUrl || linkValue(notice.links, 'telegram') || 'https://t.me/Raj_Suchna',
      whatsappUrl: notice.facts?.whatsappUrl || linkValue(notice.links, 'whatsapp') || 'https://whatsapp.com/channel/0029Vakea9U89inpSSjnR82N',
      syllabusUrl: notice.facts?.syllabusUrl || linkValue(notice.links, 'syllabus') || '',
      shortNoticeUrl: notice.facts?.shortNoticeUrl || linkValue(notice.links, 'shortNotice') || '',
      notificationPdfUrl: notice.facts?.notificationPdfUrl || linkValue(notice.links, 'notificationPdf') || '',
      applyOnlineUrl: notice.facts?.applyOnlineUrl || linkValue(notice.links, 'applyOnline') || '',
      correctionUrl: notice.facts?.correctionUrl || linkValue(notice.links, 'correctionForm') || linkValue(notice.links, 'correction') || '',
      admitCardUrl: notice.facts?.admitCardUrl || linkValue(notice.links, 'admitCard') || '',
      examCityUrl: notice.facts?.examCityUrl || linkValue(notice.links, 'examCity') || '',
      answerKeyUrl: notice.facts?.answerKeyUrl || linkValue(notice.links, 'answerKey') || '',
      scoreCardUrl: notice.facts?.scoreCardUrl || linkValue(notice.links, 'scoreCard') || '',
      resultUrl: notice.facts?.resultUrl || linkValue(notice.links, 'result') || '',
      officialSiteUrl: notice.facts?.officialSiteUrl || linkValue(notice.links, 'officialSite') || '',
      faqs: faqsHi || faqsEn,
      faqsHi: faqsHi,
      faqsEn: faqsEn,
      applicationStart: dateOnly(notice.facts?.applicationStart),
      applicationEnd: dateOnly(notice.facts?.applicationEnd),
      feeEndDate: dateOnly(notice.facts?.feeEndDate),
      correctionEndDate: dateOnly(notice.facts?.correctionEndDate) || notice.facts?.correctionEndDate || '',
      examCityDate: dateOnly(notice.facts?.examCityDate) || notice.facts?.examCityDate || '',
      admitCardDate: notice.facts?.admitCardDate || 'एग्जाम से पहले जारी किया जाएगा।',
      examDate: notice.facts?.examDate || 'जल्द ही यहां अपडेट किया जाएगा।',
      answerKeyDate: dateOnly(notice.facts?.answerKeyDate) || notice.facts?.answerKeyDate || '',
      feeGeneralObc: notice.facts?.feeGeneralObc || '',
      feeScSt: notice.facts?.feeScSt || '',
      feePh: notice.facts?.feePh || (notice.sections?.find((s) => s.key === 'fee')?.rows?.['PH / Divyang'] || notice.sections?.find((s) => s.key === 'fee')?.rows?.['PH'] || ''),
      selectionProcess: selHi || selEn,
      selectionProcessHi: selHi,
      selectionProcessEn: selEn,
      howToApply: applyHi || applyEn,
      howToApplyHi: applyHi || defaultHowToApply(notice.noticeType || 'vacancy'),
      howToApplyEn: applyEn || defaultHowToApplyEn(notice.noticeType || 'vacancy'),
      howToDownloadAdmitCard: notice.facts?.howToDownloadAdmitCard || notice.sections?.find((s) => s.key === 'howToDownloadAdmitCard')?.body || '',
      howToCheckResult: notice.facts?.howToCheckResult || notice.sections?.find((s) => s.key === 'howToCheckResult')?.body || '',
      sourceUrl: notice.facts?.sourceUrl || '',
      sourceDate: dateOnly(notice.facts?.sourceDate) || today(),
      verifiedAt: dateOnly(notice.facts?.verifiedAt) || today(),
      verifiedBy: notice.facts?.verifiedBy || 'Raj Suchna Editorial Board',
    });
    setFormLangTab('hi');
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    const defaultTitleEn = form.titleEn.trim() || form.titleHi.trim() || 'New Recruitment Notice';
    const defaultTitleHi = form.titleHi.trim() || form.titleEn.trim() || 'नई भर्ती अधिसूचना';
    const defaultAgency = form.agencyId || (agencyOptions[0]?.id ?? 'rpsc');
    const defaultCategory = form.categoryId || (categoryOptions[0]?.id ?? 'general');

    const links: NoticeLink[] = [];
    if (form.applyOnlineUrl.trim()) {
      links.push({ label: 'ऑनलाइन आवेदन करें', url: form.applyOnlineUrl.trim(), kind: 'applyOnline' });
    }
    if (form.shortNoticeUrl.trim()) {
      links.push({ label: 'शोर्ट नोटिस / एग्जाम डेट नोटिस', url: form.shortNoticeUrl.trim(), kind: 'shortNotice' });
    }
    if (form.notificationPdfUrl.trim()) {
      links.push({ label: 'आधिकारिक विज्ञप्ति', url: form.notificationPdfUrl.trim(), kind: 'notificationPdf' });
    }
    if (form.syllabusUrl.trim()) {
      links.push({ label: 'सिलेबस और एग्जाम पैटर्न', url: form.syllabusUrl.trim(), kind: 'syllabus' });
    }
    if (form.correctionUrl.trim()) {
      links.push({ label: 'फॉर्म में सुधार', url: form.correctionUrl.trim(), kind: 'correctionForm' });
    }
    if (form.admitCardUrl.trim()) {
      links.push({ label: 'एडमिट कार्ड', url: form.admitCardUrl.trim(), kind: 'admitCard' });
    }
    if (form.examCityUrl.trim()) {
      links.push({ label: 'एग्जाम सिटी डिटेल्स', url: form.examCityUrl.trim(), kind: 'examCity' });
    }
    if (form.answerKeyUrl.trim()) {
      links.push({ label: 'उत्तर कुंजी', url: form.answerKeyUrl.trim(), kind: 'answerKey' });
    }
    if (form.scoreCardUrl.trim()) {
      links.push({ label: 'स्कोर कार्ड', url: form.scoreCardUrl.trim(), kind: 'scoreCard' });
    }
    if (form.resultUrl.trim()) {
      links.push({ label: 'परिणाम / मेरिट सूची', url: form.resultUrl.trim(), kind: 'result' });
    }
    if (form.officialSiteUrl.trim()) {
      links.push({ label: 'विभागीय आधिकारिक वेबसाइट', url: form.officialSiteUrl.trim(), kind: 'officialSite' });
    }
    if (form.telegramUrl.trim()) {
      links.push({ label: 'Join Telegram Channel', url: form.telegramUrl.trim(), kind: 'telegram' });
    }
    if (form.whatsappUrl.trim()) {
      links.push({ label: 'Join WhatsApp Channel', url: form.whatsappUrl.trim(), kind: 'whatsapp' });
    }

    const categoryVacancies = parseCategoryVacancies(form.categoryVacancies);
    const faqsHi = parseFaqs(form.faqsHi || form.faqs);
    const faqsEn = parseFaqs(form.faqsEn);
    const faqs = faqsHi || faqsEn;

    const qualHi = (form.qualificationHi || form.qualification || '').trim();
    const qualEn = (form.qualificationEn || '').trim();
    const selHi = (form.selectionProcessHi || form.selectionProcess || '').trim();
    const selEn = (form.selectionProcessEn || '').trim();
    const applyHi = (form.howToApplyHi || form.howToApply || '').trim();
    const applyEn = (form.howToApplyEn || '').trim();
    const relaxHi = (form.ageRelaxationHi || form.ageRelaxation || '').trim();
    const relaxEn = (form.ageRelaxationEn || '').trim();

    const facts: NoticeFacts = {
      qualification: qualHi || qualEn || '10th / 12th / Graduate',
      qualificationHi: qualHi,
      qualificationEn: qualEn,
      selectionProcess: selHi || selEn || 'Written Exam',
      selectionProcessHi: selHi,
      selectionProcessEn: selEn,
      howToApply: applyHi || applyEn,
      howToApplyHi: applyHi,
      howToApplyEn: applyEn,
      ageRelaxation: relaxHi || relaxEn,
      ageRelaxationHi: relaxHi,
      ageRelaxationEn: relaxEn,
      sourceUrl: form.sourceUrl.trim(),
      sourceDate: form.sourceDate || today(),
      verifiedAt: form.verifiedAt || today(),
      verifiedBy: form.verifiedBy.trim() || 'Raj Suchna Editorial Board',
      ...(form.ageAsOnDate ? { ageAsOnDate: form.ageAsOnDate.trim() } : {}),
      ...(categoryVacancies ? { categoryVacancies } : {}),
      ...(form.telegramUrl ? { telegramUrl: form.telegramUrl.trim() } : {}),
      ...(form.whatsappUrl ? { whatsappUrl: form.whatsappUrl.trim() } : {}),
      ...(form.applyOnlineUrl ? { applyOnlineUrl: form.applyOnlineUrl.trim() } : {}),
      ...(form.shortNoticeUrl ? { shortNoticeUrl: form.shortNoticeUrl.trim() } : {}),
      ...(form.notificationPdfUrl ? { notificationPdfUrl: form.notificationPdfUrl.trim() } : {}),
      ...(form.syllabusUrl ? { syllabusUrl: form.syllabusUrl.trim() } : {}),
      ...(form.correctionUrl ? { correctionUrl: form.correctionUrl.trim() } : {}),
      ...(form.admitCardUrl ? { admitCardUrl: form.admitCardUrl.trim() } : {}),
      ...(form.examCityUrl ? { examCityUrl: form.examCityUrl.trim() } : {}),
      ...(form.answerKeyUrl ? { answerKeyUrl: form.answerKeyUrl.trim() } : {}),
      ...(form.scoreCardUrl ? { scoreCardUrl: form.scoreCardUrl.trim() } : {}),
      ...(form.resultUrl ? { resultUrl: form.resultUrl.trim() } : {}),
      ...(form.officialSiteUrl ? { officialSiteUrl: form.officialSiteUrl.trim() } : {}),
      ...(faqs ? { faqs } : {}),
      ...(faqsHi ? { faqsHi } : {}),
      ...(faqsEn ? { faqsEn } : {}),
      ...(form.postsCount ? { postsCount: Number(form.postsCount) } : {}),
      ...(form.ageMin ? { ageMin: Number(form.ageMin) } : {}),
      ...(form.ageMax ? { ageMax: Number(form.ageMax) } : {}),
      ...(form.applicationStart ? { applicationStart: form.applicationStart } : {}),
      ...(form.applicationEnd ? { applicationEnd: form.applicationEnd } : {}),
      ...(form.feeEndDate ? { feeEndDate: form.feeEndDate } : {}),
      ...(form.correctionEndDate ? { correctionEndDate: form.correctionEndDate.trim() } : {}),
      ...(form.examCityDate ? { examCityDate: form.examCityDate.trim() } : {}),
      admitCardDate: form.admitCardDate.trim() || 'एग्जाम से पहले जारी किया जाएगा।',
      examDate: form.examDate.trim() || 'जल्द ही यहां अपडेट किया जाएगा।',
      ...(form.answerKeyDate ? { answerKeyDate: form.answerKeyDate.trim() } : {}),
      ...(form.feeGeneralObc ? { feeGeneralObc: form.feeGeneralObc } : {}),
      ...(form.feeScSt ? { feeScSt: form.feeScSt } : {}),
      ...(form.feePh ? { feePh: form.feePh } : {}),
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
              className={`p-4 rounded-xl text-xs flex items-center justify-between border ${feedback.type === 'success'
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${statusFilter === tab.value
                  ? 'bg-[#A30B0B] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
            {/* 1. Primary Attributes & Selection Filters */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  1. Primary Attributes / मुख्य चयन श्रेणियाँ
                </span>
              </div>

              {/* Hierarchy: Notice Type ---> Jurisdiction ---> Category -----> Agency (Filtered) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <FormField label="1. Notice Type *">
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

                <FormField label="2. Jurisdiction *">
                  <Select
                    value={form.state}
                    onValueChange={(val) => {
                      const newState = val as NoticeForm['state'];
                      setForm((prev) => {
                        const validAgencies = agencyOptions.filter((a) => {
                          const grp = (a.parentGroup || '').toLowerCase();
                          if (newState === 'central') {
                            return grp === 'central' || ['ssc', 'upsc', 'railway', 'ibps', 'defence'].includes(a.id);
                          }
                          return grp === 'state' || grp === 'rajasthan' || !['ssc', 'upsc', 'railway', 'ibps', 'defence'].includes(a.id);
                        });
                        const validAgency = validAgencies.some(a => a.id === prev.agencyId) ? prev.agencyId : (validAgencies[0]?.id || '');
                        return { ...prev, state: newState, agencyId: validAgency };
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {(jurisdictionOptions.length > 0 ? jurisdictionOptions : DEFAULT_JURISDICTIONS).map((j) => (
                        <SelectItem key={j.id} value={j.id}>{j.nameEn} ({j.nameHi})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="3. Category *">
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

                <FormField label="4. Agency*">
                  <Select value={form.agencyId} onValueChange={(val) => updateForm('agencyId', val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select agency" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAgencies.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {/* Status, Expires On, Featured, Breaking */}
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

              {/* Vacancy & Age Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <FormField label="Total Posts (कुल पद)" hint="e.g. 2998">
                  <Textarea
                    rows={1}
                    value={form.postsCount}
                    onChange={(e) => updateForm('postsCount', e.target.value)}
                    placeholder="e.g. 2998"
                  />
                </FormField>
                <FormField label="Age Min (न्यूनतम आयु)">
                  <Textarea
                    rows={1}
                    value={form.ageMin}
                    onChange={(e) => updateForm('ageMin', e.target.value)}
                    placeholder="18"
                  />
                </FormField>
                <FormField label="Age Max (अधिकतम आयु)">
                  <Textarea
                    rows={1}
                    value={form.ageMax}
                    onChange={(e) => updateForm('ageMax', e.target.value)}
                    placeholder="40"
                  />
                </FormField>
                <FormField label="Age As On (गणना आधार)" hint="e.g. 01/01/2026">
                  <Textarea
                    rows={1}
                    value={form.ageAsOnDate}
                    onChange={(e) => updateForm('ageAsOnDate', e.target.value)}
                    placeholder="01/01/2026"
                  />
                </FormField>
              </div>
            </div>

            {/* 2. Language Tabs: [ Hindi (हिन्दी) ] & [ English ] for All Text Areas & Inputs */}
            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
              {/* Tab Header Bar */}
              <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    2. Language Tabs / भाषा विवरण:
                  </span>

                  <div className="inline-flex items-center bg-slate-200/90 dark:bg-slate-700/80 p-1 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setFormLangTab('hi')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        formLangTab === 'hi'
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                      )}
                    >
                      <span>हिन्दी (Hindi)</span>
                      {(form.titleHi.trim() || form.qualificationHi?.trim() || form.qualification?.trim()) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormLangTab('en')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        formLangTab === 'en'
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                      )}
                    >
                      <span>English (अंग्रेजी)</span>
                      {(form.titleEn.trim() || form.qualificationEn?.trim()) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {formLangTab === 'hi' ? 'हिन्दी टेक्स्ट एरिया व इनपुट्स' : 'English Text Areas & Inputs'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (formLangTab === 'hi') {
                        if (!form.titleHi && form.titleEn) updateForm('titleHi', form.titleEn);
                        if (!form.summaryHi && form.summaryEn) updateForm('summaryHi', form.summaryEn);
                        if (!form.qualificationHi && form.qualificationEn) {
                          updateForm('qualificationHi', form.qualificationEn);
                          updateForm('qualification', form.qualificationEn);
                        }
                      } else {
                        if (!form.titleEn && form.titleHi) updateForm('titleEn', form.titleHi);
                        if (!form.summaryEn && form.summaryHi) updateForm('summaryEn', form.summaryHi);
                        if (!form.qualificationEn && (form.qualificationHi || form.qualification)) {
                          updateForm('qualificationEn', form.qualificationHi || form.qualification);
                        }
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    title="दोनों भाषाओं के शीर्षक व विवरण का त्वरित मिलान करें"
                  >
                    Quick Sync
                  </button>
                </div>
              </div>

              {/* TAB 1: HINDI (हिन्दी) */}
              {formLangTab === 'hi' && (
                <div className="p-4 space-y-4 bg-amber-50/20 dark:bg-amber-950/10">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-200 dark:border-amber-900/50">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      हिन्दी सामग्री (Hindi Language Content)
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                      (ऐप के हिन्दी मोड में यह समस्त विवरण प्रदर्शित होगा)
                    </span>
                  </div>

                  <FormField label="भर्ती शीर्षक (Title in Hindi) *" hint="उदा: राजस्थान पटवारी 2998 पदों पर सीधी भर्ती 2026">
                    <Textarea
                      rows={2}
                      value={form.titleHi}
                      onChange={(e) => updateForm('titleHi', e.target.value)}
                      placeholder="राजस्थान पटवारी भर्ती 2026"
                    />
                  </FormField>

                  <FormField label="संक्षिप्त विवरण (Summary in Hindi)" hint="भर्ती का मुख्य संक्षिप्त विवरण">
                    <Textarea
                      rows={3}
                      value={form.summaryHi}
                      onChange={(e) => updateForm('summaryHi', e.target.value)}
                      placeholder="संक्षिप्त विवरण हिन्दी में..."
                    />
                  </FormField>

                  <FormField
                    label="Qualification / शैक्षणिक योग्यता *"
                    hint="नंबरिंग व बोल्ड शब्द समर्थित हैं। उदा: 1. **12वीं पास** के साथ **RSCIT** डिप्लोमा"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.qualificationHi || form.qualification;
                          const updated = current ? `${current} **बोल्ड शब्द**` : '**मुख्य योग्यता**';
                          updateForm('qualificationHi', updated);
                          updateForm('qualification', updated);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="शब्दों को बोल्ड करने के लिए **शब्द** लगाएं"
                      >
                        ** Bold Selected
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.qualificationHi || form.qualification;
                          const lines = current ? current.split('\n') : [];
                          const nextNum = lines.length + 1;
                          const newLine = `${nextNum}. `;
                          const updated = current ? `${current}\n${newLine}` : newLine;
                          updateForm('qualificationHi', updated);
                          updateForm('qualification', updated);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="क्रम संख्या जोड़ें"
                      >
                        1. Add Point
                      </button>
                    </div>
                    <Textarea
                      rows={3}
                      value={form.qualificationHi || form.qualification}
                      onChange={(e) => {
                        updateForm('qualificationHi', e.target.value);
                        updateForm('qualification', e.target.value);
                      }}
                      placeholder="1. मान्यता प्राप्त बोर्ड से **12वीं (10+2)** उत्तीर्ण।&#10;2. **RSCIT** अथवा समकक्ष कम्प्यूटर डिप्लोमा।"
                    />
                  </FormField>

                  <FormField
                    label="Selection Process / चयन प्रक्रिया"
                    hint="चयन प्रक्रिया के चरण नंबरिंग के साथ दर्ज करें"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const standardStages = '1. लिखित परीक्षा (Written Examination)\n2. शारीरिक दक्षता परीक्षा (PET / PST)\n3. दस्तावेज सत्यापन (Document Verification)\n4. चिकित्सा परीक्षण (Medical Examination)';
                          updateForm('selectionProcessHi', standardStages);
                          updateForm('selectionProcess', standardStages);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="मानक चयन प्रक्रिया चरण जोड़ें"
                      >
                        + 1,2,3 Stages (मानक चरण)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.selectionProcessHi || form.selectionProcess;
                          const lines = current ? current.split('\n') : [];
                          const nextNum = lines.length + 1;
                          const newLine = `${nextNum}. `;
                          const updated = current ? `${current}\n${newLine}` : newLine;
                          updateForm('selectionProcessHi', updated);
                          updateForm('selectionProcess', updated);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        1. Add Step
                      </button>
                    </div>
                    <Textarea
                      rows={3}
                      value={form.selectionProcessHi || form.selectionProcess}
                      onChange={(e) => {
                        updateForm('selectionProcessHi', e.target.value);
                        updateForm('selectionProcess', e.target.value);
                      }}
                      placeholder="1. लिखित परीक्षा (Written Exam)&#10;2. शारीरिक दक्षता परीक्षा (PET/PST)&#10;3. दस्तावेज सत्यापन (DV)"
                    />
                  </FormField>

                  <FormField
                    label="How to Apply / आवेदन कैसे करें (स्टेप-बाय-स्टेप हिन्दी गाइड)"
                    hint="अभ्यर्थियों के लिए ऑनलाइन आवेदन करने का चरणबद्ध विवरण"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const def = defaultHowToApply(form.noticeType);
                          updateForm('howToApplyHi', def);
                          updateForm('howToApply', def);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="भर्ती प्रकार के अनुसार मानक आवेदन प्रक्रिया दर्ज करें"
                      >
                        + लोड करें मानक आवेदन प्रक्रिया
                      </button>
                    </div>
                    <Textarea
                      rows={4}
                      value={form.howToApplyHi || form.howToApply || ''}
                      onChange={(e) => {
                        updateForm('howToApplyHi', e.target.value);
                        updateForm('howToApply', e.target.value);
                      }}
                      placeholder="1. राजस्थान एसएसओ पोर्टल पर लॉगिन करें...&#10;2. भर्ती पोर्टल पर जाएं..."
                    />
                  </FormField>

                  <FormField label="Age Relaxation (आयु सीमा में छूट - हिन्दी विवरण)">
                    <Textarea
                      rows={2}
                      value={form.ageRelaxationHi || form.ageRelaxation}
                      onChange={(e) => {
                        updateForm('ageRelaxationHi', e.target.value);
                        updateForm('ageRelaxation', e.target.value);
                      }}
                      placeholder="राज्य सरकार के नियमानुसार आरक्षित वर्गों (SC/ST/OBC/MBC/EWS) एवं महिला अभ्यर्थियों को अधिकतम आयु सीमा में 5 से 10 वर्ष की छूट देय होगी।"
                    />
                  </FormField>

                  <FormField
                    label="FAQs / अक्सर पूछे जाने वाले प्रश्न (हिन्दी)"
                    hint="Format: Q: प्रश्न? \n A: उत्तर।"
                  >
                    <Textarea
                      rows={4}
                      value={form.faqsHi || form.faqs}
                      onChange={(e) => {
                        updateForm('faqsHi', e.target.value);
                        updateForm('faqs', e.target.value);
                      }}
                      placeholder="Q: क्या ओटीआर अनिवार्य है?&#10;A: हाँ, राजस्थान की सभी राज्यस्तरीय भर्तियों के लिए ओटीआर अनिवार्य है।&#10;&#10;Q: आयु सीमा में कितनी छूट मिलेगी?&#10;A: नियमानुसार आरक्षित वर्गों को 5 से 10 वर्ष की छूट देय होगी।"
                    />
                  </FormField>
                </div>
              )}

              {/* TAB 2: ENGLISH (English) */}
              {formLangTab === 'en' && (
                <div className="p-4 space-y-4 bg-blue-50/20 dark:bg-blue-950/10">
                  <div className="flex items-center justify-between pb-1 border-b border-blue-200 dark:border-blue-900/50">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      English Details (English Language Content)
                    </span>
                    <span className="text-[11px] text-blue-700 dark:text-blue-400">
                      (Displayed when user chooses English in the mobile app)
                    </span>
                  </div>

                  <FormField label="Recruitment Title (Title in English) *" hint="e.g. Rajasthan Patwari 2998 Posts Recruitment 2026">
                    <Textarea
                      rows={2}
                      value={form.titleEn}
                      onChange={(e) => updateForm('titleEn', e.target.value)}
                      placeholder="Rajasthan Patwari Recruitment 2026"
                    />
                  </FormField>

                  <FormField label="Recruitment Summary (Summary in English)" hint="Brief recruitment summary in English">
                    <Textarea
                      rows={3}
                      value={form.summaryEn}
                      onChange={(e) => updateForm('summaryEn', e.target.value)}
                      placeholder="Brief recruitment summary in English..."
                    />
                  </FormField>

                  <FormField
                    label="Educational Qualification (English) *"
                    hint="Numbering and bold words supported. e.g.: 1. **12th Pass** with **RSCIT** Diploma"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.qualificationEn;
                          const updated = current ? `${current} **bold term**` : '**Key Qualification**';
                          updateForm('qualificationEn', updated);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Format words in bold"
                      >
                        ** Bold Selected
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.qualificationEn;
                          const lines = current ? current.split('\n') : [];
                          const nextNum = lines.length + 1;
                          const newLine = `${nextNum}. `;
                          const updated = current ? `${current}\n${newLine}` : newLine;
                          updateForm('qualificationEn', updated);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Add numbered point"
                      >
                        1. Add Point
                      </button>
                    </div>
                    <Textarea
                      rows={3}
                      value={form.qualificationEn}
                      onChange={(e) => updateForm('qualificationEn', e.target.value)}
                      placeholder="1. Passed **10+2 (Intermediate)** from a recognized board.&#10;2. **RSCIT** or equivalent computer diploma."
                    />
                  </FormField>

                  <FormField
                    label="Selection Process (English)"
                    hint="Specify selection stages with numbers"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const stages = '1. Written Examination (CBT / OMR)\n2. Physical Efficiency Test (PET / PST)\n3. Document Verification (DV)\n4. Medical Examination';
                          updateForm('selectionProcessEn', stages);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Insert standard selection stages"
                      >
                        + 1,2,3 Stages (Standard)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.selectionProcessEn;
                          const lines = current ? current.split('\n') : [];
                          const nextNum = lines.length + 1;
                          const newLine = `${nextNum}. `;
                          const updated = current ? `${current}\n${newLine}` : newLine;
                          updateForm('selectionProcessEn', updated);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        1. Add Step
                      </button>
                    </div>
                    <Textarea
                      rows={3}
                      value={form.selectionProcessEn}
                      onChange={(e) => updateForm('selectionProcessEn', e.target.value)}
                      placeholder="1. Written Examination&#10;2. Physical Efficiency Test (PET/PST)&#10;3. Document Verification (DV)"
                    />
                  </FormField>

                  <FormField
                    label="How to Apply (Step-by-Step English Guide)"
                    hint="Step-by-step instructions for candidates in English"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const def = defaultHowToApplyEn(form.noticeType);
                          updateForm('howToApplyEn', def);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Insert standard English application guide"
                      >
                        + Insert Standard Guide
                      </button>
                    </div>
                    <Textarea
                      rows={4}
                      value={form.howToApplyEn}
                      onChange={(e) => updateForm('howToApplyEn', e.target.value)}
                      placeholder="1. Visit the official portal / SSO Rajasthan (sso.rajasthan.gov.in) and log in.&#10;2. Navigate to Recruitment Portal and verify your OTR profile.&#10;3. Select the ongoing recruitment notification and click on Apply Online."
                    />
                  </FormField>

                  <FormField label="Age Relaxation (English Details)">
                    <Textarea
                      rows={2}
                      value={form.ageRelaxationEn}
                      onChange={(e) => updateForm('ageRelaxationEn', e.target.value)}
                      placeholder="Age relaxation of 5 to 10 years admissible for reserved categories (SC/ST/OBC/MBC/EWS) and female candidates as per State Government rules."
                    />
                  </FormField>

                  <FormField
                    label="FAQs (Frequently Asked Questions - English)"
                    hint="Format: Q: Question? \n A: Answer."
                  >
                    <Textarea
                      rows={4}
                      value={form.faqsEn}
                      onChange={(e) => updateForm('faqsEn', e.target.value)}
                      placeholder="Q: Is OTR registration mandatory?&#10;A: Yes, OTR is mandatory for all state examinations.&#10;&#10;Q: What is the age relaxation?&#10;A: 5 to 10 years relaxation for reserved categories."
                    />
                  </FormField>
                </div>
              )}
            </div>

            {/* 3. Category-Wise Vacancies */}
            <FormField label="Category-Wise Vacancies (वर्गवार रिक्तियों का विवरण)">
              <Textarea
                rows={2}
                value={form.categoryVacancies}
                onChange={(e) => updateForm('categoryVacancies', e.target.value)}
                placeholder="UR: 450, EWS: 105, OBC: 210, MBC: 52, SC: 168, ST: 135 (वैकल्पिक)"
              />
            </FormField>

            {/* 4. Dates Section (8 Important Dates) */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 space-y-3">
              <div className="pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Important Dates / महत्वपूर्ण तिथियाँ (8 Dates)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <FormField label="आवेदन प्रारंभ तिथि:">
                  <DatePicker
                    date={form.applicationStart}
                    onChange={(val) => updateForm('applicationStart', val)}
                    placeholder="आवेदन प्रारंभ तिथि"
                  />
                </FormField>
                <FormField label="आवेदन अंतिम तिथि:">
                  <DatePicker
                    date={form.applicationEnd}
                    onChange={(val) => updateForm('applicationEnd', val)}
                    placeholder="आवेदन अंतिम तिथि"
                  />
                </FormField>
                <FormField label="शुल्क भुगतान अंतिम तिथि:">
                  <DatePicker
                    date={form.feeEndDate}
                    onChange={(val) => updateForm('feeEndDate', val)}
                    placeholder="शुल्क भुगतान अंतिम तिथि"
                  />
                </FormField>
                <FormField label="फॉर्म सुधार अंतिम तिथि:">
                  <DatePicker
                    date={form.correctionEndDate}
                    onChange={(val) => updateForm('correctionEndDate', val)}
                    placeholder="फॉर्म सुधार अंतिम तिथि"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <FormField label="एग्जाम सिटी की जानकारी:">
                  <DatePicker
                    date={form.examCityDate}
                    onChange={(val) => updateForm('examCityDate', val)}
                    placeholder="एग्जाम सिटी तिथि"
                  />
                </FormField>
                <FormField label="एडमिट कार्ड तिथि:">
                  <Textarea
                    rows={1}
                    value={form.admitCardDate}
                    onChange={(e) => updateForm('admitCardDate', e.target.value)}
                    placeholder="एग्जाम से पहले जारी किया जाएगा।"
                  />
                </FormField>
                <FormField label="परीक्षा तिथि:">
                  <Textarea
                    rows={1}
                    value={form.examDate}
                    onChange={(e) => updateForm('examDate', e.target.value)}
                    placeholder="जल्द ही यहां अपडेट किया जाएगा।"
                  />
                </FormField>
                <FormField label="उत्तर कुंजी तिथि:">
                  <DatePicker
                    date={form.answerKeyDate}
                    onChange={(val) => updateForm('answerKeyDate', val)}
                    placeholder="उत्तर कुंजी तिथि"
                  />
                </FormField>
              </div>
            </div>

            {/* 5. Fees Section */}
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

            {/* 6. 11 Important Links Section (Sarkari 11 Portals) */}
            <div className="space-y-4 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20">
              <div className="pb-2 border-b border-amber-200 dark:border-amber-800/80">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Important Links / महत्वपूर्ण लिंक्स (11 Sarkari Portals)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="1. ऑनलाइन आवेदन करें (Apply Online)">
                  <Textarea rows={1} value={form.applyOnlineUrl} onChange={(e) => updateForm('applyOnlineUrl', e.target.value)} placeholder="https://..." />
                </FormField>
                <FormField label="2. शोर्ट नोटिस / एग्जाम डेट नोटिस (Short Notice)">
                  <Textarea rows={1} value={form.shortNoticeUrl} onChange={(e) => updateForm('shortNoticeUrl', e.target.value)} placeholder="https://..." />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="3. आधिकारिक विज्ञप्ति (Official Notification PDF)">
                  <Textarea rows={1} value={form.notificationPdfUrl} onChange={(e) => updateForm('notificationPdfUrl', e.target.value)} placeholder="https://..." />
                </FormField>
                <FormField label="4. सिलेबस और एग्जाम पैटर्न (Syllabus PDF)">
                  <Textarea rows={1} value={form.syllabusUrl} onChange={(e) => updateForm('syllabusUrl', e.target.value)} placeholder="https://..." />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="5. फॉर्म में सुधार (Correction Portal)">
                  <Textarea rows={1} value={form.correctionUrl} onChange={(e) => updateForm('correctionUrl', e.target.value)} placeholder="https://..." />
                </FormField>
                <FormField label="6. एडमिट कार्ड (Admit Card)">
                  <Textarea rows={1} value={form.admitCardUrl} onChange={(e) => updateForm('admitCardUrl', e.target.value)} placeholder="https://..." />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="7. एग्जाम सिटी डिटेल्स (Exam City Info)">
                  <Textarea rows={1} value={form.examCityUrl} onChange={(e) => updateForm('examCityUrl', e.target.value)} placeholder="https://..." />
                </FormField>
                <FormField label="8. उत्तर कुंजी (Answer Key)">
                  <Textarea rows={1} value={form.answerKeyUrl} onChange={(e) => updateForm('answerKeyUrl', e.target.value)} placeholder="https://..." />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="9. स्कोर कार्ड (Score Card / Marks)">
                  <Textarea rows={1} value={form.scoreCardUrl} onChange={(e) => updateForm('scoreCardUrl', e.target.value)} placeholder="https://..." />
                </FormField>
                <FormField label="10. परिणाम / मेरिट सूची (Result & Merit List)">
                  <Textarea rows={1} value={form.resultUrl} onChange={(e) => updateForm('resultUrl', e.target.value)} placeholder="https://..." />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="11. विभागीय आधिकारिक वेबसाइट (Official Website)">
                  <Textarea rows={1} value={form.officialSiteUrl} onChange={(e) => updateForm('officialSiteUrl', e.target.value)} placeholder="https://..." />
                </FormField>
                <FormField label="Telegram Channel / Group">
                  <Textarea rows={1} value={form.telegramUrl} onChange={(e) => updateForm('telegramUrl', e.target.value)} placeholder="https://t.me/Raj_Suchna" />
                </FormField>
                <FormField label="WhatsApp Community / Channel">
                  <Textarea rows={1} value={form.whatsappUrl} onChange={(e) => updateForm('whatsappUrl', e.target.value)} placeholder="https://whatsapp.com/channel/..." />
                </FormField>
              </div>
            </div>

            {/* Source URL & Editorial Verification */}
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
