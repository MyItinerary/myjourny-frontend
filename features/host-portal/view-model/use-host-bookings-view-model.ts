import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  BOOKING_STATUS_OPTIONS,
  BOOKING_WHEN_OPTIONS,
  bookingChip,
  bookingsResultLine,
  bookingsSummary,
  filterBookings,
  hasActiveBookingFilters,
  NO_BOOKING_FILTERS,
  uniqueListings,
} from "../model/booking-table";
import type { BookingFilters, BookingWhenFilter, HostBooking } from "../model/bookings.types";
import { useHostBookings } from "../model/bookings-data";
import type { FilterGroup } from "../model/filter-group.types";
import type { ListingStatus } from "../model/home.types";
import { HOST_PORTAL_BASE } from "../model/nav";
import type { HostPageHeader } from "./use-host-home-view-model";
import { useToday } from "./use-today";

export type BookingRow = { booking: HostBooking; chip: ListingStatus };

export type BookingDetail = {
  booking: HostBooking;
  chip: ListingStatus;
  /** "Accept, 2 places" */
  acceptLabel: string;
  /** Upcoming bookings can be scanned in or reported as no-shows. */
  canCheckIn: boolean;
  scanHref: string;
};

export type HostBookingsViewModel = {
  header: HostPageHeader;
  query: string;
  onQuery: (query: string) => void;
  resultLine: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  groups: FilterGroup[];
  onPick: (key: string, value: string) => void;
  scanHref: string;
  rows: BookingRow[];
  /** Nothing to show: no bookings yet, or the filters took them all away. */
  none: boolean;
  onShowEverything: () => void;
  onOpen: (id: string) => void;
  detail: BookingDetail | null;
  onCloseDetail: () => void;
  onAccept: () => void;
  onSayNo: () => void;
  onReportNoShow: () => void;
};

// Nothing is sent to itin from here yet; these say so rather than pretending.
const NOT_CONNECTED = "This will work once your bookings are connected.";

export function useHostBookingsViewModel(): HostBookingsViewModel {
  const preview = useSearchParams().get("preview");
  const today = useToday();
  const bookings = useHostBookings(preview, today);

  const [filters, setFilters] = useState<BookingFilters>(NO_BOOKING_FILTERS);
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = filterBookings(bookings, filters);
  const open = bookings.find((b) => b.id === openId) ?? null;

  const group = (
    key: string,
    label: string,
    anyValue: string,
    anyLabel: string,
    current: string,
    options: string[],
  ): FilterGroup => ({
    key,
    label,
    current: current === anyValue ? "Any" : current,
    active: current !== anyValue,
    anyValue,
    anyLabel,
    options: options.map((o) => ({ value: o, label: o, selected: current === o, subs: [] })),
  });

  const onPick = (key: string, value: string) => {
    if (key === "status") setFilters((f) => ({ ...f, status: value as BookingFilters["status"] }));
    else if (key === "listing") setFilters((f) => ({ ...f, listing: value }));
    else setFilters((f) => ({ ...f, when: value as BookingWhenFilter }));
  };

  return {
    header: { title: "Bookings", subtitle: bookingsSummary(bookings), actions: [] },
    query: filters.q,
    onQuery: (q) => setFilters((f) => ({ ...f, q })),
    resultLine: bookingsResultLine(shown.length, bookings.length),
    hasFilters: hasActiveBookingFilters(filters),
    onClearFilters: () => setFilters(NO_BOOKING_FILTERS),
    groups: [
      group("status", "Status", "All", "Any status", filters.status, BOOKING_STATUS_OPTIONS),
      group("listing", "Listing", "All", "Any listing", filters.listing, uniqueListings(bookings)),
      group("when", "When", "All dates", "All dates", filters.when, BOOKING_WHEN_OPTIONS),
    ],
    onPick,
    scanHref: `${HOST_PORTAL_BASE}/bookings/scan`,
    rows: shown.map((booking) => ({ booking, chip: bookingChip(booking.status) })),
    none: shown.length === 0,
    onShowEverything: () => setFilters(NO_BOOKING_FILTERS),
    onOpen: setOpenId,
    detail: open
      ? {
          booking: open,
          chip: bookingChip(open.status),
          acceptLabel: `Accept, ${open.guests} ${open.guests === 1 ? "place" : "places"}`,
          canCheckIn: open.tab === "Upcoming",
          scanHref: `${HOST_PORTAL_BASE}/bookings/scan`,
        }
      : null,
    onCloseDetail: () => setOpenId(null),
    onAccept: () => toast.info(NOT_CONNECTED),
    onSayNo: () => toast.info(NOT_CONNECTED),
    onReportNoShow: () => toast.info(NOT_CONNECTED),
  };
}
