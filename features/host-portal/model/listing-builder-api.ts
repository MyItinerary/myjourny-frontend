import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { type Category, useInterestCategories } from "@/lib/queries/categories";

import type { GuideExperience } from "./guide-listings.types";
import type { PlaceResult } from "./listing-draft.types";
import type { ExperiencePayload } from "./listing-payload";

/** The interest categories with their subcategories, for the builder's
 * pickers. `ready` once the request has finished, either way. */
export function useInterestTree(): { tree: Category[]; ready: boolean } {
  const { data, isFetched } = useInterestCategories({ tree: true });
  return { tree: data ?? [], ready: isFetched };
}

type NominatimResult = { name?: string; display_name: string; lat: string; lon: string };

/** Places matching what the guide typed, each with its map pin. OpenStreetMap's
 * Nominatim, as helm uses: no key, and light enough for a guide typing. */
export async function searchPlaces(query: string, city: string): Promise<PlaceResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "ng");
  url.searchParams.set("q", city ? `${query}, ${city}` : query);
  const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Place search failed");
  const results = (await response.json()) as NominatimResult[];
  return results.map((r) => {
    const [first, ...rest] = r.display_name.split(", ");
    return { name: r.name || first, area: rest.slice(0, 2).join(", "), lat: Number(r.lat), lng: Number(r.lon) };
  });
}

/** Search once the guide has typed three letters; `query` is already debounced. */
export function usePlaceSearch(query: string, city: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["places", q, city],
    queryFn: () => searchPlaces(q, city),
    enabled: q.length >= 3,
    staleTime: 10 * 60_000,
  });
}

type UploadSignature = { signature: string; timestamp: number; api_key: string; cloud_name: string; folder?: string };

/** Uploads a photo to Cloudinary, signed by itin, and returns its link. */
export async function uploadPhoto(file: File): Promise<string> {
  const { data: sig } = await apiClient.get<UploadSignature>("/guide/uploads/cloudinary-signature");
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.api_key);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  if (sig.folder) form.append("folder", sig.folder);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method: "POST", body: form });
  if (!response.ok) throw new Error("Photo upload failed");
  return ((await response.json()) as { secure_url: string }).secure_url;
}

type Pricing = { prices: { id: string; amount: string | number }[] };

/** The listing and its ticket price, for editing. */
export async function fetchListingForEdit(id: string): Promise<{ experience: GuideExperience; price: number | null }> {
  const [{ data: experience }, { data: pricing }] = await Promise.all([
    apiClient.get<GuideExperience>(`/guide/experiences/${id}`),
    apiClient.get<Pricing>(`/experiences/${id}/pricing`),
  ]);
  const first = pricing.prices[0];
  return { experience, price: first ? Number(first.amount) : null };
}

/** An experience has one ticket, "Adult": the builder's single price. Editing
 * changes that ticket's amount, since `PUT /experiences/{id}` takes no prices. */
async function savePrice(id: string, amount: number) {
  const { data } = await apiClient.get<Pricing>(`/experiences/${id}/pricing`);
  const ticket = data.prices[0];
  if (!ticket) await apiClient.post(`/experiences/${id}/prices`, { label: "Adult", amount, pricing_unit: "per_person" });
  else if (Number(ticket.amount) !== amount) await apiClient.patch(`/experiences/${id}/prices/${ticket.id}`, { amount });
}

export type SaveListing = { id: string | null; payload: ExperiencePayload; price: number };

/** Publishes a new listing, or saves changes to one already in itin. */
export function useSaveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload, price }: SaveListing): Promise<GuideExperience> => {
      if (!id) {
        const prices = [{ label: "Adult", amount: price, pricing_unit: "per_person" }];
        return (await apiClient.post<GuideExperience>("/experiences/", { ...payload, prices })).data;
      }
      const { data } = await apiClient.put<GuideExperience>(`/experiences/${id}`, payload);
      await savePrice(id, price);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guide", "experiences"] }),
  });
}
