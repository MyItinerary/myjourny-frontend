import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Figma: "Why book with us" (553:12749 desktop, 558:14155 mobile); the
// "Your taste has drifted" variant is 558:13485 / 558:14128. The full-bleed
// home-page version of the taste-quiz card, with the dashed divider underneath.
export function TasteQuizSectionView({
  visible,
  href,
  title = "Right now you’re seeing what everyone else sees.",
  body = "Five questions, about 40 seconds, and this page starts looking like yours.",
  ctaLabel = "Take it",
  className,
}: {
  visible: boolean;
  href: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  className?: string;
}) {
  if (!visible) return null;

  return (
    <section aria-label="Personalise your feed" className={cn("w-full bg-white", className)}>
      <div className="mx-auto flex w-full max-w-[900px] flex-col items-start gap-20 px-6 pt-6 pb-8 md:flex-row md:items-center md:gap-[93px] md:px-0 md:py-[94px]">
        <div className="relative aspect-square w-full max-w-[344px] shrink-0 overflow-hidden rounded-[9px] border border-[#E0DFDD] md:size-[212px] md:max-w-none">
          <Image src="/images/taste-quiz/suitcase.png" alt="" fill sizes="(min-width: 768px) 212px, 344px" className="object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h2 className="font-sans text-[32px] font-extrabold leading-[1.2] text-[#333134]">{title}</h2>
            <p className="font-sans text-lg leading-normal text-[#6F6B72] md:text-xl md:leading-[30px]">{body}</p>
          </div>
          <Button size="cta" className="shrink-0" render={<Link href={href} />}>
            {ctaLabel}
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[900px] px-6 md:px-0">
        <Image
          src="/images/taste-quiz/divider-mobile.svg"
          alt=""
          width={345}
          height={1}
          unoptimized
          className="mx-auto h-px w-full max-w-[345px] md:hidden"
        />
        <Image
          src="/images/taste-quiz/divider.svg"
          alt=""
          width={900}
          height={1}
          unoptimized
          className="hidden h-px w-full md:block"
        />
      </div>
    </section>
  );
}
