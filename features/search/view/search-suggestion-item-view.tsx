"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type {
  ActivitySuggestion,
  DestinationSuggestion,
  ExperienceSuggestionRow,
} from "../model/search.types";

export function ExperienceSuggestionThumbnail({
  src,
  fallback,
  alt,
  className,
}: {
  src?: string | null;
  fallback: string;
  alt: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-[10px] bg-[#F4F2EE]", className)}>
      <Image
        src={currentSrc}
        alt={alt}
        fill
        sizes="48px"
        onError={() => setCurrentSrc(fallback)}
        className="object-cover"
      />
    </div>
  );
}

export interface ExperienceSuggestionItemProps {
  experience: ExperienceSuggestionRow;
  onSelect: (exp: ExperienceSuggestionRow) => void;
  className?: string;
}

export function ExperienceSuggestionItem({
  experience,
  onSelect,
  className,
}: ExperienceSuggestionItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(experience)}
      className={cn(
        "flex w-full items-center gap-[14.5px] rounded-xl p-1.5 text-left transition-colors hover:bg-[#F4F2EE]/70 cursor-pointer",
        className,
      )}
    >
      <ExperienceSuggestionThumbnail
        src={experience.cover_image_url}
        fallback={experience.fallbackImage}
        alt={experience.title}
        className="size-[42px]"
      />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold leading-5 text-[#130404] truncate">
          {experience.title}
        </span>
        <span className="text-xs leading-4 text-[#6F6B72] truncate">
          {experience.subtitle}
        </span>
      </div>
    </button>
  );
}

export interface SearchSuggestionListProps {
  destinations: DestinationSuggestion[];
  activities: ActivitySuggestion[];
  experiences: ExperienceSuggestionRow[];
  isSearchingExperiences?: boolean;
  query?: string;
  onSelectDestination: (dest: DestinationSuggestion) => void;
  onSelectActivity: (act: ActivitySuggestion) => void;
  onSelectExperience: (exp: ExperienceSuggestionRow) => void;
  className?: string;
}

export function SearchSuggestionList({
  destinations,
  activities,
  experiences,
  isSearchingExperiences = false,
  query = "",
  onSelectDestination,
  onSelectActivity,
  onSelectExperience,
  className,
}: SearchSuggestionListProps) {
  const hasDestinations = destinations.length > 0;
  const hasActivities = activities.length > 0;
  const hasExperiences = experiences.length > 0;
  const trimmed = query.trim();

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {hasDestinations && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6B72]">
            Destinations
          </span>
          {destinations.map((dest) => (
            <button
              key={dest.id}
              type="button"
              onClick={() => onSelectDestination(dest)}
              className="flex w-full items-center gap-[14.5px] rounded-xl p-1.5 text-left transition-colors hover:bg-[#F4F2EE]/70 cursor-pointer"
            >
              <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#F4F2EE]">
                <Image
                  src="/icons/pin-destination.svg"
                  alt=""
                  width={18}
                  height={22}
                  className="h-[22px] w-[18px]"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold leading-5 text-[#130404] truncate">
                  {dest.city}
                </span>
                <span className="text-xs leading-4 text-[#6F6B72] truncate">
                  {dest.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasActivities && (
        <div className={cn("flex flex-col gap-2", hasDestinations && "border-t border-[#f0eee9] pt-3")}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6B72]">
            Activities &amp; Experiences
          </span>
          {activities.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelectActivity(act)}
              className="flex w-full items-center gap-[14.5px] rounded-xl p-1.5 text-left transition-colors hover:bg-[#F4F2EE]/70 cursor-pointer"
            >
              <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#F4F2EE]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F5032D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold leading-5 text-[#130404] truncate">
                  {act.label}
                </span>
                <span className="text-xs leading-4 text-[#6F6B72] truncate">
                  {act.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasExperiences && (
        <div className={cn("flex flex-col gap-2", (hasDestinations || hasActivities) && "border-t border-[#f0eee9] pt-3")}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6B72]">
              Experiences
            </span>
            {isSearchingExperiences && (
              <span className="text-[11px] text-muted-foreground animate-pulse">Updating...</span>
            )}
          </div>
          {experiences.map((exp) => (
            <ExperienceSuggestionItem
              key={exp.id}
              experience={exp}
              onSelect={onSelectExperience}
            />
          ))}
        </div>
      )}

      {isSearchingExperiences && !hasExperiences && trimmed.length >= 2 && (
        <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground border-t border-[#f0eee9] pt-3">
          <div className="size-3.5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <span>Searching experiences...</span>
        </div>
      )}

      {!hasDestinations && !hasActivities && !hasExperiences && !isSearchingExperiences && (
        <p className="py-3 text-center text-sm text-muted-foreground">
          No destinations, activities, or experiences found matching &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
