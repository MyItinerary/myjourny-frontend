import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostSetupCard } from "../view-model/use-host-home-view-model";

// "Finish setting up" on Home: the steps that get a new host verified, each
// opening the right part of their profile.
export function HostSetupCardView({ setup, className }: { setup: HostSetupCard; className?: string }) {
  return (
    <section className={cn("rounded-2xl bg-white px-[22px] py-5 shadow-[inset_0_0_0_1px_#E7E7E7]", className)}>
      <div className="mb-1.5 flex items-center gap-3.5">
        <h2 className="text-[15px] font-medium text-[#333134]">{setup.heading}</h2>
        <span className="ml-auto text-[12.5px] text-[#6F6B72]">{setup.count}</span>
      </div>
      <p className="mb-3.5 text-[13.5px] leading-[1.55] text-[#6F6B72]">{setup.note}</p>
      <div className="mb-4 h-[5px] overflow-hidden rounded-full bg-[#E9E1D2]">
        <div className="h-full rounded-full bg-[#F5032D]" style={{ width: `${setup.percent}%` }} />
      </div>
      <div className="flex flex-col gap-2">
        {setup.tasks.map((task) => (
          <Link
            key={task.title}
            href={task.href}
            className="flex w-full items-center gap-3 rounded-[14px] bg-white px-3.5 py-[13px] text-left shadow-[inset_0_0_0_1px_#E7E7E7] hover:bg-[#FAF9F7]"
          >
            <span
              aria-hidden
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] text-white",
                task.done ? "bg-[#0CBA65]" : "shadow-[inset_0_0_0_1.5px_#D9D9D9]",
              )}
            >
              {task.done ? "✓" : ""}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-[#333134]">{task.title}</span>
              <span className="mt-0.5 block text-[12.5px] leading-normal text-[#6F6B72]">{task.body}</span>
            </span>
            <ChevronRight aria-hidden className="size-4 shrink-0 text-[#6F6B72]" strokeWidth={1.9} />
          </Link>
        ))}
      </div>
    </section>
  );
}
