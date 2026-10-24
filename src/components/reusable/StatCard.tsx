'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SubStat {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}

export interface StatCardProps {
  title: string;
  icon?: React.ReactNode;
  value: string | number;
  description?: string;
  borderColor?: string;
  subStats?: SubStat[];
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  value,
  description,
  borderColor = 'border-l-[#A30B0B] dark:border-l-amber-400',
  subStats,
  onClick,
  className,
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 border-l-4 rounded-xl p-5 shadow-sm transition-all',
        borderColor,
        isClickable && 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</span>
        {description && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{description}</span>
        )}
      </div>

      {subStats && subStats.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 text-xs">
          {subStats.map((sub, i) => (
            <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              {sub.icon}
              <span className="text-[11px] font-medium">{sub.label}:</span>
              <strong className="text-slate-900 dark:text-white">{sub.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;
