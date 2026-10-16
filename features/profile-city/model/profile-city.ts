import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useUpdateProfile } from "@/lib/queries/profile";

import type { CityChoice, CityOption, Coordinates, LocationPermission } from "./profile-city.types";

export const MIN_CITY_QUERY = 2;

/** Offered before anything is typed: where most experiences are today. */
export const POPULAR_CITIES: CityChoice[] = [
  ["Lagos", "Lagos State"],
  ["Abuja", "Federal Capital Territory"],
  ["Port Harcourt", "Rivers State"],
  ["Ibadan", "Oyo State"],
  ["Benin City", "Edo State"],
  ["Enugu", "Enugu State"],
  ["Kano", "Kano State"],
  ["Calabar", "Cross River State"],
  ["Uyo", "Akwa Ibom State"],
  ["Jos", "Plateau State"],
  ["Kaduna", "Kaduna State"],
  ["Abeokuta", "Ogun State"],
].map(([name, state]) => ({ key: `popular:${name}`, name, detail: `${state}, Nigeria` }));

export function toCityChoice(city: CityOption): CityChoice {
  // A city-state repeats its own name as the region ("Lagos, Lagos").
  const region = city.region && city.region !== city.name ? city.region : null;
  return {
    key: `${city.name}|${city.region ?? ""}|${city.country_code ?? ""}`,
    name: city.name,
    detail: [region, city.country].filter(Boolean).join(", "),
  };
}

/** GET /geo/cities: cities matching what has been typed. Off below two characters. */
export function useCitySearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["geo", "cities", q.toLowerCase()],
    queryFn: async () => (await apiClient.get<CityOption[]>("/geo/cities", { params: { q } })).data.map(toCityChoice),
    enabled: q.length >= MIN_CITY_QUERY,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

/** GET /geo/reverse: the city at a point, or null when itin finds none there. */
export async function fetchCityAt({ latitude, longitude }: Coordinates): Promise<CityChoice | null> {
  try {
    const { data } = await apiClient.get<CityOption>("/geo/reverse", { params: { latitude, longitude } });
    return toCityChoice(data);
  } catch (error) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) return null;
    throw error;
  }
}

/** PUT /profile/me with the city. */
export function useSaveCity() {
  return useUpdateProfile();
}

/** Whether the browser would hand over a position without asking. Browsers
 * that can't say are "unknown", which callers treat as "would ask". */
export async function locationPermission(): Promise<LocationPermission> {
  try {
    if (!("geolocation" in navigator) || !navigator.permissions) return "unknown";
    return (await navigator.permissions.query({ name: "geolocation" })).state;
  } catch {
    return "unknown";
  }
}

/** The browser's position. Asks for permission if it hasn't been given.
 * Rejects with `{ denied: true }` when the person or their browser said no. */
export function currentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject({ denied: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject({ denied: error.code === error.PERMISSION_DENIED }),
      // A city doesn't need GPS accuracy, and a recent fix is fine.
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
