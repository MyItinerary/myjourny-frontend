import type { Metadata } from "next";

import { CommunityGuidelinesContent } from "./content";

export const metadata: Metadata = {
  title: "Community Guidelines and Reviews Policy | MyJourny",
  description:
    "Community guidelines and reviews policy for guests, hosts, and organisers on MyJourny.",
};

export default function CommunityGuidelinesPage() {
  return <CommunityGuidelinesContent />;
}
