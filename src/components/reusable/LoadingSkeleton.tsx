'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps {
  lines?: number;
  type?: 'card' | 'table-row' | 'lines';
  className?: string;
}

export function LoadingSkeleton({ lines = 3, type = 'lines', className }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className={cn('bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 animate-pulse', className)}>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3"></div>
      </div>
    );
  }

  if (type === 'table-row') {
    return (
      <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
        <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-1"></div><div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-32"></div></td>
        <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
        <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
        <td className="py-4 px-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div></td>
        <td className="py-4 px-4 text-right"><div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div></td>
      </tr>
    );
  }

  return (
    <div className={cn('space-y-2.5 animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 dark:bg-slate-800 rounded"
          style={{ width: `${100 - i * 15}%` }}
        ></div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
