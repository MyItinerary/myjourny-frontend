export interface ExperienceSuggestion {
  id: string;
  title: string;
  headline?: string | null;
  city?: string | null;
  country?: string | null;
  price_from?: number | null;
  currency?: string | null;
  cover_image_url?: string | null;
}

/** An experience suggestion with the text and image the list shows, worked out
 * by the view-model so the view only renders. */
export interface ExperienceSuggestionRow extends ExperienceSuggestion {
  subtitle: string;
  fallbackImage: string;
}

export interface SearchExperiencesParams {
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export interface DestinationSuggestion {
  id: string;
  city: string;
  description: string;
}

export interface ActivitySuggestion {
  id: string;
  label: string;
  subtitle: string;
}

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
}

export type SearchTab = "where" | "when" | "who";
export type SearchBarVariant = "hero" | "nav";
