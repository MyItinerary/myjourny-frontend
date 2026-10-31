"use client";

import {
  Accessibility,
  Car,
  Check,
  ChevronsRight,
  CloudRain,
  Languages,
  Smile,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  DetailCategoryCards,
  DetailDivider,
  DetailHostStrip,
  DetailNote,
  DetailSection,
  DetailSectionHeading,
} from "@/components/shared/detail-page-parts";
import { ExperienceLocationView, type ExperienceDetailsViewModel } from "@/features/experience-details";

import type { ExperiencePageContent } from "../model/experience-page.types";

type FitKind = ExperienceDetailsViewModel["fit"][number]["kind"];

const FIT_ICONS: Record<FitKind, LucideIcon> = {
  fitness: ChevronsRight,
  age: Smile,
  accessibility: Accessibility,
  languages: Languages,
  weather: CloudRain,
  pickup: Car,
};

type Props = {
  content: ExperiencePageContent;
  /** Fit, itinerary, lists, description and location, worked out from the experience. */
  details: ExperienceDetailsViewModel;
};

/** The experience page's body, from "About" to "More ways". Sections the
 * experience has no data for are left out. */
export function ExperienceSectionsView({ content, details }: Props) {
  const { description } = details;
  const guests = details.beforeYouBook.find((item) => item.kind === "guests");
  const safety = details.beforeYouBook.find((item) => item.kind === "safety");
  const facts = [
    ...details.fit.map((item) => ({
      id: item.kind,
      icon: FIT_ICONS[item.kind],
      title: item.label,
      body: item.note ? `${item.value}. ${item.note}` : item.value,
    })),
    ...(guests ? [{ id: "guests", icon: Users, title: guests.label, body: guests.description }] : []),
  ];

  return (
    <>
      {description.paragraphs.length > 0 && (
        <section className="flex flex-col gap-5">
          <DetailSectionHeading size="md">About this experience</DetailSectionHeading>
          <div className="flex flex-col gap-3 font-sans text-base leading-[26px] text-[#6F6B72]">
            {description.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {description.long && (
              <button
                type="button"
                onClick={description.onToggle}
                className="w-fit cursor-pointer font-medium text-[#F5032D] underline underline-offset-2 hover:opacity-85"
              >
                {description.expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
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

      {facts.length > 0 && (
        <DetailSection title="Before you book">
          <div className="grid gap-x-4 gap-y-[30px] sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.id} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <fact.icon className="size-[18px]" aria-hidden />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-foreground">{fact.title}</span>
                  <span className="text-sm text-muted-foreground">{fact.body}</span>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {details.itinerary.length > 0 && (
        <DetailSection title="Itinerary">
          <ol className="flex flex-col gap-5">
            {details.itinerary.map((step, index) => (
              // Steps have no identity beyond their position.
              <li key={index} className="flex items-start gap-3">
                <div
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground"
                >
                  {index + 1}
                </div>
                <div className="flex flex-col gap-0.5 pt-1">
                  <span className="text-base font-medium text-foreground">{step.title}</span>
                  {step.description && <span className="text-sm text-muted-foreground">{step.description}</span>}
                </div>
              </li>
            ))}
          </ol>
          <DetailNote>Please note itinerary is subject to change</DetailNote>
        </DetailSection>
      )}

      {details.lists.map((list) => (
        <DetailSection key={list.kind} title={list.title}>
          {list.kind === "highlights" ? (
            <p className="font-sans text-base leading-7 text-[#6F6B72]">{list.items.join(" ")}</p>
          ) : (
            <ul className="flex flex-col gap-1 font-sans text-base leading-7 text-[#6F6B72]">
              {list.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </DetailSection>
      ))}

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

      {safety && (
        <DetailSection title="Safety notes">
          <p className="font-sans text-base leading-7 text-[#6F6B72]">{safety.description}</p>
        </DetailSection>
      )}

      {(details.location || details.landmark) && (
        <>
          <ExperienceLocationView location={details.location} landmark={details.landmark} />
          <DetailDivider />
        </>
      )}

      {content.moreWays.length > 0 && (
        <DetailSection title={`More ways to experience ${content.city ?? "your city"}`}>
          <DetailCategoryCards items={content.moreWays} hrefFor={(slug) => `/categories/${slug}`} />
        </DetailSection>
      )}
    </>
  );
}
