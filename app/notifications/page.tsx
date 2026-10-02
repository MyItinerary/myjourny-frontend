import type { Metadata } from "next";
import { NotificationsContent } from "./content";

export const metadata: Metadata = {
  title: "Notifications | MyJourny",
  description: "Stay up to date with your trip confirmations, reminders, and updates.",
};

export default function NotificationsPage() {
  return <NotificationsContent />;
}
