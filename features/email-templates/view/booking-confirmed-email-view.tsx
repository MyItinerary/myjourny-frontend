import Image from "next/image";

import {
  EMAIL_HERO_2_SRC,
  EMAIL_LOGO_SRC,
  type BookingConfirmedEmailData,
} from "../model/email-templates.types";
import { EmailTemplateShellView } from "./email-template-shell-view";
import { VerifiedCheckIcon } from "./social-icons-view";

export interface BookingConfirmedEmailViewProps {
  data: BookingConfirmedEmailData;
  className?: string;
  maxWidthClass?: string;
}

export function BookingConfirmedEmailView({
  data,
  className,
  maxWidthClass,
}: BookingConfirmedEmailViewProps) {
  return (
    <EmailTemplateShellView
      heroImageSrc={EMAIL_HERO_2_SRC}
      logoSrc={EMAIL_LOGO_SRC}
      eyebrow={data.eyebrow}
      title={data.title}
      subtitle={data.subtitle}
      signOffPrefix={data.signOffPrefix}
      signOffTeam={data.signOffTeam}
      footerNotice={data.footerNotice}
      footerHelpEmail={data.helpEmail}
      footerCopyright={data.copyright}
      className={className}
      maxWidthClass={maxWidthClass}
    >
      {/* 2x2 Info Grid for Date, Time, Guests, Confirmation */}
      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[#F8F7F5] p-4.5 sm:gap-5 sm:p-5">
        <div>
          <p className="font-sans text-xs text-[#6F6B72]">Date</p>
          <p className="mt-0.5 font-sans text-sm font-bold text-[#130404] sm:text-base">
            {data.date}
          </p>
        </div>
        <div>
          <p className="font-sans text-xs text-[#6F6B72]">Time</p>
          <p className="mt-0.5 font-sans text-sm font-bold text-[#130404] sm:text-base">
            {data.time}
          </p>
        </div>
        <div>
          <p className="font-sans text-xs text-[#6F6B72]">Guests</p>
          <p className="mt-0.5 font-sans text-sm font-bold text-[#130404] sm:text-base">
            {data.guestsCount}
          </p>
        </div>
        <div>
          <p className="font-sans text-xs text-[#6F6B72]">Confirmation</p>
          <p className="mt-0.5 font-sans text-sm font-bold tracking-wider text-[#130404] sm:text-base">
            {data.confirmationCode}
          </p>
        </div>
      </div>

      {/* Primary Action Button & Calendar Link */}
      <div className="pt-2 text-center">
        <a
          href={data.ticketUrl}
          className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#F5032D] px-8 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d90328] active:scale-[0.99]"
        >
          View my ticket
        </a>

        {data.calendarUrl && (
          <div className="mt-2.5">
            <a
              href={data.calendarUrl}
              className="inline-flex items-center gap-1 font-sans text-xs font-medium text-[#6F6B72] hover:text-[#130404]"
            >
              <span>+</span> Add to calendar
            </a>
          </div>
        )}
      </div>

      {/* Host Row */}
      <div className="flex items-center gap-3 border-t border-[#F4F2EE] pt-4">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-[#E0DFDD]">
          <Image
            src={data.host.avatarUrl}
            alt={data.host.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="flex items-center gap-1.5 font-sans text-sm font-medium text-[#130404]">
          <span>Hosted by {data.host.name}</span>
          {data.host.isVerified && <VerifiedCheckIcon />}
        </div>
      </div>

      {/* What's Included */}
      <div>
        <h2 className="mb-2 font-sans text-sm font-bold text-[#130404]">What&apos;s included</h2>
        <ul className="space-y-1 font-sans text-xs text-[#6F6B72] sm:text-[13px]">
          {data.includedItems.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-[#333134]">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Free Cancellation Notice Box */}
      <div className="rounded-xl bg-[#F4F2EE] px-4 py-3 font-sans text-xs text-[#333134]">
        Free to cancel until{" "}
        <strong className="font-semibold text-[#130404]">{data.cancelUntilText}</strong>.{" "}
        <a
          href={data.manageBookingUrl}
          className="font-semibold text-[#801414] underline hover:text-[#2C0101]"
        >
          Manage booking
        </a>
      </div>

      {/* Explorer Joining Note */}
      <p className="font-sans text-xs leading-relaxed text-[#6F6B72]">
        {data.explorerCountNote}
      </p>
    </EmailTemplateShellView>
  );
}
