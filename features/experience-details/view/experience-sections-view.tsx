"use client";

import {
  Accessibility,
  CalendarCheck,
  Check,
  ChevronsRight,
  CloudRain,
  Languages,
  MapPin,
  Smile,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  DetailDivider,
  DetailExpandableText,
  DetailFact,
  DetailHostStrip,
  DetailMapPlaceholder,
  DetailNote,
  DetailSection,
  DetailSectionHeading,
} from "@/components/shared/detail-page-parts";

import type { ExperienceDetailsContent, ExperienceFactIcon } from "../model/experience-details.types";

const FACT_ICONS: Record<ExperienceFactIcon, LucideIcon> = {
  fitness: ChevronsRight,
  accessibility: Accessibility,
  age: Smile,
  group: Users,
  language: Languages,
  meeting: MapPin,
  weather: CloudRain,
  cancellation: CalendarCheck,
};

/** The experience page's body, from "About" to "Where you'll be". Sections
 * the experience has no data for are left out. */
export function ExperienceSectionsView({ content }: { content: ExperienceDetailsContent }) {
  return (
    <>
        {content.about && (
          <section className="flex flex-col gap-5">
            <DetailSectionHeading size="md">About this experience</DetailSectionHeading>
            <DetailExpandableText text={content.about} />
          </section>
        )}

        <DetailHostStrip
          name={content.host.name}
          href={content.host.id ? `/guides/${content.host.id}` : null}
          verified={content.host.verified}
          blurb={content.host.blurb}
          placeName={content.place.name}
          placeDetail={content.place.detail}
        />
        <DetailDivider />

        {content.facts.length > 0 && (
          <DetailSection title="Before you book">
            <div className="grid gap-x-4 gap-y-[30px] sm:grid-cols-2">
              {content.facts.map((fact) => (
                <DetailFact key={fact.id} icon={FACT_ICONS[fact.icon]} title={fact.title} body={fact.body} />
              ))}
            </div>
          </DetailSection>
        )}

        {content.itinerary.length > 0 && (
          <DetailSection title="Itinerary">
            <ol className="flex flex-col gap-5">
              {content.itinerary.map((step, index) => (
                <li key={`${index}-${step}`} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#F4F2EE] font-sans text-base font-medium text-[#333134]"
                  >
                    {index + 1}
                  </span>
                  <p className="pt-2.5 font-sans text-base leading-6 font-medium text-[#333134]">{step}</p>
                </li>
              ))}
            </ol>
            <DetailNote>Please note itinerary is subject to change</DetailNote>
          </DetailSection>
        )}

        {content.highlights.length > 0 && (
          <DetailSection title="Highlights">
            <p className="font-sans text-base leading-7 text-[#6F6B72]">{content.highlights.join(" ")}</p>
          </DetailSection>
        )}

        {(content.included.length > 0 || content.notIncluded.length > 0) && (
          <DetailSection title="What’s included">
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <ul className="flex flex-col gap-5">
                {content.included.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-base leading-6 text-[#333134]">
                    <Check className="size-6 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <ul className="flex flex-col gap-5">
                {content.notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-base leading-6 text-[#333134]">
                    <X className="size-6 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </DetailSection>
        )}

        {content.safetyNotes.length > 0 && (
          <DetailSection title="Safety notes">
            <ul className="flex flex-col gap-1 font-sans text-base leading-7 text-[#6F6B72]">
              {content.safetyNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </DetailSection>
        )}

        {content.location && (
          <DetailSection title="Where you’ll be">
            <DetailMapPlaceholder label={content.location} />
            <DetailNote icon={MapPin}>Exact meeting point shared after booking.</DetailNote>
          </DetailSection>
        )}
    </>
  );
}
