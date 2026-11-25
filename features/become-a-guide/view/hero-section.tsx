"use client";

import Image from "next/image";

export interface HeroSectionProps {
  onStartApplication: () => void;
  onScrollToHowItWorks: () => void;
}

export function HeroSection({ onStartApplication, onScrollToHowItWorks }: HeroSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1360px] px-4 py-12 sm:px-8 sm:py-20 lg:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Heading and CTAs */}
        <div className="flex flex-col lg:col-span-6">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-[#2C0101] sm:text-5xl lg:text-[56px] lg:leading-[1.12]">
            You built the audience. Start earning from it.
          </h1>

          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-[#333134] sm:text-lg">
            Turn your city knowledge into income. Real experiences, hosted by real people who
            actually live there
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
            <button
              type="button"
              onClick={onStartApplication}
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-[#F5032D] px-8 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#D40226]"
            >
              Start your application
            </button>

            <button
              type="button"
              onClick={onScrollToHowItWorks}
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[#E0DFDD] bg-white px-8 font-sans text-sm font-semibold text-[#130404] transition-colors hover:bg-[#FAF9F7]"
            >
              See how it works
            </button>
          </div>
        </div>

        {/* Right Column: Hero Image */}
        <div className="flex justify-center lg:col-span-6">
          <div className="relative aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[28px] bg-[#EBEBEB] shadow-md">
            <Image
              src="/guides/homepage.webp"
              alt="Real experiences hosted by real people"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 520px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
