import { cn } from "@/lib/utils";

import { TONE_CLASSES } from "./event-tones";

const PLACEHOLDERS = [
  { tone: 1, className: "row-span-2" },
  { tone: 2, className: "" },
  { tone: 3, className: "" },
  { tone: 4, className: "" },
  { tone: 5, className: "" },
] as const;

/** Stands in for the event's photos, in the same layout as the real gallery,
 * until the organiser has uploaded some. */
export function EventPhotosView() {
  return (
    <div
      data-testid="event-photo-placeholders"
      className="grid h-[300px] grid-cols-3 grid-rows-2 gap-4 lg:h-[479px]"
    >
      {PLACEHOLDERS.map(({ tone, className }, index) => (
        <div
          key={tone}
          className={cn("rounded-[20px]", TONE_CLASSES[tone], className, index > 2 && "hidden sm:block")}
        />
      ))}
    </div>
  );
}
