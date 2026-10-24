"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  ShieldCheck,
  Sparkles,
  FolderTree,
  X
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "All Notices", href: "/notices", icon: FileText },
  { name: "Agencies", href: "/agencies", icon: Building2 },
  { name: "Categories", href: "/categories", icon: FolderTree },
  { name: "Settings", href: "/settings", icon: Sparkles },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside (Fixed Slide-over on mobile, sticky docked on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:static md:w-64 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-dvh md:min-h-screen transition-transform duration-300 ease-in-out select-none shadow-2xl md:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-red-50 to-amber-50/30 dark:from-red-950/40 dark:to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-red-950/20 shrink-0">
              RS
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight tracking-wide">
                Rajasthan Suchna
              </h1>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Admin Console
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={closeMobile}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center justify-between px-3.5 py-3 md:py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] md:min-h-0 ${
                  isActive
                    ? "bg-[#A30B0B] text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
