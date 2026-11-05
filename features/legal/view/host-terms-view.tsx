"use client";

import type { HostTermsViewModel } from "../view-model/use-host-terms-view-model";
import { TermsView } from "./terms-view";

export function HostTermsView(props: HostTermsViewModel) {
  return <TermsView {...props} />;
}
