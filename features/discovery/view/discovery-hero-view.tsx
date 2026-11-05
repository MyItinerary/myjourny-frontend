"use client";

import Image from "next/image";

import { HomeNav } from "@/components/home/home-nav";
import { cn } from "@/lib/utils";
import { SearchBarView } from "@/features/search";
import type { HomeHeroViewModel } from "@/features/home";

type DiscoveryHeroViewProps = {
  hero: HomeHeroViewModel;
  title: string;
  subtitle: string;
  /** The headline's width on desktop, in px: it sets where the title breaks onto two lines. */
  titleWidth: number;
};

// Figma Hero of the Experiences (2660:73568) and Events (2660:73673) pages: the nav over a centred
// headline, sub-line and the 900px search bar, on the same soft wash as the home hero.
export function DiscoveryHeroView({ hero, title, subtitle, titleWidth }: DiscoveryHeroViewProps) {
  const { search, isScrolled, onOpenMobileSearch } = hero;

  return (
    <section className="relative z-20 bg-gradient-to-b from-[rgba(244,242,238,0.87)] to-white">
      <HomeNav />

      <div className="mx-auto flex w-full max-w-[900px] flex-col items-center px-6 pt-6 pb-16 text-center lg:px-0 lg:pt-[77px] lg:pb-[110px]">
        <div className="flex flex-col items-center gap-4 lg:gap-5">
          <h1
            style={{ "--hero-title-width": `${titleWidth}px` } as React.CSSProperties}
            className="lg:max-w-[var(--hero-title-width)] font-heading text-[32px] font-extrabold leading-[1.2] text-[#130404] lg:text-[52px]"
          >
            {title}
          </h1>
          <p className="font-sans text-lg font-normal leading-[28px] text-[#6F6B72] lg:text-[24px] lg:leading-normal">
            {subtitle}
          </p>
        </div>

        <div className={cn("w-full transition-opacity", isScrolled && "pointer-events-none opacity-0")}>
          <button
            type="button"
            onClick={onOpenMobileSearch}
            className="mt-12 flex w-full cursor-pointer items-center gap-[7px] rounded-full border border-[#c7c1ba] bg-white p-4 text-left lg:hidden"
          >
            <span className="min-w-0 flex-1 text-base leading-6 text-muted-foreground">Search destinations or activities</span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
              <Image src="/icons/search-lg.svg" alt="" width={16} height={16} className="invert" />
            </span>
          </button>
          <SearchBarView {...search} className="mt-[80px] hidden w-full max-w-[900px] lg:flex" />
        </div>
      </div>
    </section>
  );
}
