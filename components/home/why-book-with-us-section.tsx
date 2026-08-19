import Link from "next/link";

import { Button } from "@/components/ui/button";

// Figma: "Why book with us" (2001:9144 guest / 2001:9155 account) —
// identical content between the two states, order just moves (guest shows
// it before "Popular experiences near you"; account shows it after).
const features = [
  {
    title: "Curated, not just listed",
    description: "Every experience is picked for quality, not just popularity. No filler, no guesswork",
  },
  {
    title: "Payment protection",
    description: "Book and pay securely through MyJourny. Your money's safe until the experience happens.",
  },
  {
    title: "Verified hosts",
    description: "Every host is vetted, reviewed, and held to a standard. Quality is rewarded, not gamed.",
  },
  {
    title: "Made for you",
    description: "Recommendations that actually fit your taste, not a generic 'top 10' list everyone sees.",
  },
];

export function WhyBookWithUsSection() {
  return (
    // Mobile (2001:9170): single column, 32px-gap rows, full-width CTA at
    // the BOTTOM. Desktop (2001:9144): 2-col grid, CTA top-right.
    <section className="mx-auto w-full max-w-[1512px] px-6 py-[42px] lg:px-[306px] lg:py-[65px]">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-4 lg:gap-3">
          <h2 className="font-heading text-[32px] leading-[1.2] font-extrabold text-foreground lg:text-[40px]">
            Why book with us?
          </h2>
          <p className="max-w-[279px] text-lg leading-[28px] text-muted-foreground lg:max-w-none lg:text-xl lg:leading-[30px]">
            Every booking comes with a little peace of mind.
          </p>
        </div>
        <Button size="cta" render={<Link href="/onboarding" />} className="hidden shrink-0 lg:inline-flex">
          Get started
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-x-[105px] lg:gap-y-[61px]">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-[18px]">
            <div className="mt-1 h-[92px] w-[104px] shrink-0 rounded-2xl bg-[#731727] lg:mt-0" aria-hidden />
            <div className="flex flex-col gap-[7px] lg:gap-1.5">
              <h3 className="font-heading text-lg leading-[27px] font-semibold text-foreground lg:text-[22px] lg:leading-[33px]">
                {feature.title}
              </h3>
              <p className="text-base leading-[22px] text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button size="cta" render={<Link href="/onboarding" />} className="mt-8 w-full lg:hidden">
        Get started
      </Button>
    </section>
  );
}
