import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Figma: "_Section" empty states for My experiences (2360:33913) and
// Wishlists (2353:9198) — 180px illustration, 44px title, 24px body and a
// pill CTA, so every empty page reads the same.
export function EmptyStateView({
  imageSrc,
  title,
  body,
  ctaLabel,
  href,
  className,
}: {
  imageSrc: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-6 py-10 text-center sm:gap-[45px] sm:px-0 sm:py-20",
        className,
      )}
    >
      <div className="relative size-[90px] overflow-hidden rounded-[4px] border-[0.5px] border-[#E0DFDD] sm:size-[180px] sm:rounded-[8px] sm:border">
        <Image src={imageSrc} alt="" fill sizes="180px" className="object-cover" priority />
      </div>
      <div className="flex w-full max-w-[696px] flex-col gap-5">
        <h2 className="font-heading text-[32px] font-extrabold leading-[1.2] text-[#130404] sm:text-[44px]">{title}</h2>
        <p className="font-sans text-base leading-6 text-[#6F6B72] sm:text-2xl sm:leading-normal">{body}</p>
      </div>
      <Button size="cta" render={<Link href={href} />}>
        {ctaLabel}
      </Button>
    </div>
  );
}
