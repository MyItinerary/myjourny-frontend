import type { Metadata } from "next";
import { EditVibeContent } from "./content";

export const metadata: Metadata = {
  title: "Edit Travel Vibe | MyJourny",
  description: "Update what travel experiences light you up.",
};

export default function EditVibePage() {
  return <EditVibeContent />;
}
