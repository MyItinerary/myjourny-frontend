import type { Metadata } from "next";

import { CancellationContent } from "./content";

export const metadata: Metadata = {
  title: "Cancellation and Refund Policy | Myjourny",
  description:
    "Cancellation and Refund Policy explaining refund rules, cancellation timelines, and procedures for Myjourny.",
};

export default function CancellationPage() {
  return <CancellationContent />;
}
