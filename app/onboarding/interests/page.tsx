import type { Metadata } from "next";

import { InterestsContent } from "./content";

export const metadata: Metadata = {
  title: "What interests you? — MyJourny",
};

export default function InterestsPage() {
  return <InterestsContent />;
}
