import Link from "next/link";

import { FilterChip } from "./filter-chip";

const FILTERS = ["Dates", "Time of day", "Duration", "Price", "Languages"];

// Figma: "Frame 2147226772" (2001:11989 desktop / 2001:12383 mobile) —
// breadcrumb (desktop only), heading, filter-chip row.
// `total` is an exact count from the backend; `count` is what's loaded so far
// (shown as "N+"). While loading, only the label is shown; the bracketed count
// appears once the data has arrived.
export function CategoryHeader({
  label,
  count,
  total,
  isLoading = false,
  isError = false,
  errorText = "(Failed to load)",
}: {
  label: string;
  count?: number;
  total?: number;
  isLoading?: boolean;
  isError?: boolean;
  errorText?: string;
}) {
  const countText = isLoading
    ? null
    : isError && (count === 0 || count === undefined)
      ? errorText
      : total !== undefined
        ? `(${total} ${total === 1 ? "result" : "results"})`
        : count === 0
          ? "(0 results)"
          : count !== undefined
            ? `(${count}+ results)`
            : "(50+ results)";

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
        {label}
        {countText && (
          <>
            {" "}
            <span className="text-muted-foreground">{countText}</span>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <FilterChip key={filter} label={filter} />
        ))}
      </div>
    </div>
  );
}
