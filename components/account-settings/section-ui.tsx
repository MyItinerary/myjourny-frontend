"use client";

import { useRef } from "react";
import { CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Row({
  label,
  value,
  note,
  actionLabel,
  onAction,
  muted,
}: {
  label: string;
  value?: string;
  note?: string;
  actionLabel: string;
  onAction: () => void;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-8 border-b border-border py-7">
      <div className="flex flex-1 flex-col gap-1">
        <div className="text-base font-medium text-foreground">{label}</div>
        {value && <div className="text-base text-muted-foreground">{value}</div>}
        {note && <div className="mt-0.5 text-sm text-muted-foreground">{note}</div>}
      </div>
      <button
        type="button"
        onClick={onAction}
        className={cn(
          "shrink-0 pt-0.5 text-[15px] font-medium underline hover:text-primary cursor-pointer",
          muted ? "text-muted-foreground" : "text-brand",
        )}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function ToggleRow({
  label,
  value,
  note,
  on,
  onToggle,
}: {
  label: string;
  value: string;
  note?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-8 border-b border-border py-7">
      <div className="flex flex-1 flex-col gap-1">
        <div className="text-base font-medium text-foreground">{label}</div>
        <div className="text-base text-muted-foreground">{value}</div>
        {note && <div className="mt-0.5 text-sm text-muted-foreground">{note}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={cn(
          "mt-1 flex h-[26px] w-11 shrink-0 cursor-pointer rounded-full p-[3px] transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          on ? "bg-brand" : "bg-[#E0E0E0]",
        )}
      >
        <div
          className={cn(
            "size-5 rounded-full bg-white transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
            on ? "ml-[18px]" : "ml-0",
          )}
        />
      </button>
    </div>
  );
}

export function ModalShell({
  title,
  width = 560,
  onClose,
  children,
}: {
  title: string;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(44,1,1,0.38)] p-4">
      <div
        className="max-h-[85vh] w-full overflow-auto rounded-2xl bg-white shadow-sm"
        style={{ maxWidth: width }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div className="text-lg font-medium text-foreground">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function TextField({
  label,
  className,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <input
        {...props}
        className={cn(
          "mt-2 h-12 w-full rounded-xl border border-border px-4 font-sans text-base text-foreground outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16",
          className,
        )}
      />
    </div>
  );
}

export function ModalFooter({
  onCancel,
  onSave,
  cancelLabel = "Cancel",
  saveLabel = "Save",
  saveDisabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  saveDisabled?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="cursor-pointer rounded-full border border-border px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5]"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saveDisabled}
        className={cn(
          "cursor-pointer rounded-full px-5.5 py-3 text-[15px] font-medium",
          saveDisabled
            ? "cursor-not-allowed bg-[#E0E0E0] text-[#BDBDBD]"
            : "bg-brand text-white hover:bg-[#FF4540]",
        )}
      >
        {saveLabel}
      </button>
    </div>
  );
}

export function SavedBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted px-4.5 py-4 shadow-[inset_0_0_0_1px_theme(colors.border)]">
      <CircleCheck size={20} className="mt-0.5 shrink-0 text-[#0CBA65]" />
      <div className="flex-1 text-sm text-foreground">{message}</div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 cursor-pointer text-[13px] font-medium text-muted-foreground underline"
      >
        Dismiss
      </button>
    </div>
  );
}

const SKELETON_ROWS = [
  { w1: "180px", w2: "220px" },
  { w1: "140px", w2: "160px" },
  { w1: "210px", w2: "300px" },
  { w1: "160px", w2: "190px" },
  { w1: "190px", w2: "240px" },
];

export function SectionSkeleton() {
  return (
    <div className="max-w-[720px]">
      <div
        className="h-[38px] w-[320px] animate-pulse rounded-lg bg-[#F5F5F5]"
        aria-hidden
      />
      <div className="mt-9 flex flex-col gap-8">
        {SKELETON_ROWS.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-6 border-b border-border pb-7"
          >
            <div className="flex flex-1 flex-col gap-2.5">
              <div
                className="h-4 animate-pulse rounded-md bg-[#F5F5F5]"
                style={{ width: row.w1 }}
              />
              <div className="h-3.5 rounded-md bg-[#F5F5F5]" style={{ width: row.w2 }} />
            </div>
            <div className="h-3.5 w-9 shrink-0 rounded-md bg-[#F5F5F5]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OtpBoxes({
  digits,
  onChange,
}: {
  digits: string[];
  onChange: (next: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div className="flex w-full gap-2 sm:gap-2.5">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, "").slice(-1);
            const next = [...digits];
            next[i] = v;
            onChange(next);
            if (v && i < digits.length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit && i > 0) refs.current[i - 1]?.focus();
          }}
          inputMode="numeric"
          maxLength={1}
          className={cn(
            "h-12 max-w-14 min-w-0 flex-1 rounded-xl text-center text-lg font-medium text-foreground outline-none sm:h-15 sm:text-xl",
            digit ? "ring-2 ring-brand" : "ring-1 ring-border",
          )}
        />
      ))}
    </div>
  );
}
