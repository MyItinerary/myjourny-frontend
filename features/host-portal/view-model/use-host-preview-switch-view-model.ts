import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { setStoredPreview, usePreviewMode } from "./use-preview-mode";

export type HostPreviewSwitchViewModel = {
  /** Only while developing: a production build never shows it. */
  visible: boolean;
  mode: "full" | "empty";
  onChange: (mode: "full" | "empty") => void;
};

export function useHostPreviewSwitchViewModel(): HostPreviewSwitchViewModel {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const mode = usePreviewMode();

  return {
    visible: process.env.NODE_ENV !== "production",
    mode: mode === "full" ? "full" : "empty",
    onChange: (next) => {
      setStoredPreview(next === "full" ? "full" : null);
      // The address would otherwise keep deciding for us.
      if (params.get("preview")) {
        const rest = new URLSearchParams(params.toString());
        rest.delete("preview");
        const query = rest.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
      }
    },
  };
}
