
'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this record? This action cannot be undone.',
  itemName,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{title}</h3>
            {itemName && (
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{itemName}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 text-xs">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
