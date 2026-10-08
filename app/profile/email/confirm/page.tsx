import type { Metadata } from "next";
import { Suspense } from "react";

import { ConfirmEmailContent } from "./content";

export const metadata: Metadata = {
  title: "Confirm email | MyJourny",
};

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
