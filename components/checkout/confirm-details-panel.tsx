"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Clock, User, ChevronDown, Lock, Info, Ban } from "lucide-react";
import { StarIcon } from "@/components/icons/shared-icons";
import { cn } from "@/lib/utils";

export interface BookingDetailsData {
  experienceTitle?: string;
  thumbnailUrl?: string;
  rating?: number;
  reviewCount?: number;
  departureNote?: string;
  departureTimeAndDate?: string;
  guestsCount?: number;
  guestLabel?: string;
  cancellationPolicyTitle?: string;
  cancellationPolicySubtitle?: string;
  durationLabel?: string;
  durationSubtitle?: string;
  pricePerUnit?: number;
  currencySymbol?: string;
  currencyCode?: string;
}

const defaultBookingData: BookingDetailsData = {
  experienceTitle: "Kayaking in Victoria island, Paint and Sip & Two meals",
  thumbnailUrl: "/images/home/experiences/kayaking.jpg",
  rating: 4.0,
  reviewCount: 1806,
  departureNote: "7:30 AM Departure from Victoria Island, drop off not available for this trip",
  departureTimeAndDate: "Tuesday, September 12 2026. Starts at 7:30 AM, Duration 2.5 hours",
  guestsCount: 1,
  guestLabel: "1 guest",
  cancellationPolicyTitle: "Free cancellation",
  cancellationPolicySubtitle: "Up to 24 hours before, full refund",
  durationLabel: "Duration — 2.5 hrs",
  durationSubtitle: "See time slots above",
  pricePerUnit: 16000,
  currencySymbol: "₦",
  currencyCode: "NGN",
};

/**
 * Green checkmark SVG according to user specification:
 * stroke-width: 2px; stroke: #0CBA65; width: 13.333px; height: 9.167px;
 */
