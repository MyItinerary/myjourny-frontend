"use client";

import type { CancellationViewModel } from "../view-model/use-cancellation-view-model";
import { TermsView } from "./terms-view";

export function CancellationView(props: CancellationViewModel) {
  return <TermsView {...props} />;
}
