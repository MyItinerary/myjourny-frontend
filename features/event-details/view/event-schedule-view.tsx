import { cn } from "@/lib/utils";

import type { EventDetail } from "../model/event-details.types";

/** The day's timeline: a dot per entry on a rail. Talks are bold, breaks and
 * meals are muted, the launch sits on a cream pill. */
export function EventScheduleView({ rows }: { rows: EventDetail["schedule"] }) {
  return (
    <ol className="flex flex-col">
      {rows.map((row, index) => {
        const muted = row.kind === "muted";
        const last = index === rows.length - 1;
        return (
          <li key={row.id} className="flex items-stretch gap-4">
            <p className="w-16 shrink-0 pt-px font-sans text-base leading-6 font-medium text-[#333134] sm:w-[88px]">
              {row.time}
            </p>
            <div className="flex w-3 shrink-0 flex-col items-center">
              <span className="h-[5px] w-3 shrink-0" />
              <span
                aria-hidden
                className={cn(
                  "size-3 shrink-0 rounded-full border-2 border-[#32070F]",
                  row.kind === "talk" ? "bg-[#32070F]" : "bg-white",
                )}
              />
              <span className={cn("w-0.5 flex-1 bg-[#E7E7E7]", last && "opacity-0")} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-[22px]">
              {row.kind === "talk" && (
                <p className="font-sans text-lg leading-[27px] font-semibold text-[#333134]">{row.title}</p>
              )}
              {row.kind === "launch" && (
                <p className="w-fit rounded-lg bg-[#F4F2EE] px-2.5 py-0.5 font-sans text-lg leading-[27px] font-semibold text-[#333134]">
                  {row.title}
                </p>
              )}
              {(row.kind === "plain" || muted) && (
                <p className={cn("font-sans text-base leading-6", muted ? "text-[#6F6B72]" : "text-[#333134]")}>
                  {row.title}
                </p>
              )}
              {row.detail && (
                <p className={cn("font-sans text-sm leading-[22px] text-[#6F6B72]", row.kind === "talk" && "leading-[21px]")}>
                  {row.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
