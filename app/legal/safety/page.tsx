import type { Metadata } from "next";

import { SafetyContent } from "./content";

export const metadata: Metadata = {
  title: "Safety Guide | Myjourny",
  description: "Comprehensive safety guide for guests, guides, and organisers on Myjourny.",
};

export default function SafetyPage() {
  return <SafetyContent />;
}
