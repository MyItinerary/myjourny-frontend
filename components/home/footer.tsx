"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <footer className="bg-[#fafafa]">
      <div className="mx-auto max-w-[1372px] px-6 pt-12 pb-8 lg:px-6">
        <h2 className="py-2 font-heading text-[22px] leading-[33px] font-medium text-[#0d0d0d]">
          More ways to experience your city
        </h2>

        <Tabs
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as string)}
          className="mt-6"
        >
          <TabsList variant="line" className="h-auto w-full justify-start gap-2 overflow-x-auto border-0 bg-transparent p-0">
            {inspirationCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-start justify-center gap-2 rounded-none px-4 pt-0 pb-2 text-sm font-medium text-[#757575] border-t-0 border-x-0 border-b-2 border-transparent transition-all after:hidden hover:text-foreground data-active:border-t-0 data-active:border-x-0 data-active:border-b-[#F5032D] data-active:text-[#0d0d0d] data-active:shadow-none"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Figma only specs subcategory content for the first tab — same
            placeholder row shown regardless of the active tab until the
            rest of the taxonomy exists. */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          {inspirationSubcategories.map((subcategory) => (
            <div key={subcategory.id} className="flex flex-col pr-4">
              <span className="text-sm font-medium text-[#0d0d0d]">{subcategory.label}</span>
              <span className="pt-0.5 text-[13px] text-[#4a4540]">Subcategory</span>
            </div>
          ))}
        </div>

        {/* Figma seam: InspirationSection pb-24px + Footer block pt-48px = 72px */}
        {/* Figma fixes this container at 268px tall regardless of content */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:mt-[72px] lg:min-h-[268px] lg:gap-8">
          {linkColumns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-[0.14px] text-[#2a2420]">{column.heading}</h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link} className="flex h-6 items-center">
                    <Link href="#" className="text-sm text-[#4a4540] hover:text-foreground">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={cn("mt-6 flex flex-wrap items-center gap-2.5 border-t border-[#e0e0e0] pt-3 text-sm text-[#424242] lg:mt-10 lg:pt-6")}>
          <span>&copy; {new Date().getFullYear()} Myjourny, Inc.</span>
          <Link href="#" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="#" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="#" className="hover:text-foreground">
            Your privacy choices
          </Link>
        </div>
      </div>
    </footer>
  );
}
