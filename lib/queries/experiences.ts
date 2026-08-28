"use client";

import { useQuery } from "@tanstack/react-query";
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
  price: number;
  currency: string;
  duration?: number | null; // minutes
  rating?: number | null;
  safetyBadgeCount: number;
  city?: string | null;
  country?: string | null;
};

const FALLBACK_IMAGE = "/images/home/experiences/kayaking.jpg";

function formatDuration(minutes?: number | null): string {
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
    priceFrom: match.price,
    currency: match.currency,
  };
}

export function useRecommendedExperiences(params: {
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
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
}) {
  return useQuery({
    queryKey: ["experiences", "recommendations", params],
    queryFn: async () => {
      const baseParams = {
        latitude: params.latitude ?? undefined,
        longitude: params.longitude ?? undefined,
        city: params.city,
        offset: params.offset ?? 0,
        limit: params.limit ?? 10,
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
    },
    enabled: params.enabled ?? true,
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

// Matches itin's ExperienceDetail DTO (extends ExperienceOut) — a
// DIFFERENT field-naming scheme than ExperienceMatch above (price_from
// not price, cover_image_url not imageUrl, id not experience_id, etc.).
// This is a best-effort shape from reading the DTO, not verified against
// a live response the way ExperienceMatch was — re-verify against a real
// GET /experiences/{id} call when actually building app/experiences/[id]
// via figma-design-to-code, per the plan.
export type ExperienceDetail = {
  id: string;
  guide_id?: string | null;
  status: string;
  title: string;
  headline?: string | null;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  duration_minutes?: number | null;
  group_size_min?: number | null;
  group_size_max?: number | null;
  price_from?: number | null;
  currency?: string | null;
  interest_tags?: string[] | null;
  safety_badge_count?: number | null;
  rating?: number | null;
  cover_image_url?: string | null;
  booking_url?: string | null;
  what_you_will_do?: string[] | null;
  whats_included?: string[] | null;
  whats_not_included?: string[] | null;
  why_you_will_like_this?: string[] | null;
  images?: string[] | null;
  host?: { id: string; display_name?: string | null } | null;
};

export function useExperienceDetail(id: string) {
  return useQuery({
    queryKey: ["experiences", "detail", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ExperienceDetail>(`/experiences/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
