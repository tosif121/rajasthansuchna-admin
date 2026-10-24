'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Building2, 
  History, 
  Settings, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard (डैशबोर्ड)', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Notices (सभी भर्तियां)', href: '/notices', icon: FileText },
  { name: 'Review Queue (समीक्षा कतार)', href: '/review-queue', icon: CheckSquare, badge: '1' },
  { name: 'Agencies (भर्ती बोर्ड)', href: '/agencies', icon: Building2 },
  { name: 'Audit Logs (ऑडिट रिकॉर्ड)', href: '/audit-logs', icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-screen transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-red-50 to-amber-50/30 dark:from-red-950/40 dark:to-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-bold text-white shadow-md shadow-red-950/20">
            राज
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight tracking-wide">
              राज सूचना
            </h1>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#A30B0B] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                  isActive ? 'bg-white text-[#A30B0B]' : 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live Flutter App API Status */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">
          <span>FLUTTER API</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-2 leading-relaxed">
          Versioned /api/v1 endpoints connected to mobile client.
        </p>
        <a
          href="/api/v1/notices"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold transition-colors"
        >
          Inspect Feed JSON <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Admin User Footer */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-800 dark:text-amber-400 font-bold text-xs">
          VS
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">Vikram Sharma</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Senior Editor & Approver</p>
        </div>
        <button title="Settings" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
