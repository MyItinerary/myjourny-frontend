"use client";

import type { CookieViewModel } from "../view-model/use-cookie-view-model";
import { CookiePreferencesDialog } from "./cookie-preferences-dialog";
import { TermsView } from "./terms-view";

export function CookieView(props: CookieViewModel) {
  return (
    <>
      <TermsView {...props} />
      <CookiePreferencesDialog
        open={props.isPreferencesOpen}
        preferences={props.preferences}
        onClose={props.closePreferences}
        onToggle={props.onTogglePreference}
        onAcceptAll={props.onAcceptAll}
        onRejectNonEssential={props.onRejectNonEssential}
        onSave={props.onSavePreferences}
      />
    </>
  );
}
