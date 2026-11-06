"use client";

import { Footer } from "@/features/footer";
import type { BecomeAGuideViewModel } from "../view-model/use-become-a-guide-view-model";
import { BecomeAGuideNav } from "./become-a-guide-nav";
import { BroadcastVsMatchSection } from "./broadcast-vs-match-section";
import { CtaSection } from "./cta-section";
import { EarningsCalculatorSection } from "./earnings-calculator-section";
import { FaqSection } from "./faq-section";
import { HeroSection } from "./hero-section";
import { SampleExperiencesSection } from "./sample-experiences-section";
import { ThreeStepsSection } from "./three-steps-section";
import { ValuePropsSection } from "./value-props-section";

export function BecomeAGuideView({
  professions,
  selectedProfessionId,
  pricePerPerson,
  formattedPricePerPerson,
  groupSize,
  sessionsPerMonth,
  earnings,
  steps,
  sampleExperiences,
  isLoadingExperiences,
  faqItems,
  openFaqId,
  onSelectProfession,
  onPriceChange,
  onGroupSizeChange,
  onSessionsChange,
  onStartApplication,
  onScrollToHowItWorks,
  onToggleFaq,
}: BecomeAGuideViewModel) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <BecomeAGuideNav />

      <main className="flex-1">
        <HeroSection
          onStartApplication={onStartApplication}
          onScrollToHowItWorks={onScrollToHowItWorks}
        />

        <EarningsCalculatorSection
          professions={professions}
          selectedProfessionId={selectedProfessionId}
          pricePerPerson={pricePerPerson}
          formattedPricePerPerson={formattedPricePerPerson}
          groupSize={groupSize}
          sessionsPerMonth={sessionsPerMonth}
          earnings={earnings}
          onSelectProfession={onSelectProfession}
          onPriceChange={onPriceChange}
          onGroupSizeChange={onGroupSizeChange}
          onSessionsChange={onSessionsChange}
        />

        <BroadcastVsMatchSection />

        <ValuePropsSection />

        <ThreeStepsSection steps={steps} />

        <SampleExperiencesSection
          experiences={sampleExperiences}
          isLoading={isLoadingExperiences}
        />

        <FaqSection
          items={faqItems}
          openId={openFaqId}
          onToggle={onToggleFaq}
        />

        <CtaSection onStartApplication={onStartApplication} />
      </main>

      <Footer />
    </div>
  );
}
