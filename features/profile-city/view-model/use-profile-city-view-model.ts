import { useEffect, useRef, useState } from "react";

import {
  currentPosition,
  fetchCityAt,
  locationPermission,
  MIN_CITY_QUERY,
  POPULAR_CITIES,
  useCitySearch,
  useSaveCity,
} from "../model/profile-city";
import type { CityChoice } from "../model/profile-city.types";

const SEARCH_DELAY_MS = 300;

type Options = {
  /** The saved city; null when there isn't one. */
  city: string | null;
  /** The profile has loaded, so `city` can be trusted. */
  ready: boolean;
  open: boolean;
  onClose: () => void;
  /** A city was saved; `message` is the confirmation to show. */
  onSaved: (message: string) => void;
  onError: (error: unknown) => void;
};

export type ProfileCityViewModel = {
  open: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  /** Heading over the list, when it needs one. */
  listLabel: string | null;
  choices: CityChoice[];
  selectedKey: string | null;
  onSelect: (choice: CityChoice) => void;
  searching: boolean;
  /** Why the list is empty or why location didn't work. */
  notice: string | null;
  locating: boolean;
  onUseMyLocation: () => void;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
};

/** The profile's city: a worldwide search with "Use my location", plus a
 * one-off fill from the browser's location when no city is saved and the
 * browser already shares location with the site (it never asks on its own). */
export function useProfileCityViewModel({ city, ready, open, onClose, onSaved, onError }: Options): ProfileCityViewModel {
  const saveCity = useSaveCity();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CityChoice | null>(null);
  const [located, setLocated] = useState<CityChoice | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const results = useCitySearch(query);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Kept in refs so the detection effect runs once, not on every render.
  const detectionTried = useRef(false);
  const saveRef = useRef(saveCity.mutate);
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    saveRef.current = saveCity.mutate;
    onSavedRef.current = onSaved;
  });

  useEffect(() => {
    if (!ready || city || detectionTried.current) return;
    detectionTried.current = true;
    let cancelled = false;
    (async () => {
      try {
        if ((await locationPermission()) !== "granted") return;
        const found = await fetchCityAt(await currentPosition());
        if (!found || cancelled) return;
        saveRef.current(
          { city: found.name },
          {
            onSuccess: () =>
              onSavedRef.current(`We set your city to ${found.name} from your location. Use Edit to change it.`),
          },
        );
      } catch {
        // Nothing was asked for, so nothing is reported: the row stays "Not provided".
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, city]);

  const typed = search.trim().length >= MIN_CITY_QUERY;
  const waiting = typed && (search !== query || results.isFetching);
  const found = typed ? (results.data ?? []) : POPULAR_CITIES;
  const choices = located && !typed ? [located, ...found.filter((c) => c.name !== located.name)] : found;

  let notice = locationNotice;
  if (typed && results.isError) notice = "City search is unavailable right now. Try again shortly.";
  else if (typed && !waiting && choices.length === 0) notice = "No city matches that. Check the spelling, or try the nearest large city.";

  const reset = () => {
    setSearch("");
    setQuery("");
    setSelected(null);
    setLocated(null);
    setLocationNotice(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const onUseMyLocation = async () => {
    if (locating) return;
    setLocating(true);
    setLocationNotice(null);
    try {
      const here = await fetchCityAt(await currentPosition());
      if (here) {
        setSearch("");
        setQuery("");
        setLocated(here);
        setSelected(here);
      } else {
        setLocationNotice("We couldn't work out your city. Search for it instead.");
      }
    } catch (error) {
      setLocationNotice(
        (error as { denied?: boolean })?.denied
          ? "Location is blocked for this site. Search for your city instead."
          : "We couldn't work out your city. Search for it instead.",
      );
    } finally {
      setLocating(false);
    }
  };

  const onSave = () => {
    if (!selected || saveCity.isPending) return;
    const name = selected.name;
    saveCity.mutate(
      { city: name },
      {
        onSuccess: () => {
          reset();
          onClose();
          onSaved(`Saved. Your city is ${name}.`);
        },
        onError,
      },
    );
  };

  return {
    open,
    search,
    onSearchChange: (value) => {
      setSearch(value);
      // The list is about to change; don't keep a choice that is no longer on it.
      setSelected(null);
      setLocationNotice(null);
    },
    listLabel: typed ? null : "Popular cities",
    choices,
    selectedKey: selected?.key ?? null,
    onSelect: setSelected,
    searching: waiting && !results.isError,
    notice,
    locating,
    onUseMyLocation,
    canSave: !!selected && !saveCity.isPending,
    saving: saveCity.isPending,
    onSave,
    onClose: close,
  };
}
