import type { Metadata } from "next";
import { EditVibeContent } from "./content";

export const metadata: Metadata = {
  title: "Edit Travel Vibe | Myjourny",
  description: "Update what travel experiences light you up.",
};

export default function EditVibePage() {
  return <EditVibeContent />;
}
