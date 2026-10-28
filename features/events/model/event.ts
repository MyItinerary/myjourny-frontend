import { useQuery } from "@tanstack/react-query";

import { experienceDetailQueryKey, fitAndLogistics } from "@/features/experience-details";
import { apiClient } from "@/lib/api-client";

import type {
  EventDetail,
  GoodToKnowRow,
  LineupCard,
  Organiser,
  RelatedListings,
  ScheduleRow,
} from "./event.types";

/** The event, from the same request (and cache) as the experience page. */
export function useEventDetail(id: string) {
  return useQuery({
    queryKey: experienceDetailQueryKey(id),
    queryFn: async () => {
      const { data } = await apiClient.get<EventDetail>(`/experiences/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/** Similar listings, and for an event its organiser's past events. */
export function useRelatedListings(id: string) {
  return useQuery({
    queryKey: ["experiences", "related", id],
    queryFn: async () => {
      const { data } = await apiClient.get<RelatedListings>(`/experiences/${id}/related`);
      return data;
    },
    enabled: !!id,
  });
}

/** "19:00:00" → "7:00pm". */
export function clockLabel(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour}:${String(minutes).padStart(2, "0")}${suffix}`;
}

/** "YYYY-MM-DD" as a local date, not UTC midnight. */
function localDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const dayLabel = (key: string, options: Intl.DateTimeFormatOptions) =>
  localDate(key).toLocaleDateString("en-GB", options);

/** "Sat 14 November · 7:00pm – 11:00pm", or "Fri 13 – Sun 15 November · from 7:00pm"
 * over several days. Null until the date is set. */
export function eventDateLine(event: Pick<EventDetail, "event_start_date" | "event_end_date" | "start_times" | "duration_minutes">): string | null {
  const start = event.event_start_date;
  if (!start) return null;
  const startTime = event.start_times?.[0] ?? null;
  const end = event.event_end_date && event.event_end_date !== start ? event.event_end_date : null;
  if (end) {
    const sameMonth = localDate(start).getMonth() === localDate(end).getMonth();
    const head = dayLabel(start, { weekday: "short", day: "numeric", ...(sameMonth ? {} : { month: "long" }) });
    const days = `${head} – ${dayLabel(end, { weekday: "short", day: "numeric", month: "long" })}`;
    return startTime ? `${days} · from ${clockLabel(startTime)}` : days;
  }
  const day = dayLabel(start, { weekday: "short", day: "numeric", month: "long" });
  if (!startTime) return day;
  if (!event.duration_minutes) return `${day} · ${clockLabel(startTime)}`;
  const [hours, minutes] = startTime.split(":").map(Number);
  const endMinutes = (hours * 60 + minutes + event.duration_minutes) % (24 * 60);
  const endTime = `${Math.floor(endMinutes / 60)}:${endMinutes % 60}`;
  return `${day} · ${clockLabel(startTime)} – ${clockLabel(endTime)}`;
}

/** "Harbour Hall · Lagos Island"; null without a venue or area. */
export function venueLine(event: Pick<EventDetail, "venue_name" | "area">): string | null {
  return [event.venue_name, event.area].map((part) => part?.trim()).filter(Boolean).join(" · ") || null;
}

/** "Tolu and Ada", "Tolu, Ada and Kemi". */
function joinNames(names: string[]): string | null {
  const clean = names.map((name) => name.trim()).filter(Boolean);
  if (!clean.length) return null;
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
}

/** The timeline, in time order, with times as "7:00pm" and the people on stage. */
export function scheduleRows(event: Pick<EventDetail, "schedule">): ScheduleRow[] {
  return [...(event.schedule ?? [])]
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((item) => ({
      time: clockLabel(item.time),
      title: item.title,
      description: item.description?.trim() || null,
      kind: item.kind,
      people: joinNames(item.people ?? []),
    }));
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

export function lineupCards(event: Pick<EventDetail, "lineup">): LineupCard[] {
  return (event.lineup ?? []).map((member) => ({
    name: member.name,
    role: member.role,
    bio: member.bio?.trim() || null,
    photoUrl: member.photo_url || null,
    initials: initials(member.name),
  }));
}

// The page's wording for an organiser who hasn't confirmed access.
export const ACCESSIBILITY_NOT_CONFIRMED = "Not confirmed. Ask the organiser before you buy.";

const transferText = (allowed: boolean | null | undefined, deadline: string | null | undefined): string | null => {
  if (allowed == null) return null;
  if (!allowed) return "Tickets can't be transferred to someone else.";
  return deadline
    ? `You can transfer your ticket until ${dayLabel(deadline, { weekday: "short", day: "numeric", month: "long" })}.`
    : "You can transfer your ticket to someone else.";
};

/** "Good to know": the organiser's rows, plus accessibility, which always shows. */
export function goodToKnowRows(event: EventDetail): GoodToKnowRow[] {
  const facts = event.good_to_know ?? {};
  const fit = fitAndLogistics(event);
  const value = (kind: string) => fit.find((item) => item.kind === kind);

  const entry = [
    facts.entry_text?.trim(),
    facts.id_required ? "Bring a photo ID." : null,
    facts.student_id_required ? "Student tickets need a valid student ID at the door." : null,
  ].filter(Boolean);
  const access = value("accessibility");
  const age = value("age");
  const rows: (GoodToKnowRow | null)[] = [
    entry.length ? { key: "entry", title: "Entry and ID", text: entry.join(" ") } : null,
    {
      key: "accessibility",
      title: "Accessibility",
      text:
        event.accessibility && event.accessibility !== "not_confirmed" && access
          ? [access.value, access.note].filter(Boolean).join(" ")
          : ACCESSIBILITY_NOT_CONFIRMED,
    },
    facts.parking_text?.trim() ? { key: "parking", title: "Parking and getting there", text: facts.parking_text.trim() } : null,
    (() => {
      const text = transferText(facts.transfer_allowed, facts.transfer_deadline);
      return text ? { key: "transfer", title: "Ticket transfer", text } : null;
    })(),
    age ? { key: "age", title: "Age", text: [age.value, age.note].filter(Boolean).join(" ") } : null,
    facts.whats_allowed?.trim() ? { key: "allowed", title: "What's allowed", text: facts.whats_allowed.trim() } : null,
    facts.dress_code?.trim() ? { key: "dress", title: "Dress code", text: facts.dress_code.trim() } : null,
    value("languages") ? { key: "language", title: "Language", text: value("languages")!.value } : null,
  ];
  return rows.filter((row): row is GoodToKnowRow => row !== null);
}

/** Who runs it: the organiser picked in the admin, or MyJourny. */
export function organiser(event: Pick<EventDetail, "host" | "organiser_blurb">): Organiser {
  const name = event.host?.display_name?.trim() || "MyJourny";
  return {
    name,
    verified: event.host ? !!event.host.is_verified : true,
    blurb: event.organiser_blurb?.trim() || null,
    avatarLetter: name.charAt(0).toUpperCase(),
  };
}
