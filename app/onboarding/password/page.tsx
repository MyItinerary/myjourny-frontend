import type { Metadata } from "next";

import { PasswordContent } from "./content";

export const metadata: Metadata = {
  title: "Create a password — MyJourny",
};

export default function PasswordPage() {
  return <PasswordContent />;
}
