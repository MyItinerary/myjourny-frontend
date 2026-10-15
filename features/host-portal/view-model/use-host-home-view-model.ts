import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

import {
  EMPTY_PITCH,
  EMPTY_SUBTITLE,
  EXAMPLES,
  EXAMPLES_COPY,
  fullSubtitle,
  greetingFor,
  QUICK_ACTIONS,
  SELL_POINTS,
} from "../model/home-copy";
import type { EmptyPitch, ExampleListing, SellPoint } from "../model/home-copy.types";
import type { HostHomeData } from "../model/home.types";
import { useHostHome } from "../model/home-data";
import { HOST_PORTAL_BASE } from "../model/nav";

export type HostPageHeader = {
  title: string;
  subtitle: string;
  actions: { label: string; href: string; primary: boolean }[];
};

export type HostHomeViewModel = {
  header: HostPageHeader;
  /** Where "Start a new listing" and the empty pitch lead. */
  newListingHref: string;
  listingsHref: string;
  bookingsHref: string;
  quick: { label: string; href: string }[];
  /** What a host with nothing listed is shown. */
  pitch: EmptyPitch;
  examples: { heading: string; body: string; items: ExampleListing[] };
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

export function useHostHomeViewModel(): HostHomeViewModel {
  const { state, firstName } = useHostHome(useSearchParams().get("preview"));
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
      actions: [{ label: "Start a new listing", href: newListingHref, primary: true }],
    },
    newListingHref,
    listingsHref: `${HOST_PORTAL_BASE}/listings`,
    bookingsHref: `${HOST_PORTAL_BASE}/bookings`,
    quick: QUICK_ACTIONS.map((q) => ({ label: q.label, href: `${HOST_PORTAL_BASE}/${q.to}` })),
    pitch: EMPTY_PITCH,
    examples: { ...EXAMPLES_COPY, items: EXAMPLES },
    sellPoints: SELL_POINTS,
    ...state,
  };
}
