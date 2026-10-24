"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DeleteConfirmationModalProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  isDeleting?: boolean;
  displayName?: string;
  itemName?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  deletingLabel?: string;
  icon?: React.ReactNode;
  variant?: "destructive" | "warning";
}

export function DeleteConfirmationModal({
  open,
  isOpen,
  onOpenChange,
  onDelete,
  onConfirm,
  onCancel,
  isDeleting = false,
  displayName,
  itemName,
  title = "Are you sure?",
  description,
  actionLabel = "Delete",
  deletingLabel,
  icon,
  variant = "destructive",
}: DeleteConfirmationModalProps) {
  const isModalOpen = open !== undefined ? open : (isOpen ?? false);
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onCancel) onCancel();
  };
  const handleAction = () => {
    if (onDelete) onDelete();
    if (onConfirm) onConfirm();
  };

  const name = displayName || itemName;
  const isWarning = variant === "warning";
  const defaultDeletingLabel = deletingLabel || (actionLabel.endsWith("e") ? `${actionLabel.slice(0, -1)}ing...` : `${actionLabel}ing...`);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl sm:max-w-sm bg-card border border-border shadow-xl p-6">
        <DialogHeader className="items-center text-center gap-1 pt-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 border ${
              isWarning
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {icon || (isWarning ? <AlertTriangle size={22} /> : <Trash2 size={22} />)}
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
          <div className="text-xs text-muted-foreground text-center mt-1">
            {description ? (
              <p>{description}</p>
            ) : (
              <p>
                Do you really want to delete{" "}
                <span className="font-semibold text-destructive">&quot;{name || "this item"}&quot;</span>? This action cannot be undone.
              </p>
            )}
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border-border/60"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={isDeleting}
            className={`flex-1 rounded-xl text-white ${
              isWarning ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {defaultDeletingLabel}
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmationModal;
