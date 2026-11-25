import type { Metadata } from "next";

import { InterestsContent } from "./content";

export const metadata: Metadata = {
  title: "What interests you? | Myjourny",
};

export default function InterestsPage() {
  return <InterestsContent />;
}
