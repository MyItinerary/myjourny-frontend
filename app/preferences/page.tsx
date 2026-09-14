import type { Metadata } from "next";
import { PreferencesContent } from "../profile/preferences/content";

export const metadata: Metadata = {
  title: "Your Preferences | MyJourny",
  description: "View and edit your travel preferences.",
};

export default function PreferencesAliasPage() {
  return <PreferencesContent />;
}
