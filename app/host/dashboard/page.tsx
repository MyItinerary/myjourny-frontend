import { Suspense } from "react";

import { HostHomeContent } from "./content";

// The content reads the URL (?preview=full), which needs a Suspense boundary.
export default function HostHomePage() {
  return (
    <Suspense>
      <HostHomeContent />
    </Suspense>
  );
}
