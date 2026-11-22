import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { toCityDestination, useExperienceCities } from "@/features/cities";
import { useTasteQuizCtaViewModel } from "@/features/taste-quiz-cta";

import { clearRecentSearches, recentSearchDates, saveRecentSearch, useRecentSearches } from "../model/recent-searches";
import { saveLastSearchArea } from "../model/last-search-area";
import { nearestCity } from "../model/nearby";
import { DEFAULT_DESTINATIONS, linkDates, startOfToday, withDate, withGuests } from "../model/search";
import { calendarMonths, datePresets, describeDates, MAX_GUESTS, pickRange, presetFor } from "../model/search-sheet";
import type { DatePresetId } from "../model/search-sheet.types";
import type { GuestCounts, SearchTab } from "../model/search.types";
import {
  activityRows,
  destinationRows,
  matchGroups,
  popularAreaRows,
  recentRows,
  type SheetRowActions,
} from "./search-sheet-rows";
import type { SearchSheetViewModel } from "./search-sheet.types";
import { GUEST_TYPES, useSearchBarViewModel } from "./use-search-bar-view-model";

export type { SheetListRow, SheetMatchGroup, SheetMatchKind, SheetMatchRow, SheetRowIcon } from "./search-sheet-rows";
export type { SearchSheetViewModel, SheetDatePreset, SheetGuestType } from "./search-sheet.types";

const NO_GUESTS: GuestCounts = { adults: 0, children: 0, infants: 0 };

/** The phone search sheet (Figma 2726:7167): Where, When and Who as stacked cards, one open at a time,
 * on top of the search the site already had. Mount it only while open. */
