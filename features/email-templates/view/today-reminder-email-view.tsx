import Image from "next/image";

import {
  EMAIL_HERO_2_SRC,
  EMAIL_LOGO_SRC,
  type TodayReminderEmailData,
} from "../model/email-templates.types";
import { EmailTemplateShellView } from "./email-template-shell-view";
import { VerifiedCheckIcon } from "./social-icons-view";

export interface TodayReminderEmailViewProps {
  data: TodayReminderEmailData;
  className?: string;
  maxWidthClass?: string;
}

export function TodayReminderEmailView({
  data,
  className,
  maxWidthClass,
}: TodayReminderEmailViewProps) {
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
      {/* Highlight Box with Meeting Point, Time & Instructions */}
      <div className="space-y-1.5 rounded-xl border border-[#E0DFDD]/70 bg-[#F8F7F5] p-4 font-sans text-xs text-[#333134] sm:text-[13px]">
        <p className="font-bold text-[#130404]">{data.timeAndDuration}</p>
        <p>{data.meetingPoint}</p>
        <p>
          <span>{data.contactNote}</span>
          <span className="font-semibold text-[#E04F16]">{data.contactPhone}</span>
        </p>
        <p className="pt-0.5 text-[#6F6B72]">{data.bringNote}</p>
      </div>

      {/* Check-in Code Card */}
      <div className="flex items-center justify-between rounded-xl border border-[#E0DFDD] bg-white px-4.5 py-3.5 shadow-xs">
        <span className="font-sans text-xs text-[#6F6B72] sm:text-sm">Check-in code</span>
        <span className="font-sans text-base font-extrabold tracking-wider text-[#130404]">
          {data.checkInCode}
        </span>
      </div>

      {/* Primary Action Button */}
      <div className="pt-1 text-center">
        <a
          href={data.directionsUrl}
          className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#F5032D] px-8 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d90328] active:scale-[0.99]"
        >
          Directions and check-in
        </a>
      </div>

      {/* Map Preview Graphic */}
      <div className="overflow-hidden rounded-2xl border border-[#E0DFDD] bg-[#F7F5F0]">
        <div className="relative flex h-[140px] w-full items-center justify-center bg-[linear-gradient(to_right,#E7E5E0_1px,transparent_1px),linear-gradient(to_bottom,#E7E5E0_1px,transparent_1px)] bg-[size:28px_28px]">
          {/* Subtle coastline wave curve */}
          <svg
            className="absolute inset-0 h-full w-full text-[#DFDCD4] opacity-40"
            preserveAspectRatio="none"
            viewBox="0 0 200 100"
          >
            <path
              d="M0,40 Q50,70 100,50 T200,60 L200,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>

          {/* Map Pin Badge */}
          <div className="relative z-10 flex items-center gap-1.5 rounded-full border border-[#E0DFDD] bg-white px-3 py-1.5 shadow-sm">
            <svg
              className="size-3.5 text-[#F5032D]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span className="font-sans text-xs font-semibold text-[#130404]">
              {data.locationName}, Lagos
            </span>
          </div>
        </div>
        <div className="bg-white px-4 py-2.5 font-sans text-xs font-medium text-[#333134]">
          {data.locationName}, {data.locationState}
        </div>
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

      {/* WhatsApp Note */}
      <p className="font-sans text-xs leading-relaxed text-[#6F6B72]">
        {data.whatsappNote}
      </p>
    </EmailTemplateShellView>
  );
}
