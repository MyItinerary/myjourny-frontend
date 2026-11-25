import { useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth/session-store";

import { buildShareUrl, shareTargets, useReferralCode } from "../model/share";
import type { ShareTarget } from "../model/share.types";

export type ShareDialogViewModel = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  title: string;
  imageUrl: string | null;
  /** "Daniel invited you to try …", or the listing's name. */
  message: string;
  /** What gets shared. */
  url: string;
  /** True when the link carries the sharer's referral code. */
  hasReferral: boolean;
  copied: boolean;
  onCopy: () => void;
  targets: ShareTarget[];
  /** The device's own share sheet, or copying when it has none. */
  onMoreOptions: () => void;
};

type Options = {
  /** The page being shared, as a path: /experiences/{id}. */
  path: string;
  /** The listing's name. */
  title: string;
  imageUrl?: string | null;
  /** "experience" or "event", for the invite line. */
  kind: "experience" | "event";
};

/** Share dialog state: the link (with the sharer's referral code when a
 * campaign is active), copying it, and the channels to send it through. */
export function useShareDialogViewModel({ path, title, imageUrl = null, kind }: Options): ShareDialogViewModel {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: referralCode } = useReferralCode(open && user !== null);

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const url = buildShareUrl(origin, path, referralCode);
  const firstName = user?.fullName?.trim().split(/\s+/)[0];
  const message = firstName ? `${firstName} invited you to try ${title}` : `Take a look at this ${kind}: ${title}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar instead.");
    }
  };

  return {
    open,
    onOpen: () => setOpen(true),
    onClose: () => {
      setOpen(false);
      setCopied(false);
    },
    title,
    imageUrl,
    message,
    url,
    hasReferral: !!referralCode,
    copied,
    onCopy: copy,
    targets: shareTargets(url, message),
    onMoreOptions: async () => {
      if (!navigator.share) return copy();
      try {
        await navigator.share({ title, text: message, url });
      } catch {
        // The visitor closed the share sheet.
      }
    },
  };
}
