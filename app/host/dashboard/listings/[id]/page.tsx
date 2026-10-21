import { Suspense } from "react";

import { HostListingDetailContent } from "./content";

// The content reads the URL (?preview=full), which needs a Suspense boundary.
export default async function HostListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <HostListingDetailContent id={id} />
    </Suspense>
  );
}
