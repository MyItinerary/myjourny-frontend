import { Clock } from "lucide-react";

import type { BookingBarProps } from "../model/booking-card.types";

/** Mobile bar pinned to the bottom of the page. Its button opens the booking
 * card as a bottom sheet (owned by the page) rather than duplicating the form. */
export function BookingBarView({
  summary,
  detail,
  urgency,
  actionLabel,
  actionDisabled,
  onAction,
  onExpand,
}: BookingBarProps & {
  /** The button: starts the booking. */
  onAction: () => void;
  /** The handle and the rest of the bar: pulls the sheet up. */
  onExpand: () => void;
}) {
  return (
    // Tapping the handle or anywhere on the bar but the button expands the
    // sheet; the button itself starts the booking.
    <div
      onClick={onExpand}
      className="fixed inset-x-0 bottom-0 z-30 cursor-pointer rounded-t-[24px] border-t border-[#E7E7E7] bg-white px-4 pt-2 pb-[34px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden"
    >
      <button
        type="button"
        aria-label="Open booking"
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className="mx-auto flex h-4 w-16 cursor-pointer items-start justify-center"
      >
        <span aria-hidden className="h-1 w-9 rounded-sm bg-[#E0E0E0]" />
      </button>
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-sans text-base leading-6 font-semibold whitespace-nowrap text-[#333134]">{summary}</p>
          {detail && (
            <p className="font-sans text-sm leading-5 whitespace-nowrap text-[#6F6B72] underline decoration-solid underline-offset-2">
              {detail}
            </p>
          )}
          {urgency && (
            <div className="flex pt-1">
              <span className="flex items-center gap-1 rounded-full bg-[#FFF0D6] px-2 py-0.5 font-sans text-xs leading-[18px] font-medium whitespace-nowrap text-[#7A4100]">
                <Clock className="size-3.5" aria-hidden />
                {urgency}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={actionDisabled}
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="shrink-0 cursor-pointer rounded-full bg-[#F5032D] px-4 py-3 font-sans text-base leading-6 font-medium whitespace-nowrap text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
