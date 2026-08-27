import type { Metadata } from "next";

import { CuratingContent } from "./content";

export const metadata: Metadata = {
  title: "Curating your experiences — MyJourny",
};

export default function CuratingPage() {
  return <CuratingContent />;
}
