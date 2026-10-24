"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, LogOut, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSidebar } from "./SidebarContext";

export function AdminHeader() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toggleMobile } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/admin/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem("rs_auth_user");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors pt-[env(safe-area-inset-top,0px)]">
      {/* Left: Mobile Hamburger Toggle & Brand (hidden on desktop) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobile}
          className="md:hidden min-w-[44px] min-h-[44px] -ml-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center font-bold text-white text-xs shadow-xs">
            RS
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            Rajasthan Suchna
          </span>
        </div>
      </div>

      {/* Right Actions & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* User Account Dropdown with Logout and Theme Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer min-h-[44px]"
            aria-label="Admin user menu"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A30B0B] to-[#7A0606] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              A
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline-block">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showUserMenu && (
            <>
              {/* Dismiss overlay */}
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setShowUserMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-30 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">Admin</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">admin@rajasthansuchna.gov.in</p>
                </div>

                <div className="px-2 py-1 space-y-1">
                  <button
                    onClick={() => { toggleTheme(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left cursor-pointer min-h-[38px]"
                  >
                    {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Switch to {theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-left font-semibold cursor-pointer min-h-[38px]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
