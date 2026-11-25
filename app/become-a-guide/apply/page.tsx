import type { Metadata } from "next";

import { GuideApplicationContent } from "./content";

export const metadata: Metadata = {
  title: "Apply to become a guide | MyJourny",
  description: "Start your application to host real experiences on MyJourny.",
};

export default function GuideApplicationPage() {
  return <GuideApplicationContent />;
}
