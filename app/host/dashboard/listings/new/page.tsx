import { Suspense } from "react";

import { HostListingBuilderContent } from "./content";

// The content reads the URL (?preview=full), which needs a Suspense boundary.
export default function NewListingPage() {
  return (
    <Suspense>
      <HostListingBuilderContent />
    </Suspense>
  );
}
