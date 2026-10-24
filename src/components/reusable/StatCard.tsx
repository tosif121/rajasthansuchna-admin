"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface SubStat {
  label: string;
  value: number | string;
  icon?: React.ReactNode | React.ElementType;
}

export interface StatCardProps {
  title: string;
  icon?: React.ReactNode | React.ElementType;
  value: string | number;
  description?: string;
  subtitle?: string;
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
  subtitle,
  borderColor = "border-l-[#A30B0B] dark:border-l-amber-400",
  subStats,
  onClick,
  className,
}) => {
  const isClickable = !!onClick;
  const desc = description || subtitle;

  const renderIcon = (itemIcon?: React.ReactNode | React.ElementType) => {
    if (!itemIcon) return null;
    if (React.isValidElement(itemIcon)) return itemIcon;
    if (typeof itemIcon === "function" || (typeof itemIcon === "object" && "$$typeof" in (itemIcon as any))) {
      const IconComponent = itemIcon as React.ElementType;
      return <IconComponent className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
    return itemIcon as React.ReactNode;
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-l-4 p-5 transition-all",
        borderColor,
        isClickable && "cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        {icon && <span className="shrink-0">{renderIcon(icon)}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</span>
        {desc && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{desc}</span>
        )}
      </div>

      {subStats && subStats.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 text-xs">
          {subStats.map((sub, i) => (
            <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              {sub.icon && <span className="text-slate-400">{renderIcon(sub.icon)}</span>}
              <span className="text-slate-500 dark:text-slate-400">{sub.label}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
