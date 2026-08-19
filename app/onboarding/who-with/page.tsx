import type { Metadata } from "next";

import { WhoWithContent } from "./content";

export const metadata: Metadata = {
  title: "Who do you go with? — MyJourny",
};

export default function WhoWithPage() {
  return <WhoWithContent />;
}
