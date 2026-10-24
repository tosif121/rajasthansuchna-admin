"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sun, Moon, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AdminHeaderProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export function AdminHeader({ currentRole, onRoleChange }: AdminHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("rs_auth_user");
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search circulars, agencies, or recruitment posts..."
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#A30B0B] transition-colors"
        />
      </div>

      {/* Right Actions & Controls */}
      <div className="flex items-center gap-3">
        {/* User Account Dropdown with Logout and Theme Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A30B0B] to-[#7A0606] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              A
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline-block">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-30 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">Admin</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">admin@rajasthansuchna.gov.in</p>
              </div>

              <div className="px-2 py-1 space-y-1">
                <button
                  onClick={() => { toggleTheme(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left cursor-pointer"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                  <span>Switch to {theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-left font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
