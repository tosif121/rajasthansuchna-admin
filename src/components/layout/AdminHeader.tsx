'use client';

import React from 'react';
import { Bell, Search, UserCheck } from 'lucide-react';

interface AdminHeaderProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export function AdminHeader({ currentRole, onRoleChange }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search notices, agencies, or circular numbers..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {/* Right Actions & Role Simulation Switcher */}
      <div className="flex items-center gap-4">
        {/* Role Switcher to test Self-Approval Policy */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Testing as:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="reviewer" className="bg-slate-900 text-white">Reviewer / Approver</option>
            <option value="editor" className="bg-slate-900 text-white">Submitting Editor (usr_editor_1)</option>
            <option value="publisher" className="bg-slate-900 text-white">Publisher</option>
            <option value="administrator" className="bg-slate-900 text-white">Super Administrator</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 bg-slate-900 rounded-lg border border-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950"></span>
        </button>
      </div>
    </header>
  );
}
