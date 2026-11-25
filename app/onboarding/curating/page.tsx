import type { Metadata } from "next";

import { CuratingContent } from "./content";

export const metadata: Metadata = {
  title: "Curating your experiences | Myjourny",
};

export default function CuratingPage() {
  return <CuratingContent />;
}
