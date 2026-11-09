import type { Metadata } from "next";

import { TermsContent } from "./content";

export const metadata: Metadata = {
  title: "Terms of Use | MyJourny",
  description: "Terms of Use and conditions for using MyJourny marketplace.",
};

export default function TermsPage() {
  return <TermsContent />;
}
