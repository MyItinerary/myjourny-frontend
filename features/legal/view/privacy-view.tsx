"use client";

import type { PrivacyViewModel } from "../view-model/use-privacy-view-model";
import { TermsView } from "./terms-view";

export function PrivacyView(props: PrivacyViewModel) {
  return <TermsView {...props} />;
}
