import type { Metadata } from "next";

import { EmailTemplatesContent } from "./content";

export const metadata: Metadata = {
  title: "Email Templates | Myjourny",
  description: "Preview transactional email templates for Myjourny.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmailTemplatesPage() {
  return <EmailTemplatesContent />;
}
