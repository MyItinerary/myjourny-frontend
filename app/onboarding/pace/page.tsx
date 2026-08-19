import type { Metadata } from "next";

import { PaceContent } from "./content";

export const metadata: Metadata = {
  title: "What's your pace? — MyJourny",
};

export default function PacePage() {
  return <PaceContent />;
}
