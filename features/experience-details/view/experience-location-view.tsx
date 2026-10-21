import { MapPin } from "lucide-react";

import type { ExperienceLocation } from "../model/experience-details.types";

type Props = {
  location: ExperienceLocation | null;
  /** Section heading; the booking page says "Where to meet". */
  heading?: string;
  /** Just the map: the booking page lists the instructions and directions itself. */
  mapOnly?: boolean;
};

/** A real map: the exact meeting point once booked, the area otherwise. */
export function ExperienceLocationView({ location, heading = "Where you'll be", mapOnly = false }: Props) {
  if (!location) return null;
  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">{heading}</h2>

      {(location.mode === "exact" || location.mode === "approximate") && (
        <iframe
          title={location.mode === "exact" ? "Meeting point map" : `Map of ${location.label}`}
          src={location.embedUrl}
          loading="lazy"
          className="mt-4 h-[280px] w-full rounded-2xl border-0 bg-muted"
        />
      )}
      {(location.mode === "label" || location.mode === "exact-text") && (
        <div className="mt-4 flex h-[120px] w-full items-center justify-center gap-2 rounded-2xl bg-muted text-sm font-medium text-foreground">
          <MapPin className="size-5 text-brand" aria-hidden />
          {location.label}
        </div>
      )}

      {mapOnly ? null : location.mode === "exact" || location.mode === "exact-text" ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">You&apos;re booked. Here&apos;s where to meet.</p>
          {location.instructions && <p className="text-sm text-muted-foreground">{location.instructions}</p>}
          {location.mode === "exact" && (
            <a
              href={location.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand underline underline-offset-2"
            >
              Get directions
            </a>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          ⓘ {location.mode === "approximate" ? "The map shows the general area. " : ""}Exact meeting point shared
          after booking.
        </p>
      )}
    </section>
  );
}
