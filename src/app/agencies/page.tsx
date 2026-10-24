'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Building2, ExternalLink, Globe, ShieldCheck } from 'lucide-react';

interface Agency {
  id: string;
  nameHi: string;
  nameEn: string;
  code: string;
  parentGroup: 'rajasthan' | 'central';
  officialUrl: string;
  activeNotices: number;
}

const agenciesList: Agency[] = [
  { id: 'agency_rsmssb', nameHi: 'राजस्थान कर्मचारी चयन बोर्ड', nameEn: 'RSMSSB (Rajasthan Staff Selection Board)', code: 'RSMSSB', parentGroup: 'rajasthan', officialUrl: 'https://rsmssb.rajasthan.gov.in', activeNotices: 12 },
  { id: 'agency_rpsc', nameHi: 'राजस्थान लोक सेवा आयोग', nameEn: 'RPSC (Rajasthan Public Service Commission)', code: 'RPSC', parentGroup: 'rajasthan', officialUrl: 'https://rpsc.rajasthan.gov.in', activeNotices: 8 },
  { id: 'agency_police', nameHi: 'राजस्थान पुलिस मुख्यालय', nameEn: 'Rajasthan Police Headquarters', code: 'POLICE', parentGroup: 'rajasthan', officialUrl: 'https://police.rajasthan.gov.in', activeNotices: 4 },
  { id: 'agency_hc', nameHi: 'राजस्थान उच्च न्यायालय जोधपुर', nameEn: 'Rajasthan High Court Jodhpur', code: 'HCRAJ', parentGroup: 'rajasthan', officialUrl: 'https://hcraj.nic.in', activeNotices: 3 },
  { id: 'agency_ssc', nameHi: 'कर्मचारी चयन आयोग', nameEn: 'Staff Selection Commission (SSC)', code: 'SSC', parentGroup: 'central', officialUrl: 'https://ssc.gov.in', activeNotices: 15 },
  { id: 'agency_rrb', nameHi: 'रेलवे भर्ती बोर्ड', nameEn: 'Railway Recruitment Board (RRB)', code: 'RRB', parentGroup: 'central', officialUrl: 'https://rrbcdg.gov.in', activeNotices: 6 },
];

export default function AgenciesPage() {
  const [currentRole, setCurrentRole] = useState('reviewer');
  const [filterGroup, setFilterGroup] = useState<'all' | 'rajasthan' | 'central'>('all');

  const filtered = agenciesList.filter(a => filterGroup === 'all' || a.parentGroup === filterGroup);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#A30B0B] dark:text-amber-400" />
                भर्ती बोर्ड एवं एजेंसियां <span className="text-sm font-normal text-slate-500 dark:text-slate-400">· Recruitment Agencies</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Official state and central examination commissions delivering verified circulars to Rajasthan Suchna.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => setFilterGroup('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterGroup === 'all' ? 'bg-[#A30B0B] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Agencies ({agenciesList.length})
              </button>
              <button
                onClick={() => setFilterGroup('rajasthan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterGroup === 'rajasthan' ? 'bg-[#A30B0B] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Rajasthan Govt (राज्य)
              </button>
              <button
                onClick={() => setFilterGroup('central')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterGroup === 'central' ? 'bg-[#A30B0B] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Central Govt (केन्द्र)
              </button>
            </div>
          </div>

          {/* Agencies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(agency => (
              <div
                key={agency.id}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-red-200 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-bold text-white text-sm shadow-md shadow-red-950/20">
                    {agency.code}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    agency.parentGroup === 'rajasthan'
                      ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50'
                      : 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50'
                  }`}>
                    {agency.parentGroup === 'rajasthan' ? 'RAJASTHAN GOVT' : 'CENTRAL GOVT'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{agency.nameHi}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{agency.nameEn}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <strong>{agency.activeNotices}</strong> Active Circulars
                  </span>
                  <a
                    href={agency.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#A30B0B] dark:text-amber-400 hover:underline"
                  >
                    Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
