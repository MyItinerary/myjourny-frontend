"use client";

import { toggleMockSession, useSession } from "@/lib/mock-session";

// Dev-only control for previewing the guest vs. onboarded-account homepage
// without real auth. Delete this once real sessions exist.
export function MockSessionToggle() {
  const { state } = useSession();

  if (process.env.NODE_ENV === "production") return null;

  return (
    <button
      type="button"
      onClick={toggleMockSession}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg transition-opacity hover:opacity-90"
    >
      Preview: {state === "guest" ? "Guest" : "Account"} · tap to switch
    </button>
  );
}
