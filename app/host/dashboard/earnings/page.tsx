import { Suspense } from "react";

import { HostEarningsContent } from "./content";

// The content reads the URL (?preview=full), which needs a Suspense boundary.
export default function HostEarningsPage() {
  return (
    <Suspense>
      <HostEarningsContent />
    </Suspense>
  );
}
