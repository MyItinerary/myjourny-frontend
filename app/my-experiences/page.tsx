import type { Metadata } from "next";
import { MyExperiencesContent } from "./content";

export const metadata: Metadata = {
  title: "My experiences — Myjourny",
  description: "View and manage your upcoming, past, and cancelled experiences.",
};

export default function MyExperiencesPage() {
  return <MyExperiencesContent />;
}
