"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";
import { HomeNav } from "@/components/home/home-nav";
import { SearchBarView } from "@/features/search";

import type { HomeHeroViewModel } from "../view-model/use-home-hero-view-model";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Figma "Hero" (671:24718): the nav over a centred headline, sub-line and the
// 900px three-field search bar, on a soft grey-to-white wash.
export function HomeHeroView({ search, isScrolled, onOpenMobileSearch }: HomeHeroViewModel) {
  return (
    <section className="relative z-20 bg-gradient-to-b from-[rgba(244,242,238,0.87)] to-white">
      <HomeNav />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-[900px] flex-col items-center px-6 pt-6 pb-16 text-center lg:px-0 lg:pt-[77px] lg:pb-[138px]"
      >
        <div className="flex flex-col items-center gap-4 lg:gap-5">
          <motion.h1
            variants={itemVariants}
            className="max-w-[706px] font-heading text-[32px] font-extrabold leading-[1.2] text-[#130404] lg:text-[52px]"
          >
            Find things worth doing. Here or anywhere.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="font-sans text-lg font-normal leading-[28px] text-[#6F6B72] lg:text-[24px] lg:leading-normal"
          >
            Experiences and events picked to match your taste.
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          animate={
            isScrolled
              ? { opacity: 0, scale: 0.95, y: -16, transition: { duration: 0.22, ease: "easeInOut" } }
              : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } }
          }
          className={cn("w-full", isScrolled && "pointer-events-none")}
        >
          <button
            type="button"
            onClick={onOpenMobileSearch}
            className="mt-12 flex w-full items-center gap-[7px] rounded-full border border-[#c7c1ba] bg-white p-4 text-left lg:hidden cursor-pointer"
          >
            <span className="min-w-0 flex-1 text-base leading-6 text-muted-foreground">
              Search destinations or activities
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
              <Image src="/icons/search-lg.svg" alt="" width={16} height={16} className="invert" />
            </span>
          </button>
          <SearchBarView {...search} className="mt-[97px] hidden w-full max-w-[900px] lg:flex" />
        </motion.div>
      </motion.div>
    </section>
  );
}
