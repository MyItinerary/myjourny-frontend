import { Suspense } from "react";

import { HostListingsContent } from "./content";

// The content reads the URL (?preview=full), which needs a Suspense boundary.
export default function HostListingsPage() {
  return (
    <Suspense>
      <HostListingsContent />
    </Suspense>
  );
}
