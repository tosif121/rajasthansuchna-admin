'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const renderedAction =
    action ||
    (actionLabel && onAction ? (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-[#A30B0B] hover:bg-[#850909] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        {actionLabel}
      </button>
    ) : null);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white/60 dark:bg-slate-900/40 max-w-lg mx-auto my-6',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#A30B0B] dark:text-amber-400 flex items-center justify-center mb-3.5 border border-red-200 dark:border-red-900/40 shadow-xs">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {renderedAction && (
        <div className="mt-5">
          {renderedAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
