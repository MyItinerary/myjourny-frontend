import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailContent } from "./content";

export const metadata: Metadata = {
  title: "Verify email | MyJourny",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
