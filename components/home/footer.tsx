"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth/session-store";
import { groupChildrenByParentSlug, useInterestCategories } from "@/lib/queries/categories";
import { inspirationCategories, inspirationSubcategories } from "@/lib/mock-data/home";

// Figma: "Footer" (2001:8924/2001:8949) — identical between guest/account.
// Bundles two stacked blocks: the "InspirationSection" category tabs
// ("More ways to experience your city") above the actual footer link
// columns + legal row, both on the same light (#fafafa) background.
const linkColumns = [
  {
    heading: "Support",
    links: ["Help Center", "Report a safety concern", "Guest protection", "Cancellation options", "Trust and safety"],
  },
  {
    heading: "Hosting and Curating",
    links: [
      "Become a guide",
      "Become a curator",
      "Host protection",
      "Host and curator resources",
      "Community forum",
      "Hosting responsibly",
    ],
  },
  {
    heading: "Myjourny",
    links: ["About us", "Newsroom", "Careers", "Investors", "Gift cards"],
  },
];

export function Footer() {
  const [activeCategory, setActiveCategory] = useState(inspirationCategories[0].id);
  const { user } = useSession();
  const isAccount = user !== null;

  // Tabs stay driven by the static list either way — real parent
  // slugs/labels already match it 1:1, so there's nothing to gain (and a
  // loading flash to lose) by fetching parents too. Only the subcategory
  // row below switches to real data for signed-in users.
  const categoriesQuery = useInterestCategories();
  const childrenByParent = categoriesQuery.data
    ? groupChildrenByParentSlug(categoriesQuery.data)
    : null;
  const activeSubcategories = isAccount
    ? (childrenByParent?.get(activeCategory) ?? []).map((c) => ({ id: c.slug, label: c.text }))
    : inspirationSubcategories;

  return (
    <footer className="bg-[#F7F7F7]">
      <div className="mx-auto max-w-[1372px] px-6 pt-12 pb-8 lg:px-6">
        <h2 className="py-2 font-heading text-[22px] leading-[33px] font-medium text-[#222222]">
          More ways to experience your city
        </h2>

        <Tabs
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as string)}
          className="mt-4"
        >
          <TabsList
            variant="line"
            className="relative flex h-auto w-full justify-start gap-6 overflow-x-auto border-b border-[#EBEBEB] bg-transparent p-0 scrollbar-none"
          >
            {inspirationCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={cn(
                  "relative flex items-center justify-center whitespace-nowrap rounded-none border-0 bg-transparent px-0 pb-3.5 pt-2 text-sm font-medium text-[#717171] transition-colors after:hidden hover:text-[#222222]",
                  "data-active:border-0 data-active:bg-transparent data-active:font-semibold data-active:text-[#222222] data-active:shadow-none"
                )}
              >
                {category.label}
                {activeCategory === category.id && (
                  <motion.span
                    layoutId="footer-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-[2px] bg-[#222222]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    aria-hidden="true"
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Figma only specs subcategory content for the first tab — guests
            still see that same static placeholder regardless of the active
            tab (itin's categories endpoint is auth-only); signed-in users
            get each tab's real children. */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          {activeSubcategories.map((subcategory) => (
            <div key={subcategory.id} className="flex flex-col pr-4">
              <span className="text-sm font-medium text-[#222222]">{subcategory.label}</span>
              <span className="pt-0.5 text-[13px] text-[#717171]">Subcategory</span>
            </div>
          ))}
        </div>

        {/* Figma seam: InspirationSection pb-24px + Footer block pt-48px = 72px */}
        {/* Figma fixes this container at 268px tall regardless of content */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-[#EBEBEB] pt-8 sm:grid-cols-3 lg:mt-[72px] lg:min-h-[268px] lg:gap-8 lg:pt-12">
          {linkColumns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-[0.14px] text-[#222222]">{column.heading}</h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link} className="flex h-6 items-center">
                    <Link href="#" className="text-sm text-[#4a4540] hover:text-[#222222] hover:underline">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={cn("mt-6 flex flex-wrap items-center gap-2.5 border-t border-[#EBEBEB] pt-3 text-sm text-[#717171] lg:mt-10 lg:pt-6")}>
          <span>&copy; {new Date().getFullYear()} Myjourny, Inc.</span>
          <Link href="#" className="hover:text-[#222222] hover:underline">
            Privacy
          </Link>
          <Link href="#" className="hover:text-[#222222] hover:underline">
            Terms
          </Link>
          <Link href="#" className="hover:text-[#222222] hover:underline">
            Your privacy choices
          </Link>
          <span className="text-[#c7c1ba]">&bull;</span>
          {/* <Link href="/checkout-preview" className="text-brand hover:underline font-medium">
            Checkout Preview
          </Link> */}
        </div>
      </div>
    </footer>
  );
}
