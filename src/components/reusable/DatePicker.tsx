'use client';

import * as React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  date?: Date | string | null;
  setDate?: (date: Date | undefined) => void;
  onChange?: (dateStr: string, dateObj?: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  showTimeSelect?: boolean;
  id?: string;
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: (e: React.MouseEvent) => void;
  hasValue?: boolean;
  clearable?: boolean;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, onChange, onKeyDown, onFocus, onBlur, placeholder, disabled, className, id, onClear, hasValue, clearable, ...rest }, ref) => {
    return (
      <div className="relative w-full inline-block">
        <div
          onClick={disabled ? undefined : (onClick as any)}
          className={cn(
            'flex items-center w-full h-9 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all cursor-pointer shadow-xs select-none',
            'hover:border-[#A30B0B]/50 hover:bg-muted/30 focus-within:ring-2 focus-within:ring-[#A30B0B]/20 focus-within:border-[#A30B0B]',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#A30B0B] dark:text-amber-400 shrink-0" />
          <input
            ref={ref}
            type="text"
            id={id}
            value={value || ''}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={placeholder || 'Select deadline date'}
            readOnly
            className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none cursor-pointer"
            {...rest}
          />
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClear?.(e);
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors"
              aria-label="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
CustomDateInput.displayName = 'CustomDateInput';

export function DatePicker({
  date,
  setDate,
  onChange,
  placeholder = 'Select application deadline',
  className,
  disabled = false,
  clearable = true,
  minDate,
  maxDate,
  dateFormat = 'yyyy-MM-dd',
  showTimeSelect = false,
  id,
}: DatePickerProps) {
  // Normalize date string (YYYY-MM-DD or ISO) or Date safely without timezone drift
  const selectedDate = React.useMemo<Date | null>(() => {
    if (!date) return null;
    if (date instanceof Date) return isNaN(date.getTime()) ? null : date;
    if (typeof date === 'string') {
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const [, y, m, d] = match;
        const localD = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        return isNaN(localD.getTime()) ? null : localD;
      }
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }, [date]);

  const handleChange = (newDate: Date | null) => {
    if (setDate) {
      setDate(newDate || undefined);
    }
    if (onChange) {
      if (newDate) {
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        onChange(dateStr, newDate);
      } else {
        onChange('', null);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setDate) setDate(undefined);
    if (onChange) onChange('', null);
  };

  return (
    <div className="relative w-full">
      <ReactDatePicker
        selected={selectedDate}
        onChange={handleChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        dateFormat={dateFormat}
        showTimeSelect={showTimeSelect}
        popperPlacement="bottom-start"
        popperClassName="react-datepicker-popper"
        customInput={
          <CustomDateInput
            id={id}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            clearable={clearable}
            hasValue={Boolean(selectedDate)}
            onClear={handleClear}
          />
        }
      />
    </div>
  );
}

export default DatePicker;
