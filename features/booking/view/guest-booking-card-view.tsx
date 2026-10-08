import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shown instead of the booking form for guests: quotes and checkout need an
// account, so the panel just shows the price and sends them to log in,
// coming back here afterwards.
export function GuestBookingCardView({
  priceFrom,
  loginHref,
  className,
}: {
  /** "₦5,000.00", or null when there are no ticket types. */
  priceFrom: string | null;
  loginHref: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 rounded-2xl border border-border bg-card p-6", className)}>
      {priceFrom !== null && (
        <p className="flex items-baseline gap-1">
          <span className="font-sans text-base font-normal text-[#6F6B72]">from</span>
          <span className="font-sans text-[32px] font-extrabold leading-[1.2] text-[#130404]">{priceFrom}</span>
        </p>
      )}
      <Button size="cta" className="w-full" render={<Link href={loginHref} />}>
        Log in to book
      </Button>
      <p className="text-center text-sm text-[#6F6B72]">
        You&apos;ll see the host and exact meeting point once you&apos;re signed in.
      </p>
    </div>
  );
}
