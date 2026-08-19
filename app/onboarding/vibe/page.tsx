import type { Metadata } from "next";

import { VibeContent } from "./content";

export const metadata: Metadata = {
  title: "What lights you up? — MyJourny",
};

export default function VibePage() {
  return <VibeContent />;
}
