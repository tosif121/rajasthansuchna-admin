'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange?: () => void;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  onCheckedChange,
  disabled,
  label,
  className = '',
}: ToggleSwitchProps) {
  const handleClick = () => {
    if (disabled) return;
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
    if (onChange) {
      onChange();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors shrink-0',
        checked ? 'bg-[#A30B0B]' : 'bg-slate-300 dark:bg-slate-700',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

export default ToggleSwitch;
