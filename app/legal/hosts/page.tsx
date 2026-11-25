import type { Metadata } from "next";

import { HostTermsContent } from "./content";

export const metadata: Metadata = {
  title: "Guide Terms | Myjourny",
  description: "Terms and conditions for guides listing experiences or events on Myjourny.",
};

export default function HostTermsPage() {
  return <HostTermsContent />;
}
