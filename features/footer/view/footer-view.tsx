"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { FooterViewModel } from "../view-model/use-footer-view-model";

const SKELETON_WIDTHS = ["w-36", "w-40", "w-32", "w-44", "w-36", "w-28"];

// Figma: "Footer" (2656:72994).
export function FooterView({
  tabs,
  isLoadingTabs,
  onSelectTab,
  subcategories,
  isLoadingSubcategories,
  columns,
  legalLinks,
  socialLinks,
  year,
}: FooterViewModel) {
  const activeTab = tabs.find((tab) => tab.active);

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-[1372px] px-6 pt-12 pb-8">
        <h2 className="py-2 font-heading text-[22px] leading-[33px] font-medium text-[#0d0d0d]">
          More ways to experience your city
        </h2>

        {isLoadingTabs ? (
          <div className="mt-4 flex gap-6 overflow-x-auto border-b border-[#f5f5f5] pb-3.5 pt-2 scrollbar-none">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-28 shrink-0 rounded bg-[#EAE8E3]" />
            ))}
          </div>
        ) : tabs.length > 0 ? (
          <Tabs value={String(activeTab?.id ?? "")} onValueChange={(val) => onSelectTab(Number(val))} className="mt-4">
            <TabsList
              variant="line"
              className="relative flex h-auto w-full justify-start gap-3 overflow-x-auto border-b border-[#f5f5f5] bg-transparent p-0 scrollbar-none"
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={String(tab.id)}
                  className={cn(
                    "relative flex items-center justify-center whitespace-nowrap rounded-none border-0 bg-transparent px-4 pb-2 pt-0 text-sm font-medium text-[#bdbdbd] transition-colors after:hidden hover:text-[#212121]",
                    "data-active:border-0 data-active:bg-transparent data-active:text-[#212121] data-active:shadow-none",
                  )}
                >
                  {tab.label}
                  {tab.active && (
                    <motion.span
                      layoutId="footer-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f5032d]"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      aria-hidden="true"
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : null}

        <div className="mt-8 flex min-h-[48px] flex-wrap items-center gap-6">
          {isLoadingSubcategories
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex min-w-[120px] flex-col pr-4">
                  <Skeleton className={cn("h-4 rounded bg-[#EAE8E3]", SKELETON_WIDTHS[index % SKELETON_WIDTHS.length])} />
                  <Skeleton className="mt-1.5 h-3 w-16 rounded bg-[#EAE8E3]" />
                </div>
              ))
            : subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={subcategory.href}
                  className="group flex flex-col pr-4 transition-opacity hover:opacity-80"
                >
                  <span className="text-sm font-medium text-[#0d0d0d] group-hover:underline">{subcategory.label}</span>
                  <span className="pt-0.5 text-[13px] text-[#4a4540]">Subcategory</span>
                </Link>
              ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 pt-8 sm:grid-cols-3 lg:mt-[72px] lg:min-h-[268px] lg:gap-8 lg:pt-0">
          {columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-[0.14px] text-[#2a2420]">{column.heading}</h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link} className="flex h-6 items-center">
                    <Link href="#" className="text-sm text-[#4a4540] hover:text-[#0d0d0d] hover:underline">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#e0e0e0] pt-3 text-sm text-[#424242] lg:mt-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span>&copy; {year} Myjourny, Inc.</span>
            {legalLinks.map((link) => (
              <span key={link} className="flex items-center gap-2.5">
                <Image src="/icons/footer/dot.svg" alt="" width={7} height={7} aria-hidden="true" />
                <Link href="#" className="hover:text-[#0d0d0d] hover:underline">
                  {link}
                </Link>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <Link key={social.label} href="#" aria-label={social.label} className="flex h-[18px] items-center">
                <Image src={social.src} alt="" width={social.width} height={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
