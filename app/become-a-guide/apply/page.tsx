import type { Metadata } from "next";

import { GuideApplicationContent } from "./content";

export const metadata: Metadata = {
  title: "Apply to become a guide | Myjourny",
  description: "Start your application to guide real experiences on Myjourny.",
};

export default function GuideApplicationPage() {
  return <GuideApplicationContent />;
}
