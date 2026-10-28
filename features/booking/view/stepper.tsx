import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

const BUTTON =
  "flex size-10 shrink-0 lg:size-8 cursor-pointer items-center justify-center rounded-full border-[0.727px] border-[#E0DFDD] bg-white text-[#333134] transition-colors hover:bg-[#F4F2EE] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[#F5F5F5] disabled:text-[#BDBDBD] disabled:hover:bg-[#F5F5F5]";

/** Round minus/plus around a count. Each end greys out at its limit. 40px on a phone so it is easy to tap, the design's 32px on desktop. */
export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  disabled = false,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Locks both buttons, while a booking starts. */
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={BUTTON}
      >
        <Minus className="size-3" />
      </button>
      <span className="w-7 text-center text-base font-medium text-[#333134]">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={BUTTON}
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}
