import type { Metadata } from "next";

import { ExperiencesContent } from "./content";

export const metadata: Metadata = {
  title: "Experiences worth showing up for | Myjourny",
  description: "Tours, tastings, workshops, and hidden spots, guided by locals.",
};

export default function ExperiencesPage() {
  return <ExperiencesContent />;
}
