import type { Metadata } from "next";
import { EditEnergyContent } from "./content";

export const metadata: Metadata = {
  title: "Edit Energy Level | MyJourny",
  description: "Update your travel energy and pace preferences.",
};

export default function EditEnergyPage() {
  return <EditEnergyContent />;
}
