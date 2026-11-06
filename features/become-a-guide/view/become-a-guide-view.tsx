"use client";

import { Footer } from "@/features/footer";
import type { BecomeAGuideViewModel } from "../view-model/use-become-a-guide-view-model";
import { BecomeAGuideNav } from "./become-a-guide-nav";
import { BroadcastVsMatchSection } from "./broadcast-vs-match-section";
import { EarningsCalculatorSection } from "./earnings-calculator-section";
import { HeroSection } from "./hero-section";
import { ValuePropsSection } from "./value-props-section";

export function BecomeAGuideView({
  professions,
  selectedProfessionId,
  pricePerPerson,
  formattedPricePerPerson,
  groupSize,
  sessionsPerMonth,
  earnings,
  onSelectProfession,
  onPriceChange,
  onGroupSizeChange,
  onSessionsChange,
  onStartApplication,
  onScrollToHowItWorks,
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
      </main>

      <Footer />
    </div>
  );
}
