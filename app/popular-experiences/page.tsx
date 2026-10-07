import type { Metadata } from "next";
import { PopularExperiencesContent } from "./content";

export const metadata: Metadata = {
  title: "Popular experiences near you | MyJourny",
  description: "Hand-picked spots people are loving right now.",
};

export default function PopularExperiencesPage() {
  return <PopularExperiencesContent />;
}
