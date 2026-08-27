"use client";

import { useSession } from "@/lib/auth/session-store";
import { HeroSection } from "@/components/home/hero-section";
import { WhyBookWithUsSection } from "@/components/home/why-book-with-us-section";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { CitiesSection } from "@/components/home/cities-section";
import { CtaSection } from "@/components/home/cta-section";
import { Footer } from "@/components/home/footer";
import {
  accountCategories,
  browsingHistoryExperiences,
  cities,
  guestCategories,
  popularExperiences,
  topPicks,
} from "@/lib/mock-data/home";

// Figma "Home" (2001:9142 guest / 2001:9152 account, mobile 2001:9168 /
// 2001:9462) — both states share the same 9 sections; only the order (and
// the categories content) changes once a user is signed in and onboarded.
// See DESIGN-SYSTEM.md for the full node id map.
export function HomeContent() {
  const { user } = useSession();
  const isAccount = user !== null;

  const popularExperiencesSection = (
    <ExperienceRailSection
      key="popular-experiences"
      heading="Popular experiences near you"
      subheading="Hand-picked spots people are loving right now."
      items={popularExperiences}
    />
  );

  const whyBookWithUsSection = <WhyBookWithUsSection key="why-book-with-us" />;

  return (
    <div className="flex flex-1 flex-col">
      <HeroSection />

      <ExperienceRailSection
        key="popular-experiences"
        heading="Popular experiences near you"
        subheading="Hand-picked spots people are loving right now."
        items={popularExperiences}
      />
      <WhyBookWithUsSection key="why-book-with-us" />

      <CategoriesSection categories={isAccount ? accountCategories : guestCategories} />

      <ExperienceRailSection
        heading="Top picks right now"
        subheading="What’s happening in Lagos"
        items={topPicks}
        cardVariant="vertical"
      />

      <CitiesSection cities={cities} />

      <ExperienceRailSection
        heading="Based on your browsing history"
        subheading="A few things we noticed you're drawn to."
        items={browsingHistoryExperiences}
        cardVariant="vertical"
      />

      <CtaSection />
      <Footer />
    </div>
  );
}
