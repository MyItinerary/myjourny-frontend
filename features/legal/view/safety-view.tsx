"use client";

import type { SafetyViewModel } from "../view-model/use-safety-view-model";
import { TermsView } from "./terms-view";

export function SafetyView(props: SafetyViewModel) {
  return <TermsView {...props} />;
}
