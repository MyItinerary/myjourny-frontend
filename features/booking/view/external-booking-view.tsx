import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  /** The host's booking page, already checked to be http(s); itin only sends it to signed-in users. */
  url: string | null;
  signedIn: boolean;
  /** Where a guest logs in to get the link. */
  loginHref: string;
  className?: string;
};

/** In place of the booking card for a listing that books on the host's own
 * site: MyJourny doesn't take the payment, so there is nothing to hold. */
export function ExternalBookingView({ url, signedIn, loginHref, className }: Props) {
  return (
    <aside className={cn("flex flex-col gap-3 rounded-[24px] border border-[#E7E7E7] bg-white p-6", className)}>
      <h2 className="font-sans text-lg font-semibold text-[#333134]">Booked on the host&apos;s site</h2>
      <p className="text-sm leading-[22px] text-[#6F6B72]">
        The host takes bookings and payment for this experience on their own site, so its dates, prices and
        cancellation terms are set there.
      </p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#F5032D] px-4 text-base font-medium text-white hover:bg-[#d90328]"
        >
          Book on the host&apos;s site
          <ExternalLink aria-hidden className="size-4" />
        </a>
      ) : signedIn ? (
        <p className="text-sm font-medium text-[#333134]">The host hasn&apos;t shared a booking link yet.</p>
      ) : (
        <Link
          href={loginHref}
          className="flex h-12 items-center justify-center rounded-full border border-[#E0DFDD] px-4 text-base font-medium text-[#333134] hover:bg-[#F4F2EE]"
        >
          Log in to see the booking link
        </Link>
      )}
    </aside>
  );
}
