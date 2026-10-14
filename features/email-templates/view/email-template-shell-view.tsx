import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SocialButtonGroupView } from "./social-icons-view";

export interface EmailTemplateShellProps {
  heroImageSrc: string;
  logoSrc?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  signOffPrefix?: string;
  signOffTeam?: string;
  footerNotice: string;
  footerHelpEmail?: string;
  footerCopyright?: string;
  children: ReactNode;
  className?: string;
  maxWidthClass?: string;
}

export function EmailTemplateShellView({
  heroImageSrc,
  logoSrc = "/images/email-templates/3.png",
  eyebrow,
  title,
  subtitle,
  signOffPrefix,
  signOffTeam = "From MyJourny",
  footerNotice,
  footerHelpEmail,
  footerCopyright = "© 2026 MyJourny Ltd. Lagos, Nigeria.",
  children,
  className,
  maxWidthClass = "max-w-[600px]",
}: EmailTemplateShellProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center bg-[#F4F2EE] px-3 py-6 sm:px-6 sm:py-10",
        className,
      )}
    >
      {/* Email Card Container */}
      <div
        className={cn(
          "w-full overflow-hidden rounded-[28px] border border-[#E0DFDD]/70 bg-white shadow-sm @container",
          maxWidthClass,
        )}
      >
        {/* Top Hero Banner with Background Image & Logo */}
        <div className="relative h-[210px] w-full overflow-hidden sm:h-[235px]">
          <Image
            src={heroImageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            priority
            className="object-cover object-center"
          />
          {/* Subtle contrast overlay to enhance logo readability */}
          <div className="absolute inset-0 bg-black/15" />

          {/* Centered MyJourny Logo */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="relative h-10 w-[190px] sm:h-12 sm:w-[210px]">
              <Image
                src={logoSrc}
                alt="MyJourny"
                fill
                sizes="210px"
                className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
        </div>

        {/* Card Body Content */}
        <div className="px-6 py-7 sm:px-9 sm:py-8">
          {/* Eyebrow Label */}
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#F5032D]">
            {eyebrow}
          </p>

          {/* Main Email Heading */}
          <h1 className="mt-2 mb-3 font-sans text-2xl font-extrabold leading-snug tracking-tight text-[#130404] sm:text-[28px]">
            {title}
          </h1>

          {/* Subtitle / Intro Message */}
          <p className="mb-6 font-sans text-sm leading-relaxed text-[#6F6B72] sm:text-[15px]">
            {subtitle}
          </p>

          {/* Dynamic Template Specific Content */}
          <div className="space-y-5">{children}</div>

          {/* Sign-off & Social Icons Row */}
          <div className="mt-8 flex items-end justify-between border-t border-[#F4F2EE] pt-6">
            <div className="font-sans text-xs text-[#6F6B72] sm:text-sm">
              {signOffPrefix && <p className="mb-1 leading-normal">{signOffPrefix}</p>}
              <p className="font-medium text-[#333134]">{signOffTeam}</p>
            </div>
            <SocialButtonGroupView />
          </div>
        </div>
      </div>

      {/* External Footer on cream background */}
      <footer className="mt-6 max-w-[480px] text-center font-sans text-xs leading-relaxed text-[#8A868D]">
        <p>{footerNotice}</p>
        {footerHelpEmail && (
          <p className="mt-1">
            Need help?{" "}
            <a
              href={`mailto:${footerHelpEmail}`}
              className="font-medium text-[#F5032D] hover:underline"
            >
              {footerHelpEmail}
            </a>
          </p>
        )}
        {footerCopyright && <p className="mt-2 text-[11px] text-[#A39FA7]">{footerCopyright}</p>}
      </footer>
    </div>
  );
}