function ValidatedCheckmark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      className="h-[9.167px] w-[13.333px] shrink-0"
      aria-label="Valid field"
    >
      <path
        d="M14.3333 1L5.16667 10.1667L1 6"
        stroke="#0CBA65"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ConfirmDetailsPanel({
  booking = defaultBookingData,
  onConfirm,
}: {
  booking?: BookingDetailsData;
  onConfirm?: (details: { email: string; phone: string; note: string }) => void;
}) {
  const [email, setEmail] = useState("Juliet@gmail.com");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Validate email format
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPhoneValid = phone.trim().length >= 7;
  const isFormReady = isEmailValid && isPhoneValid;

  const handleConfirm = () => {
    if (!isFormReady || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmed(true);
      onConfirm?.({ email, phone: `${countryCode}${phone}`, note });
    }, 800);
  };

  return (
    <div className="w-full bg-white text-[#333134]">
      {/* Top Navbar / Logo Row */}
      <header className="mx-auto flex w-full max-w-[1240px] items-center px-4 py-6 sm:px-8">
        <Link href="/" aria-label="MyJourny home" className="flex items-center">
          <Image
            src="/logo/myjourny-logo.svg"
            alt="MyJourny"
            width={167}
            height={29}
            priority
            style={{ width: "auto" }}
            className="h-[26px] w-auto lg:h-[29px]"
          />
        </Link>
      </header>

      {/* Main Two-Column Layout */}
      <main className="mx-auto max-w-[1240px] px-4 pt-2 pb-16 sm:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Form Details */}
          <div className="flex flex-col lg:col-span-7">
            {/* Header: 'Confirm your details and pay' */}
            <h1
              className="font-heading text-[#333134]"
              style={{
                fontFamily: '"TikTok Sans 18pt", var(--font-heading), sans-serif',
                fontSize: "32px",
                fontStyle: "normal",
                fontWeight: 800,
                lineHeight: "120%", // 38.4px
              }}
            >
              Confirm your details and pay
            </h1>

            {confirmed ? (
              <div className="mt-8 rounded-[24px] border border-[#0CBA65]/30 bg-[#F4F9F6] p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#0CBA65]/20">
                  <ValidatedCheckmark />
                </div>
                <h3 className="mt-3 text-lg font-bold text-[#130404]">Details Confirmed!</h3>
                <p className="mt-1 text-sm text-[#6F6B72]">
                  We&apos;re preparing your booking for {email}. You will receive confirmation details shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmed(false)}
                  className="mt-4 text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  Edit details
                </button>
              </div>
            ) : (
              <div className="mt-7 flex flex-col gap-6">
                {/* 1. Email Address Field */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="checkout-email"
                    style={{
                      color: "#333134",
                      fontFamily: '"TikTok Sans", var(--font-sans), sans-serif',
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "24px",
                    }}
                  >
                    Email address
                  </label>
                  <div
                    style={{
                      borderRadius: "200px",
                      background: "#F4F2EE",
                      display: "flex",
                      padding: "12px 16px",
                      alignItems: "center",
                      gap: "10px",
                      alignSelf: "stretch",
                    }}
                  >
                    <input
                      id="checkout-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-base text-[#333134] placeholder:text-[#8C888F] outline-none"
                    />
                    {isEmailValid && <ValidatedCheckmark />}
                  </div>
                </div>

                {/* 2. Phone Number Field */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="checkout-phone"
                    style={{
                      color: "#333134",
                      fontFamily: '"TikTok Sans", var(--font-sans), sans-serif',
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "24px",
                    }}
                  >
                    Phone number
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Country Code Pill */}
                    <div className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#F4F2EE] px-4 py-3 text-sm font-medium text-[#333134] shadow-xs cursor-pointer select-none">
                      {/* Nigeria Flag */}
                      <span className="flex items-center text-base leading-none">🇳🇬</span>
                      <span className="font-sans text-sm font-medium text-[#333134]">{countryCode}</span>
                      <ChevronDown className="size-4 text-[#6F6B72]" />
                    </div>

                    {/* Phone Input Pill */}
                    <div
                      style={{
                        borderRadius: "200px",
                        background: "#F4F2EE",
                        display: "flex",
                        padding: "12px 16px",
                        alignItems: "center",
                        gap: "10px",
                        flex: 1,
                      }}
                    >
                      <input
                        id="checkout-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-base text-[#333134] placeholder:text-[#8C888F] outline-none"
                      />
                      {isPhoneValid && <ValidatedCheckmark />}
                    </div>
                  </div>

                  {/* Helper Text with Info Icon */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Info className="size-3.5 shrink-0 text-[#6F6B72]" />
                    <span className="font-sans text-xs text-[#6F6B72]">
                      We&apos;ll only contact you with essential updates or changes to your booking
                    </span>
                  </div>
                </div>

                {/* 3. Leave a Note for the Guide */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="checkout-note"
                    style={{
                      color: "#333134",
                      fontFamily: '"TikTok Sans", var(--font-sans), sans-serif',
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "24px",
                    }}
                  >
                    Leave a note for the guide
                  </label>
                  <textarea
                    id="checkout-note"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Anything you'd need to make your experience easy or memorable?"
                    className="w-full rounded-[20px] border-0 bg-[#F4F2EE] p-4 font-sans text-sm text-[#333134] placeholder:text-[#8C888F] outline-none transition-all focus:ring-1 focus:ring-brand/30 resize-none"
                  />
                </div>

                {/* 4. Payment Secured by Paystack Banner */}
                <div className="flex items-start gap-3.5 rounded-[20px] bg-[#F4F2EE] p-4.5 sm:items-center">
                  <div className="flex size-7 shrink-0 items-center justify-center pt-0.5 sm:pt-0">
                    <Lock className="size-5 text-[#6F6B72]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-[15px] font-semibold text-[#130404]">
                      Payment secured by Paystack
                    </span>
                    <span className="font-sans text-xs text-[#6F6B72] mt-0.5">
                      Payment methods like card, bank transfer, USSD and Pay with Zap all available
                    </span>
                  </div>
                </div>

                {/* 5. Terms and Privacy Agreement */}
                <p className="font-sans text-xs text-[#6F6B72] sm:text-[13px]">
                  By confirming you agree to our{" "}
                  <Link href="#" className="font-medium text-brand hover:underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="font-medium text-brand hover:underline">
                    privacy policy
                  </Link>
                </p>

                {/* 6. CTA Button: 'Confirm and pay' */}
                <button
                  type="button"
                  disabled={!isFormReady || isSubmitting}
                  onClick={handleConfirm}
                  className={cn(
                    "w-full rounded-full py-4 text-center font-sans text-base font-semibold transition-all",
                    isFormReady
                      ? "bg-brand text-white shadow-sm hover:bg-[#d90328] active:scale-[0.99] cursor-pointer"
                      : "bg-[#E0DFDD] text-[#8C888F] cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? "Processing…" : "Confirm and pay"}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Booking Summary Card */}
          <div className="lg:col-span-5">
            <div className="rounded-[24px] border border-[#E0DFDD] bg-white p-6 shadow-xs">
              {/* Experience Thumbnail & Title */}
              <div className="flex items-start gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-[14px] bg-[#F4F2EE] sm:size-18">
                  <Image
                    src={booking.thumbnailUrl || "/images/home/experiences/kayaking.jpg"}
                    alt={booking.experienceTitle || "Experience"}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="font-sans text-[15px] font-semibold leading-snug text-[#130404]">
                    {booking.experienceTitle}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-1.5 font-sans text-xs text-[#6F6B72]">
                    <span className="flex items-center text-brand">
                      <StarIcon className="size-3.5 fill-brand stroke-brand" />
                    </span>
                    <span className="font-medium text-[#130404]">{booking.rating?.toFixed(1)}</span>
                    <span>({booking.reviewCount?.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 h-px w-full bg-[#E0DFDD]" />

              {/* Trip Details List */}
              <div className="flex flex-col gap-3.5">
                {/* Departure Details */}
                <div className="flex items-start gap-3">
                  <Ban className="size-4 shrink-0 text-[#6F6B72] mt-0.5" />
                  <span className="font-sans text-[13px] leading-relaxed text-[#333134]">
                    {booking.departureNote}
                  </span>
                </div>

                {/* Time & Duration */}
                <div className="flex items-start gap-3">
                  <Clock className="size-4 shrink-0 text-[#6F6B72] mt-0.5" />
                  <span className="font-sans text-[13px] leading-relaxed text-[#333134]">
                    {booking.departureTimeAndDate}
                  </span>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-3">
                  <User className="size-4 shrink-0 text-[#6F6B72]" />
                  <span className="font-sans text-[13px] text-[#333134]">
                    {booking.guestLabel}
                  </span>
                </div>

                {/* Make Changes Link */}
                <button
                  type="button"
                  onClick={() => alert("Make changes clicked")}
                  className="mt-1 self-start font-sans text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  Make changes to this booking
                </button>
              </div>

              {/* Divider */}
              <div className="my-5 h-px w-full bg-[#E0DFDD]" />

              {/* Guarantees & Cancellation Policy */}
              <div className="flex flex-col gap-4">
                {/* Cancellation */}
                <div className="flex items-start gap-3">
                  <Ban className="size-4 shrink-0 text-[#6F6B72] mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-semibold text-[#130404]">
                      {booking.cancellationPolicyTitle}
                    </span>
                    <span className="font-sans text-xs text-[#6F6B72]">
                      {booking.cancellationPolicySubtitle}
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start gap-3">
                  <Clock className="size-4 shrink-0 text-[#6F6B72] mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-semibold text-[#130404]">
                      {booking.durationLabel}
                    </span>
                    <span className="font-sans text-xs text-[#6F6B72]">
                      {booking.durationSubtitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 h-px w-full bg-[#E0DFDD]" />

              {/* Total Price Section */}
              <div className="flex flex-col">
                <span className="font-sans text-xs font-medium text-[#6F6B72]">Total price</span>
                <div className="mt-1 flex items-baseline">
                  <span className="font-sans text-[26px] font-bold text-[#130404] tracking-tight">
                    {booking.currencySymbol}
                    {booking.pricePerUnit?.toLocaleString()}
                  </span>
                  <span className="ml-1.5 font-sans text-sm text-[#6F6B72]">
                    x {booking.guestsCount} Adult
                  </span>
                </div>
                <span className="mt-1 font-sans text-xs font-medium text-[#F25C05]">
                  Taxes and fees included
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
