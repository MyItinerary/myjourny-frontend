import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { type HostAccess, useHostAccess } from "../model/host-access";
import { usePreviewMode } from "./use-preview-mode";

export type HostGuardViewModel = {
  /** False while the account is checked, or while someone who doesn't belong here is sent away. */
  ready: boolean;
  /** For a guide whose application isn't approved yet. */
  banner: { title: string; body: string } | null;
};

const BANNERS: Partial<Record<HostAccess, HostGuardViewModel["banner"]>> = {
  pending: {
    title: "Your guide application is in review",
    body: "Look around while we check it. We'll email you once you're approved, and then you can publish your first listing.",
  },
  rejected: {
    title: "Your guide application wasn't approved",
    body: "We've emailed you what to change. Reply to that email, or write to hello@myjourny.io, and we'll take another look.",
  },
};

/** Only guides use the host dashboard. Signed-out visitors go to log in and
 * come back; travellers go to become-a-guide. */
export function useHostGuardViewModel(): HostGuardViewModel {
  const router = useRouter();
  const pathname = usePathname();
  const access = useHostAccess();
  // The design's sample host, while developing, needs no account.
  const sample = usePreviewMode() === "full" && process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (sample) return;
    if (access === "signed-out") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (access === "traveller") router.replace("/become-a-guide");
  }, [access, sample, pathname, router]);

  if (sample) return { ready: true, banner: null };
  return {
    ready: access === "approved" || access === "pending" || access === "rejected",
    banner: BANNERS[access] ?? null,
  };
}
