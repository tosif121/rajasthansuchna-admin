'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from 'date-fns';
import { cn } from '@/lib/utils';

export default function DateRangePicker({
  date,
  setDate,
  buttonClassName,
}: {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<DateRange | undefined>(date);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => date?.from || new Date());
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Update temp state and calendar view month when popover opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempDate(date);
      setCalendarMonth(date?.from || new Date());
    }
    setIsOpen(open);
  };

  // Quick select - immediately apply and close
  const setRangeAndApply = (days: number) => {
    // Rolling window up to today so newly placed orders always appear live
    const newRange = { from: startOfDay(subDays(new Date(), days)), to: endOfDay(new Date()) };
    setDate(newRange);
    setIsOpen(false);
  };

  const setTodayAndApply = () => {
    const today = new Date();
    const newRange = { from: startOfDay(today), to: endOfDay(today) };
    setDate(newRange);
    setIsOpen(false);
  };

  const setYesterdayAndApply = () => {
    const yesterday = subDays(new Date(), 1);
    const newRange = { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    setDate(newRange);
    setIsOpen(false);
  };

  const setThisMonthAndApply = () => {
    const now = new Date();
    const newRange = { from: startOfMonth(now), to: endOfMonth(now) };
    setDate(newRange);
    setIsOpen(false);
  };

  const setLastMonthAndApply = () => {
    const lastMonth = subMonths(new Date(), 1);
    const newRange = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    setDate(newRange);
    setIsOpen(false);
  };

  const setThisYearAndApply = () => {
    const now = new Date();
    const newRange = { from: startOfYear(now), to: endOfYear(now) };
    setDate(newRange);
    setIsOpen(false);
  };

  const setLastYearAndApply = () => {
    const lastYear = subYears(new Date(), 1);
    const newRange = { from: startOfYear(lastYear), to: endOfYear(lastYear) };
    setDate(newRange);
    setIsOpen(false);
  };

  const handleApply = () => {
    // If tempDate is selected use it; otherwise default to the visible calendarMonth
    const activeFrom = tempDate?.from || startOfMonth(calendarMonth);
    const activeTo = tempDate?.to || (tempDate?.from ? tempDate.from : endOfMonth(calendarMonth));

    const from = startOfDay(activeFrom);
    const to = endOfDay(activeTo);

    setDate({ from, to });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setIsOpen(false);
  };

  const handleClearAndApply = () => {
    setDate(undefined);
    setIsOpen(false);
  };

  const formatDateForButton = (date: DateRange | undefined) => {
    if (!date?.from) return 'Select Date';

    // If whole month is selected (1st to last day of same month)
    const isWholeMonth =
      date.to &&
      format(date.from, 'yyyy-MM') === format(date.to, 'yyyy-MM') &&
      date.from.getDate() === 1 &&
      date.to.getDate() === endOfMonth(date.from).getDate();

    if (isWholeMonth) {
      return format(date.from, isMobile ? 'MMM yyyy' : 'MMMM yyyy');
    }

    if (date.to && format(date.from, 'yyyy-MM-dd') !== format(date.to, 'yyyy-MM-dd')) {
      if (isMobile) {
        // Shorter format for mobile
        return `${format(date.from, 'MMM dd')} - ${format(date.to, 'MMM dd, y')}`;
      }
      return `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`;
    }

    return format(date.from, isMobile ? 'MMM dd, y' : 'LLL dd, y');
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            'w-auto justify-start text-left font-medium h-10 px-3 py-2',
            'hover:bg-accent transition-colors duration-200',
            'min-w-0', // Allow button to shrink
            !date && 'text-muted-foreground',
            buttonClassName,
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{formatDateForButton(date)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-0 flex flex-col shadow-lg',
          isMobile
            ? 'w-screen max-w-xs mx-4' // Mobile: full width with margins
            : 'w-auto', // Desktop: auto width
        )}
        align={isMobile ? 'center' : 'end'}
        side={isMobile ? 'bottom' : 'bottom'}
        sideOffset={8}
      >
        <div
          className={cn(
            'flex',
            isMobile ? 'flex-col' : 'flex-row', // Stack vertically on mobile
          )}
        >
          {/* Quick Select Sidebar */}
          <div
            className={cn(
              'flex space-y-1 p-3 bg-accent/50',
              isMobile
                ? 'flex-row overflow-auto gap-1 space-y-0 border-b border' // Horizontal on mobile
                : 'flex-col border-r border min-w-[140px]', // Vertical on desktop
            )}
          >
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile
                  ? 'text-xs h-7 px-2 flex-1 w-max' // Smaller on mobile
                  : 'text-sm h-8 px-3',
              )}
              onClick={setTodayAndApply}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
              )}
              onClick={setYesterdayAndApply}
            >
              Yesterday
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
              )}
              onClick={() => setRangeAndApply(6)}
            >
              Last 7 days
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
              )}
              onClick={() => setRangeAndApply(29)}
            >
              Last 30 days
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
              )}
              onClick={setThisMonthAndApply}
            >
              This month
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
              )}
              onClick={setLastMonthAndApply}
            >
              Last month
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
              )}
              onClick={() => setRangeAndApply(89)}
            >
              Last 90 days
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
              )}
              onClick={setThisYearAndApply}
            >
              This year
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start hover:text-primary',
                isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
              )}
              onClick={setLastYearAndApply}
            >
              Last year
            </Button>
            <div className={cn(isMobile ? 'w-full' : 'pt-2 border-t border-gray-300 mt-2')}>
              <Button
                variant="ghost"
                className={cn(
                  'justify-start hover:text-red-600 text-red-600',
                  isMobile ? 'text-xs h-7 px-2 flex-1 w-max' : 'text-sm h-8 px-3',
                )}
                onClick={handleClearAndApply}
              >
                Clear dates
              </Button>
            </div>
          </div>

          {/* Calendar */}
          <div className="overflow-hidden">
            <Calendar
              mode="range"
              month={calendarMonth}
              onMonthChange={(newMonth) => {
                setCalendarMonth(newMonth);
                setTempDate({ from: startOfMonth(newMonth), to: endOfMonth(newMonth) });
              }}
              selected={tempDate}
              onSelect={setTempDate}
              numberOfMonths={1}
              showOutsideDays={!isMobile} // Hide outside days on mobile for cleaner look
              captionLayout="dropdown"
              startMonth={new Date(new Date().getFullYear() - 10, 0)}
              endMonth={new Date(new Date().getFullYear() + 10, 11)}
              className={cn(
                'p-3',
                isMobile && 'scale-95 origin-center', // Slightly smaller on mobile
              )}
            />
          </div>
        </div>

        {/* Apply/Cancel Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-accent px-3 py-2 bg-accent/30">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
