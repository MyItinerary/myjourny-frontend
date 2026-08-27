import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordContent } from "./content";

export const metadata: Metadata = {
  title: "Reset password — MyJourny",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
