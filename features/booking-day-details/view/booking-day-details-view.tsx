import { CalendarPlus, Backpack, FileDown, MapPin, Phone } from "lucide-react";

import type { BookingDayDetails } from "../model/booking-day-details.types";

type Props = {
  details: BookingDayDetails;
  showMeeting: boolean;
  showDownloads: boolean;
};

const linkClass =
  "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-[#130404] hover:bg-[#F4F2EE]";

export function BookingDayDetailsView({ details, showMeeting, showDownloads }: Props) {
  if (!showMeeting && !showDownloads) return null;
  return (
    <>
      {showMeeting && (
        <section aria-labelledby="day-details-heading" className="mt-8 rounded-2xl border border-border p-6">
          <h2 id="day-details-heading" className="font-sans text-lg font-bold text-[#130404]">
            On the day
          </h2>
          <dl className="mt-4 flex flex-col gap-4 text-sm">
            {(details.meetingInstructions || details.mapsUrl) && (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#6F6B72]" aria-hidden />
                <div>
                  <dt className="font-medium text-[#130404]">Meeting point</dt>
                  {details.meetingInstructions && (
                    <dd className="mt-1 whitespace-pre-line text-[#130404]">{details.meetingInstructions}</dd>
                  )}
                  {details.meetingArea && <dd className="mt-1 text-[#6F6B72]">{details.meetingArea}</dd>}
                  {details.mapsUrl && (
                    <dd className="mt-2">
                      <a href={details.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand">
                        Get directions
                      </a>
                    </dd>
                  )}
                </div>
              </div>
            )}
            {details.whatToBring && (
              <div className="flex gap-3">
                <Backpack className="mt-0.5 size-4 shrink-0 text-[#6F6B72]" aria-hidden />
                <div>
                  <dt className="font-medium text-[#130404]">What to bring</dt>
                  <dd className="mt-1 whitespace-pre-line text-[#130404]">{details.whatToBring}</dd>
                </div>
              </div>
            )}
            {details.hostPhone && details.hostPhoneHref && (
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-[#6F6B72]" aria-hidden />
                <div>
                  <dt className="font-medium text-[#130404]">Your host</dt>
                  <dd className="mt-1">
                    <a href={details.hostPhoneHref} className="font-medium text-brand">
                      {details.hostPhone}
                    </a>
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </section>
      )}
      {showDownloads && (
        <div className="mt-6 flex flex-wrap gap-3">
          {details.calendarUrl && (
            <a href={details.calendarUrl} className={linkClass}>
              <CalendarPlus className="size-4" aria-hidden /> Add to calendar
            </a>
          )}
          {details.receiptUrl && (
            <a href={details.receiptUrl} className={linkClass}>
              <FileDown className="size-4" aria-hidden /> Download receipt
            </a>
          )}
        </div>
      )}
    </>
  );
}
