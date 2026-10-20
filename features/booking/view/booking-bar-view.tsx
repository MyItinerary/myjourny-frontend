/** Mobile bar pinned to the bottom of the listing. "Book now" opens the booking card as a bottom sheet
 * (owned by the page) rather than duplicating the form. */
export function BookingBarView({ priceFrom, onBookNow }: { priceFrom: string; onBookNow: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-[#E7E7E7] bg-white px-4 pt-3 pb-[34px] lg:hidden">
      <button type="button" onClick={onBookNow} className="flex cursor-pointer flex-col items-start gap-0.5 text-left">
        <span className="text-base leading-6 font-semibold text-[#333134]">from {priceFrom}</span>
        <span className="text-sm leading-5 text-[#6F6B72] underline">Choose a date and time</span>
      </button>
      <button type="button" onClick={onBookNow} className="cursor-pointer rounded-full bg-[#F5032D] px-4 py-3 text-base font-medium text-white hover:bg-[#d90328]">
        Book now
      </button>
    </div>
  );
}
