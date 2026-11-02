import Image from "next/image";

import { HOME_SECTION_IDS } from "../model/home-sections.types";

const REASONS = [
  {
    title: "Curated, not just listed",
    description: "Every experience is picked for quality, not just popularity. No filler, no guesswork",
    icon: "/images/home/why-book-with-us/Curated-not-listed.jpg",
  },
  {
    title: "Verified hosts",
    description: "Every host is vetted, reviewed, and held to a standard. Quality is rewarded, not gamed.",
    icon: "/images/home/why-book-with-us/Verified-hosts.jpg",
  },
  {
    title: "Made for you",
    description: "Recommendations that actually fit your taste, not a generic 'top 10' list everyone sees.",
    icon: "/images/home/why-book-with-us/Made-for-you.jpg",
  },
];

// Figma "Why book with us" (671:25332): centred heading over three columns.
export function HomeWhyBookView() {
  return (
    <section id={HOME_SECTION_IDS.whyBook} className="w-full bg-white">
      <div className="mx-auto w-full max-w-[1512px] px-6 pt-12 pb-12 lg:px-32 lg:pt-[65px] lg:pb-[46px]">
        <div className="mx-auto flex max-w-[454px] flex-col gap-[11px] text-center">
          <h2 className="font-sans text-[28px] font-extrabold leading-[120%] text-[#333134]">
            Why book with us?
          </h2>
          <p className="font-sans text-[16px] leading-6 text-[#6F6B72]">
            Every booking comes with a little peace of mind.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-10 lg:mt-[45px] lg:grid-cols-3 lg:gap-[18px]">
          {REASONS.map((reason) => (
            <li key={reason.title} className="flex flex-col items-center gap-[18px] text-center">
              <div className="relative size-[95px] shrink-0 overflow-hidden rounded-[13.7px] border border-[#F4F2EE]">
                <Image src={reason.icon} alt="" fill sizes="95px" className="object-cover" />
              </div>
              <div className="flex flex-col gap-[7px]">
                <h3 className="font-sans text-[18px] font-semibold leading-[27px] text-[#333134]">
                  {reason.title}
                </h3>
                <p className="font-sans text-base leading-6 text-[#6F6B72]">{reason.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
