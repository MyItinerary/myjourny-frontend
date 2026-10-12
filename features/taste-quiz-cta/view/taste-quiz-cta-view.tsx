import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Figma: "Why book with us" (553:10188 desktop, 558:12846 mobile). A full-width banner dropped between
// rows of an experiences grid.
export function TasteQuizCtaView({
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
    <section
      aria-label="Personalise your feed"
      className={cn(
        "flex w-full flex-col items-start gap-[18px] rounded-3xl bg-[#F4F2EE] px-4 py-6 md:flex-row md:items-center md:justify-between md:gap-8 md:px-[42px]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col items-start gap-8 md:flex-row md:items-center">
        <div className="relative size-[93px] shrink-0 overflow-hidden rounded-[9px] border border-[#E0DFDD]">
          <Image src="/images/taste-quiz/suitcase.png" alt="" fill sizes="93px" className="object-cover" />
        </div>
        <div className="flex w-full max-w-[582px] flex-col gap-4 md:gap-3">
          <h2 className="font-sans text-2xl font-semibold leading-[1.2] text-[#333134]">
            Right now you&rsquo;re seeing what everyone else sees.
          </h2>
          <p className="font-sans text-xl leading-[1.2] text-[#6F6B72]">
            Five questions, about 40 seconds, and this page starts looking like yours.
          </p>
        </div>
      </div>
      <Button size="cta" className="w-[134px] shrink-0" render={<Link href={href} />}>
        Take it
      </Button>
    </section>
  );
}
