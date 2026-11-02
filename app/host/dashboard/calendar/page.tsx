import { Suspense } from "react";

import { HostCalendarContent } from "./content";

// The content reads the URL (?preview=full), which needs a Suspense boundary.
export default function HostCalendarPage() {
  return (
    <Suspense>
      <HostCalendarContent />
    </Suspense>
  );
}
