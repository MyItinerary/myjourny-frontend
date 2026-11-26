import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { inputClass, StepHeading } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

export function StepReviews({ vm }: Props) {
  const { reviews } = vm;
  return (
    <div>
      <StepHeading
        badge="Optional"
        title="Reviews"
        intro="Already have reviews on another site? Bring them in so guests can see what others thought of your experience."
      />
      <div className="mb-3.5 grid grid-cols-2 gap-2.5">
        {reviews.platforms.map((platform) => (
          <button
            key={platform}
            type="button"
            aria-pressed={reviews.selected === platform}
            onClick={() => reviews.onSelect(platform)}
            className={cn(
              "flex cursor-pointer flex-col gap-[3px] rounded-[14px] bg-white px-3.5 py-[13px] text-left hover:shadow-[inset_0_0_0_2px_#FF4540]",
              reviews.selected === platform ? "shadow-[inset_0_0_0_2px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
            )}
          >
            <span className="text-sm font-medium">{platform}</span>
            <span className="text-xs text-[#6F6B72]">Not connected</span>
          </button>
        ))}
      </div>
      {reviews.selected && (
        <div className="mb-[18px] flex gap-2.5">
          <input
            aria-label={`${reviews.selected} link`}
            value={reviews.url}
            placeholder={reviews.urlPlaceholder}
            onChange={(e) => reviews.onUrl(e.target.value)}
            className={cn(inputClass, "min-w-0 flex-1 text-[14.5px]")}
          />
          <button
            type="button"
            disabled={!reviews.canImport}
            onClick={reviews.onImport}
            className="h-12 shrink-0 cursor-pointer rounded-full bg-[#F5032D] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#BDBDBD]"
          >
            Import reviews
          </button>
        </div>
      )}
    </div>
  );
}

export function StepBooking({ vm }: Props) {
  const { booking } = vm;
  const group = (label: string, options: { key: string; label: string; sub: string; selected: boolean }[], onPick: (key: string) => void) => (
    <section aria-label={label} className="mb-[22px]">
      <div className="mb-2.5 text-base font-medium text-[#333134]">{label}</div>
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            aria-pressed={o.selected}
            onClick={() => onPick(o.key)}
            className={cn(
              "flex w-full cursor-pointer items-start gap-2.5 rounded-xl bg-white px-3.5 py-3 text-left text-[13.5px] hover:shadow-[inset_0_0_0_2px_#FF4540] disabled:cursor-not-allowed disabled:bg-[#FAF9F7] disabled:hover:shadow-[inset_0_0_0_1px_#E7E7E7]",
              o.selected ? "shadow-[inset_0_0_0_2px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
            )}
          >
            <span aria-hidden className={cn("mt-px size-[17px] shrink-0 rounded-full", o.selected ? "shadow-[inset_0_0_0_5px_#F5032D]" : "shadow-[inset_0_0_0_1.5px_#D2D2D2]")} />
            <span>
              <span className="block font-medium">{o.label}</span>
              <span className="mt-0.5 block text-xs leading-normal text-[#6F6B72]">{o.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
  return (
    <div>
      <StepHeading title="How guests book" />
      {group("Booking type", booking.types, (key) => booking.onType(key as "instant" | "request"))}
    </div>
  );
}

export function StepReview({ vm }: Props) {
  const { review, publishBlock } = vm;
  return (
    <div>
      <StepHeading title="Review and publish" intro="Check what you've entered. Open a step to see it, or edit it to make changes." />
      <ul aria-label="Your experience, step by step" className="flex flex-col gap-2.5">
        {review.map((step) => (
          <li key={step.n}>
            <details className="group rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7] open:shadow-[inset_0_0_0_1px_#E0DFDD]">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
                    step.ok ? "bg-[#0CBA65]" : "bg-[#D9921C]",
                  )}
                >
                  {step.ok ? "✓" : "!"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-medium text-[#333134]">{step.label}</span>
                  <span className="block text-xs text-[#6F6B72]">{step.optional ? "Optional" : step.ok ? "Done" : "Needs something"}</span>
                </span>
                <ChevronDown aria-hidden className="size-4 shrink-0 text-[#6F6B72] transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-[#F0F0F0] px-4 pt-3 pb-4">
                <dl className="flex flex-col gap-2.5">
                  {step.rows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[140px_1fr] gap-3 text-[13px]">
                      <dt className="text-[#6F6B72]">{row.label}</dt>
                      <dd className={cn("min-w-0 break-words", row.value === "Not added" ? "text-[#B4760A]" : "text-[#333134]")}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  onClick={step.onEdit}
                  aria-label={`Edit ${step.label}`}
                  className="mt-3.5 cursor-pointer text-[13px] font-medium text-[#F5032D] underline underline-offset-2"
                >
                  Edit
                </button>
              </div>
            </details>
          </li>
        ))}
      </ul>
      {publishBlock && <p className="mt-5 rounded-xl bg-[#FDF7EB] px-3.5 py-2.5 text-[13px] text-[#8A5A07]">{publishBlock}</p>}
    </div>
  );
}
