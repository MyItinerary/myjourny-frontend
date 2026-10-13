import type { Metadata } from "next";

import { EmailTemplatesContent } from "./content";

export const metadata: Metadata = {
  title: "Email Templates | MyJourny",
  description: "Preview transactional email templates for MyJourny.",
};

export default function EmailTemplatesPage() {
  return <EmailTemplatesContent />;
}
