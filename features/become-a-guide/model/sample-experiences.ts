import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { formatNgnCurrency } from "./become-a-guide-calculator";
import type { SampleExperienceItem } from "./become-a-guide.types";

export const DEFAULT_SAMPLE_EXPERIENCES: SampleExperienceItem[] = [
  {
    id: "sample-photographer",
    category: "PHOTOGRAPHER",
    title: "Neighbourhood photowalk",
    priceFormatted: "₦10,000",
    guestCountFormatted: "8 guests",
    imageUrl: null,
    href: "/experiences",
  },
  {
    id: "sample-private-chef",
    category: "PRIVATE CHEF",
    title: "Supper club for strangers",
    priceFormatted: "₦28,000",
    guestCountFormatted: "10 guests",
    imageUrl: null,
    href: "/experiences",
  },
  {
    id: "sample-yoga-instructor",
    category: "YOGA INSTRUCTOR",
    title: "Sunrise rooftop flow",
    priceFormatted: "₦8,000",
    guestCountFormatted: "15 guests",
    imageUrl: null,
    href: "/experiences",
  },
  {
    id: "sample-dj",
    category: "DJ",
    title: "Vinyl listening session",
    priceFormatted: "₦7,500",
    guestCountFormatted: "20 guests",
    imageUrl: null,
    href: "/experiences",
  },
  {
    id: "sample-makeup-artist",
    category: "MAKEUP ARTIST",
    title: "Everyday glam masterclass",
    priceFormatted: "₦18,000",
    guestCountFormatted: "6 guests",
    imageUrl: null,
    href: "/experiences",
  },
  {
    id: "sample-craft-practitioner",
    category: "CRAFT PRACTITIONER",
    title: "Adire dyeing workshop",
    priceFormatted: "₦15,000",
    guestCountFormatted: "10 guests",
    imageUrl: null,
    href: "/experiences",
  },
  {
    id: "sample-boat-operator",
    category: "BOAT OPERATOR",
    title: "Sunset creek cruise",
    priceFormatted: "₦20,000",
    guestCountFormatted: "12 guests",
    imageUrl: null,
    href: "/experiences",
  },
  {
    id: "sample-fitness-coach",
    category: "FITNESS COACH",
    title: "Saturday beach bootcamp",
    priceFormatted: "₦5,000",
    guestCountFormatted: "25 guests",
    imageUrl: null,
    href: "/experiences",
  },
];

interface ApiExperienceItem {
  id: string;
  title: string;
  headline?: string | null;
  city?: string | null;
  price_from?: number | null;
  cover_image_url?: string | null;
}

interface ApiExperienceResponse {
  items?: ApiExperienceItem[];
}

export function mapApiExperiences(items?: ApiExperienceItem[]): SampleExperienceItem[] {
  if (!items || items.length === 0) {
    return DEFAULT_SAMPLE_EXPERIENCES;
  }

  const mapped: SampleExperienceItem[] = items.map((item, index) => {
    const fallback = DEFAULT_SAMPLE_EXPERIENCES[index % DEFAULT_SAMPLE_EXPERIENCES.length];
    return {
      id: item.id || fallback.id,
      category: item.city ? item.city.toUpperCase() : fallback.category,
      title: item.title || fallback.title,
      priceFormatted:
        item.price_from != null ? formatNgnCurrency(item.price_from) : fallback.priceFormatted,
      guestCountFormatted: fallback.guestCountFormatted,
      imageUrl: item.cover_image_url || null,
      href: `/experiences/${item.id}`,
    };
  });

  if (mapped.length < 8) {
    const remaining = DEFAULT_SAMPLE_EXPERIENCES.slice(mapped.length);
    return [...mapped, ...remaining];
  }

  return mapped.slice(0, 8);
}

export function useSampleExperiencesQuery() {
  return useQuery({
    queryKey: ["become-a-guide", "sample-experiences"],
    queryFn: async (): Promise<SampleExperienceItem[]> => {
      try {
        const { data } = await apiClient.get<ApiExperienceResponse>("/experiences/filter", {
          params: { limit: 8 },
        });
        return mapApiExperiences(data?.items);
      } catch {
        return DEFAULT_SAMPLE_EXPERIENCES;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
