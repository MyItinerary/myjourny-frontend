import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Every empty page reads the same, at the size of an empty wishlist collection: a small
// illustration (72px, 120px from sm), a 24px title, a 16px body and the standard pill CTA.
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
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-6 py-12 text-center sm:py-20", className)}>
      <div className="relative size-[72px] overflow-hidden rounded-[6px] border-[0.5px] border-[#E0DFDD] sm:size-[120px] sm:rounded-[8px] sm:border">
        <Image src={imageSrc} alt="" fill sizes="120px" className="object-cover" priority />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold text-[#130404]">{title}</h2>
        <p className="font-sans text-base text-[#6F6B72]">{body}</p>
      </div>
      <Button size="cta" render={<Link href={href} />}>
        {ctaLabel}
      </Button>
    </div>
  );
}
