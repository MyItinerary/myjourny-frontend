import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostPageHeader } from "../view-model/use-host-home-view-model";

// The 64px bar above each portal screen: what this screen is, what's going on
// in it, and its main actions.
export function HostPageHeaderView({ title, subtitle, actions }: HostPageHeader) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3.5 px-6 shadow-[inset_0_-1px_0_#E7E7E7]">
      <div className="min-w-0">
        <h1 className="max-w-[320px] truncate font-heading text-[17px] font-extrabold tracking-[-0.2px] text-[#333134] md:max-w-none">
          {title}
        </h1>
        {subtitle && <p className="mt-px text-xs text-[#6F6B72]">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              "flex h-9 items-center rounded-full text-[13px] font-medium whitespace-nowrap transition-[filter] hover:brightness-[0.97]",
              action.primary
                ? "bg-[#F5032D] px-4 text-white"
                : "bg-white px-3.5 text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]",
            )}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
