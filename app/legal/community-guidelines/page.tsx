import type { Metadata } from "next";

import { CommunityGuidelinesContent } from "./content";

export const metadata: Metadata = {
  title: "Community Guidelines and Reviews Policy | Myjourny",
  description:
    "Community guidelines and reviews policy for guests, guides, and organisers on Myjourny.",
};

export default function CommunityGuidelinesPage() {
  return <CommunityGuidelinesContent />;
}
