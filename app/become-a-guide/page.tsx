import type { Metadata } from "next";

import { BecomeAGuideContent } from "./content";

export const metadata: Metadata = {
  title: "Become a guide | Myjourny",
  description: "Turn your city knowledge into income. Guide real experiences for travellers on Myjourny.",
};

export default function BecomeAGuidePage() {
  return <BecomeAGuideContent />;
}
