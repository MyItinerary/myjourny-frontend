import { toast } from "sonner";

export interface ShareDataPayload {
  title: string;
  text: string;
  url: string;
}

export interface ShareExperienceOptions {
  title: string;
  url: string;
}

export function buildSharePayload({ title, url }: ShareExperienceOptions): ShareDataPayload {
  return {
    title,
    text: `Check out ${title} on MyJourny:`,
    url,
  };
}

export async function shareExperience({ title, url }: ShareExperienceOptions): Promise<void> {
  const shareData = buildSharePayload({ title, url });

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err: unknown) {
      // User cancelling the native share sheet throws an AbortError — do not treat as an error or copy to clipboard.
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
    }
  }

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } else {
      toast.error("Couldn't copy the link");
    }
  } catch {
    toast.error("Couldn't copy the link");
  }
}

