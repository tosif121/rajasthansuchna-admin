import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#A30B0B] text-white border-transparent",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-transparent",
    destructive: "bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/60",
    outline: "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200",
    success: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50",
    warning: "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
