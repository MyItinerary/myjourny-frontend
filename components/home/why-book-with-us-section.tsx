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
          <h2 className="font-heading text-[32px] font-extrabold leading-[1.2] text-[#130404] lg:text-[40px] lg:leading-[48px]">
            Why book with us?
          </h2>
          <p className="max-w-[279px] font-sans text-lg font-normal leading-[28px] text-[#6F6B72] lg:max-w-none lg:text-[20px] lg:leading-[30px]">
            Every booking comes with a little peace of mind.
          </p>
        </div>
        <Button
          size="cta"
          render={<Link href="/onboarding" />}
          className="hidden w-[134px] shrink-0 bg-[#F5032D] text-white hover:bg-[#d90328] lg:inline-flex"
        >
          Get started
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-x-[105px] lg:gap-y-[61px]">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-[18px]">
            <div className="mt-1 h-[92px] w-[104px] shrink-0 rounded-2xl bg-[#731727] lg:mt-0" aria-hidden />
            <div className="flex flex-col gap-[7px] lg:gap-1.5">
              <h3 className="font-heading text-lg font-semibold leading-[27px] text-[#130404] lg:text-[22px] lg:leading-[33px]">
                {feature.title}
              </h3>
              <p className="font-sans text-base leading-[24px] text-[#6F6B72]">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        size="cta"
        render={<Link href="/onboarding" />}
        className="mt-8 w-full bg-[#F5032D] text-white hover:bg-[#d90328] lg:hidden"
      >
        Get started
      </Button>
    </section>
  );
}
