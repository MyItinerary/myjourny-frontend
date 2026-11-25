import type { Metadata } from "next";
import { EditInterestsContent } from "./content";

export const metadata: Metadata = {
  title: "Edit Interests | Myjourny",
  description: "Update your travel interest preferences.",
};

export default function EditInterestsPage() {
  return <EditInterestsContent />;
}
