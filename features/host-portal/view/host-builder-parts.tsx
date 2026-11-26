import { Check, Clock, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

export const inputClass =
  "h-12 w-full rounded-xl bg-white px-3.5 text-[15px] text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] outline-none placeholder:text-[#A09DA3] focus-visible:shadow-[inset_0_0_0_2px_#333134]";

/** The top of a step: its title, with a "Required" chip when it must be filled in, and a line about it. */
export function StepHeading({ title, intro, badge }: { title: string; intro?: string; badge?: string }) {
  return (
    <>
      <div className="mb-2 flex items-center gap-2.5">
        <h2 className="font-heading text-[28px] leading-tight font-extrabold text-[#333134]">{title}</h2>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
              badge === "Required" ? "bg-[#FEF2F3] text-[#F5032D]" : "bg-[#F4F2EE] text-[#6F6B72]",
            )}
          >
            {badge}
          </span>
        )}
      </div>
      {intro ? <p className="mb-7 text-base leading-relaxed text-pretty text-[#6F6B72]">{intro}</p> : <div className="mb-6" />}
    </>
  );
}

export function Field({
  label,
  aside,
  sub,
  hint,
  count,
  error,
  className,
  children,
}: {
  label: string;
  aside?: string;
  /** A line under the label, before the input: what the field is for. */
  sub?: string;
  hint?: string;
  /** A counter under the input, on the right: "12/60", "120 of 1,000 words". */
  count?: string;
  /** What's wrong with what's been typed, under the input in red. */
  error?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("mb-[22px] block", className)}>
      <span className={cn("flex items-baseline gap-2 text-base font-medium text-[#333134]", sub ? "mb-1" : "mb-1.5")}>
        {label}
        {aside && <span className="ml-auto text-[13px] font-normal text-[#A09DA3]">{aside}</span>}
      </span>
      {sub && <span className="mb-2.5 block text-[13px] leading-normal text-pretty text-[#6F6B72]">{sub}</span>}
      {children}
      {(count || error) && (
        <span className="mt-1.5 flex items-baseline gap-3 text-xs">
          {error && <span className="text-[#F5032D]">{error}</span>}
          {count && <span className="ml-auto shrink-0 text-[#A09DA3]">{count}</span>}
        </span>
      )}
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
      {radio ? (
        <span
          aria-hidden
          className={cn(
            "size-[17px] shrink-0 rounded-full",
            selected ? "shadow-[inset_0_0_0_5px_#F5032D]" : "shadow-[inset_0_0_0_1.5px_#D2D2D2]",
          )}
        />
      ) : (
        // A checkbox: these cards can be picked together.
        <span
          aria-hidden
          data-checkbox
          className={cn(
            "flex size-[17px] shrink-0 items-center justify-center rounded-[5px]",
            selected ? "bg-[#F5032D] text-white" : "bg-white shadow-[inset_0_0_0_1.5px_#D2D2D2]",
          )}
        >
          {selected && <Check className="size-3" strokeWidth={3} />}
        </span>
      )}
      {children}
    </button>
  );
}

/** A growing list of single-line inputs: what's included, what to bring. */
export function LineList({
  title,
  label,
  lines,
  placeholder,
  maxLength,
  max,
  onSet,
  onAdd,
  onDel,
}: {
  title: string;
  label: string;
  lines: string[];
  placeholder?: string;
  maxLength?: number;
  /** The most lines the list can hold. */
  max?: number;
  onSet: (index: number, value: string) => void;
  onAdd: () => void;
  onDel: (index: number) => void;
}) {
  return (
    <section className="mb-7" aria-label={title}>
      <div className="mb-2.5 text-base font-medium text-[#333134]">{title}</div>
      <div className="flex flex-col gap-2">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              aria-label={`${label} ${i + 1}`}
              value={line}
              placeholder={placeholder}
              maxLength={maxLength}
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
      {(max === undefined || lines.length < max) && (
        <button type="button" onClick={onAdd} className="mt-2.5 cursor-pointer text-[13px] font-medium text-[#F5032D]">
          Add item
        </button>
      )}
    </section>
  );
}

/** A start time picked from a list of half hours. */
export function TimeSelect({
  value,
  label,
  options,
  format,
  onChange,
  disabled = false,
  className,
}: {
  value: string;
  label: string;
  options: string[];
  format: (time: string) => string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 w-full cursor-pointer items-center rounded-xl bg-white px-3.5 text-left text-[15px] disabled:cursor-not-allowed disabled:bg-[#FAFAFA]",
          value ? "text-[#333134]" : "text-[#A09DA3]",
          open ? "shadow-[inset_0_0_0_1.5px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
        )}
      >
        <span className="flex-1">{value ? format(value) : "Pick a time"}</span>
        <Clock aria-hidden className="size-4 text-[#6F6B72]" />
      </button>
      {open && (
        <div role="listbox" aria-label={label} className="absolute top-[54px] left-0 z-40 flex max-h-60 w-full min-w-[140px] flex-col overflow-y-auto rounded-[14px] bg-white p-1.5 shadow-[inset_0_0_0_1px_#E7E7E7,0_12px_32px_rgba(16,24,40,0.14)]">
          {options.map((t) => (
            <button
              key={t}
              type="button"
              role="option"
              aria-selected={t === value}
              onClick={() => {
                setOpen(false);
                onChange(t);
              }}
              className={cn("h-9 shrink-0 cursor-pointer rounded-[9px] px-[11px] text-left text-sm", t === value ? "bg-[#FEF2F3] font-medium text-[#F5032D]" : "hover:bg-[#F5F5F5]")}
            >
              {format(t)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
