"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Compass } from "lucide-react";
import { useExperienceDetail } from "@/lib/queries/experiences";
import type { Booking } from "@/lib/queries/bookings";

const FALLBACK_TITLE = "Untitled experience";
const FALLBACK_DATE = "Date to be confirmed";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseUtcDate(datetimeStr?: string | null): Date | null {
  if (!datetimeStr) return null;
  // Datetimes from /bookings/me are UTC without a timezone suffix (e.g. "2026-09-26T10:00:00").
  // Parse them strictly as UTC by appending "Z" if no timezone suffix is present.
  const hasTimezone = /[Zz]|[+-]\d{2}(:\d{2})?$/.test(datetimeStr);
  const iso = hasTimezone ? datetimeStr : `${datetimeStr}Z`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function formatBookingDates(datetimeStr?: string | null): string {
  if (!datetimeStr) return FALLBACK_DATE;
  try {
    const d = parseUtcDate(datetimeStr);
    if (!d) return FALLBACK_DATE;

    const month = MONTH_NAMES[d.getUTCMonth()];
    const day = d.getUTCDate();
    const year = d.getUTCFullYear();

    const nth = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${month} ${day}${nth(day)}, ${year}`;
  } catch {
    return FALLBACK_DATE;
  }
}

export interface BookingCardItem {
  id: string;
  experience_id?: string | null;
  experience_title?: string | null;
  experience_cover_image_url?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  dateStr?: string | null;
  requested_datetime?: string | null;
  status?: string;
}

export function BookingCard({
  booking,
  fallbackTitle,
  fallbackImage,
  fallbackDate,
}: {
  booking?: Booking | BookingCardItem;
  fallbackTitle?: string;
  fallbackImage?: string;
  fallbackDate?: string;
}) {
  const [imageError, setImageError] = useState(false);

  // If experience_title is already provided on the booking (from /bookings/me),
  // skip fetching experience details to avoid redundant network requests.
  const hasDirectMetadata = Boolean(booking?.experience_title || (booking as BookingCardItem)?.title);
  const fallbackExperienceId = !hasDirectMetadata && booking?.experience_id ? booking.experience_id : "";
  const { data: experience } = useExperienceDetail(fallbackExperienceId);

  const title =
    booking?.experience_title ||
    (booking as BookingCardItem)?.title ||
    experience?.title ||
    fallbackTitle ||
    FALLBACK_TITLE;

  const imageUrl =
    (!imageError &&
      (booking?.experience_cover_image_url ||
        (booking as BookingCardItem)?.imageUrl ||
        experience?.cover_image_url ||
        experience?.images?.[0] ||
        fallbackImage)) ||
    null;

  const dateStr =
    (booking as BookingCardItem)?.dateStr ||
    formatBookingDates(booking?.requested_datetime) ||
    fallbackDate ||
    FALLBACK_DATE;

  const href =
    booking?.id && !booking.id.startsWith("demo-")
      ? `/bookings/${booking.id}`
      : booking?.experience_id
      ? `/experiences/${booking.experience_id}`
      : "#";

  return (
    <Link
      href={href}
      className="group flex flex-col cursor-pointer transition-transform duration-200"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-[#F4F2EE] border border-[#E0DFDD]/50 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Placeholder when cover image is null (e.g. experience deleted) */
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#F4F2EE] p-4 text-[#8C888F]">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#EAE8E3] text-[#6F6B72] transition-transform duration-300 group-hover:scale-105">
              <Compass className="size-6" />
            </div>
            <span className="mt-2 text-xs font-medium text-[#8C888F]">
              No photo preview
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col">
        <h3 className="font-heading text-[15px] sm:text-[16px] font-bold leading-[1.3] text-[#1E1E1E] line-clamp-2 group-hover:text-brand transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-[13px] font-normal text-[#8C888F]">
          {dateStr}
        </p>
      </div>
    </Link>
  );
}

