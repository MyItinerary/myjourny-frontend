import type { Metadata } from "next";
import { EditInterestsContent } from "./content";

export const metadata: Metadata = {
  title: "Edit Interests | MyJourny",
  description: "Update your travel interest preferences.",
};

export default function EditInterestsPage() {
  return <EditInterestsContent />;
}
