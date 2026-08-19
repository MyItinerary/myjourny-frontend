import Link from "next/link";

import { FilterChip } from "@/components/categories/filter-chip";

const FILTERS = ["Dates", "Time of day", "Duration", "Price", "Languages"];

// Figma: "Frame 2147226772" (2001:11989 desktop / 2001:12383 mobile) —
// breadcrumb (desktop only), heading, filter-chip row.
export function CategoryHeader({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-4 lg:gap-[18px]">
      <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 lg:flex">
        <Link href="/" className="text-base font-medium text-brand">
          Home page
        </Link>
        <span aria-hidden className="text-base text-foreground">
          /
        </span>
        <span className="text-base font-medium text-foreground">{label}</span>
      </nav>

      <p className="font-heading text-[32px] leading-[1.2] font-extrabold text-foreground lg:text-[40px]">
        {label} <span className="text-muted-foreground">(50+ results)</span>
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((filter) => (
          <FilterChip key={filter} label={filter} />
        ))}
      </div>
    </div>
  );
}
