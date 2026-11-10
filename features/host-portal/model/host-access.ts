import { useSession } from "@/lib/auth/session-store";
import { type MeResponse, useMe } from "@/lib/queries/auth";

/** Who is opening the host dashboard. */
export type HostAccess = "checking" | "signed-out" | "traveller" | "pending" | "rejected" | "approved";

type Inputs = {
  hydrated: boolean;
  signedIn: boolean;
  me: Pick<MeResponse, "signup_type" | "guide_status"> | undefined;
};

/** Signed-out visitors and travellers don't belong here; a guide whose
 * application isn't approved yet can look around but not list anything. */
export function hostAccessOf({ hydrated, signedIn, me }: Inputs): HostAccess {
  if (!hydrated) return "checking";
  if (!signedIn) return "signed-out";
  if (!me) return "checking";
  if (me.signup_type !== "guide") return "traveller";
  if (me.guide_status === "approved") return "approved";
  return me.guide_status === "rejected" ? "rejected" : "pending";
}

export function useHostAccess(): HostAccess {
  const { state, hydrated } = useSession();
  const { data: me } = useMe();
  return hostAccessOf({ hydrated, signedIn: state === "account", me });
}
