import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The design's pill input. Red edged when the answer is wrong. */
export const inputClass = (invalid?: boolean) =>
  cn(
    "h-12 w-full rounded-full border bg-[#F4F2EE] px-4 font-sans text-base font-medium text-[#17151C] outline-none transition-colors placeholder:font-normal placeholder:text-[#5D5B60] focus:border-[#F5032D] focus:bg-white",
    invalid ? "border-[#DC2626]" : "border-transparent",
  );

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="font-sans text-[13px] leading-snug text-[#DC2626]">
      {message}
    </p>
  );
}

/** A label, the input, a hint under it and its mistake, if any. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="font-sans text-base leading-6 font-medium text-[#333134]">
        {label}
      </label>
      {children}
      {hint && <p className="font-sans text-xs font-light text-[#6F6B72]">{hint}</p>}
      <FieldError id={`${htmlFor}-error`} message={error} />
    </div>
  );
}

/** A pill select with the design's chevron. */
export function Select({
  id,
  value,
  onChange,
  invalid,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn(inputClass(invalid), "cursor-pointer appearance-none pr-11", !value && "font-normal text-[#5D5B60]")}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Image
        src="/images/become-a-guide/apply/chevron-down.svg"
        alt=""
        width={20}
        height={20}
        unoptimized
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2"
      />
    </div>
  );
}

/** The card the form sits in: the logo and which step this is. Full width on a phone. */
export function ApplicationCard({ stepLabel, children }: { stepLabel: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,rgba(244,242,238,0.87)_0%,#fff_100%)] sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full flex-col gap-6 bg-white px-4 py-8 sm:max-w-[595px] sm:rounded-xl sm:border sm:border-[#E0DFDD] sm:px-6 sm:py-9">
        <Image src="/logo/myjourny-logo.svg" alt="MyJourny" width={211} height={36} priority className="h-9 w-auto self-start" />
        <p className="font-sans text-base text-[#6F6B72]">{stepLabel}</p>
        {children}
      </div>
    </div>
  );
}

export function StepTitle() {
  return (
    <div className="flex flex-col gap-[9px]">
      <p className="font-sans text-base leading-6 text-[#F5032D]">CREATE AN ACCOUNT</p>
      <h1 className="font-sans text-[32px] leading-[1.2] font-extrabold text-[#333134]">Let&apos;s get to know you</h1>
    </div>
  );
}

/** Back and the main action, side by side and full width on a phone, to the right on a wider screen. */
export function ActionButtons({
  primaryLabel,
  onPrimary,
  onBack,
  busy,
  busyLabel = "Sending…",
}: {
  primaryLabel: string;
  onPrimary: () => void;
  onBack: () => void;
  busy?: boolean;
  busyLabel?: string;
}) {
  return (
    <div className="flex gap-4 sm:justify-end">
      <button
        type="button"
        onClick={onBack}
        className="h-12 flex-1 cursor-pointer rounded-full border border-[#F5032D] px-4 font-sans text-base font-medium text-[#F5032D] hover:bg-[#FEF2F3] sm:w-[124px] sm:flex-none"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onPrimary}
        disabled={busy}
        className="h-12 flex-1 cursor-pointer rounded-full bg-[#F5032D] px-4 font-sans text-base font-medium whitespace-nowrap text-white hover:bg-[#D40226] disabled:cursor-wait disabled:opacity-70 sm:min-w-[124px] sm:flex-none sm:px-5"
      >
        {busy ? busyLabel : primaryLabel}
      </button>
    </div>
  );
}
