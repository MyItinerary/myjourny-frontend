import type { Metadata } from "next";

import { BecomeAGuideContent } from "./content";

export const metadata: Metadata = {
  title: "Become a guide | MyJourny",
  description: "Turn your city knowledge into income. Host real experiences for travellers on MyJourny.",
};

export default function BecomeAGuidePage() {
  return <BecomeAGuideContent />;
}
