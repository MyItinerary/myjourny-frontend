import type { Metadata } from "next";

import { HomeContent } from "./content";

export const metadata: Metadata = {
  title: "MyJourny — Discover experiences near you",
  description: "Real experiences hosted by real people, booked in under 2 minutes.",
};

export default function HomePage() {
  return <HomeContent />;
}