export function useSearchSheetViewModel({ onClose }: { onClose: () => void }): SearchSheetViewModel {
  // Experiences are fetched as you type; a shorter wait than the desktop bar keeps the predictions in step.
  const search = useSearchBarViewModel({ variant: "hero", initialActiveTab: "where", onClose, debounceMs: 300 });
  const router = useRouter();
  const recents = useRecentSearches();
  const tasteQuiz = useTasteQuizCtaViewModel();
  const [editing, setEditing] = useState(false);
  // The quick pick last tapped. On a Sunday Tonight and This weekend are the same day, so the
  // range alone can't say which one was meant. "anytime" is no dates, said on purpose.
  const [pickedPreset, setPickedPreset] = useState<DatePresetId | null>(null);
  const [searching, setSearching] = useState(false);
  // Waiting on the location for Nearby (the permission prompt, then a fix).
  const [locating, setLocating] = useState(false);
  const citiesQuery = useExperienceCities();
  const viewportHeight = useVisualViewportHeight();

  // The sheet covers the page, so the page behind it shouldn't scroll.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const range = search.draftRange;
  const query = search.selectedWhere;
  const { guests } = search;
  // A results page link carrying the dates and guests, like every search from the bar.
  const resultsLink = (path: string) => {
    const { day, until } = linkDates(range);
    return withGuests(withDate(path, day, until), guests.adults + guests.children, guests.children + guests.infants > 0);
  };

  const goTo = (card: SearchTab | null) => {
    setEditing(false);
    search.setActiveTab(card);
  };

  // Picking any suggestion fills Where and moves on to When, as the search bar always has;
  // an experience goes straight to its page.
  const actions: SheetRowActions = {
    pickArea: (area) => {
      search.setWhereInput(area);
      goTo("when");
    },
    pickDestination: (dest) => {
      setEditing(false);
      search.onSelectDestination(dest);
    },
    pickActivity: (act) => {
      setEditing(false);
      search.onSelectActivity(act);
    },
    openExperience: search.onNavigateToExperience,
    pickEvent: (ev) => {
      setEditing(false);
      search.onSelectEvent(ev);
    },
  };

  const groups = editing
    ? matchGroups(
        query,
        {
          destinations: search.filteredDestinations,
          activities: search.filteredActivities,
          // The last results stay up while the next ones load, so the list doesn't jump on each letter.
          experiences: query.trim().length >= 2 ? search.suggestedExperiences : [],
          events: search.filteredEvents,
        },
        actions,
      )
    : [];

  const presets = datePresets();
  const picked = presets.find((p) => p.id === pickedPreset);
  const pickedStillHolds = pickedPreset === "anytime" ? !range.start : !!picked?.range && sameRange(picked.range, range);
  const selectedPreset = pickedStillHolds ? picked : presetFor(range) ?? undefined;

  return {
    openCard: search.activeTab,
    onOpenCard: goTo,
    onClose: search.onClose,

    editing,
    whereQuery: query,
    whereSummary: query.trim() || "Add place",
    onWhereFocus: () => setEditing(true),
    onWhereChange: (value) => {
      setEditing(true);
      search.setWhereInput(value);
    },
    onClearWhere: () => search.setWhereInput(""),
    recentSearches: recentRows(recents, (recent) => {
      const dates = recentSearchDates(recent);
      search.setWhereInput(recent.where);
      // Days that have gone by are dropped; the rest of the search comes back as it was.
      search.onSetDates(dates.start && dates.start >= startOfToday() ? dates : { start: null, end: null });
      search.updateGuests(recent.guests);
      setPickedPreset(null);
      goTo(null);
    }),
    onClearRecentSearches: clearRecentSearches,
    nearby: {
      key: "nearby",
      title: "Nearby",
      subtitle: locating ? "Finding where you are…" : "Find what's around you",
      icon: "place",
      // Location is asked for only now, on the tap. The listing filters by city, so this opens the
      // closest listed city's results page; without a location it shows everything.
      onSelect: () => {
        if (locating) return;
        const open = (path: string) => {
          search.onClose();
          router.push(resultsLink(path));
        };
        if (typeof navigator === "undefined" || !navigator.geolocation) return open("/search");
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const cities = citiesQuery.data?.length ? citiesQuery.data.map(toCityDestination) : DEFAULT_DESTINATIONS;
            const city = nearestCity({ latitude: coords.latitude, longitude: coords.longitude }, cities);
            if (!city) return open("/search");
            saveLastSearchArea(city.city);
            open(`/cities/${city.id}`);
          },
          () => open("/search"),
          { maximumAge: 10 * 60 * 1000, timeout: 10_000 },
        );
      },
    },
    destinations: destinationRows(search.filteredDestinations, actions),
    popularAreas: popularAreaRows(actions),
    activities: activityRows(search.filteredActivities, actions),
    tasteQuizHref: tasteQuiz.visible ? tasteQuiz.href : null,
    matchGroups: groups,
    noMatch: editing && !!query.trim() && groups.length === 0 && !search.isSearchingExperiences,

    whenSummary: selectedPreset?.label ?? (range.start ? describeDates(range) : "Add dates"),
    datePresets: presets.map((preset) => ({ ...preset, selected: preset.id === selectedPreset?.id })),
    months: calendarMonths(range),
    onPickDay: (date) => {
      setPickedPreset(null);
      search.onSetDates(pickRange(range, date));
    },
    onPickPreset: (preset) => {
      setPickedPreset(preset.id);
      search.onSetDates(preset.range ?? { start: null, end: null });
    },
    onSkipDates: () => {
      setPickedPreset(null);
      search.onAnyDate();
    },

    whoSummary: search.whoText || "Add guests",
    // Adults, children and infants, as the search has always counted them. Up to 20 in all.
    guestTypes: GUEST_TYPES.map((type) => ({
      ...type,
      count: guests[type.key],
      canRemove: guests[type.key] > 0,
      canAdd: search.totalGuests < MAX_GUESTS,
    })),
    onAddGuest: (key) => {
      if (search.totalGuests < MAX_GUESTS) search.incrementGuest(key);
    },
    onRemoveGuest: search.decrementGuest,

    searching,
    onClearAll: () => {
      search.setWhereInput("");
      search.onClearDates();
      search.updateGuests(NO_GUESTS);
      setPickedPreset(null);
      goTo("where");
    },
    onSearch: () => {
      setSearching(true);
      saveRecentSearch({ where: query, dates: range, guests });
      if (query.trim()) {
        search.onSearch();
        return;
      }
      // Never disabled: with no place it shows everything, for the dates and guests picked.
      search.onClose();
      router.push(resultsLink("/search"));
    },

    viewportHeight,
  };
}

function sameRange(a: { start: Date; end: Date }, b: { start: Date | null; end: Date | null }): boolean {
  return !!b.start && a.start.getTime() === b.start.getTime() && a.end.getTime() === (b.end ?? b.start).getTime();
}

/** The visual viewport's height, which shrinks while the on-screen keyboard is up. */
function useVisualViewportHeight(): number | null {
  return useSyncExternalStore(subscribeToViewport, () => window.visualViewport?.height ?? null, () => null);
}

function subscribeToViewport(onChange: () => void) {
  const viewport = window.visualViewport;
  viewport?.addEventListener("resize", onChange);
  return () => viewport?.removeEventListener("resize", onChange);
}
