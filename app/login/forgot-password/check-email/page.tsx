import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckEmailContent } from "./content";

export const metadata: Metadata = {
  title: "Check your email — MyJourny",
};

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}
