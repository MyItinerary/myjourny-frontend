import type { Metadata } from "next";

import { EmailContent } from "./content";

export const metadata: Metadata = {
  title: "What's your email? — MyJourny",
};

export default function EmailPage() {
  return <EmailContent />;
}
