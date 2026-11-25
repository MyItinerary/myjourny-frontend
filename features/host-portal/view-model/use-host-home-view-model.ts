import { useSyncExternalStore } from "react";

import { useSession } from "@/lib/auth/session-store";

import {
  EMPTY_PITCH,
  EMPTY_SUBTITLE,
  fullSubtitle,
  greetingFor,
  QUICK_ACTIONS,
  SELL_POINTS,
  SETUP_COPY,
  TEMPLATES_COPY,
} from "../model/home-copy";
import type { EmptyPitch, ExampleListing, SellPoint } from "../model/home-copy.types";
import type { HostHomeData } from "../model/home.types";
import { useHostHome } from "../model/home-data";
import { LISTING_TEMPLATES } from "../model/listing-templates";
import { HOST_PORTAL_BASE } from "../model/nav";
import { useHostProfile } from "../model/profile-data";
import type { SetupTask } from "../model/profile.types";
import { usePreviewMode } from "./use-preview-mode";

export type HostPageHeader = {
  title: string;
  /** A small pill beside the title: "Live", "Draft". */
  chip?: string;
  subtitle: string;
  /** A link when it has an `href`, a button when it has an `onClick`. */
  actions: { label: string; href?: string; onClick?: () => void; primary: boolean }[];
};

/** "Finish setting up": what the host still has to do before we can verify them. */
export type HostSetupCard = {
  heading: string;
  /** "1 of 3 done" */
  count: string;
  percent: number;
  note: string;
  tasks: (Omit<SetupTask, "pane"> & { href: string })[];
};

export type HostHomeViewModel = {
  header: HostPageHeader;
  /** Where "Start a new listing" and the empty pitch lead. */
  newListingHref: string;
  listingsHref: string;
  bookingsHref: string;
  quick: { label: string; href: string }[];
  /** Null once the host has nothing left to set up. */
  setup: HostSetupCard | null;
  /** What a host with nothing listed is shown. */
  pitch: EmptyPitch;
  templates: { heading: string; items: (ExampleListing & { href: string })[] };
  sellPoints: SellPoint[];
} & ({ kind: "empty" } | { kind: "full"; data: HostHomeData });

const subscribe = () => () => {};
const hourNow = () => Math.floor(Date.now() / 3_600_000);

/** The current time, once on the client; null while rendering on the server, so
 * the greeting never differs between the two. */
function useNow(): Date | null {
  const hour = useSyncExternalStore(subscribe, hourNow, () => null);
  return hour === null ? null : new Date(hour * 3_600_000);
}

function setupCard(tasks: SetupTask[] | null): HostSetupCard | null {
  if (!tasks?.length || tasks.every((t) => t.done)) return null;
  const done = tasks.filter((t) => t.done).length;
  return {
    heading: SETUP_COPY.heading,
    count: `${done} of ${tasks.length} done`,
    percent: Math.max(6, Math.round((done / tasks.length) * 100)),
    note: SETUP_COPY.note,
    tasks: tasks.map(({ pane, ...task }) => ({ ...task, href: `${HOST_PORTAL_BASE}/profile?pane=${pane}` })),
  };
}

export function useHostHomeViewModel(): HostHomeViewModel {
  const preview = usePreviewMode();
  const { state, firstName } = useHostHome(preview);
  const { user } = useSession();
  const profile = useHostProfile(preview, user);
  const now = useNow();

  const newListingHref = `${HOST_PORTAL_BASE}/listings/new`;
  const greeting = now ? greetingFor(now) : "Welcome back";
  const title = firstName ? `${greeting}, ${firstName}` : greeting;
  const subtitle =
    state.kind === "empty" ? EMPTY_SUBTITLE : now ? fullSubtitle(now, state.data.attention.length) : "";

  return {
    header: {
      title,
      subtitle,
      // A new host has one way in, the "Create your first experience" card.
      actions: state.kind === "empty" ? [] : [{ label: "Start a new experience", href: newListingHref, primary: true }],
    },
    newListingHref,
    listingsHref: `${HOST_PORTAL_BASE}/listings`,
    bookingsHref: `${HOST_PORTAL_BASE}/bookings`,
    quick: QUICK_ACTIONS.map((q) => ({ label: q.label, href: `${HOST_PORTAL_BASE}/${q.to}` })),
    setup: setupCard(profile.setup),
    pitch: EMPTY_PITCH,
    templates: {
      ...TEMPLATES_COPY,
      items: LISTING_TEMPLATES.map((t) => ({ ...t.card, href: `${newListingHref}?template=${t.card.id}` })),
    },
    sellPoints: SELL_POINTS,
    ...state,
  };
}
