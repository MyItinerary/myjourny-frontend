import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BANNER_TONE, capitalise, DETAIL_TABS, dateFill, payout, RULE_LABELS, stars } from "../model/listing-detail";
import { useHostListingDetail } from "../model/listing-detail-data";
import type { DetailAction, DetailTab, ListingDetail } from "../model/listing-detail.types";
import { useHostListings } from "../model/listings-data";
import type { HostListing } from "../model/listings.types";
import { HOST_PORTAL_BASE } from "../model/nav";
import type { HostPageHeader } from "./use-host-home-view-model";
import { usePreviewMode } from "./use-preview-mode";

export type HostListingDetailViewModel = {
  header: HostPageHeader;
  /** No such listing for this host. */
  notFound: boolean;
  listingsHref: string;
  calendarHref: string;
  listing: HostListing | null;
  detail: ListingDetail | null;
  banner: { tone: "amber" | "grey" | "blue" | "red"; title: string; body: string; button: string; onButton: () => void } | null;
  stats: ListingDetail["stats"];
  dates: { date: string; when: string; seats: string; percent: number; full: boolean; onGuests: () => void }[];
  tabs: { tab: DetailTab; active: boolean; onSelect: () => void }[];
  tab: DetailTab;
  reviews: { name: string; stars: string; when: string; text: string }[];
  rules: { label: string; value: string }[];
  next: { title: string; meta: string; cue: string; onGuests: () => void } | null;
  pay: ReturnType<typeof payout>;
  meetCue: string;
  actions: { label: string; onClick: () => void }[];
};

const NOT_CONNECTED = "This will work once your listings are connected.";
const BASE = HOST_PORTAL_BASE;

export function useHostListingDetailViewModel(id: string): HostListingDetailViewModel {
  const router = useRouter();
  const preview = usePreviewMode();
  const listing = useHostListings(preview).find((l) => l.id === id) ?? null;
  const detail = useHostListingDetail(id, preview);
  const [tab, setTab] = useState<DetailTab>("About");

  const run = (action: DetailAction) => {
    switch (action) {
      case "edit":
      case "fix":
        router.push(`${BASE}/listings/new`);
        return;
      case "block-date":
      case "add-dates":
        router.push(`${BASE}/calendar`);
        return;
      case "past-bookings":
      case "see-guests":
        router.push(`${BASE}/bookings`);
        return;
      case "copy-link":
        void navigator.clipboard
          ?.writeText(`${window.location.origin}/experiences/${id}`)
          .then(() => toast.success("Link copied"))
          .catch(() => toast.error("Couldn't copy the link"));
        return;
      default:
        toast.info(NOT_CONNECTED);
    }
  };

  const toGuests = () => run("see-guests");
  const first = detail?.dates[0];

  return {
    header: {
      title: listing?.title ?? "Listing",
      chip: listing?.status,
      subtitle: listing ? `${listing.cat} · ${listing.sub}` : "",
      actions: listing && listing.status !== "Archived" ? [{ label: "Edit listing", href: `${BASE}/listings/new`, primary: true }] : [],
    },
    notFound: !listing || !detail,
    listingsHref: `${BASE}/listings`,
    calendarHref: `${BASE}/calendar`,
    listing,
    detail,
    banner: detail?.banner
      ? {
          tone: BANNER_TONE[detail.banner.kind],
          title: detail.banner.title,
          body: detail.banner.body,
          button: detail.banner.button.label,
          onButton: () => run(detail.banner!.button.action),
        }
      : null,
    stats: detail?.stats ?? [],
    dates: (detail?.dates ?? []).map((d) => ({ date: d.date, when: d.when, ...dateFill(d.taken, d.cap), onGuests: toGuests })),
    tabs: DETAIL_TABS.map((t) => ({ tab: t, active: t === tab, onSelect: () => setTab(t) })),
    tab,
    reviews: (detail?.reviews ?? []).map((r) => ({ ...r, stars: stars(r.stars) })),
    rules: detail ? RULE_LABELS.map((label, i) => ({ label, value: detail.rules[i] ?? "" })) : [],
    next: detail && first ? { title: first.date, meta: `${first.when} · ${first.taken} of ${first.cap} booked`, cue: detail.cue, onGuests: toGuests } : null,
    pay: detail ? payout(detail) : payout({ guests: 0, price: 0 }),
    meetCue: detail ? capitalise(detail.cue) : "",
    actions: (detail?.actions ?? []).map((a) => ({ label: a.label, onClick: () => run(a.action) })),
  };
}
