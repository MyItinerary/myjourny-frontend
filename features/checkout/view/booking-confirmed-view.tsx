"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { OnboardingLogo } from "@/components/onboarding/onboarding-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { BookingConfirmation } from "../model/booking-confirmation.types";

function Card({ confirmation, className }: { confirmation: BookingConfirmation; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-[17px] rounded-[17px] border border-[#E6E6E6] bg-white p-6", className)}>
      <div className="relative h-[309px] w-full overflow-hidden rounded-3xl bg-muted">
        {confirmation.imageUrl && (
          <Image src={confirmation.imageUrl} alt="" fill sizes="503px" unoptimized className="object-cover" />
        )}
      </div>
      <div className="flex flex-col gap-[18px] font-sans">
        <div className="flex flex-col gap-1.5">
          <p className="text-2xl font-medium leading-[39px] text-[#333134]">{confirmation.title}</p>
          <p className="text-[23px] leading-[35px] text-[#6F6B72]">{confirmation.dateLabel}</p>
        </div>
        <div>
          <p className="text-[23px] leading-[35px] text-[#6F6B72]">{confirmation.guestsLabel}</p>
          {confirmation.totalLabel && (
            <p className="text-[32px] font-medium leading-[44px] text-[#333134]">{confirmation.totalLabel} total</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Figma "Desktop - 11" / "Desktop - 12": shown once the payment is confirmed.
// The design's empty white square above the heading is a placeholder with no
// artwork, so it isn't drawn. On a phone the booking sits in a bar at the bottom.
export function BookingConfirmedView({ confirmation }: { confirmation: BookingConfirmation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[rgba(244,242,238,0.87)] to-white pb-36 lg:pb-0">
      <div className="flex justify-center pt-10 lg:pt-[86px]">
        <OnboardingLogo />
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[1000px] flex-col gap-10 px-6 lg:mt-[79px] lg:flex-row lg:items-start lg:justify-center lg:gap-[62px] lg:px-0">
        <Card confirmation={confirmation} className="hidden w-[503px] shrink-0 lg:flex" />

        <div className="flex flex-col gap-6 lg:w-[428px] lg:pt-0">
          <h1 className="font-sans text-[40px] font-extrabold leading-[1.2] text-[#333134] lg:text-5xl">You&rsquo;re going!</h1>
          <p className="-mt-2 font-sans text-xl leading-[30px] text-[#6F6B72]">
            We hope you have a great time! We&rsquo;ve sent you a confirmation mail for this booking
          </p>
          <div className="flex gap-4">
            <Button size="cta" className="flex-1" render={<Link href={confirmation.viewHref} />}>
              View booking
            </Button>
            {confirmation.calendarHref && (
              <Button
                size="cta"
                variant="outline"
                className="flex-1 border-[#2C0101] bg-transparent text-[#2C0101] hover:bg-[#2C0101]/5"
                render={<a href={confirmation.calendarHref} target="_blank" rel="noreferrer" />}
              >
                Add to calendar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        {open && <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="fixed inset-0 -z-10 bg-black/40" />}
        <div className="rounded-t-2xl border-t border-[#E6E6E6] bg-white">
          {open && <Card confirmation={confirmation} className="m-4 border-0 p-0" />}
          <div className="flex items-center gap-3 p-4">
            <div className="relative size-[60px] shrink-0 overflow-hidden rounded-lg bg-muted">
              {confirmation.imageUrl && (
                <Image src={confirmation.imageUrl} alt="" fill sizes="60px" unoptimized className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1 font-sans">
              <p className="text-sm text-[#333134]">{confirmation.guestsLabel}</p>
              {confirmation.totalLabel && (
                <p className="text-2xl font-medium leading-8 text-[#333134]">{confirmation.totalLabel}</p>
              )}
              <p className="text-sm text-[#6F6B72]">{confirmation.dateLabel}</p>
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "Hide booking" : "Show booking"}
              onClick={() => setOpen((v) => !v)}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#F4F2EE]"
            >
              <ChevronDown className={cn("size-5 text-[#6F6B72] transition-transform", !open && "rotate-180")} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
