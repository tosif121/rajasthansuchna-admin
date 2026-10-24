"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const renderedAction = action || (actionLabel && onAction ? (
    <Button
      onClick={onAction}
      className="h-9 rounded-xl text-xs font-semibold cursor-pointer"
    >
      {actionLabel}
    </Button>
  ) : null);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-2xl bg-card/60 max-w-lg mx-auto my-6",
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3.5 border border-primary/20 shadow-2xs">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {(renderedAction || secondaryAction) && (
        <div className="flex items-center gap-2.5 mt-5 flex-wrap justify-center">
          {renderedAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
