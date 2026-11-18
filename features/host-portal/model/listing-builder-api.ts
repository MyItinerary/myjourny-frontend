import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { type Category, useInterestCategories } from "@/lib/queries/categories";

import type { GuideExperience } from "./guide-listings.types";
import type { PlacePin, PlaceResult } from "./listing-draft.types";
import type { ExperiencePayload, ListingPrices } from "./listing-payload";

/** The interest categories with their subcategories, for the builder's
 * pickers. `ready` once the request has finished, either way. */
export function useInterestTree(): { tree: Category[]; ready: boolean } {
  const { data, isFetched } = useInterestCategories({ tree: true });
  return { tree: data ?? [], ready: isFetched };
}

type PlaceSuggestion = { place_id: string; name: string; area: string | null };
type PlaceLocation = { place_id: string; latitude: number; longitude: number };

/** Places matching what the guide typed, from Google through itin. The same
 * `session` goes on the pick, so Google bills the typing and the pick as
 * one search. */
export async function searchPlaces(query: string, city: string, session: string): Promise<PlaceResult[]> {
  const { data } = await apiClient.get<PlaceSuggestion[]>("/geo/places/autocomplete", {
    params: { q: query, city: city || undefined, session },
  });
  return data.map((p) => ({ placeId: p.place_id, name: p.name, area: p.area ?? "" }));
}

/** The map pin of a picked place. */
export async function fetchPlacePin(placeId: string, session: string): Promise<PlacePin> {
  const { data } = await apiClient.get<PlaceLocation>(`/geo/places/${encodeURIComponent(placeId)}`, {
    params: { session },
  });
  return { lat: data.latitude, lng: data.longitude };
}

/** Search once the guide has typed three letters; `query` is already debounced. */
export function usePlaceSearch(query: string, city: string, session: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["places", q, city],
    queryFn: () => searchPlaces(q, city, session),
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

type Ticket = { id: string; amount: string | number; pricing_unit?: string };
type Pricing = { prices: Ticket[] };

const PRIVATE = "per_booking";
const adultTicket = (prices: Ticket[]) => prices.find((t) => t.pricing_unit !== PRIVATE);
const privateTicket = (prices: Ticket[]) => prices.find((t) => t.pricing_unit === PRIVATE);
const amountOf = (ticket: Ticket | undefined) => (ticket ? Number(ticket.amount) : null);

/** The listing and its ticket prices, for editing. */
export async function fetchListingForEdit(id: string): Promise<{ experience: GuideExperience; prices: ListingPrices }> {
  const [{ data: experience }, { data: pricing }] = await Promise.all([
    apiClient.get<GuideExperience>(`/guide/experiences/${id}`),
    apiClient.get<Pricing>(`/experiences/${id}/pricing`),
  ]);
  return {
    experience,
    prices: { price: amountOf(adultTicket(pricing.prices)), privatePrice: amountOf(privateTicket(pricing.prices)) },
  };
}

const newTickets = (price: number, privatePrice: number | null) => [
  { label: "Adult", amount: price, pricing_unit: "per_person" },
  ...(privatePrice ? [{ label: "Private group", amount: privatePrice, pricing_unit: PRIVATE }] : []),
];

/** An experience sells an "Adult" ticket per person and, if the host set one,
 * a "Private group" ticket per booking. `PUT /experiences/{id}` takes no
 * prices, so editing changes the tickets directly. A cleared private price
 * archives its ticket, since past bookings still point at it. */
async function savePrices(id: string, price: number, privatePrice: number | null) {
  const { data } = await apiClient.get<Pricing>(`/experiences/${id}/pricing`);
  const adult = adultTicket(data.prices);
  if (!adult) await apiClient.post(`/experiences/${id}/prices`, newTickets(price, null)[0]);
  else if (Number(adult.amount) !== price) await apiClient.patch(`/experiences/${id}/prices/${adult.id}`, { amount: price });

  const group = privateTicket(data.prices);
  if (privatePrice && !group) await apiClient.post(`/experiences/${id}/prices`, newTickets(price, privatePrice)[1]);
  else if (privatePrice && group && Number(group.amount) !== privatePrice)
    await apiClient.patch(`/experiences/${id}/prices/${group.id}`, { amount: privatePrice });
  else if (!privatePrice && group) await apiClient.patch(`/experiences/${id}/prices/${group.id}`, { is_active: false });
}

export type SaveListing = { id: string | null; payload: ExperiencePayload; price: number; privatePrice: number | null };

/** Publishes a new listing, or saves changes to one already in itin. */
export function useSaveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload, price, privatePrice }: SaveListing): Promise<GuideExperience> => {
      if (!id) {
        const prices = newTickets(price, privatePrice);
        return (await apiClient.post<GuideExperience>("/experiences/", { ...payload, prices })).data;
      }
      const { data } = await apiClient.put<GuideExperience>(`/experiences/${id}`, payload);
      await savePrices(id, price, privatePrice);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guide", "experiences"] }),
  });
}
