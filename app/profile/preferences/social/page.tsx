import type { Metadata } from "next";
import { EditSocialContent } from "./content";

export const metadata: Metadata = {
  title: "Edit Social Style | MyJourny",
  description: "Update who you prefer to experience places with.",
};

export default function EditSocialPage() {
  return <EditSocialContent />;
}
