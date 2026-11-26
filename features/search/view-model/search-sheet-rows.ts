import { recentSearchDates, type RecentSearch } from "../model/recent-searches";
import { formatGuestsText } from "../model/search";
import { describeDates, LAGOS_AREAS, matchesQuery, matchSegments } from "../model/search-sheet";
import type { TextSegment } from "../model/search-sheet.types";
import type {
  ActivitySuggestion,
  DestinationSuggestion,
  EventSuggestion,
  ExperienceSuggestionRow,
} from "../model/search.types";

/** Which illustration a row's tile shows: a place (waves), a location pin, or a category compass. */
export type SheetRowIcon = "place" | "location" | "category";

export interface SheetListRow {
  key: string;
  title: string;
  subtitle?: string;
  icon: SheetRowIcon;
  onSelect: () => void;
}

export type SheetMatchKind = "area" | "destination" | "category" | "experience" | "event";

export interface SheetMatchRow {
  key: string;
  kind: SheetMatchKind;
  title: TextSegment[];
  subtitle: string;
  /** Experiences only: their cover photo, and what shows if it fails to load. */
  image?: { src: string | null; fallback: string };
  onSelect: () => void;
}

export interface SheetMatchGroup {
  key: string;
  label: string;
  rows: SheetMatchRow[];
}

/** What tapping a suggestion does; the view-model wires these to the search. */
export interface SheetRowActions {
  pickArea: (area: string) => void;
  pickDestination: (dest: DestinationSuggestion) => void;
  pickActivity: (act: ActivitySuggestion) => void;
  openExperience: (exp: ExperienceSuggestionRow) => void;
  pickEvent: (ev: EventSuggestion) => void;
}

export interface SheetSuggestions {
  destinations: DestinationSuggestion[];
  activities: ActivitySuggestion[];
  experiences: ExperienceSuggestionRow[];
  events: EventSuggestion[];
}

/** The cities with experiences (from the API): the location results the search has always had. */
export function destinationRows(destinations: DestinationSuggestion[], actions: SheetRowActions): SheetListRow[] {
  return destinations.map((dest) => ({
    key: `destination-${dest.id}`,
    title: dest.city,
    subtitle: dest.description,
    icon: "location",
    onSelect: () => actions.pickDestination(dest),
  }));
}

export function activityRows(activities: ActivitySuggestion[], actions: SheetRowActions): SheetListRow[] {
  return activities.map((act) => ({
    key: `activity-${act.id}`,
    title: act.label,
    subtitle: act.subtitle,
    icon: "category",
    onSelect: () => actions.pickActivity(act),
  }));
}

export function popularAreaRows(actions: SheetRowActions): SheetListRow[] {
  return LAGOS_AREAS.map((area) => ({ key: `popular-${area}`, title: area, icon: "location", onSelect: () => actions.pickArea(area) }));
}

/** "This weekend · 2 guests", "Any date". */
export function recentRows(recents: RecentSearch[], onSelect: (recent: RecentSearch) => void, now: Date = new Date()): SheetListRow[] {
  return recents.map((recent) => {
    const dates = recentSearchDates(recent);
    return {
      key: `recent-${recent.where}`,
      title: recent.where,
      subtitle: [dates.start ? describeDates(dates, now) : "Any date", formatGuestsText(recent.guests)].filter(Boolean).join(" · "),
      icon: "place",
      onSelect: () => onSelect(recent),
    };
  });
}

/** The predictive results while typing, by group, leaving out groups with no match. Typed letters are marked. */
export function matchGroups(query: string, suggestions: SheetSuggestions, actions: SheetRowActions): SheetMatchGroup[] {
  if (!query.trim()) return [];
  const groups: SheetMatchGroup[] = [
    {
      key: "areas",
      label: "Areas",
      rows: LAGOS_AREAS.filter((area) => matchesQuery(area, query)).map((area) => ({
        key: `area-${area}`,
        kind: "area",
        title: matchSegments(area, query),
        subtitle: "Area in Lagos",
        onSelect: () => actions.pickArea(area),
      })),
    },
    {
      key: "destinations",
      label: "Destinations",
      rows: suggestions.destinations.map((dest) => ({
        key: `destination-${dest.id}`,
        kind: "destination",
        title: matchSegments(dest.city, query),
        subtitle: dest.description,
        onSelect: () => actions.pickDestination(dest),
      })),
    },
    {
      key: "activities",
      label: "Activities & experiences",
      rows: suggestions.activities.map((act) => ({
        key: `activity-${act.id}`,
        kind: "category",
        title: matchSegments(act.label, query),
        subtitle: act.subtitle,
        onSelect: () => actions.pickActivity(act),
      })),
    },
    {
      key: "experiences",
      label: "Experiences",
      rows: suggestions.experiences.map((exp) => ({
        key: `experience-${exp.id}`,
        kind: "experience",
        title: matchSegments(exp.title, query),
        subtitle: exp.city || exp.subtitle,
        image: { src: exp.cover_image_url ?? null, fallback: exp.fallbackImage },
        onSelect: () => actions.openExperience(exp),
      })),
    },
    {
      key: "events",
      label: "Events",
      rows: suggestions.events.map((ev) => ({
        key: `event-${ev.id}`,
        kind: "event",
        title: matchSegments(ev.title, query),
        subtitle: ev.subtitle,
        onSelect: () => actions.pickEvent(ev),
      })),
    },
  ];
  return groups.filter((group) => group.rows.length > 0);
}
