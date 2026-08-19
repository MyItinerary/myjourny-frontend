import Link from "next/link";

import { Button } from "@/components/ui/button";

// Figma: "CTA" (2001:9150 guest / 2001:9160 account) — identical content
// between the two states.
export function CtaSection() {
  return (
    // Mobile (2001:9460) is LEFT-aligned with a 40px heading; desktop
    // (2001:8890) is centered with 48px.
    <section className="relative overflow-hidden bg-primary px-6 pt-[61px] pb-[57px] text-left lg:pt-[84px] lg:pb-[107px] lg:text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_120%,rgba(245,3,45,0.55),transparent)]"
      />
      <div className="relative mx-auto flex max-w-[704px] flex-col items-start gap-[18px] lg:items-center lg:gap-6">
        <h2 className="font-heading text-[40px] leading-[1.2] font-extrabold text-white lg:text-5xl">
          Experience life around what you actually love.
        </h2>
        <p className="max-w-[614px] text-lg leading-[27px] font-medium text-[#ffc1cc] lg:text-xl lg:leading-[30px]">
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
