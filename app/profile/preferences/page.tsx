import type { Metadata } from "next";
import { PreferencesContent } from "./content";

export const metadata: Metadata = {
  title: "Your Preferences | MyJourny",
  description: "View and edit your travel preferences.",
};

export default function PreferencesPage() {
  return <PreferencesContent />;
}
