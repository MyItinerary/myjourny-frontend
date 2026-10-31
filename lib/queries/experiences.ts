"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ExperienceCardProps } from "@/components/experiences/experience-card";

// Matches itin's ExperienceMatch DTO (app/core/dto/experience.py) — what
// GET /experiences/recommendations and GET /experiences/browsing-history
// both return.
export type ExperienceMatch = {
  experience_id: string;
  match_score: number;
  reasons: string[];
  explanation: string;
  title: string;
  headline?: string | null;
  imageUrl?: string | null;
  price?: number;
  price_from?: number | null;
  price_unit?: string | null;
  currency: string;
  duration?: number | null; // minutes
  rating?: number | null;
  safetyBadgeCount: number;
  city?: string | null;
  country?: string | null;
};

export const FALLBACK_IMAGE = "/images/home/experiences/kayaking.jpg";

export function formatDuration(minutes?: number | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : `${hours}h ${rest}m`;
}

// ExperienceMatch and ExperienceCardProps don't line up field-for-field —
// see the plan (mossy-scribbling-dusk.md) for why each of these gaps
// exists rather than being an oversight: no `category` field at all (city
// stands in for it), no `reviewCount` field at all (defaults to 0).
export function experienceMatchToCardProps(
  match: ExperienceMatch
): ExperienceCardProps & { id: string } {
  return {
    id: match.experience_id,
    imageSrc: match.imageUrl || FALLBACK_IMAGE,
    imageAlt: match.title,
    category: match.city || "",
    title: match.title,
    duration: formatDuration(match.duration),
    rating: match.rating ?? 0,
    reviewCount: 0,
    // price_from is null when nothing is on sale; the legacy `price` is 0 then, which isn't "Free".
    priceFrom: match.price_from != null ? Number(match.price_from) : null,
    currency: match.currency,
  };
}

type RecommendationParams = {
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  /** Category numeric ID — passed as ?id=<id> to GET /experiences/recommendations */
  id?: number;
  /** Interest category or subcategory slug; the backend also matches its subcategories and older tags. */
  interest?: string;
  price_min?: number;
  price_max?: number;
  duration_min?: number;
  duration_max?: number;
  time_of_day?: string;
};

async function fetchRecommendations(
  params: RecommendationParams & { offset: number; limit: number }
): Promise<ExperienceMatch[]> {
  const baseParams = {
    latitude: params.latitude ?? undefined,
    longitude: params.longitude ?? undefined,
    city: params.city,
    id: params.id,
    interest: params.interest,
    price_min: params.price_min,
    price_max: params.price_max,
    duration_min: params.duration_min,
    duration_max: params.duration_max,
    time_of_day: params.time_of_day,
    offset: params.offset,
    limit: params.limit,
  };
  try {
    const { data } = await apiClient.get<ExperienceMatch[]>(
      "/experiences/recommendations",
      { params: baseParams }
    );
    return data;
  } catch (error) {
    // A backend that hasn't picked up the optional-lat/long change yet
    // (e.g. not redeployed) still 422s on missing latitude/longitude —
    // retry once with 0/0 dummy coordinates rather than surfacing that
    // for what should be a perfectly valid "no location" request.
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 422 && (baseParams.latitude === undefined || baseParams.longitude === undefined)) {
      const { data } = await apiClient.get<ExperienceMatch[]>(
        "/experiences/recommendations",
        { params: { ...baseParams, latitude: baseParams.latitude ?? 0, longitude: baseParams.longitude ?? 0 } }
      );
      return data;
    }
    throw error;
  }
}

export function useRecommendedExperiences(
  params: RecommendationParams & {
    offset?: number;
    limit?: number;
    /**
     * Defaults to true — no city/coordinates is a legitimate call on its own
     * (location-agnostic, profile-scored recommendations), not something to
     * infer disabled from. Callers that need to defer (e.g. "Popular near
     * you" while geolocation is still resolving) pass `enabled: false`
     * explicitly instead.
     */
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["experiences", "recommendations", params],
    queryFn: () =>
      fetchRecommendations({
        ...params,
        offset: params.offset ?? 0,
        limit: params.limit ?? (params.id !== undefined ? 20 : 10),
      }),
    enabled: params.enabled ?? true,
  });
}

// Server-paginated recommendations for listing pages: each fetchNextPage()
// asks itin for the next `pageSize` via offset. The endpoint returns a bare
// list with no total, so a short page is the only "no more" signal.
// Scores can shift between page fetches, so the same experience can land
// on two pages — keep the first.
export function uniqueMatches(pages: ExperienceMatch[][] | undefined): ExperienceMatch[] {
  const seen = new Set<string>();
  return (pages ?? []).flat().filter((m) => {
    if (seen.has(m.experience_id)) return false;
    seen.add(m.experience_id);
    return true;
  });
}

