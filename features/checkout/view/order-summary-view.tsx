"use client";

import { Ban, ChevronDown, Clock, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { OrderSummary } from "../view-model/use-checkout-view-model";

function Row({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex shrink-0 items-center rounded-md bg-[#F4F2EE] p-[7px]">
        <Icon className="size-[18px] text-[#6F6B72]" />
      </span>
      <div className="min-w-0 flex-1 font-sans text-base font-medium leading-6 text-[#333134]">{children}</div>
    </div>
  );
}

function Policy({ icon: Icon, title, note }: { icon: typeof Clock; title: string; note: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex shrink-0 items-center rounded-md bg-[#F4F2EE] p-[7px]">
        <Icon className="size-[18px] text-[#6F6B72]" />
      </span>
      <div className="flex flex-col gap-0.5 font-sans">
        <p className="text-lg font-medium leading-[27px] text-[#333134]">{title}</p>
        <p className="text-sm leading-[22px] text-[#6F6B72]">{note}</p>
      </div>
    </div>
  );
}

function Total({ summary }: { summary: OrderSummary }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-sans text-sm font-medium leading-[21px] text-[#00100C]">Total price</p>
      <p className="font-sans">
        <span className="text-[32px] font-medium leading-9 text-[#333134]">{summary.total} </span>
        <span className="text-base leading-6 text-[#6F6B72]">{summary.quantity}</span>
      </p>
      <p className="font-sans text-sm leading-[22px] text-[#FF5400]">Taxes and fees included</p>
    </div>
  );
}

function Details({ summary }: { summary: OrderSummary }) {
  return (
    <>
      <div className="flex items-start gap-4 px-4">
        <div className="relative h-[84px] w-[89px] shrink-0 overflow-hidden rounded-[3px] bg-muted shadow-[0_1px_3px_rgba(197,197,197,0.25)]">
          {summary.imageUrl && (
            <Image src={summary.imageUrl} alt="" fill sizes="89px" unoptimized className="object-cover" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-sans text-lg font-semibold leading-[27px] text-[#00100C]">{summary.title}</p>
          {summary.rating !== null && (
            <p className="flex items-center gap-1.5 font-sans text-sm leading-[22px] text-[#6F6B72]">
              <Star className="size-[22px] fill-[#F5032D] text-[#F5032D]" />
              {summary.rating.toFixed(1)}
            </p>
          )}
        </div>
      </div>

      <div className="mx-4 border-t border-[#EEEEEE]" />

      <div className="flex flex-col gap-4 px-4">
        <Row icon={Clock}>{summary.when}</Row>
        <Row icon={User}>{summary.guests}</Row>
        <Link
          href={summary.changeHref}
          className="self-start font-sans text-sm font-medium leading-[21px] text-[#F5032D] underline underline-offset-2"
        >
          Make changes to this booking
        </Link>
      </div>

      <div className="mx-4 border-t border-[#EEEEEE]" />

      <div className="flex flex-col gap-4 px-4">
        <Policy icon={Ban} title="Free cancellation" note="Up to 24 hours before, full refund" />
        <Policy icon={Clock} title={`Duration — ${summary.durationLabel}`} note="See time slots above" />
      </div>
    </>
  );
}

// Figma "Accordion": a card beside the form on desktop; on a phone it's a
// bar fixed to the bottom with the total, which opens up to the details.
export function OrderSummaryView({ summary, className }: { summary: OrderSummary; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "hidden w-full flex-col gap-4 rounded-lg border border-[#E7E7E7] bg-white pt-4 lg:flex",
          className,
        )}
      >
        <Details summary={summary} />
        <div className="rounded-b-lg bg-[#FAFAFA] p-4">
          <Total summary={summary} />
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        {open && (
          <button type="button" aria-label="Close order details" onClick={() => setOpen(false)} className="fixed inset-0 -z-10 bg-black/40" />
        )}
        <div className="flex max-h-[85vh] flex-col overflow-y-auto rounded-t-2xl bg-white">
          {open && (
            <div className="flex flex-col gap-4 pt-4 pb-4">
              <Details summary={summary} />
            </div>
          )}
          <div className="flex items-end justify-between gap-4 bg-[#FAFAFA] p-4">
            <Total summary={summary} />
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "Hide order details" : "Show order details"}
              onClick={() => setOpen((v) => !v)}
              className="mb-1 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#F4F2EE]"
            >
              <ChevronDown className={cn("size-5 text-[#6F6B72] transition-transform", !open && "rotate-180")} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
