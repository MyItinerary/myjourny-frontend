import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { ShareTarget } from "./share.types";

/** The query parameter that carries a referral code on a shared link. */
export const REFERRAL_PARAM = "ref";
const REFERRAL_STORAGE_KEY = "myjourny:referral";

/** The link to share: the page itself, plus the sharer's referral code when a
 * referral campaign is active for them. Without one it is just the page. */
export function buildShareUrl(origin: string, path: string, referralCode?: string | null): string {
  const url = new URL(path, origin);
  if (referralCode) url.searchParams.set(REFERRAL_PARAM, referralCode);
  return url.toString();
}

/** Where each "share via" button sends the link. */
export function shareTargets(url: string, message: string): ShareTarget[] {
  const text = encodeURIComponent(`${message} ${url}`);
  const link = encodeURIComponent(url);
  return [
    { id: "email", label: "Email", href: `mailto:?subject=${encodeURIComponent(message)}&body=${text}` },
    { id: "messages", label: "Messages", href: `sms:?&body=${text}` },
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${text}` },
    { id: "messenger", label: "Messenger", href: `fb-messenger://share/?link=${link}` },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
    {
      id: "twitter",
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${link}`,
    },
  ];
}

type ReferralResponse = { code?: unknown; active?: unknown } | unknown[] | null | undefined;

/** The referral code to share, only while the campaign behind it is active.
 * ASSUMED, NOT BUILT: GET /referrals/me and its `{ code, active }` shape do not exist yet.
 * TODO(backend/admin): build referral codes and campaigns, and accept the stored code at
 * booking and signup (`storedReferral`). Until then every link is just the page.
 * Expects GET /referrals/me → { code, active }; anything else means none. */
export function activeReferralCode(data: ReferralResponse): string | null {
  if (!data || Array.isArray(data) || typeof data.code !== "string" || !data.code) return null;
  return data.active === false ? null : data.code;
}

export function useReferralCode(enabled: boolean) {
  return useQuery({
    queryKey: ["referrals", "me"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ReferralResponse>("/referrals/me");
        return activeReferralCode(data);
      } catch {
        // No referral programme (or not signed in): the link is the page alone.
        return null;
      }
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}

/** Remembers the referral code on the link a visitor arrived through, so the
 * campaign still applies when they book or sign up later. */
export function captureReferral(search: string, storage: Pick<Storage, "setItem"> = window.localStorage): string | null {
  const code = new URLSearchParams(search).get(REFERRAL_PARAM)?.trim();
  if (!code) return null;
  try {
    storage.setItem(REFERRAL_STORAGE_KEY, code);
  } catch {
    // Storage blocked: the code just isn't remembered.
  }
  return code;
}

export function storedReferral(storage: Pick<Storage, "getItem"> = window.localStorage): string | null {
  try {
    return storage.getItem(REFERRAL_STORAGE_KEY);
  } catch {
    return null;
  }
}
