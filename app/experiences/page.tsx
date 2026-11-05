import type { Metadata } from "next";

import { ExperiencesContent } from "./content";

export const metadata: Metadata = {
  title: "Experiences worth showing up for | MyJourny",
  description: "Tours, tastings, workshops, and hidden spots, hosted by locals.",
};

export default function ExperiencesPage() {
  return <ExperiencesContent />;
}
