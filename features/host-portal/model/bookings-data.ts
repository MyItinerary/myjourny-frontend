import type { HostBooking } from "./bookings.types";
import { useGuideBookings } from "./guide-bookings-api";
import { isPaid, toHostBooking } from "./guide-bookings";
import { useHostAccess } from "./host-access";
import { isSample } from "./listings-data";
import { sampleBookings } from "./sample-bookings";

export type HostBookingsData = {
  bookings: HostBooking[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

/** The guide's paid bookings from itin. While the design is reviewed,
 * `?preview=full` shows the design's six sample bookings instead; that's off
 * in production builds. */
export function useHostBookings(preview: string | null, today: string | null): HostBookingsData {
  const sample = isSample(preview);
  const access = useHostAccess();
  const guide = !sample && (access === "approved" || access === "pending" || access === "rejected");
  const query = useGuideBookings(guide);

  const pages = query.data?.pages ?? [];
  const guideBookings = pages.flatMap((page) => page.items ?? []);
  const onLoadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
  };

  if (sample) return { bookings: today ? sampleBookings(today) : [], loading: false, hasMore: false, loadingMore: false, onLoadMore };
  if (!today) return { bookings: [], loading: true, hasMore: false, loadingMore: false, onLoadMore };
  return {
    bookings: guideBookings.filter(isPaid).map((b) => toHostBooking(b, today)),
    loading: guide && query.isLoading,
    hasMore: guide && !!query.hasNextPage,
    loadingMore: guide && query.isFetchingNextPage,
    onLoadMore,
  };
}
