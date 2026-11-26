import type { DestinationSuggestion } from "./search.types";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** City centres by the slug /cities/{slug} uses. The listing API filters by city, not distance,
 * so Nearby opens the closest of these that has experiences. Add a city here when it's listed. */
export const CITY_COORDINATES: Record<string, Coordinates> = {
  lagos: { latitude: 6.5244, longitude: 3.3792 },
  abuja: { latitude: 9.0765, longitude: 7.3986 },
  ibadan: { latitude: 7.3775, longitude: 3.947 },
  "benin-city": { latitude: 6.335, longitude: 5.6037 },
  calabar: { latitude: 4.9757, longitude: 8.3417 },
  "port-harcourt": { latitude: 4.8156, longitude: 7.0498 },
  kano: { latitude: 12.0022, longitude: 8.592 },
  kaduna: { latitude: 10.5105, longitude: 7.4165 },
  enugu: { latitude: 6.4584, longitude: 7.5464 },
  jos: { latitude: 9.8965, longitude: 8.8583 },
  abeokuta: { latitude: 7.1475, longitude: 3.3619 },
  owerri: { latitude: 5.484, longitude: 7.0351 },
  bauchi: { latitude: 10.3158, longitude: 9.8442 },
  uyo: { latitude: 5.0377, longitude: 7.9128 },
  ilorin: { latitude: 8.4966, longitude: 4.5426 },
  akure: { latitude: 7.2571, longitude: 5.2058 },
  warri: { latitude: 5.516, longitude: 5.75 },
  onitsha: { latitude: 6.145, longitude: 6.7853 },
  asaba: { latitude: 6.198, longitude: 6.731 },
  umuahia: { latitude: 5.525, longitude: 7.4922 },
  osogbo: { latitude: 7.7827, longitude: 4.5418 },
};

/** Great-circle distance in kilometres. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** The listed city closest to `here`, among those we know the centre of; null when there's none. */
export function nearestCity(here: Coordinates, cities: DestinationSuggestion[]): DestinationSuggestion | null {
  let best: { city: DestinationSuggestion; km: number } | null = null;
  for (const city of cities) {
    const centre = CITY_COORDINATES[city.id];
    if (!centre) continue;
    const km = distanceKm(here, centre);
    if (!best || km < best.km) best = { city, km };
  }
  return best?.city ?? null;
}
