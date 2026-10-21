import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const inputClass =
  "h-12 w-full rounded-xl bg-white px-3.5 text-[15px] text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] outline-none placeholder:text-[#A09DA3] focus-visible:shadow-[inset_0_0_0_2px_#333134]";

export function StepHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <>
      <div className="mb-2 text-[11px] font-medium tracking-[0.06em] text-[#F5032D] uppercase">{eyebrow}</div>
      <h2 className="mb-2 font-heading text-[28px] leading-tight font-extrabold text-[#333134]">{title}</h2>
      <p className="mb-7 text-base leading-relaxed text-pretty text-[#6F6B72]">{intro}</p>
    </>
  );
}

export function Field({
  label,
  aside,
  hint,
  className,
  children,
}: {
  label: string;
  aside?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("mb-[22px] block", className)}>
      <span className="mb-1.5 flex items-baseline gap-2 text-[13px] font-medium text-[#333134]">
        {label}
        {aside && <span className="ml-auto font-normal text-[#A09DA3]">{aside}</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-[#6F6B72]">{hint}</span>}
    </label>
  );
}

/** A rounded choice that is either on or off. */
export function Pill({
  on,
  onClick,
  children,
  className,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "h-[34px] cursor-pointer rounded-full px-3.5 text-[13px] font-medium transition-colors",
        on ? "bg-[#F5032D] text-white" : "bg-white text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] hover:bg-[#FAF9F7]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** A big choice card with a dot or radio: category, subcategory, when it runs, how guests book. */
export function ChoiceCard({
  selected,
  onClick,
  radio,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  radio?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3.5 py-3 text-left text-[13px] text-[#333134] hover:bg-[#FAF9F7]",
        selected ? "shadow-[inset_0_0_0_2px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "shrink-0 rounded-full",
          radio ? "size-[17px]" : "size-[7px]",
          radio
            ? selected ? "shadow-[inset_0_0_0_5px_#F5032D]" : "shadow-[inset_0_0_0_1.5px_#D2D2D2]"
            : selected ? "bg-[#F5032D]" : "bg-[#E0E0E0]",
        )}
      />
      {children}
    </button>
  );
}

/** A growing list of single-line inputs: what's included, what to bring. */
export function LineList({
  title,
  label,
  lines,
  onSet,
  onAdd,
  onDel,
}: {
  title: string;
  label: string;
  lines: string[];
  onSet: (index: number, value: string) => void;
  onAdd: () => void;
  onDel: (index: number) => void;
}) {
  return (
    <section className="mb-7" aria-label={title}>
      <div className="mb-2.5 text-[13px] font-medium text-[#333134]">{title}</div>
      <div className="flex flex-col gap-2">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              aria-label={`${label} ${i + 1}`}
              value={line}
              onChange={(e) => onSet(i, e.target.value)}
              className={cn(inputClass, "h-11 text-sm")}
            />
            <button
              type="button"
              aria-label={`Remove ${label} ${i + 1}`}
              onClick={() => onDel(i)}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6F6B72] hover:bg-[#F4F2EE]"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={onAdd} className="mt-2.5 cursor-pointer text-[13px] font-medium text-[#F5032D]">
        Add a line
      </button>
    </section>
  );
}
