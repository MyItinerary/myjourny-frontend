"use client";

import { Calendar, ChevronDown, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { computeDatePresets, DatePickerCalendar } from "@/components/shared/date-picker-calendar";
import { cn } from "@/lib/utils";

import type { ExperienceBookingCardProps } from "../view-model/use-experience-booking-card-view-model";
import {
  BookingCardActionView,
  BookingCardInfoRows,
  BookingCardPriceView,
  BookingCardShell,
  BookingCardStepperButton,
  BookingCardTotalView,
} from "./booking-card-parts";
import { Addons, DaysRow, PromoCode } from "./experience-booking-card-extras";

type Props = ExperienceBookingCardProps & {
  className?: string;
  /** Shows the sheet header with a close button, for the mobile bottom sheet. */
  onClose?: () => void;
  /** The sheet header's title. */
  title?: string;
};

/** The one start time of the chosen day, when there is no choice to make. */
function fixedStart(sessions: Props["sessions"]) {
  return sessions.scheduled && sessions.options.length === 1 && !sessions.options[0].disabled
    ? sessions.options[0]
    : null;
}

/** The date pill: "June 13 · 2 hours", opening the calendar. */
function DateField({ sessions, durationLabel }: Pick<Props, "sessions" | "durationLabel">) {
  const [open, setOpen] = useState(false);
  const fixedTime = fixedStart(sessions);
  const label = `${sessions.dateLabel}${fixedTime ? ` · ${fixedTime.label}` : ""}${durationLabel ? ` · ${durationLabel}` : ""}`;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // One bookable day: the date is fixed, so there is nothing to pick.
  if (sessions.scheduled && sessions.openDayCount === 1) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-[#F4F2EE] px-4 py-3">
        <Calendar className="size-6 shrink-0 text-[#333134]" aria-hidden />
        <span data-testid="fixed-date" className="truncate font-sans text-base leading-6 text-[#333134]">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Choose a date"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-full bg-[#F4F2EE] px-4 py-3 text-left"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Calendar className="size-6 shrink-0 text-[#333134]" aria-hidden />
          <span className="truncate font-sans text-base leading-6 text-[#333134]">{label}</span>
        </span>
        <ChevronDown className={cn("size-6 shrink-0 text-[#333134] transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full min-w-[320px] rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <DatePickerCalendar
            selectedDate={sessions.selectedDate}
            minDate={sessions.minDate}
            isDateEnabled={sessions.isDateSelectable}
            presets={computeDatePresets().filter((p) => sessions.isDateSelectable(p.date))}
            onSelect={(date) => {
              sessions.onSelectDate(date);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

/** Time chips for the chosen day, or what to do when there are none. */
function TimePicker({ sessions }: Pick<Props, "sessions">) {
  // A day with one start time has nothing to choose: the time sits in the
  // date pill, and only the seats note and time zone remain.
  const fixedTime = fixedStart(sessions);
  if (fixedTime) {
    return (
      <p className="font-sans text-xs leading-4 text-[#6F6B72]">
        {fixedTime.note ? `${fixedTime.note}. ` : ""}
        {sessions.timezoneNote}
      </p>
    );
  }
  const message = sessions.noSessions
    ? "No upcoming sessions yet. Check back soon."
    : sessions.allSoldOut && sessions.options.length === 0
      ? "All upcoming sessions are sold out."
      : !sessions.scheduled
        ? "Select your preferred date. The host will confirm the start time with you."
        : null;

  return (
    <div className="flex flex-col gap-2 pt-1">
      {message ? (
        <p className="font-sans text-sm leading-[22px] text-[#6F6B72]">{message}</p>
      ) : (
        <>
          <p className="font-sans text-sm leading-[22px] font-medium text-[#333134]">Choose a time</p>
          <div className="flex flex-wrap gap-2">
            {sessions.options.map((option) => (
              <button
                key={option.startsAt}
                type="button"
                disabled={option.disabled}
                aria-pressed={option.selected}
                onClick={() => sessions.onPickSession(option.startsAt)}
                className={cn(
                  "flex h-11 min-w-[88px] flex-1 cursor-pointer flex-col items-center justify-center rounded-[10px] border font-sans text-base transition-colors disabled:cursor-not-allowed",
                  option.selected
                    ? "border-transparent bg-[#32070F] text-white"
                    : "border-[#E7E7E7] bg-white text-[#333134] hover:bg-[#F4F2EE]",
                  option.disabled && "text-[#B3B0B5] line-through",
                )}
              >
                {option.label}
                {option.note && !option.disabled && (
                  <span className="text-[10px] leading-3 font-normal opacity-80">{option.note}</span>
                )}
              </button>
            ))}
          </div>
          <p className="font-sans text-xs leading-4 text-[#6F6B72]">{sessions.timezoneNote}</p>
        </>
      )}
    </div>
  );
}

function GuestRow({ row }: { row: ExperienceBookingCardProps["guests"][number] }) {
  return (
    <div className="flex items-center justify-between rounded-full bg-[#F4F2EE] py-2 pr-2 pl-4">
      <span className="flex items-center gap-2">
        <User className="size-6 shrink-0 text-[#333134]" aria-hidden />
        <span className="flex flex-col">
          <span className="font-sans text-base leading-[22px] text-[#333134]">{row.label}</span>
          {row.sublabel && <span className="font-sans text-xs leading-4 text-[#6F6B72]">{row.sublabel}</span>}
        </span>
      </span>
      <span className="flex items-center gap-1">
        <BookingCardStepperButton
          action="minus"
          size="sm"
          label={`Decrease ${row.label}`}
          disabled={row.quantity <= 0}
          onClick={() => row.onChange(Math.max(0, row.quantity - 1))}
        />
        <span className="w-7 text-center font-sans text-base leading-4 font-medium text-[#333134]">{row.quantity}</span>
        <BookingCardStepperButton
          action="plus"
          size="sm"
          label={`Increase ${row.label}`}
          disabled={row.quantity >= row.max}
          onClick={() => row.onChange(Math.min(row.max, row.quantity + 1))}
        />
      </span>
    </div>
  );
}

/** The booking card on an experience page: price, date, time, guests, total
 * and the book button. Red is reserved for the button. */
export function ExperienceBookingCardView({ className, onClose, title, ...card }: Props) {
  return (
    <BookingCardShell className={className} onClose={onClose} title={title}>
      <div className="flex flex-col gap-1">
        <BookingCardPriceView price={card.price} />
        {card.scheduleLabel && (
          <p className="font-sans text-sm leading-[22px] font-medium text-[#333134]">{card.scheduleLabel}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <DateField sessions={card.sessions} durationLabel={card.durationLabel} />
        <TimePicker sessions={card.sessions} />
        <div className="flex flex-col gap-2 pt-1">
          {card.guests.map((row) => (
            <GuestRow key={row.id} row={row} />
          ))}
        </div>
        {card.days.show && <DaysRow days={card.days} />}
        {card.addons.length > 0 && <Addons addons={card.addons} />}
        <PromoCode promo={card.promo} />
        {card.notices.map((notice) => (
          <p key={notice} role="status" className="font-sans text-xs leading-4 text-[#6F6B72]">
            {notice}
          </p>
        ))}
      </div>

      <BookingCardTotalView total={card.total} />

      {card.action ? (
        <BookingCardActionView action={card.action} />
      ) : (
        <p className="text-center font-sans text-sm text-[#6F6B72]">This experience isn&apos;t available for booking yet.</p>
      )}

      <BookingCardInfoRows rows={card.info} />
    </BookingCardShell>
  );
}
