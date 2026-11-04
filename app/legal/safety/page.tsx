import type { Metadata } from "next";

import { SafetyContent } from "./content";

export const metadata: Metadata = {
  title: "Safety Guide | MyJourny",
  description: "Comprehensive safety guide for guests, hosts, and organisers on MyJourny.",
};

export default function SafetyPage() {
  return <SafetyContent />;
}
