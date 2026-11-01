import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

// Figma "Why book with us" taste-quiz band (698:29815): a rounded grey card
// with the suitcase, the pitch and a red "Take it" button.
export function HomeTasteQuizBandView({ visible, href }: { visible: boolean; href: string }) {
  if (!visible) return null;

  return (
    <section aria-label="Personalise your feed" className="w-full bg-white">
      <div className="mx-auto w-full max-w-[1512px] px-6 py-10 lg:px-32 lg:py-[72px]">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-[#F4F2EE] p-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-6 lg:flex-row lg:items-center lg:gap-8">
            <div className="relative size-[140px] shrink-0 overflow-hidden rounded-[6px] border border-[#E0DFDD]">
              <Image src="/images/taste-quiz/suitcase.png" alt="" fill sizes="140px" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h2 className="font-sans text-2xl font-extrabold leading-[1.2] text-[#333134] lg:text-[32px]">
                Right now you&rsquo;re seeing what everyone else sees.
              </h2>
              <p className="font-sans text-lg leading-[28px] text-[#6F6B72] lg:text-[20px] lg:leading-[30px]">
                Five questions, about 40 seconds, and this page starts looking like yours.
              </p>
            </div>
          </div>
          <Button size="cta" className="w-[134px] shrink-0" render={<Link href={href} />}>
            Take it
          </Button>
        </div>
      </div>
    </section>
  );
}
