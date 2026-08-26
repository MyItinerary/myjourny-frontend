import Link from "next/link";

import { Button } from "@/components/ui/button";

// Figma: "CTA" (2001:9150 guest / 2001:9160 account) — identical content
// between the two states.
export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-primary px-6 pt-[61px] pb-[57px] text-center lg:pt-[84px] lg:pb-[107px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_120%,rgba(245,3,45,0.55),transparent)]"
      />
      <div className="relative mx-auto flex max-w-[704px] flex-col items-center gap-[18px] text-center lg:gap-6">
        <h2 className="font-heading text-[36px] font-extrabold leading-[1.2] text-[#FFF] lg:text-[48px] lg:leading-[57.6px]">
          Experience life around what you actually love.
        </h2>
        <p className="max-w-[614px] text-[18px] font-medium leading-[28px] text-[#FFC1CC] lg:text-[20px] lg:leading-[30px]">
          Tell us your interests and we&rsquo;ll shape every recommendation around the experiences that fit you, not
          everyone else.
        </p>
        <Button
          size="cta"
          variant="outline"
          className="mt-2 border-transparent bg-white text-primary hover:bg-white/90 lg:mt-0"
          render={<Link href="/onboarding" />}
        >
          Get started
        </Button>
      </div>
    </section>
  );
}
