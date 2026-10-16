"use client";

import { Drawer } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { BookingDetail, HostBookingsViewModel } from "../view-model/use-host-bookings-view-model";
import { BookingAvatar, StatusChip } from "./host-booking-parts";

const CARD = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";
const NOTE_CARD = "rounded-2xl bg-[#FAF9F7] shadow-[inset_0_0_0_1px_#E9E1D2]";

function Detail({ detail, vm }: { detail: BookingDetail; vm: HostBookingsViewModel }) {
  const { booking } = detail;
  return (
    <div className="px-[26px] pt-6">
      <div className="mb-5 flex items-start gap-3.5">
        <BookingAvatar name={booking.name} url={booking.avatarUrl} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-[9px]">
            <Drawer.Title className="font-heading text-[21px] font-extrabold text-[#333134]">{booking.name}</Drawer.Title>
            <StatusChip status={detail.chip} label={booking.status} />
          </div>
          <Drawer.Description className="mt-[5px] text-[13px] text-[#6F6B72]">
            {booking.ref} · {booking.line} · {booking.money}
          </Drawer.Description>
        </div>
        <Drawer.Close
          aria-label="Close"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F0F0F0] text-[#333134]"
        >
          <X aria-hidden className="size-3.5" strokeWidth={2.2} />
        </Drawer.Close>
      </div>

      {booking.isRequest && (
        <div className="mb-[18px] rounded-2xl bg-[#FDF7EB] px-[18px] py-4 shadow-[inset_0_0_0_1px_#E9E1D2]">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-[#F5032D]" />
            <p className="text-[13.5px] font-medium text-[#333134]">{booking.deadline}</p>
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.55] text-[#6F6B72]">
            Answer inside 24 hours. Hosts who take longer drop down the list when guests search.
          </p>
          <div className="mt-3.5 flex gap-2">
            <button
              type="button"
              onClick={vm.onAccept}
              className="h-10 cursor-pointer rounded-full bg-[#F5032D] px-[18px] text-[13.5px] font-medium text-white hover:bg-[#FF4540]"
            >
              {detail.acceptLabel}
            </button>
            <button
              type="button"
              onClick={vm.onSayNo}
              className="h-10 cursor-pointer rounded-full bg-white px-4 text-[13.5px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]"
            >
              Say no
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {booking.facts.map((fact) => (
          <div key={fact.label} className="rounded-[14px] bg-white px-3.5 py-[13px] shadow-[inset_0_0_0_1px_#E7E7E7]">
            <p className="text-[11.5px] text-[#6F6B72]">{fact.label}</p>
            <p className="mt-[5px] text-[15px] font-medium text-[#333134]">{fact.value}</p>
          </div>
        ))}
      </div>

      <section className={cn(CARD, "mb-2.5 p-4")}>
        <h3 className="mb-2 text-[12.5px] font-medium text-[#333134]">Food and access notes</h3>
        <p className="text-[13px] leading-[1.6] text-pretty text-[#6F6B72]">{booking.notes}</p>
      </section>
      <section className={cn(NOTE_CARD, "mb-[18px] p-4")}>
        <h3 className="mb-2 text-[12.5px] font-medium text-[#333134]">Their phone number</h3>
        <p className="text-[13px] leading-[1.6] text-pretty text-[#6F6B72]">{booking.contact}</p>
      </section>

      {booking.tab === "Cancelled" && (
        <section className={cn(CARD, "mb-6 p-[18px]")}>
          <h3 className="mb-3.5 text-[13.5px] font-medium text-[#333134]">What happened, and where the money went</h3>
          <ol>
            {booking.timeline.map((step, i) => (
              <li key={step.title} className="flex gap-[13px]">
                <div className="flex w-3.5 shrink-0 flex-col items-center">
                  <span
                    aria-hidden
                    className={cn("mt-[5px] size-[9px] shrink-0 rounded-full", i === booking.timeline.length - 1 ? "bg-[#F5032D]" : "bg-[#D9D9D9]")}
                  />
                  {i < booking.timeline.length - 1 && <span aria-hidden className="mt-1 w-[1.5px] flex-1 bg-[#EBEBEB]" />}
                </div>
                <div className="min-w-0 pb-[18px]">
                  <p className="text-[13px] font-medium text-[#333134]">{step.title}</p>
                  <p className="mt-[3px] text-[12.5px] leading-[1.55] text-pretty text-[#6F6B72]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          {booking.cancelNote && (
            <p className={cn(NOTE_CARD, "p-3.5 text-[12.5px] leading-[1.6] text-pretty text-[#333134]")}>{booking.cancelNote}</p>
          )}
        </section>
      )}

      {detail.canCheckIn && (
        <div className="flex gap-[9px] pb-[26px]">
          <Link
            href={detail.scanHref}
            className="flex h-[42px] items-center gap-[7px] rounded-full bg-white px-4 text-[13px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] lg:hidden"
          >
            <svg aria-hidden width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
              <path d="M7.5 12h9" />
            </svg>
            <span>Scan their ticket</span>
          </Link>
          <button
            type="button"
            onClick={vm.onReportNoShow}
            className="h-[42px] cursor-pointer rounded-full bg-white px-4 text-[13px] font-medium text-[#F5032D] shadow-[inset_0_0_0_1px_#FACDD3]"
          >
            Report a no show
          </button>
        </div>
      )}
    </div>
  );
}

// Handoff "Listing Builder" prototype: one booking opened from the table, in a
// panel from the right.
export function BookingDetailView({ vm }: { vm: HostBookingsViewModel }) {
  return (
    <Drawer.Root open={vm.detail !== null} onOpenChange={(open) => !open && vm.onCloseDetail()} swipeDirection="right">
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-[#2C0101]/[0.22] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-40 flex justify-end">
          <Drawer.Popup className="h-full w-full max-w-[520px] overflow-y-auto bg-[#FCFCFC] shadow-[-12px_0_40px_rgba(16,24,40,0.12)] outline-none transition-transform duration-200 [transform:translateX(var(--drawer-swipe-movement-x,0px))] data-ending-style:[transform:translateX(100%)] data-starting-style:[transform:translateX(100%)]">
            {vm.detail && <Detail detail={vm.detail} vm={vm} />}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
