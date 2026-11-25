import type { Metadata } from "next";

import { CookieContent } from "./content";

export const metadata: Metadata = {
  title: "Cookie Policy | Myjourny",
  description: "Learn how Myjourny uses cookies and similar technologies to remember your choices, keep you secure, and improve your experience.",
};

export default function CookiePage() {
  return <CookieContent />;
}
