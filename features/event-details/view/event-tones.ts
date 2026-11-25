import type { EventTone } from "../model/event-details.types";

/** The five warm tones photo and face placeholders use. */
export const TONE_CLASSES: Record<EventTone, string> = {
  1: "bg-[#E9E1D2]",
  2: "bg-[#DED6CC]",
  3: "bg-[#D6D2CB]",
  4: "bg-[#E4DCD5]",
  5: "bg-[#ECE4DE]",
};

export function initials(name: string): string {
  return name
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
