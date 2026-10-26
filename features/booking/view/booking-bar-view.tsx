import { Button } from "@/components/ui/button";

/** Mobile sticky summary bar. "Book now" opens the full booking panel as a
 * bottom sheet (owned by the page) rather than duplicating the form. */
export function BookingBarView({ priceLabel, onBookNow }: { priceLabel: string | null; onBookNow: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border bg-card px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden">
      <div>
        {priceLabel && <p className="text-sm font-semibold text-foreground">{priceLabel}</p>}
        <p className="text-xs text-brand">Free cancellation valid for 24hrs</p>
      </div>
      <Button size="cta" onClick={onBookNow}>
        Book now
      </Button>
    </div>
  );
}
