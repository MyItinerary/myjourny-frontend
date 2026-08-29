import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";

// Figma "Check box pills" (variants 2–9): icon + label + description card.
// Selected state confirmed against 2068:25080 — a 1px brand-red border, no fill change.
export interface CheckboxPillProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function CheckboxPill({
  icon: Icon,
  label,
  description,
  selected,
  onClick,
  className,
}: CheckboxPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full h-[82px] min-h-[82px] items-start gap-4 p-4 rounded-[16px] bg-white border text-left transition-colors cursor-pointer",
        selected ? "border-brand" : "border-transparent",
        className
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#f5f3ef]">
        <Icon className="size-6 text-foreground" />
      </span>
      <span className="flex flex-col gap-0.5 justify-center min-w-0">
        <span className="font-sans text-[16px] font-medium leading-[24px] text-[#333134]">
          {label}
        </span>
        <span className="font-sans text-[14px] font-normal leading-[22px] text-[#6F6B72]">
          {description}
        </span>
      </span>
    </button>
  );
}
