"use client";

export interface EmptyResultsViewProps {
  hasActiveFilters: boolean;
  onClearAll: () => void;
  /** Where "get in touch" goes; there's no contact page yet. */
  contactHref?: string;
}

// Figma: "No results found" (2601:51139). The filter row stays above it, so
// people can also undo single filters there.
export function EmptyResultsView({ hasActiveFilters, onClearAll, contactHref = "#" }: EmptyResultsViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-[696px] flex-col items-center justify-center gap-5 px-2 py-10 text-center lg:py-14">
      <h2 className="font-heading text-[28px] leading-[1.2] font-extrabold text-[#130404]">No results found</h2>
      <p className="max-w-[573px] font-sans text-base text-[#6f6b72]">
        Try changing your filters, searching for something else or{" "}
        <a href={contactHref} className="text-brand underline underline-offset-2">
          get in touch
        </a>{" "}
        and we’ll help you find the perfect experience.
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex h-12 min-w-[134px] items-center justify-center rounded-full bg-brand px-4 font-sans text-base font-medium text-white transition-colors hover:bg-brand/90 active:scale-[0.97] cursor-pointer"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
