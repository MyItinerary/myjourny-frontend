import type { Metadata } from "next";
import { ProfileContent } from "./content";

export const metadata: Metadata = {
  title: "My Profile | MyJourny",
  description: "View and manage your MyJourny profile, bookings, wishlist, and travel preferences.",
};

export default function ProfilePage() {
  return <ProfileContent />;
}
