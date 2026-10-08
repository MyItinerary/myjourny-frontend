"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Category, useInterestCategories, useSubcategories } from "@/lib/queries/categories";

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
  const categoriesQuery = useInterestCategories();
  const categories = categoriesQuery.data ?? [];

  // Top-level parent categories from GET /categories?category_type=interest
  const parentCategories = categories.filter((c) => c.parent_id === null);

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  // Active category: either currently selected or default to the first parent
  const currentCategory =
    parentCategories.find((c) => c.id === activeCategoryId) ?? parentCategories[0];

  const currentParentId = currentCategory?.id ?? null;

  // Fetch subcategories whenever a category is selected: GET /categories?parent_id=<id>
  const { data: subcategories = [] } = useSubcategories(currentParentId);

  return (
    <footer className="bg-[#FCFCFC]">
      <div className="mx-auto max-w-[1372px] px-6 pt-12 pb-8 lg:px-6">
        <h2 className="py-2 font-heading text-[22px] leading-[33px] font-medium text-[#222222]">
          More ways to experience your city
        </h2>

        {parentCategories.length > 0 && (
          <Tabs
            value={String(currentCategory?.id ?? "")}
            onValueChange={(val) => setActiveCategoryId(Number(val))}
            className="mt-4"
          >
            <TabsList
              variant="line"
              className="relative flex h-auto w-full justify-start gap-6 overflow-x-auto border-b border-[#EBEBEB] bg-transparent p-0 scrollbar-none"
            >
              {parentCategories.map((category) => {
                const isActive = category.id === currentCategory?.id;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={String(category.id)}
                    className={cn(
                      "relative flex items-center justify-center whitespace-nowrap rounded-none border-0 bg-transparent px-0 pb-3.5 pt-2 text-sm font-medium text-[#717171] transition-colors after:hidden hover:text-[#222222]",
                      "data-active:border-0 data-active:bg-transparent data-active:font-semibold data-active:text-[#222222] data-active:shadow-none"
                    )}
                  >
                    {category.text}
                    {isActive && (
                      <motion.span
                        layoutId="footer-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-[2px] bg-[#222222]"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        aria-hidden="true"
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        )}

        {/* Dynamic subcategories from the endpoint: updates when a category is clicked */}
        <div className="mt-8 flex flex-wrap items-center gap-6 min-h-[48px]">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/categories/${subcategory.slug}`}
              className="flex flex-col pr-4 group transition-opacity hover:opacity-80"
            >
              <span className="text-sm font-medium text-[#222222] group-hover:underline">
                {subcategory.text}
              </span>
              <span className="pt-0.5 text-[13px] text-[#717171]">Subcategory</span>
            </Link>
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
        </div>
      </div>
    </footer>
  );
}
