import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { CityDestination, CityTile, ExperienceCity } from "./cities.types";

export const experienceCitiesQueryKey = ["experiences", "cities"] as const;

/** Cities that have bookable experiences, busiest first. Public. */
export function useExperienceCities() {
  return useQuery({
    queryKey: experienceCitiesQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<ExperienceCity[]>("/experiences/cities");
      return data;
    },
    staleTime: 10 * 60_000,
  });
}

// Photos we ship for some cities; any other city uses its best experience's cover.
const LOCAL_CITY_IMAGES: Record<string, string> = {
  lagos: "/images/home/cities/lagos.jpg",
  abuja: "/images/home/cities/abuja.jpg",
  ibadan: "/images/home/cities/ibadan.jpg",
  calabar: "/images/home/cities/calabar.jpg",
  abeokuta: "/images/home/cities/abeokuta.jpg",
  jos: "/images/home/cities/jos.jpg",
  bauchi: "/images/home/cities/bauchi.jpg",
  kaduna: "/images/home/cities/kaduna.jpg",
};
const DEFAULT_CITY_IMAGE = "/images/home/cities/lagos.jpg";

export function toCityTile(city: ExperienceCity): CityTile {
  return {
    id: city.slug,
    name: city.name,
    country: city.country ?? "",
    imageSrc: LOCAL_CITY_IMAGES[city.slug] ?? city.image_url ?? DEFAULT_CITY_IMAGE,
  };
}

export function toCityDestination(city: ExperienceCity): CityDestination {
  return {
    id: city.slug,
    city: city.country ? `${city.name}, ${city.country}` : city.name,
    description: `${city.count} ${city.count === 1 ? "experience" : "experiences"}`,
  };
}
