import { useQueries } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth/session-store";
import { INTEREST_OPTIONS } from "@/lib/onboarding/preference-options";
import { useMyBookings, type Booking } from "@/lib/queries/bookings";
import { useInterestCategories } from "@/lib/queries/categories";
import type { ExperienceDetail } from "@/lib/queries/experiences";
import { useGetProfile } from "@/lib/queries/profile";

/** Bookings in one category, outside the saved interests, before we say so. */
export const DRIFT_MIN_BOOKINGS = 3;

export type TasteDrift = {
  /** How many bookings sit in the drifted category. */
  count: number;
  /** Display name of that category, e.g. "water activities". */
  category: string;
  /** Display names of the interests the user saved in the quiz. */
  interests: string[];
};

const BOOKED_STATUSES: Booking["status"][] = ["confirmed", "completed"];

// The quiz saves interest ids ("food", "art", "street-life"); experiences are
// tagged with category slugs ("local-food-drinks", "art-creativity"). A tag
// belongs to an interest when they are the same or the id is one of the
// slug's words.
function tagMatchesInterest(tag: string, interestId: string) {
  const t = tag.toLowerCase();
  const i = interestId.toLowerCase();
  return t === i || t.split("-").includes(i);
}

/** The category the user keeps booking outside their saved interests, once it
 * has happened `DRIFT_MIN_BOOKINGS` times. `bookedTags` has one entry per
 * booking: that experience's interest tags. Null when nothing has drifted. */
export function detectTasteDrift({
  savedInterests,
  bookedTags,
}: {
  savedInterests: string[];
  bookedTags: string[][];
}): { count: number; tag: string } | null {
  if (savedInterests.length === 0) return null;

  const counts = new Map<string, number>();
  for (const tags of bookedTags) {
    // A booking that touches a saved interest isn't drift, whatever else it is tagged.
    if (tags.some((tag) => savedInterests.some((id) => tagMatchesInterest(tag, id)))) continue;
    for (const tag of new Set(tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  let best: { count: number; tag: string } | null = null;
  for (const [tag, count] of counts) {
    if (count >= DRIFT_MIN_BOOKINGS && (!best || count > best.count)) best = { count, tag };
  }
  return best;
}

export function humanizeSlug(slug: string) {
  return slug.replace(/[-_]+/g, " ").trim().toLowerCase();
}

function interestLabel(id: string) {
  return (INTEREST_OPTIONS.find((o) => o.id === id)?.label ?? humanizeSlug(id)).toLowerCase();
}

/** Whether a signed-in user's bookings have moved away from the interests they
 * picked in the quiz. Undefined while any of the data is still loading. */
export function useTasteDrift(enabled: boolean): TasteDrift | null | undefined {
  const { user } = useSession();
  const active = enabled && user !== null;

  const profile = useGetProfile();
  const upcoming = useMyBookings("upcoming", 20);
  const past = useMyBookings("past", 20);
  const categories = useInterestCategories();

  const experienceIds = [
    ...new Set(
      [...(upcoming.data?.pages ?? []), ...(past.data?.pages ?? [])]
        .flatMap((page) => page.items)
        .filter((b) => BOOKED_STATUSES.includes(b.status) && b.experience_id)
        .map((b) => b.experience_id as string),
    ),
  ];

  const details = useQueries({
    queries: experienceIds.map((id) => ({
      queryKey: ["experiences", "detail", id],
      queryFn: async () => {
        const { data } = await apiClient.get<ExperienceDetail>(`/experiences/${id}`);
        return data;
      },
      enabled: active,
    })),
  });

  if (!active) return null;
  if (!profile.data || upcoming.isPending || past.isPending || details.some((d) => d.isPending)) return undefined;

  const savedInterests = profile.data.interests ?? [];
  const drift = detectTasteDrift({
    savedInterests,
    bookedTags: details.flatMap((d) => (d.data ? [d.data.interest_tags ?? []] : [])),
  });
  if (!drift) return null;

  const labelFor = (slug: string) =>
    (categories.data?.find((c) => c.slug === slug)?.text ?? humanizeSlug(slug)).toLowerCase();

  return { count: drift.count, category: labelFor(drift.tag), interests: savedInterests.map(interestLabel) };
}
