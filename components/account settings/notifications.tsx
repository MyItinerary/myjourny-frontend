"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotifRow {
  key: string;
  label: string;
  locked?: boolean;
  note?: string;
}

const ROWS: NotifRow[] = [
  {
    key: "confirm",
    label: "Booking confirmations",
    locked: true,
    note: "Sent the moment a host confirms.",
  },
  { key: "remind", label: "Booking reminders", note: "A day before, and two hours before." },
  {
    key: "dayof",
    label: "Day of messages",
    note: "Meeting point, host name, what to bring.",
  },
  { key: "msg", label: "Messages from hosts" },
  {
    key: "cancel",
    label: "Cancellations and refunds",
    locked: true,
    note: "Including what we send back and when.",
  },
  { key: "review", label: "Review requests" },
  { key: "drop", label: "The weekly drop", note: "New experiences in Lagos, once a week." },
  { key: "news", label: "Product news" },
];

type Channel = "em" | "push";

const INITIAL_NOTIF: Record<string, Record<Channel, boolean>> = {
  confirm: { em: true, push: true },
  remind: { em: true, push: true },
  dayof: { em: false, push: true },
  msg: { em: true, push: true },
  cancel: { em: true, push: true },
  review: { em: true, push: true },
  drop: { em: true, push: false },
  news: { em: true, push: false },
};

const GRID_COLS = "grid-cols-[1fr_44px_44px] sm:grid-cols-[1fr_96px_96px]";

function NotifCheckbox({
  on,
  locked,
  onToggle,
  label,
}: {
  on: boolean;
  locked?: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label}
      className={cn(
        "flex size-[22px] items-center justify-center rounded-[6px] transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        locked
          ? "cursor-not-allowed bg-[#F5F5F5]"
          : on
            ? "cursor-pointer bg-brand"
            : "cursor-pointer bg-white ring-1 ring-border",
      )}
    >
      <Check
        size={13}
        strokeWidth={3}
        className={cn(locked ? "text-[#757575]" : "text-white", !locked && !on && "opacity-0")}
      />
    </button>
  );
}

export function NotificationsSection() {
  const [notif, setNotif] = useState(INITIAL_NOTIF);

  function toggle(rowKey: string, channel: Channel) {
    setNotif((prev) => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], [channel]: !prev[rowKey][channel] },
    }));
  }

  return (
    <div className="max-w-[720px] flex-1">
      <div className="font-sans text-[32px] leading-[1.2] font-extrabold text-foreground">
        Notifications
      </div>

      <div className="mt-6 max-w-[620px] text-base text-muted-foreground">
        Pick how each kind of message reaches you. Booking and payment updates are sent as a push
        and an email together, so leaving both on is the safest setting.
      </div>

      <div
        className={cn(
          "mt-8 grid items-end gap-0 border-b border-border pb-3.5",
          GRID_COLS,
        )}
      >
        <div className="text-sm font-medium text-muted-foreground">Notification</div>
        <div className="text-center text-sm font-medium text-foreground">Email</div>
        <div className="text-center text-sm font-medium text-foreground">Push</div>
      </div>

      {ROWS.map((row) => {
        const emOn = row.locked ? true : notif[row.key].em;
        const pushOn = row.locked ? true : notif[row.key].push;
        return (
          <div
            key={row.key}
            className={cn("grid items-center border-b border-border py-5", GRID_COLS)}
          >
            <div className="pr-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-medium text-foreground">{row.label}</span>
                {row.locked && (
                  <span className="shrink-0 rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-[#757575]">
                    Always on
                  </span>
                )}
              </div>
              {row.note && (
                <div className="mt-0.5 text-[13px] text-muted-foreground">{row.note}</div>
              )}
            </div>
            <div className="flex justify-center">
              <NotifCheckbox
                on={emOn}
                locked={row.locked}
                onToggle={() => toggle(row.key, "em")}
                label={`Email notifications for ${row.label}`}
              />
            </div>
            <div className="flex justify-center">
              <NotifCheckbox
                on={pushOn}
                locked={row.locked}
                onToggle={() => toggle(row.key, "push")}
                label={`Push notifications for ${row.label}`}
              />
            </div>
          </div>
        );
      })}

      <div className="mt-6 text-sm text-muted-foreground">
        Booking confirmations and cancellations cannot be turned off. You need them to show up at
        the right place, and to know when a refund is on its way. If you have no email on file we
        send the push only.
      </div>
    </div>
  );
}
