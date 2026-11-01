import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { categoriesBySlug } from "@/lib/mock-data/home";

import {
  DEFAULT_ACTIVITIES,
  DEFAULT_DESTINATIONS,
  DEFAULT_EVENTS,
  FALLBACK_IMAGE,
  formatExperienceSubtitle,
  useSearchExperiences,
} from "../model/search";
import type {
  ActivitySuggestion,
  DestinationSuggestion,
  EventSuggestion,
  ExperienceSuggestion,
  ExperienceSuggestionRow,
  GuestCounts,
  SearchBarVariant,
  SearchTab,
} from "../model/search.types";

export interface UseSearchBarViewModelOptions {
  variant?: SearchBarVariant;
  initialActiveTab?: SearchTab | null;
  /** Prefills "Where", e.g. with what the current results page was searched for. */
  initialWhere?: string;
  onClose?: () => void;
  debounceMs?: number;
}

export const GUEST_TYPES: { key: keyof GuestCounts; label: string; description: string }[] = [
  { key: "adults", label: "Adults", description: "Aged 13 or above" },
  { key: "children", label: "Children", description: "Ages 2 - 12" },
  { key: "infants", label: "Infants", description: "Under 2" },
];

function formatGuestsText(counts: GuestCounts) {
  const total = counts.adults + counts.children + counts.infants;
  if (total <= 0) return "";
  return `${total} guest${total > 1 ? "s" : ""}${counts.infants > 0 ? `, ${counts.infants} infant${counts.infants > 1 ? "s" : ""}` : ""}`;
}

