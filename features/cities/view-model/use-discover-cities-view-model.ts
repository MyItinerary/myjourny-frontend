import { toCityTile, useExperienceCities } from "../model/cities";
import type { CityTile } from "../model/cities.types";

export type DiscoverCitiesViewModel = {
  /** Cities with experiences; empty while loading, so no wrong city flashes up. */
  cities: CityTile[];
  /** False once loaded with none, or if it failed: hide the section. */
  show: boolean;
};

/** "Discover by cities": every city that has bookable experiences, from the API. */
export function useDiscoverCitiesViewModel(): DiscoverCitiesViewModel {
  const { data, isError } = useExperienceCities();
  const cities = (data ?? []).map(toCityTile);
  return { cities, show: !isError && (data === undefined || cities.length > 0) };
}
