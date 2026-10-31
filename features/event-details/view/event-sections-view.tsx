"use client";

import {
  Car,
  Languages,
  MapPin,
  Mic,
  Share2,
  ShoppingBag,
  Ticket,
  UserCheck,
  Users,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { eventCategoryHref } from "@/features/event-categories";
import {
  DetailCategoryCards,
  DetailDivider,
  DetailExpandableText,
  DetailFact,
  DetailHostStrip,
  DetailIconTile,
  DetailMapPlaceholder,
  DetailNote,
  DetailSection,
  DetailSectionHeading,
} from "@/components/shared/detail-page-parts";

import type { EventDetail, EventFactIcon, EventIncludedIcon } from "../model/event-details.types";
import { EventLineupView } from "./event-lineup-view";
import { EventQuestionsView } from "./event-questions-view";
import { EventScheduleView } from "./event-schedule-view";

const INCLUDED_ICONS: Record<EventIncludedIcon, LucideIcon> = {
  talks: Mic,
  launch: Zap,
  gift: ShoppingBag,
  meal: Utensils,
  ticket: Ticket,
};

const FACT_ICONS: Record<EventFactIcon, LucideIcon> = {
  ticket: Ticket,
  accessibility: UserCheck,
  parking: Car,
  transfer: Share2,
  age: Users,
  bag: ShoppingBag,
  dress: ShoppingBag,
  language: Languages,
};

type Props = {
  event: EventDetail;
  openQuestionId: string | null;
  onToggleQuestion: (id: string) => void;
};

/** The event page's body, from "About" to "Know before you go". Sections the
 * event has no data for are left out. */
export function EventSectionsView({ event, openQuestionId, onToggleQuestion }: Props) {
  const rows = Math.ceil(event.goodToKnow.length / 2);
  return (
    <>
      <section className="flex flex-col gap-5">
        <DetailSectionHeading size="md">About this event</DetailSectionHeading>
        <DetailExpandableText text={event.about} />
      </section>

      <DetailHostStrip
        name={event.organiser.name}
        href={event.organiser.id ? `/guides/${event.organiser.id}` : null}
        verified={event.organiser.verified}
        blurb={event.organiser.blurb}
        placeName={event.place.name}
        placeDetail={event.place.detail}
      />
      <DetailDivider />

      {event.included.length > 0 && (
        <DetailSection title="What ticket includes">
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
            {event.included.map((item) => {
              const Icon = INCLUDED_ICONS[item.icon];
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <DetailIconTile icon={Icon} />
                  <span className="text-base font-medium text-foreground">{item.label}</span>
                </li>
              );
            })}
          </ul>
        </DetailSection>
      )}

      {event.goodToKnow.length > 0 && (
        <DetailSection title="Good to know">
          <div
            className="grid gap-x-4 gap-y-[30px] sm:grid-flow-col sm:grid-rows-[repeat(var(--rows),auto)]"
            style={{ "--rows": rows } as React.CSSProperties}
          >
            {event.goodToKnow.map((fact) => (
              <DetailFact key={fact.id} icon={FACT_ICONS[fact.icon]} title={fact.title} body={fact.body} />
            ))}
          </div>
        </DetailSection>
      )}

      {event.lineup.length > 0 && (
        <DetailSection title="Lineup">
          <EventLineupView people={event.lineup} />
        </DetailSection>
      )}

      {event.questions.length > 0 && (
        <DetailSection title="Questions">
          <EventQuestionsView questions={event.questions} openId={openQuestionId} onToggle={onToggleQuestion} />
        </DetailSection>
      )}

      <DetailSection title="Where you’ll be">
        <DetailMapPlaceholder label={event.place.detail ?? event.place.name} />
        <DetailNote icon={MapPin}>{event.address}</DetailNote>
      </DetailSection>

      {event.schedule.length > 0 && (
        <DetailSection title="Schedule">
          <EventScheduleView rows={event.schedule} />
        </DetailSection>
      )}

      {event.moreWays.length > 0 && (
        <DetailSection title={`More ways to experience ${event.city}`}>
          <DetailCategoryCards items={event.moreWays} hrefFor={eventCategoryHref} />
        </DetailSection>
      )}

      {event.knowBeforeYouGo.length > 0 && (
        <section className="flex flex-col gap-4">
          <DetailSectionHeading>Know before you go</DetailSectionHeading>
          <div className="flex flex-col gap-3 font-sans text-base leading-[27px] text-[#6F6B72]">
            {event.knowBeforeYouGo.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
