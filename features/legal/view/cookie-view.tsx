"use client";

import type { CookieViewModel } from "../view-model/use-cookie-view-model";
import { TermsView } from "./terms-view";

export function CookieView(props: CookieViewModel) {
  return <TermsView {...props} />;
}
