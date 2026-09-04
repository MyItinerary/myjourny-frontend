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
        "flex w-full min-h-[56px] xl:min-h-[68px] items-center gap-3 xl:gap-4 p-2.5 lg:py-2 lg:px-3.5 xl:py-3 xl:px-4 rounded-[14px] xl:rounded-[16px] bg-white border text-left transition-colors cursor-pointer",
        selected ? "border-brand" : "border-transparent",
        className
      )}
    >
      <span className="flex size-9 xl:size-11 shrink-0 items-center justify-center rounded-[12px] xl:rounded-[14px] bg-[#f5f3ef]">
        <Icon className="size-4.5 xl:size-5 text-foreground" />
      </span>
      <span className="flex flex-col gap-0.5 justify-center min-w-0 flex-1">
        <span className="font-sans text-[14px] xl:text-[15px] font-medium leading-[18px] xl:leading-[22px] text-[#333134]">
          {label}
        </span>
        <span className="font-sans text-[12px] xl:text-[13px] font-normal leading-[16px] xl:leading-[19px] text-[#6F6B72]">
          {description}
        </span>
      </span>
    </button>
  );
}
