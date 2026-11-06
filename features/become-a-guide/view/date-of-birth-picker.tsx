"use client";

import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { MONTH_NAMES, WEEKDAY_LABELS } from "@/lib/dates";

export interface DateOfBirthPickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

function parseDateString(str: string): Date | null {
  if (!str) return null;
  // Format DD/MM/YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    // If format is YYYY-MM-DD
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const date = new Date(year, month, day);
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
  }
  return null;
}

function formatDateString(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function DateOfBirthPicker({
  id = "dob",
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  error,
}: DateOfBirthPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedDate = useMemo(() => parseDateString(value), [value]);
  const [navigatedDate, setNavigatedDate] = useState<Date | null>(null);
  const viewDate = navigatedDate ?? selectedDate ?? new Date(1998, 0, 1);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate selectable years for birth date (1940 to 2010)
  const years = useMemo(() => {
    const list: number[] = [];
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear - 16;
    for (let y = maxYear; y >= 1940; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const handlePrevMonth = () => {
    setNavigatedDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setNavigatedDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const picked = new Date(year, month, day);
    onChange(formatDateString(picked));
    setNavigatedDate(null);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input container with dynamic active styling */}
      <div
        onClick={() => setIsOpen(true)}
        className={`mt-2 flex w-full cursor-pointer items-center justify-between px-4 py-3.5 transition-all duration-200 ${
          isOpen
            ? "rounded-[20px] border border-[#F5032D] bg-white ring-1 ring-[#F5032D]/10"
            : "rounded-[8px] border border-transparent bg-[#F4F2EE] hover:border-[#D1D5DB]"
        }`}
      >
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-transparent font-sans text-sm text-[#130404] placeholder-[#A8A29E] focus:outline-hidden"
        />
        <Calendar className="size-4 shrink-0 text-[#6F6B72]" />
      </div>

      {error && <p className="mt-1 font-sans text-xs text-[#DC2626]">{error}</p>}

      {/* Dropdown Calendar Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar dropdown"
          className="absolute top-[calc(100%+8px)] left-0 z-50 w-full min-w-[290px] max-w-[320px] rounded-[20px] border border-[#E0DFDD] bg-white p-4 shadow-[0_10px_35px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 pb-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={handlePrevMonth}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[#130404] hover:bg-[#F4F2EE]"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-[#130404]">
              {/* Month selector */}
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setNavigatedDate(new Date(year, parseInt(e.target.value, 10), 1))}
                  className="cursor-pointer appearance-none rounded-lg bg-[#F4F2EE] py-1 pl-2 pr-5 text-xs font-semibold text-[#130404] focus:outline-hidden"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-[#6F6B72]" />
              </div>

              {/* Year selector */}
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setNavigatedDate(new Date(parseInt(e.target.value, 10), month, 1))}
                  className="cursor-pointer appearance-none rounded-lg bg-[#F4F2EE] py-1 pl-2 pr-5 text-xs font-semibold text-[#130404] focus:outline-hidden"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-[#6F6B72]" />
              </div>
            </div>

            <button
              type="button"
              aria-label="Next month"
              onClick={handleNextMonth}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[#130404] hover:bg-[#F4F2EE]"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 text-center font-sans text-[11px] font-semibold text-[#6F6B72] pb-1">
            {WEEKDAY_LABELS.map((day) => (
              <span key={day} className="py-1">
                {day.slice(0, 2)}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="size-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                !!selectedDate &&
                selectedDate.getFullYear() === year &&
                selectedDate.getMonth() === month &&
                selectedDate.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`flex size-8 cursor-pointer items-center justify-center rounded-[8px] font-sans text-xs transition-colors ${
                    isSelected
                      ? "bg-[#F5032D] font-bold text-white shadow-xs"
                      : "text-[#130404] hover:bg-[#F4F2EE]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
