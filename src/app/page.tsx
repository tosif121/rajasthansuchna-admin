'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  FileText,
  ChevronDown,
  Calendar,
  Briefcase,
  Search,
  Lock,
  MessageSquare,
  Share2,
  Smartphone,
  Flame,
  Clock,
  MapPin,
  GraduationCap,
  HelpCircle,
  TrendingUp,
  Send,
  Users,
} from 'lucide-react';

interface NoticeItem {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  summaryHi?: string;
  summaryEn?: string;
  noticeType?: string;
  agencyName?: string;
  state?: string;
  publishedAt?: string;
  facts?: {
    postsCount?: number;
    qualification?: string;
    applicationEnd?: string;
    examDate?: string;
    feeGeneralObc?: string;
    feeScSt?: string;
    feePh?: string;
    sourceUrl?: string;
  };
  links?: Array<{ label: string; url: string; kind: string }>;
}

export default function LandingPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await fetch('/api/v1/notices?limit=12');
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.vacancies || data.items || []);
          setNotices(items);
        }
      } catch (err) {
        console.error('Failed to load notices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((n) => {
    const matchesCat =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'rajasthan'
        ? (n.state || '').toLowerCase() === 'rajasthan'
        : selectedCategory === 'central'
        ? (n.state || '').toLowerCase() === 'central'
        : selectedCategory === 'admitcard'
        ? (n.noticeType || '').toLowerCase() === 'admitcard'
        : selectedCategory === 'result'
        ? (n.noticeType || '').toLowerCase() === 'result'
        : true;

    const matchesQuery =
      searchQuery.trim() === ''
        ? true
        : (n.titleHi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.titleEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.agencyName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesQuery;
  });

  const faqs = [
    {
      q: 'राज सूचना ऐप क्या है और यह अन्य जॉब पोर्टल्स से अलग क्यों है?',
      a: 'राज सूचना राजस्थान एवं केंद्र सरकार की सभी भर्तियों, परीक्षाओं, उत्तर-कुंजियों और परिणामों की 100% आधिकारिक और सत्यापित जानकारी प्रदान करने वाला स्वतंत्र प्लेटफ़ॉर्म है। यहाँ बिना किसी फर्जी खबर या भ्रामक विज्ञापनों के सिर्फ आधिकारिक राजपत्र (Gazette) व आयोग सर्कुलरों पर आधारित सूचना मिलती है।',
    },
    {
      q: 'क्या ऐप में राजस्थान पशु परिचर, रीट, पटवारी व CET की जानकारी उपलब्ध है?',
      a: 'हाँ! RSSB, RPSC, पुलिस, शिक्षा विभाग, बिजली बोर्ड (JVVNL), हाई कोर्ट तथा SSC, UPSC, रेलवे की सभी भर्तियों का विस्तृत विवरण, पद संख्या, पात्रता, आयु सीमा एवं आवेदन लिंक उपलब्ध है।',
    },
    {
      q: 'राज सूचना एआई सहायक (AI Assistant) कैसे काम करता है?',
      a: 'हमारा एआई सहायक केवल संबंधित भर्ती की आधिकारिक अधिसूचना के आधार पर आपके प्रश्नों (जैसे: योग्यता, उम्र, फीस, परीक्षा तिथि) का उत्तर देता है। यह किसी भी प्रकार की काल्पनिक या भ्रामक जानकारी नहीं देता।',
    },
    {
      q: 'क्या ऐप डाउनलोड करने और उपयोग करने के लिए कोई शुल्क है?',
      a: 'नहीं! राज सूचना ऐप सभी अभ्यर्थियों के लिए पूर्णतः निःशुल्क डाउनलोड योग्य है। सभी लाइव अलर्ट और भर्ती सूचनाएं पूरी तरह फ्री हैं।',
    },
    {
      q: 'एपीके (APK) इंस्टॉल करते समय Android सुरक्षा चेतावनी क्यों दिखाता है?',
      a: 'जब आप Google Play Store के बाहर किसी डायरेक्ट वेबसाइट से APK डाउनलोड करते हैं, तो Android सुरक्षा कारणों से "File might be harmful" या "Unknown Source" की चेतावनी देता है। आप सुरक्षित रूप से "Download anyway" और "Install" चुन सकते हैं क्योंकि यह हमारी आधिकारिक हस्ताक्षरित फ़ाइल है।',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-[#A30B0B] selection:text-white">
      {/* ─── Top Notification Ticker ─── */}
      <div className="bg-gradient-to-r from-[#7A0606] via-[#A30B0B] to-[#7A0606] text-white py-1.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 shadow-sm">
        <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
          <Flame className="w-3 h-3 fill-slate-950" /> Live
        </span>
        <span>राजस्थान एवं केंद्र सरकार की भर्तियों, एडमिट कार्ड और रिजल्ट्स की 100% आधिकारिक सूचना</span>
        <span className="hidden md:inline text-amber-200">| सीधे राजपत्र से सत्यापित</span>
      </div>

      {/* ─── Navigation Header ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-950/20 group-hover:scale-105 transition-transform">
              RS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                  राज सूचना
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-[#A30B0B] dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                Raj Suchna · Govt Alert Portal
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#vacancies" className="hover:text-[#A30B0B] dark:hover:text-amber-400 transition-colors">
              ताज़ा भर्तियां
            </a>
            <a href="#ai-assistant" className="hover:text-[#A30B0B] dark:hover:text-amber-400 transition-colors">
              AI सहायक
            </a>
            <a href="#community" className="hover:text-[#A30B0B] dark:hover:text-amber-400 transition-colors">
              टेलीग्राम / व्हाट्सएप
            </a>
            <a href="#features" className="hover:text-[#A30B0B] dark:hover:text-amber-400 transition-colors">
              विशेषताएं
            </a>
            <a href="#faq" className="hover:text-[#A30B0B] dark:hover:text-amber-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" /> Admin Console
            </Link>
            <a
              href="/api/v1/download-apk"
              download="RajSuchna.apk"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A30B0B] to-[#850909] hover:from-[#850909] hover:to-[#680505] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-950/20 hover:shadow-lg transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download App</span>
              <span className="hidden sm:inline text-[10px] bg-red-950/50 px-1.5 py-0.5 rounded text-red-200">
                APK
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-red-50/40 via-amber-50/20 to-transparent dark:from-red-950/20 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Official Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  100% आधिकारिक अधिसूचनाएं · शून्य फर्जी खबरें
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.15]">
                सरकारी नौकरियों की हर सूचना,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A30B0B] via-red-600 to-amber-600">
                  सबसे पहले और सबसे सटीक
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                राजस्थान (RPSC, RSSB, पुलिस, शिक्षा) एवं केंद्र (SSC, रेलवे, रक्षा) की सभी भर्तियां, एडमिट कार्ड, सिलेबस, कट-ऑफ और आधिकारिक स्रोत से सत्यापित जानकारी — अब आपके मोबाइल में।
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href="/api/v1/download-apk"
                  download="RajSuchna.apk"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#A30B0B] to-[#7A0606] hover:from-[#850909] hover:to-[#630404] text-white rounded-2xl text-base font-bold shadow-xl shadow-red-950/25 hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-sm font-extrabold leading-tight">डाउनलोड राज सूचना ऐप</div>
                    <div className="text-[11px] text-red-200 font-normal">Direct Release APK (v1.0.0)</div>
                  </div>
                </a>

                <a
                  href="#vacancies"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
                >
                  <Search className="w-4 h-4 text-[#A30B0B]" />
                  <span>ताज़ा भर्तियां देखें</span>
                </a>
              </div>

              {/* Community Badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs">
                <span className="text-slate-500 font-medium">ऑफिशियल चैनल से जुड़ें:</span>
                <a
                  href="https://t.me/Raj_Suchna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Telegram (@Raj_Suchna)
                </a>
                <a
                  href="https://whatsapp.com/channel/0029Vakea9U89inpSSjnR82N"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Channel
                </a>
              </div>
            </div>

            {/* Right Mockup Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px]">
                {/* Decorative Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 rounded-[40px] blur-xl opacity-75"></div>

                {/* Mobile Mockup Card */}
                <div className="relative bg-white dark:bg-slate-900 rounded-[36px] border-4 border-slate-800 dark:border-slate-700 p-4 shadow-2xl overflow-hidden">
                  {/* Phone Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#A30B0B] text-white flex items-center justify-center text-[10px] font-black">
                        RS
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">राज सूचना</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      ⚡ 35 क्रेडिट्स
                    </span>
                  </div>

                  {/* Mock Vacancy Card */}
                  <div className="my-3 p-3 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50/50 dark:from-slate-800 dark:to-slate-800/80 border border-red-100 dark:border-slate-700">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#A30B0B] dark:text-red-400 mb-1">
                      <span>RSSB JAIPUR</span>
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                        5,934 पद
                      </span>
                    </div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      राजस्थान पशु परिचर (Animal Attendant) भर्ती 2026
                    </h2>
                    <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      <div>🎓 योग्यता: 10वीं पास</div>
                      <div>📅 अंतिम तिथि: 30 दिसंबर 2026</div>
                      <div>💰 फीस: Gen/OBC ₹600 · SC/ST ₹400 · PH ₹0</div>
                    </div>
                  </div>

                  {/* AI Assistant Chat Bubble */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] space-y-1.5 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-[#A30B0B] dark:text-amber-400 font-bold text-[10px]">
                      <Sparkles className="w-3 h-3" /> राज सूचना एआई सहायक
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-[10px] leading-snug">
                      &quot;नमस्ते! मैं राज सूचना एआई सहायक हूँ। पशु परिचर भर्ती 2026 की आधिकारिक अधिसूचना से सत्यापित जानकारी दे सकता हूँ।&quot;
                    </p>
                  </div>

                  {/* Bottom Navigation Mock */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-around text-[10px] text-slate-400 font-medium">
                    <span className="text-[#A30B0B] font-bold">होम</span>
                    <span>श्रेणियां</span>
                    <span className="text-[#A30B0B]">एआई सहायता</span>
                    <span>प्रोफाइल</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#A30B0B] dark:text-amber-400">50,000+</div>
              <div className="text-xs font-medium text-slate-500 mt-1">एक्टिव सरकारी पद</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">100%</div>
              <div className="text-xs font-medium text-slate-500 mt-1">सत्यापित अधिसूचनाएं</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">12+</div>
              <div className="text-xs font-medium text-slate-500 mt-1">भर्ती आयोग (RPSC, RSSB, SSC)</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">0 Ads</div>
              <div className="text-xs font-medium text-slate-500 mt-1">शून्य भ्रामक विज्ञापन</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Vacancies Section ─── */}
      <section id="vacancies" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A30B0B] uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> ताज़ा सरकारी भर्तियां
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              वर्तमान में खुली प्रमुख अधिसूचनाएं
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="भर्ती या आयोग खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A30B0B]/20"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'सभी भर्तियां (All)' },
            { id: 'rajasthan', label: 'राजस्थान विशेष (Rajasthan)' },
            { id: 'central', label: 'अखिल भारतीय (Central Govt)' },
            { id: 'admitcard', label: 'एडमिट कार्ड (Admit Cards)' },
            { id: 'result', label: 'रिजल्ट / परिणाम (Results)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#A30B0B] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vacancies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Briefcase className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              इस श्रेणी में कोई भर्ती नहीं मिली।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900 hover:shadow-lg transition-all"
              >
                <div>
                  {/* Agency & Post Badge */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-[#A30B0B] dark:text-red-400 truncate max-w-[170px]">
                      {notice.agencyName || (notice.state === 'rajasthan' ? 'Rajasthan Govt' : 'Central Govt')}
                    </span>
                    {notice.facts?.postsCount ? (
                      <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800">
                        {notice.facts.postsCount.toLocaleString()} पद
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {notice.titleHi || notice.titleEn}
                  </h3>

                  {/* Facts details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {notice.facts?.qualification && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{notice.facts.qualification}</span>
                      </div>
                    )}
                    {notice.facts?.applicationEnd && (
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>अंतिम तिथि: {notice.facts.applicationEnd}</span>
                      </div>
                    )}
                    {(notice.facts?.feeGeneralObc || notice.facts?.feeScSt) && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 truncate">
                        शुल्क: Gen/OBC {notice.facts?.feeGeneralObc || '₹-'} · SC/ST {notice.facts?.feeScSt || '₹-'}
                        {notice.facts?.feePh ? ` · PH ${notice.facts.feePh}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">सत्यापित सूचना</span>
                  <a
                    href="/api/v1/download-apk"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#A30B0B] dark:text-amber-400 hover:underline"
                  >
                    <span>ऐप पर देखें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── AI Assistant Feature Showcase ─── */}
      <section id="ai-assistant" className="py-16 bg-gradient-to-br from-red-50/70 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/70 text-[#A30B0B] dark:text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> ग्राउंडेड आर्टिफिशियल इंटेलिजेंस
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 dark:text-white leading-tight">
                राज सूचना एआई सहायक — <br />
                <span className="text-[#A30B0B] dark:text-amber-400">बिना भ्रम की प्रामाणिक जानकारी</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                किसी भी भर्ती के 50 पन्नों के नोटिफिकेशन को पढ़ने में घंटों बर्बाद न करें। राज सूचना एआई से सीधे पूछें कि आपकी उम्र, योग्यता और श्रेणी के अनुसार आप पात्र हैं या नहीं।
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'केवल आधिकारिक सरकारी अधिसूचना (Gazette) पर आधारित उत्तर',
                  'योग्यता, आयु सीमा, परीक्षा पैटर्न और फीस की तुरंत जानकारी',
                  'हिन्दी और अंग्रेज़ी दोनों भाषाओं में सरल और स्पष्ट संवाद',
                  'शून्य काल्पनिक या गलत जानकारी (Strict Grounding)',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Demo Simulation */}
            <div className="lg:col-span-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#A30B0B] flex items-center justify-center text-white font-bold text-xs">
                      AI
                    </div>
                    <span>राज सूचना एआई सहायक (लाइव चैट)</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> एक्टिव
                  </span>
                </div>

                {/* Question bubble */}
                <div className="flex justify-end">
                  <div className="bg-[#A30B0B] text-white p-3 rounded-2xl rounded-tr-xs text-xs max-w-[85%] shadow-sm">
                    क्या 12वीं पास छात्र राजस्थान पशु परिचर या पुलिस कांस्टेबल भर्ती के लिए आवेदन कर सकता है?
                  </div>
                </div>

                {/* AI Answer Bubble */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-3.5 rounded-2xl rounded-tl-xs text-xs max-w-[90%] space-y-1.5 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-bold text-[#A30B0B] dark:text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> आधिकारिक अधिसूचना से सत्यापित
                    </div>
                    <p className="leading-relaxed">
                      हाँ! राजस्थान पशु परिचर भर्ती हेतु न्यूनतम शैक्षणिक योग्यता <strong>10वीं पास (Secondary)</strong> रखी गई है तथा पुलिस कांस्टेबल हेतु <strong>12वीं पास (Senior Secondary + CET)</strong> आवश्यक है। अतः 12वीं पास अभ्यर्थी दोनों भर्तियों हेतु पात्र हैं।
                    </p>
                  </div>
                </div>

                {/* Download CTA in Card */}
                <div className="pt-2 text-center">
                  <a
                    href="/api/v1/download-apk"
                    download="RajSuchna.apk"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#A30B0B] dark:text-amber-400 hover:underline"
                  >
                    <span>ऐप डाउनलोड कर अपने सवाल अभी पूछें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Community Section ─── */}
      <section id="community" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#A30B0B] uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" /> आधिकारिक कम्युनिटी
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            लाखों अभ्यर्थियों से सीधे जुड़ें
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
            टेलीग्राम और व्हाट्सएप पर परीक्षा तिथियां, पीडीएफ नोटिफिकेशन और एडमिट कार्ड के सीधे लिंक सबसे पहले प्राप्त करें।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Telegram Card */}
          <a
            href="https://t.me/Raj_Suchna"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-800 border border-sky-200 dark:border-sky-900 hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#0088cc] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-sky-600/20">
              <Send className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                Official Telegram Channel
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                @Raj_Suchna
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                दैनिक अपडेट्स, पीडीएफ सर्कुलर्स और फास्ट अलर्ट्स
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-sky-600 ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* WhatsApp Card */}
          <a
            href="https://whatsapp.com/channel/0029Vakea9U89inpSSjnR82N"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50/50 dark:from-slate-900 dark:to-slate-800 border border-emerald-200 dark:border-emerald-900 hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-emerald-600/20">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Official WhatsApp Channel
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Raj Suchna Alerts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                सीधे आपके व्हाट्सएप पर इंस्टेंट सरकारी सूचनाएं
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-600 ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* ─── Key Features Section ─── */}
      <section id="features" className="py-16 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              राज सूचना ऐप के प्रमुख फ़ायदे
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              अभ्यर्थियों की ज़रूरतों को ध्यान में रखकर तैयार किया गया सबसे विश्वसनीय प्लेटफॉर्म
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#A30B0B] flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                तत्काल पुश नोटिफिकेशन्स
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                जैसे ही कोई नया नोटिफिकेशन या एडमिट कार्ड जारी होगा, आपके फोन पर तुरंत अलर्ट आ जाएगा ताकि कोई अंतिम तिथि न छूटे।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                सीधे आधिकारिक लिंक्स
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                किसी भी बिचौलिए या फेक री-डायरेक्ट के बिना सीधे SSO राजस्थान, RPSC व RSSB के मुख्य आवेदन पोर्टल का लिंक मिलता है।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                ऑफलाइन सेव व बुकमार्क
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                मनपसंद भर्तियों को बिना इंटरनेट के कभी भी पढ़ने के लिए ऐप में बुकमार्क करें। सभी विवरण आपके फोन में सुरक्षित रहते हैं।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#A30B0B] uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" /> अक्सर पूछे जाने वाले सवाल
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
            अभ्यर्थी सहायता व FAQ
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-[#A30B0B]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom Call to Action ─── */}
      <section className="py-14 bg-gradient-to-r from-[#7A0606] via-[#A30B0B] to-[#7A0606] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            आज ही डाउनलोड करें &quot;राज सूचना&quot; ऐप
          </h2>
          <p className="text-sm sm:text-base text-red-100 max-w-xl mx-auto">
            सरकारी नौकरी की तैयारी करने वाले हर अभ्यर्थी का सबसे भरोसेमंद साथी।
          </p>
          <div className="pt-2">
            <a
              href="/api/v1/download-apk"
              download="RajSuchna.apk"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 hover:bg-amber-300 rounded-2xl text-base font-extrabold shadow-2xl transition-all transform hover:scale-105"
            >
              <Download className="w-5 h-5 text-[#A30B0B]" />
              <span>डाउनलोड ऐप (APK)</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#A30B0B] text-white flex items-center justify-center font-black text-sm">
                RS
              </div>
              <div>
                <span className="font-bold text-white text-sm">राज सूचना (Raj Suchna)</span>
                <p className="text-[10px] text-slate-500">Government Recruitment Information Portal</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <a href="https://t.me/Raj_Suchna" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Telegram
              </a>
              <a href="https://whatsapp.com/channel/0029Vakea9U89inpSSjnR82N" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                WhatsApp
              </a>
              <Link href="/login" className="hover:text-white transition-colors">
                Admin Console
              </Link>
              <a href="mailto:rajsuchnaa@gmail.com" className="hover:text-white transition-colors">
                Support: rajsuchnaa@gmail.com
              </a>
            </div>
          </div>

          <div className="pt-6 text-center text-[11px] text-slate-500 leading-relaxed">
            <p>
              <strong>Disclaimer:</strong> राज सूचना एक स्वतंत्र सूचना पोर्टल एवं एप्लीकेशन है जो राजस्थान एवं केंद्र सरकार की आधिकारिक विज्ञप्तियों, राजपत्रों और आयोगों की वेबसाइटों से सूचना एकत्रित कर अभ्यर्थियों तक पहुंचाता है। अभ्यर्थियों को सलाह दी जाती है कि आवेदन से पूर्व संबंधित आयोग की आधिकारिक अधिसूचना का अवलोकन अवश्य करें।
            </p>
            <p className="mt-2 text-slate-600">
              © 2026 Raj Suchna. All Rights Reserved. Built with precision for Rajasthan aspirants.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
