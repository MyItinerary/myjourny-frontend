import type { Metadata } from "next";

import { HostTermsContent } from "./content";

export const metadata: Metadata = {
  title: "Host Terms | MyJourny",
  description: "Terms and conditions for hosts listing experiences or events on MyJourny.",
};

export default function HostTermsPage() {
  return <HostTermsContent />;
}
