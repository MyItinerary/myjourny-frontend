import { Button } from "@/components/ui/button";

/** Mobile sticky summary bar. "Book now" opens the full booking panel as a
 * bottom sheet (owned by the page) rather than duplicating the form. */
export function BookingBarView({
  priceFrom,
  onBookNow,
  note = "Free cancellation valid for 24hrs",
  actionLabel = "Book now",
}: {
  priceFrom: string;
  onBookNow: () => void;
  /** The line under the price. */
  note?: string;
  actionLabel?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border bg-card px-6 py-4 lg:hidden">
      <div>
        <p className="text-sm font-semibold text-foreground">from {priceFrom}</p>
        <p className="text-xs text-brand">{note}</p>
      </div>
      <Button size="cta" onClick={onBookNow}>
        {actionLabel}
      </Button>
    </div>
  );
}
