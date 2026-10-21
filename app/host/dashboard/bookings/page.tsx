import { Suspense } from "react";

import { HostBookingsContent } from "./content";

// The content reads the URL (?preview=full), which needs a Suspense boundary.
export default function HostBookingsPage() {
  return (
    <Suspense>
      <HostBookingsContent />
    </Suspense>
  );
}
