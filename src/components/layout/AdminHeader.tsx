'use client';

import React from 'react';
import { Bell, Search, UserCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface AdminHeaderProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export function AdminHeader({ currentRole, onRoleChange }: AdminHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search notices, agencies, or circulars..."
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-600 dark:focus:border-red-500 transition-colors"
        />
      </div>

      {/* Right Actions & Controls */}
      <div className="flex items-center gap-3">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-600" />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Role Switcher to test Self-Approval Policy */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-slate-500 dark:text-slate-400">Testing as:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-amber-700 dark:text-amber-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="reviewer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Reviewer / Approver</option>
            <option value="editor" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Submitting Editor (usr_editor_1)</option>
            <option value="publisher" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Publisher</option>
            <option value="administrator" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Super Administrator</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-950"></span>
        </button>
      </div>
    </header>
  );
}
