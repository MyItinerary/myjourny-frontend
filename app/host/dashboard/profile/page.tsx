import { Suspense } from "react";

import { HostProfileContent } from "./content";

// The content reads the URL (?pane=, ?preview=full), which needs a Suspense boundary.
export default function HostProfilePage() {
  return (
    <Suspense>
      <HostProfileContent />
    </Suspense>
  );
}
