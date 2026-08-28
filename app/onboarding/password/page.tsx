import type { Metadata } from "next";
import { Suspense } from "react";

import { PasswordContent } from "./content";

export const metadata: Metadata = {
  title: "Create a password — MyJourny",
};

export default function PasswordPage() {
  return (
    <Suspense fallback={null}>
      <PasswordContent />
    </Suspense>
  );
}
