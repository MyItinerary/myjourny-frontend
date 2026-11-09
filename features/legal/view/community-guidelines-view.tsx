"use client";

import type { CommunityGuidelinesViewModel } from "../view-model/use-community-guidelines-view-model";
import { TermsView } from "./terms-view";

export function CommunityGuidelinesView(props: CommunityGuidelinesViewModel) {
  return <TermsView {...props} />;
}
