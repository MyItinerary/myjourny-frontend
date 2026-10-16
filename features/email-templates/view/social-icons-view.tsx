import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-6.62 6.3 6.34 6.34 0 0 0 6.34 6.35 6.35 6.35 0 0 0 6.34-6.35V9.41a8.27 8.27 0 0 0 4.19 1.15V7.12a4.83 4.83 0 0 1-1-.43z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function VerifiedCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      width="14"
      height="14"
      className="inline-block text-[#10B981]"
      {...props}
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 8.2L7 10.2L11 5.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SocialButtonGroupView({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <a
        href="https://myjourny.app"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Website"
        className="flex size-7 items-center justify-center rounded-full bg-[#F4F2EE] text-[#6F6B72] transition-colors hover:bg-[#EBE9E4] hover:text-[#130404]"
      >
        <GlobeIcon />
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex size-7 items-center justify-center rounded-full bg-[#F4F2EE] text-[#6F6B72] transition-colors hover:bg-[#EBE9E4] hover:text-[#130404]"
      >
        <InstagramIcon />
      </a>
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex size-7 items-center justify-center rounded-full bg-[#F4F2EE] text-[#6F6B72] transition-colors hover:bg-[#EBE9E4] hover:text-[#130404]"
      >
        <FacebookIcon />
      </a>
    </div>
  );
}
