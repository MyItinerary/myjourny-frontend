import Image from "next/image";

import { cn } from "@/lib/utils";
import { HomeNav } from "@/components/home/home-nav";

// Figma: "Hero" (2001:9143 guest / 2001:9153 account) — pixel-identical
// between the two states, so this ships as one shared component.
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted to-white">
      <HomeNav />

      <div className="mx-auto flex max-w-[900px] flex-col items-start gap-4 px-6 pt-[50px] pb-[64px] text-left lg:block lg:h-[513px] lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0 lg:text-center">
        <div className="flex flex-col items-start gap-4 lg:absolute lg:top-[77px] lg:left-1/2 lg:w-[900px] lg:-translate-x-1/2 lg:items-center lg:gap-5">
          {/* Mobile headline is Midnight Earth (#2c0101); desktop is #130404. */}
          <h1 className="font-heading text-[32px] leading-[1.2] font-extrabold text-[#2c0101] lg:text-[52px] lg:text-[#130404]">
            Your city is full of things worth doing, Start with one.
          </h1>
          <p className="max-w-[508px] text-lg leading-[28px] text-muted-foreground lg:w-[508px] lg:text-2xl lg:leading-normal">
            Real experiences hosted by real people, booked in under 2 minutes.
          </p>
        </div>

        {/* Mobile: compact "Where to?" pill (2001:8004); desktop: 3-field bar. */}
        <button
          type="button"
          className="mt-[76px] flex w-full items-center gap-[7px] rounded-full border border-[#c7c1ba] bg-white p-4 text-left lg:hidden"
        >
          <span className="min-w-0 flex-1 text-base leading-6 text-muted-foreground">Where to?</span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
            <Image src="/icons/search-lg.svg" alt="" width={16} height={16} className="invert" />
          </span>
        </button>
        <SearchBar className="hidden w-full max-w-[900px] lg:absolute lg:top-[348px] lg:left-1/2 lg:flex lg:w-[900px] lg:-translate-x-1/2" />
      </div>
    </section>
  );
}

function SearchBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[28px] border border-[#c7c1ba] bg-white p-2 lg:flex-row lg:items-center lg:gap-[9px] lg:rounded-[57px]",
        className
      )}
    >
      <div className="flex flex-1 flex-col divide-y divide-[#e0dfdd] lg:flex-row lg:divide-x lg:divide-y-0">
        <SearchField label="Where" placeholder="Discover locations" />
        <SearchField label="When" placeholder="Select dates" />
        <SearchField label="Who" placeholder="Select guests" />
      </div>
      <button
        type="button"
        aria-label="Search"
        className="flex size-11 shrink-0 items-center justify-center self-end rounded-full bg-brand text-white transition-colors hover:bg-brand/90 lg:self-auto"
      >
        <Image src="/icons/search-lg.svg" alt="" width={20} height={20} className="invert" />
      </button>
    </div>
  );
}

function SearchField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-[57px] px-4 py-2">
      <span className="text-xs text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{placeholder}</span>
    </div>
  );
}