export function useInfiniteRecommendedExperiences(
  params: RecommendationParams & { pageSize: number; enabled?: boolean }
) {
  const { pageSize, enabled = true, ...filters } = params;
  return useInfiniteQuery({
    queryKey: ["experiences", "recommendations", "infinite", filters, pageSize],
    queryFn: ({ pageParam }) => fetchRecommendations({ ...filters, offset: pageParam, limit: pageSize }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < pageSize ? undefined : allPages.length * pageSize,
    enabled,
  });
}

export function useBrowsingHistory(limit = 10) {
  return useQuery({
    queryKey: ["experiences", "browsing-history", limit],
    queryFn: async () => {
      const { data } = await apiClient.get<ExperienceMatch[]>("/experiences/browsing-history", {
        params: { limit },
      });
      return data;
    },
  });
}

// Matches itin's ExperiencePriceOut DTO (app/core/dto/experience_price.py).
// An experience can have multiple price tiers (e.g. "Standard", "Group") —
// booking now requires picking one via experience_price_id.
export type ExperiencePrice = {
  id: string;
  experience_id: string;
  label: string;
  description?: string | null;
  amount: number;
};

export function useExperiencePrices(experienceId: string) {
  return useQuery({
    queryKey: ["experiences", "prices", experienceId],
    queryFn: async () => {
      const { data } = await apiClient.get<ExperiencePrice[]>("/experience-prices/", {
        params: { experience_id: experienceId },
      });
      return data;
    },
    enabled: !!experienceId,
  });
}

// GET /experiences/semantic-search — Natural language / AI query matching
export type SemanticSearchResult = {
  experience_id: string;
  match_score?: number;
  title: string;
  headline?: string | null;
  imageUrl?: string | null;
  price?: number;
  price_from?: number | null;
  price_unit?: string | null;
  currency: string;
  duration?: number | null;
  rating?: number | null;
  safetyBadgeCount?: number;
  city?: string | null;
  country?: string | null;
};

export function useSemanticSearch(params: {
  q: string;
  latitude?: number | null;
  longitude?: number | null;
  radius_km?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["experiences", "semantic-search", params],
    queryFn: async () => {
      const { data } = await apiClient.get<SemanticSearchResult[]>(
        "/experiences/semantic-search",
        {
          params: {
            q: params.q,
            ...(params.latitude != null && { latitude: params.latitude }),
            ...(params.longitude != null && { longitude: params.longitude }),
            ...(params.radius_km != null && { radius_km: params.radius_km }),
          },
        }
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: (params.enabled ?? true) && !!params.q.trim(),
    staleTime: 60_000,
  });
}

// POST /bookings/{bookingId}/payment-sheet — Stripe Payment Sheet integration
export type PaymentSheetParams = {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
};

export function useBookingPaymentSheet() {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await apiClient.post<PaymentSheetParams>(
        `/bookings/${bookingId}/payment-sheet`
      );
      return data;
    },
  });
}


// GET /experiences/filter — plain filtered listing (no personal scoring), so
// it's the one listing guests can use too. itin drops the exact location,
// guide and booking link for guests. Paginated by page number with a total.
export type ExperienceListItem = {
  id: string;
  title: string;
  headline?: string | null;
  city?: string | null;
  country?: string | null;
  duration_minutes?: number | null;
  rating?: number | null;
  currency?: string | null;
  cover_image_url?: string | null;
  price_from?: number | null;
  price_unit?: string | null;
};

type ExperienceListPage = {
  items: ExperienceListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type ExperienceFilters = {
  city?: string;
  country?: string;
  /** Energy/budget/comfort/social-style category slug(s), with subcategories. */
  category?: string[];
  /** Interest category slug — exact match against the experience's interest tags. */
  interest?: string;
  /** Free-text search query across experiences */
  search?: string;
  price_min?: number;
  price_max?: number;
  duration_min?: number;
  duration_max?: number;
  time_of_day?: string;
  rating_min?: number;
  /** YYYY-MM-DD: only experiences someone can start that day (today or later). */
  date?: string;
  sort?: "created_at_desc" | "rating_desc" | "price_asc" | "price_desc";
};

export function experienceListItemToCardProps(
  item: ExperienceListItem
): ExperienceCardProps & { id: string } {
  return {
    id: item.id,
    imageSrc: item.cover_image_url || FALLBACK_IMAGE,
    imageAlt: item.title,
    category: item.city || "",
    title: item.title,
    duration: formatDuration(item.duration_minutes),
    rating: item.rating ?? 0,
    reviewCount: 0,
    priceFrom: item.price_from ?? null,
    currency: item.currency ?? "NGN",
  };
}

async function fetchExperiencePage(filters: ExperienceFilters, page: number, limit: number) {
  const { data } = await apiClient.get<ExperienceListPage>("/experiences/filter", {
    params: { ...filters, page, limit },
    // category=a&category=b, the way FastAPI reads list params.
    paramsSerializer: { indexes: null },
  });
  return data;
}

export function useFilteredExperiences(
  filters: ExperienceFilters & { limit: number; enabled?: boolean }
) {
  const { limit, enabled = true, ...rest } = filters;
  return useQuery({
    queryKey: ["experiences", "filter", rest, limit],
    queryFn: () => fetchExperiencePage(rest, 1, limit),
    enabled,
  });
}

export function useInfiniteFilteredExperiences(
  filters: ExperienceFilters & { pageSize: number; enabled?: boolean }
) {
  const { pageSize, enabled = true, ...rest } = filters;
  return useInfiniteQuery({
    queryKey: ["experiences", "filter", "infinite", rest, pageSize],
    queryFn: ({ pageParam }) => fetchExperiencePage(rest, pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
    enabled,
  });
}
