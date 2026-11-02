import { Suspense } from "react";

import { HostHelpContent } from "./content";

// The content reads the URL (?guide=), which needs a Suspense boundary.
export default function HostHelpPage() {
  return (
    <Suspense>
      <HostHelpContent />
    </Suspense>
  );
}
