import { AlertCircle, CalendarCheck, CalendarDays, Clock, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** A 40px rounded tile holding an icon: cream on white, white on cream. */
export function IconTile({ icon: Icon = CalendarCheck, surface = "cream" }: { icon?: LucideIcon; surface?: "cream" | "white" }) {
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", surface === "cream" ? "bg-[#F4F2EE]" : "bg-white")}>
      <Icon aria-hidden className="size-[22px] text-[#333134]" />
    </span>
  );
}

/** A policy row under the button: cancellation and the like. */
export function InfoRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <IconTile />
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-[#333134]">{title}</p>
        <p className="text-sm leading-[22px] text-[#6F6B72]">{body}</p>
      </div>
    </div>
  );
}

/** Amber, and only for scarcity. The last spot is solid and heavier. */
export function UrgencyBadge({ level, text }: { level: "few" | "one"; text: string }) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm",
        level === "one" ? "bg-[#FFB020] font-semibold text-[#2C0101]" : "bg-[#FFF0D6] font-medium text-[#7A4100]",
      )}
    >
      <Clock aria-hidden className="size-4 shrink-0" />
      {text}
    </p>
  );
}

/** A message inside the card. Never a dead end: it carries an action. */
export function Notice({
  tone = "neutral",
  title,
  body,
  action,
  onAction,
}: {
  tone?: "neutral" | "error";
  title: string;
  body: string;
  action?: string | null;
  onAction?: () => void;
}) {
  const Icon = tone === "error" ? AlertCircle : CalendarDays;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl px-4 py-3.5",
        tone === "error" ? "border border-[#E0DFDD] bg-white" : "bg-[#F4F2EE]",
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-[#333134]" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-base font-medium text-[#333134]">{title}</p>
        <p className="text-sm leading-[22px] text-[#6F6B72]">{body}</p>
        {action && (
          <button type="button" onClick={onAction} className="w-fit cursor-pointer pt-0.5 text-sm font-medium text-[#333134] underline">
            {action}
          </button>
        )}
      </div>
    </div>
  );
}

/** A cream pill row: the guest stepper, the date field. */
export function PillRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between rounded-full bg-[#F4F2EE]", className)}>{children}</div>;
}

/** The big red action. Red is for this button only. Dots show while a booking starts. */
export function BookButton({
  label,
  loading,
  disabled,
  onClick,
}: {
  label: string | null;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={onClick}
      className={cn(
        "flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-base font-medium transition-colors",
        disabled && !loading ? "cursor-not-allowed bg-[#E0E0E0] text-[#A0A0A0]" : "bg-[#F5032D] text-white hover:bg-[#d90328]",
      )}
    >
      {loading ? (
        <span className="flex gap-1" role="status" aria-label="Starting your booking">
          <span className="size-1.5 animate-pulse rounded-full bg-white" />
          <span className="size-1.5 animate-pulse rounded-full bg-white [animation-delay:150ms]" />
          <span className="size-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:300ms]" />
        </span>
      ) : (
        label
      )}
    </button>
  );
}
