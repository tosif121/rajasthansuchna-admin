"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted/70", className)}
      {...props}
    />
  );
}

export function PageSkeleton({ statsCount = 4 }: { statsCount?: number }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      {statsCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: statsCount }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border bg-card space-y-2">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Content Skeleton */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-muted/60 animate-pulse rounded-2xl border border-border/60" />
      ))}
    </div>
  );
}

export function LoadingSkeleton({
  type = "card",
  count = 1,
}: {
  type?: "card" | "table-row" | "text" | "stats";
  count?: number;
}) {
  if (type === "table-row") {
    return (
      <tr className="animate-pulse border-b border-border/40">
        <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
        <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
        <td className="py-4 px-4"><Skeleton className="h-4 w-48" /></td>
        <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
        <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
        <td className="py-4 px-4 text-right"><Skeleton className="h-6 w-16 ml-auto rounded-lg" /></td>
      </tr>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
