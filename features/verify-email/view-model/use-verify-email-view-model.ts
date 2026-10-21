import { useSearchParams } from "next/navigation";

import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";

import { useVerifyEmail } from "../model/verify-email";
import type { VerifyEmailStatus } from "../model/verify-email.types";

export type VerifyEmailViewModel = {
  status: VerifyEmailStatus;
  heading: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

/** The page the verification email links to: confirms the token once, then
 * says whether it worked. */
export function useVerifyEmailViewModel(): VerifyEmailViewModel {
  const token = useSearchParams().get("token");
  const { user } = useSession();
  const verify = useVerifyEmail(token);

  const status: VerifyEmailStatus = verify.isSuccess ? "verified" : !token || verify.isError ? "failed" : "verifying";
  const signedIn = Boolean(user);

  if (status === "verified") {
    return {
      status,
      heading: "Email verified",
      subtitle: "Thanks, you're all set to book experiences.",
      ctaLabel: signedIn ? "Start exploring" : "Log in",
      ctaHref: signedIn ? "/" : "/login",
    };
  }
  if (status === "failed") {
    return {
      status,
      heading: "This link didn't work",
      subtitle: token
        ? apiErrorMessage(verify.error, "The link may have expired. Send yourself a new one from your account settings.")
        : "The link is missing its code. Open it straight from the email we sent.",
      ctaLabel: signedIn ? "Go to account settings" : "Log in",
      ctaHref: signedIn ? "/profile" : "/login",
    };
  }
  return { status, heading: "Verifying your email…", subtitle: "This only takes a moment.", ctaLabel: "", ctaHref: "" };
}
