import type { Metadata } from "next";

import { PrivacyContent } from "./content";

export const metadata: Metadata = {
  title: "Privacy Policy | Myjourny",
  description: "Privacy Policy explaining how Myjourny collects, uses, and protects your personal data in accordance with the NDPA 2023.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
