import Image from "next/image";

import { cn } from "@/lib/utils";

import type { EventDetail } from "../model/event-details.types";
import { initials, TONE_CLASSES } from "./event-tones";

/** Speakers: a square face, name, role and one line about them. */
export function EventLineupView({ people }: { people: EventDetail["lineup"] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3">
      {people.map((person) => (
        <li key={person.id} className="flex flex-col gap-3">
          <div
            className={cn(
              "relative flex aspect-[277/258] items-center justify-center overflow-hidden rounded-[20px]",
              TONE_CLASSES[person.tone],
            )}
          >
            {person.imageUrl ? (
              <Image src={person.imageUrl} alt={person.name} fill unoptimized sizes="277px" className="object-cover" />
            ) : (
              <span aria-hidden className="font-sans text-4xl font-medium text-[#333134]/60">
                {initials(person.name)}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-sans text-[17px] leading-6 font-semibold text-[#333134]">{person.name}</p>
            <p className="font-sans text-sm font-medium text-[#333134]">{person.role}</p>
            <p className="font-sans text-sm leading-[21px] text-[#6F6B72]">{person.bio}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