export function useSearchBarViewModel({
  variant = "hero",
  initialActiveTab = null,
  initialWhere = "",
  onClose,
  debounceMs = 600,
}: UseSearchBarViewModelOptions = {}) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<SearchTab | null>(initialActiveTab);
  const [selectedWhere, setSelectedWhere] = useState(initialWhere);
  const [debouncedWhere, setDebouncedWhere] = useState(initialWhere);
  const [selectedWhereId, setSelectedWhereId] = useState("");
  const [selectedType, setSelectedType] = useState<"destination" | "activity" | "experience" | "event" | null>(null);

  const [selectedWhen, setSelectedWhen] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  // What they typed into "Who"; null once the steppers take over and the text
  // comes from the counts.
  const [typedWho, setTypedWho] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 0, children: 0, infants: 0 });

  const [prevInitialTab, setPrevInitialTab] = useState(initialActiveTab);
  if (initialActiveTab !== prevInitialTab) {
    setPrevInitialTab(initialActiveTab);
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }

  // Single centralized debounce timer for typing search query
  useEffect(() => {
    const delay = selectedWhere.trim() ? debounceMs : 0;
    const timer = setTimeout(() => {
      setDebouncedWhere(selectedWhere);
    }, delay);
    return () => clearTimeout(timer);
  }, [selectedWhere, debounceMs]);

  const trimmedDebouncedWhere = debouncedWhere.trim();
  const experiencesQuery = useSearchExperiences({
    search: trimmedDebouncedWhere,
    limit: 5,
    enabled: trimmedDebouncedWhere.length >= 2,
  });

  const isTypingWaiting =
    selectedWhere.trim().length >= 2 && selectedWhere.trim() !== trimmedDebouncedWhere;
  const isSearchingExperiences = isTypingWaiting || experiencesQuery.isFetching;
  const suggestedExperiences = useMemo<ExperienceSuggestionRow[]>(
    () =>
      (experiencesQuery.data ?? []).map((exp) => ({
        ...exp,
        subtitle: formatExperienceSubtitle(exp),
        fallbackImage: FALLBACK_IMAGE,
      })),
    [experiencesQuery.data],
  );

  const totalGuests = guests.adults + guests.children + guests.infants;
  const canSearch = !!selectedWhere.trim();

  const trimmedQuery = selectedWhere.trim().toLowerCase();

  const filteredDestinations = useMemo(() => {
    if (!trimmedQuery) return DEFAULT_DESTINATIONS.slice(0, 5);
    return DEFAULT_DESTINATIONS.filter(
      (dest) =>
        dest.city.toLowerCase().includes(trimmedQuery) ||
        dest.id.toLowerCase().includes(trimmedQuery) ||
        dest.description.toLowerCase().includes(trimmedQuery),
    );
  }, [trimmedQuery]);

  const filteredActivities = useMemo(() => {
    if (!trimmedQuery) return DEFAULT_ACTIVITIES.slice(0, 6);
    return DEFAULT_ACTIVITIES.filter(
      (act) =>
        act.label.toLowerCase().includes(trimmedQuery) ||
        act.id.toLowerCase().includes(trimmedQuery) ||
        act.subtitle.toLowerCase().includes(trimmedQuery),
    );
  }, [trimmedQuery]);

  // Hardcoded for now: three to start with, then the ones matching what's typed.
  const filteredEvents = useMemo(() => {
    if (!trimmedQuery) return DEFAULT_EVENTS.slice(0, 3);
    return DEFAULT_EVENTS.filter(
      (ev) => ev.title.toLowerCase().includes(trimmedQuery) || ev.subtitle.toLowerCase().includes(trimmedQuery),
    );
  }, [trimmedQuery]);

  const whoText = typedWho ?? formatGuestsText(guests);

  const updateGuests = useCallback((newGuests: GuestCounts) => {
    setGuests(newGuests);
    setTypedWho(null);
  }, []);

  const incrementGuest = useCallback((key: keyof GuestCounts) => {
    setGuests((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    setTypedWho(null);
  }, []);

  const decrementGuest = useCallback((key: keyof GuestCounts) => {
    setGuests((prev) => (prev[key] <= 0 ? prev : { ...prev, [key]: prev[key] - 1 }));
    setTypedWho(null);
  }, []);

  const setWhereInput = useCallback((value: string) => {
    setSelectedWhere(value);
    setSelectedWhereId("");
    setSelectedType(null);
  }, []);

  const setWhoInput = useCallback(
    (value: string) => {
      setTypedWho(value);
      const num = parseInt(value.replace(/\D/g, ""), 10);
      if (!isNaN(num)) {
        setGuests({ adults: num, children: 0, infants: 0 });
      }
    },
    [],
  );

  const onSelectDestination = useCallback((dest: DestinationSuggestion) => {
    setSelectedWhere(dest.city);
    setSelectedWhereId(dest.id);
    setSelectedType("destination");
    setActiveTab("when");
  }, []);

  const onSelectActivity = useCallback((act: ActivitySuggestion) => {
    setSelectedWhere(act.label);
    setSelectedWhereId(act.id);
    setSelectedType("activity");
    setActiveTab("when");
  }, []);

  const onSelectExperience = useCallback((exp: ExperienceSuggestion) => {
    setSelectedWhere(exp.title);
    setSelectedWhereId(exp.id);
    setSelectedType("experience");
    setActiveTab("when");
  }, []);

  const onSelectEvent = useCallback((ev: EventSuggestion) => {
    setSelectedWhere(ev.title);
    setSelectedWhereId(ev.id);
    setSelectedType("event");
    setActiveTab("when");
  }, []);

  const onSelectDate = useCallback((date: Date, label?: string) => {
    setSelectedDate(date);
    setSelectedWhen(label ?? date.toLocaleDateString("en-US", { month: "long", day: "numeric" }));
    setActiveTab("who");
  }, []);

  const handleClose = useCallback(() => {
    setActiveTab(null);
    onClose?.();
  }, [onClose]);

  const onSearch = useCallback(
    (customQuery?: string) => {
      const rawQuery = customQuery ?? selectedWhere;
      const trimmed = rawQuery.trim().toLowerCase();
      if (!trimmed) return;

      handleClose();

      // There's no event page yet, so an event is searched for by name.
      if (selectedType === "event") {
        router.push(`/search?q=${encodeURIComponent(rawQuery)}`);
        return;
      }

      if (selectedType === "experience" && selectedWhereId) {
        router.push(`/experiences/${selectedWhereId}`);
        return;
      }

      if (selectedType === "activity" && selectedWhereId) {
        router.push(`/categories/${selectedWhereId}`);
        return;
      }

      if (selectedType === "destination" && selectedWhereId) {
        router.push(`/cities/${selectedWhereId}`);
        return;
      }

      const matchedDest = DEFAULT_DESTINATIONS.find(
        (d) =>
          d.city.toLowerCase().includes(trimmed) ||
          d.id.toLowerCase().includes(trimmed) ||
          trimmed.includes(d.id.toLowerCase()),
      );

      const matchedAct = DEFAULT_ACTIVITIES.find(
        (a) =>
          a.label.toLowerCase().includes(trimmed) ||
          a.id.toLowerCase().includes(trimmed) ||
          trimmed.includes(a.id.toLowerCase()) ||
          a.subtitle.toLowerCase().includes(trimmed),
      );

      if (matchedDest && !matchedAct) {
        router.push(`/cities/${matchedDest.id}`);
        return;
      }

      if (matchedAct) {
        router.push(`/categories/${matchedAct.id}`);
        return;
      }

      if (matchedDest) {
        router.push(`/cities/${matchedDest.id}`);
        return;
      }

      if (categoriesBySlug.has(trimmed)) {
        router.push(`/categories/${trimmed}`);
        return;
      }

      router.push(`/search?q=${encodeURIComponent(rawQuery)}`);
    },
    [handleClose, router, selectedType, selectedWhere, selectedWhereId],
  );

  const onNavigateToDestination = useCallback(
    (dest: DestinationSuggestion) => {
      handleClose();
      router.push(`/cities/${dest.id}`);
    },
    [handleClose, router],
  );

  const onNavigateToActivity = useCallback(
    (act: ActivitySuggestion) => {
      handleClose();
      router.push(`/categories/${act.id}`);
    },
    [handleClose, router],
  );

  const onNavigateToEvent = useCallback(
    (ev: EventSuggestion) => {
      handleClose();
      router.push(`/search?q=${encodeURIComponent(ev.title)}`);
    },
    [handleClose, router],
  );

  const onNavigateToExperience = useCallback(
    (exp: ExperienceSuggestion) => {
      handleClose();
      router.push(`/experiences/${exp.id}`);
    },
    [handleClose, router],
  );

  return {
    variant,
    activeTab,
    selectedWhere,
    debouncedWhere,
    selectedWhen,
    selectedDate,
    whoText,
    guests,
    totalGuests,
    canSearch,
    isSearchingExperiences,
    suggestedExperiences,
    filteredDestinations,
    filteredActivities,
    filteredEvents,
    guestTypes: GUEST_TYPES,
    setActiveTab,
    setWhereInput,
    setWhoInput,
    onSelectDestination,
    onSelectActivity,
    onSelectExperience,
    onSelectEvent,
    onSelectDate,
    onNavigateToDestination,
    onNavigateToActivity,
    onNavigateToExperience,
    onNavigateToEvent,
    updateGuests,
    incrementGuest,
    decrementGuest,
    onSearch,
    onClose: handleClose,
  };
}

export type SearchBarViewModel = ReturnType<typeof useSearchBarViewModel>;
