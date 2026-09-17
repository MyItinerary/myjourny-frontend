"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";
import { HomeNav } from "@/components/home/home-nav";
import { SearchBar, MobileSearchModal } from "@/components/home/search-bar";

const heroContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HeroSection() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative z-20 bg-gradient-to-b from-muted to-white">
      <HomeNav />

      <motion.div
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-[900px] flex-col items-start px-6 lg:px-0 pt-[24px] pb-[64px] text-left lg:pt-[36px] lg:pb-[90px]"
      >
        <div className="flex flex-col items-start gap-4 text-left lg:gap-5">
          <motion.h1
            variants={heroItemVariants}
            className="font-heading text-[32px] font-extrabold leading-[1.2] text-[#2c0101] lg:text-[52px] lg:leading-[62.4px] lg:text-[#130404]"
          >
            Your city is full of things worth doing, Start with one.
          </motion.h1>
          <motion.p
            variants={heroItemVariants}
            className="max-w-[508px] font-sans text-lg font-normal leading-[28px] text-[#6F6B72] lg:text-[24px] lg:leading-normal"
          >
            Real experiences hosted by real people, booked in under 2 minutes.
          </motion.p>
        </div>

        <motion.div
          variants={heroItemVariants}
          animate={
            isScrolled
              ? { opacity: 0, scale: 0.95, y: -16, transition: { duration: 0.22, ease: "easeInOut" } }
              : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } }
          }
          className={cn("w-full", isScrolled && "pointer-events-none")}
        >
          {/* Mobile: compact "Search destinations or activities" pill; desktop: 3-field bar. */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="mt-[76px] flex w-full items-center gap-[7px] rounded-full border border-[#c7c1ba] bg-white p-4 text-left lg:hidden cursor-pointer"
          >
            <span className="min-w-0 flex-1 text-base leading-6 text-muted-foreground">Search destinations or activities</span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
              <Image src="/icons/search-lg.svg" alt="" width={16} height={16} className="invert" />
            </span>
          </button>
          <SearchBar variant="hero" className="mt-8 hidden w-full max-w-[900px] lg:mt-12 lg:flex" />
        </motion.div>
      </motion.div>

      {/* Mobile search modal */}
      {mobileSearchOpen && <MobileSearchModal onClose={() => setMobileSearchOpen(false)} />}
    </section>
  );
}
