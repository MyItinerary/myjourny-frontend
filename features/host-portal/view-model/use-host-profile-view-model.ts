import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth/session-store";

import {
  closingCopy,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_NOTE,
  PANE_COPY,
  PAYOUT_SCHEDULES,
  PROFILE_PANES,
  SETUP_NOTE,
} from "../model/profile-copy";
import { useHostProfile } from "../model/profile-data";
import type { HostProfile, PayoutSchedule, ProfilePaneKey, ProfileRow, SetupTask } from "../model/profile.types";
import { HOST_PORTAL_BASE } from "../model/nav";
import type { HostPageHeader } from "./use-host-home-view-model";

export type ProfileNavItem = {
  key: ProfilePaneKey;
  label: string;
  icon: "person" | "card" | "shield" | "bell" | "globe" | "doc";
  active: boolean;
  /** "1 left" */
  badge: string | null;
};

export type HostProfileViewModel = {
  header: HostPageHeader;
  nav: ProfileNavItem[];
  onPane: (pane: ProfilePaneKey) => void;
  pane: ProfilePaneKey;
  title: string;
  subtitle: string;
  setup: { count: string; percent: number; note: string; tasks: (SetupTask & { onOpen: () => void })[] } | null;
  rows: ProfileRow[];
  onRowAction: (row: ProfileRow) => void;
  preview: HostProfile["preview"] | null;
  notifications: {
    channels: readonly string[];
    rows: { label: string; cells: { on: boolean; locked: boolean }[] }[];
    note: string;
    onToggle: (row: number, channel: number) => void;
  } | null;
  payouts: {
    schedules: { key: PayoutSchedule; label: string; sub: string; selected: boolean }[];
    onSchedule: (schedule: PayoutSchedule) => void;
  } | null;
  tax: { statements: HostProfile["statements"]; documents: HostProfile["documents"]; onAction: () => void } | null;
  danger: { text: string; onStart: () => void } | null;
};

const NOT_CONNECTED = "This will work once your profile is connected.";

const isPane = (value: string | null): value is ProfilePaneKey => PROFILE_PANES.some((p) => p.key === value);

export function useHostProfileViewModel(): HostProfileViewModel {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useSession();
  const profile = useHostProfile(params.get("preview"), user);

  const fromUrl = params.get("pane");
  const [pane, setPane] = useState<ProfilePaneKey>(isPane(fromUrl) ? fromUrl : "personal");
  const [notifOverride, setNotif] = useState<HostProfile["notifications"] | null>(null);
  const [scheduleOverride, setSchedule] = useState<PayoutSchedule | null>(null);

  const notifications = notifOverride ?? profile.notifications;
  const schedule = scheduleOverride ?? profile.schedule;
  const soon = () => toast.info(NOT_CONNECTED);

  const doneTasks = profile.setup?.filter((t) => t.done).length ?? 0;

  return {
    header: {
      title: "Your profile",
      chip: profile.setup ? "Not live yet" : "Live",
      subtitle: "This is what guests see before they book",
      actions: [{ label: "View as a guest", onClick: soon, primary: false }],
    },
    nav: PROFILE_PANES.map((p) => ({
      ...p,
      active: p.key === pane,
      badge: p.key === "verify" && profile.verifyLeft > 0 ? `${profile.verifyLeft} left` : null,
    })),
    onPane: setPane,
    pane,
    title: PANE_COPY[pane].title,
    subtitle: PANE_COPY[pane].sub,
    setup:
      pane === "personal" && profile.setup
        ? {
            count: `${doneTasks} of ${profile.setup.length} done`,
            percent: Math.max(6, Math.round((doneTasks / profile.setup.length) * 100)),
            note: SETUP_NOTE,
            tasks: profile.setup.map((task) => ({ ...task, onOpen: () => setPane(task.pane) })),
          }
        : null,
    rows: pane === "notify" ? [] : profile.rows[pane],
    onRowAction: (row) => {
      if (row.link === "earnings") router.push(`${HOST_PORTAL_BASE}/earnings`);
      else if (row.link === "help") router.push(`${HOST_PORTAL_BASE}/help`);
      else soon();
    },
    preview: pane === "public" ? profile.preview : null,
    notifications:
      pane === "notify"
        ? {
            channels: NOTIFICATION_CHANNELS,
            rows: notifications.map((n, r) => ({
              label: n.label,
              // Booking requests always reach WhatsApp.
              cells: n.channels.map((on, c) => ({ on, locked: r === 0 && c === 0 })),
            })),
            note: NOTIFICATION_NOTE,
            onToggle: (r, c) => {
              if (r === 0 && c === 0) return;
              setNotif(
                notifications.map((n, i) =>
                  i === r ? { ...n, channels: n.channels.map((on, j) => (j === c ? !on : on)) as typeof n.channels } : n,
                ),
              );
            },
          }
        : null,
    payouts:
      pane === "payouts"
        ? {
            schedules: PAYOUT_SCHEDULES.map((s) => ({ ...s, selected: s.key === schedule })),
            onSchedule: setSchedule,
          }
        : null,
    tax: pane === "tax" ? { statements: profile.statements, documents: profile.documents, onAction: soon } : null,
    danger: pane === "security" ? { text: closingCopy(profile.closing), onStart: soon } : null,
  };
}
