import type { Metadata } from "next";

import { ResetPasswordContent } from "./content";

export const metadata: Metadata = {
  title: "Reset password — MyJourny",
};

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
