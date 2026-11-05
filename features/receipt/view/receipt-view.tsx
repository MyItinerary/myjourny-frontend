"use client";

import { CalendarDays, Check, Download, MapPin, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { ReceiptViewModel } from "../view-model/use-receipt-view-model";
import { ReceiptSkeleton } from "./receipt-skeleton";

export function ReceiptView({
  receipt,
  isLoading,
  isError,
  errorStatus,
  bookingId,
  isDownloading,
  refetch,
  onDownloadPdf,
}: ReceiptViewModel) {
  if (isLoading) {
    return <ReceiptSkeleton />;
  }

  if (isError || !receipt) {
    if (errorStatus === 401 || errorStatus === 403) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h2 className="font-sans text-2xl font-bold text-[#130404]">Sign in to view receipt</h2>
          <p className="mt-2 font-sans text-sm text-[#6F6B72]">
            You must be signed in with the account that placed this booking to see its receipt.
          </p>
          <div className="mt-6">
            <Link
              href={`/login?next=${encodeURIComponent(bookingId ? `/receipts/${bookingId}` : "/my-experiences")}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#130404] px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#2A0808]"
            >
              Sign in
            </Link>
          </div>
        </div>
      );
    }

    if (errorStatus === 404) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h2 className="font-sans text-2xl font-bold text-[#130404]">Receipt not found</h2>
          <p className="mt-2 font-sans text-sm text-[#6F6B72]">
            We could not find a confirmed booking or receipt for this identifier.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#130404] px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#2A0808]"
            >
              Back to home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h2 className="font-sans text-2xl font-bold text-[#130404]">Couldn&apos;t load receipt</h2>
        <p className="mt-2 font-sans text-sm text-[#6F6B72]">
          A network or server error occurred while retrieving this receipt.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={refetch}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#130404] px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#2A0808] cursor-pointer"
          >
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#130404] sm:text-4xl lg:text-5xl">
        Receipt
      </h1>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Receipt Card */}
        <div className="rounded-[28px] border border-[#EBEBEB] bg-white p-6 shadow-xs sm:p-8 lg:col-span-7">
          <div className="text-center">
            <div className="flex justify-center">
              {receipt.status === "paid" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F7F0] px-3.5 py-1 font-sans text-xs font-semibold text-[#02A078]">
                  <Check className="size-3.5 stroke-[3]" />
                  Paid
                </span>
              ) : receipt.status === "refunded" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F4F5] px-3.5 py-1 font-sans text-xs font-semibold text-[#71717A]">
                  Refunded
                </span>
              ) : receipt.status === "unpaid" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-3.5 py-1 font-sans text-xs font-semibold text-[#DC2626]">
                  Unpaid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] px-3.5 py-1 font-sans text-xs font-semibold text-[#B45309]">
                  Payment pending
                </span>
              )}
            </div>
            <h2 className="mt-3 font-sans text-4xl font-extrabold tracking-tight text-[#130404] sm:text-5xl">
              {receipt.totalPriceFormatted}
            </h2>
            {receipt.paidAtFormatted && (
              <p className="mt-2 font-sans text-xs text-[#6F6B72] sm:text-sm">
                {receipt.paidAtFormatted}
              </p>
            )}
          </div>

          <hr className="my-6 border-[#EBEBEB] sm:my-8" />

          {/* Experience Item */}
          <div className="flex items-center gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-[#EBEBEB] sm:size-20">
              {receipt.experienceImageUrl ? (
                <Image
                  src={receipt.experienceImageUrl}
                  alt={receipt.experienceTitle}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-[#EBEBEB] text-[#6F6B72]">
                  <span className="size-8 rounded-lg bg-[#FAF9F7]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-sans text-base font-bold text-[#130404] sm:text-lg">
                {receipt.experienceTitle}
              </h3>
              {receipt.experienceLocation && (
                <p className="mt-0.5 font-sans text-xs text-[#6F6B72] sm:text-sm">
                  {receipt.experienceLocation}
                </p>
              )}
            </div>
          </div>

          <hr className="my-5 border-[#EBEBEB]" />

          {/* Date & Time Row */}
          <div className="flex items-center gap-3 text-[#333134]">
            <CalendarDays className="size-5 shrink-0 text-[#6F6B72]" />
            <span className="font-sans text-xs font-medium text-[#333134] sm:text-sm">
              {receipt.sessionDateTimeFormatted}
            </span>
          </div>

          {/* Location Row (if available) */}
          {receipt.meetingLocation && (
            <div className="mt-4 flex items-center gap-3 text-[#333134]">
              <MapPin className="size-5 shrink-0 text-[#6F6B72]" />
              <span className="font-sans text-xs font-medium text-[#333134] sm:text-sm">
                {receipt.meetingLocation}
              </span>
            </div>
          )}

          {/* Total Price Section */}
          <div className="mt-8 border-t border-[#EBEBEB] pt-6">
            <p className="font-sans text-xs font-medium text-[#6F6B72]">Total price</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-sans text-2xl font-extrabold text-[#130404] sm:text-3xl">
                {receipt.totalPriceFormatted}
              </span>
              {receipt.partySizeLabel && (
                <span className="font-sans text-xs text-[#6F6B72] sm:text-sm">
                  x {receipt.partySizeLabel}
                </span>
              )}
            </div>
            {receipt.taxesAndFeesNote && (
              <p className="mt-1.5 font-sans text-xs font-medium text-[#F5032D]">
                {receipt.taxesAndFeesNote}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Order Details */}
        <div className="flex flex-col lg:col-span-5">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#F5032D] px-6 font-sans text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#D40226] disabled:opacity-70 sm:h-13"
          >
            <Download className="size-4 stroke-[2.5]" />
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>

          {(receipt.orderNumber || receipt.paymentReference || receipt.billedTo) && (
            <div className="mt-8 sm:mt-10">
              <h3 className="font-sans text-base font-bold text-[#130404] sm:text-lg">
                Order details
              </h3>
              <div className="mt-4 divide-y divide-[#EBEBEB]">
                {receipt.orderNumber && (
                  <div className="flex items-center justify-between py-3.5 text-xs sm:text-sm">
                    <span className="font-sans text-[#6F6B72]">Order number</span>
                    <span className="font-sans font-bold text-[#130404]">{receipt.orderNumber}</span>
                  </div>
                )}
                {receipt.paymentReference && (
                  <div className="flex items-center justify-between py-3.5 text-xs sm:text-sm">
                    <span className="font-sans text-[#6F6B72]">Payment reference</span>
                    <span className="font-sans font-bold text-[#130404]">
                      {receipt.paymentReference}
                    </span>
                  </div>
                )}
                {receipt.billedTo && (
                  <div className="flex items-center justify-between py-3.5 text-xs sm:text-sm">
                    <span className="font-sans text-[#6F6B72]">Billed to</span>
                    <span className="font-sans font-bold text-[#130404]">{receipt.billedTo}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
