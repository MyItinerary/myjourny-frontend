import type { Metadata } from "next";
import { ProfileContent } from "./content";

export const metadata: Metadata = {
  title: "My Profile | Myjourny",
  description: "View and manage your Myjourny profile, bookings, wishlist, and travel preferences.",
};

export default function ProfilePage() {
  return <ProfileContent />;
}
