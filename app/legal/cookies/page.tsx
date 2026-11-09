import type { Metadata } from "next";

import { CookieContent } from "./content";

export const metadata: Metadata = {
  title: "Cookie Policy | MyJourny",
  description: "Learn how MyJourny uses cookies and similar technologies to remember your choices, keep you secure, and improve your experience.",
};

export default function CookiePage() {
  return <CookieContent />;
}
