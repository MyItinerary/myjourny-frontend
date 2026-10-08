"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LOCKED_NOTIFICATION_TYPES,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  type NotificationType,
} from "@/lib/queries/notification-preferences";
import { SectionSkeleton } from "@/components/account-settings/section-ui";

interface NotifRow {
  key: NotificationType;
  label: string;
  note?: string;
}

// itin's notification types, in the order the screen lists them. The
// in-app channel isn't shown; it stays on. Rows only show for types the
// backend returns.
const ROWS: NotifRow[] = [
  { key: "booking_confirmations", label: "Booking confirmations", note: "Sent the moment a host confirms." },
  { key: "pre_trip_reminder", label: "Booking reminders", note: "A day before, and two hours before." },
  {
    key: "itinerary_update",
    label: "Day of messages",
    note: "Meeting point, host name, what to bring, and any change to the plan.",
  },
  { key: "host_messages", label: "Messages from hosts" },
  { key: "safety_alert", label: "Safety alerts", note: "Weather, closures and anything that affects your day." },
  {
    key: "cancellations_refunds",
    label: "Cancellations and refunds",
    note: "Including what we send back and when.",
  },
  { key: "payment_status", label: "Payment updates", note: "Receipts and any problem with a payment." },
  { key: "review_requests", label: "Review requests" },
  { key: "weekly_drop", label: "The weekly drop", note: "New experiences in Lagos, once a week." },
  { key: "product_news", label: "Product news" },
];

type Channel = "email" | "push";

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
  const { data: notif, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  if (isLoading || !notif) return <SectionSkeleton />;

  function toggle(rowKey: NotificationType, channel: Channel) {
    update.mutate({ [rowKey]: { [channel]: !notif![rowKey]?.[channel] } });
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

      {ROWS.filter((row) => notif[row.key]).map((row) => {
        const locked = LOCKED_NOTIFICATION_TYPES.has(row.key);
        const emOn = locked || !!notif[row.key]?.email;
        const pushOn = locked || !!notif[row.key]?.push;
        return (
          <div
            key={row.key}
            className={cn("grid items-center border-b border-border py-5", GRID_COLS)}
          >
            <div className="pr-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-medium text-foreground">{row.label}</span>
                {locked && (
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
                locked={locked}
                onToggle={() => toggle(row.key, "email")}
                label={`Email notifications for ${row.label}`}
              />
            </div>
            <div className="flex justify-center">
              <NotifCheckbox
                on={pushOn}
                locked={locked}
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
