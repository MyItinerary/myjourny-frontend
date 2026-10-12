import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Figma: "Why book with us" (553:12749 desktop, 558:14155 mobile). The full-bleed
// home-page version of the taste-quiz card, with the dashed divider underneath.
export function TasteQuizSectionView({
  visible,
  href,
  className,
}: {
  visible: boolean;
  href: string;
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
            <h2 className="font-sans text-[32px] font-extrabold leading-[1.2] text-[#333134]">Right now you&rsquo;re seeing what everyone else sees.</h2>
            <p className="font-sans text-lg leading-normal text-[#6F6B72] md:text-xl md:leading-[30px]">Five questions, about 40 seconds, and this page starts looking like yours.</p>
          </div>
          <Button size="cta" className="w-[134px] shrink-0 self-start" render={<Link href={href} />}>
            Take it
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
