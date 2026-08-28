"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

// import Image from "next/image";
// import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleAuthButtonProps {
  label?: string;
  onCredential: (credential: string) => void;
  onError?: () => void;
  className?: string;
  /** True while a credential is being exchanged/signed in — shows a spinner and blocks another attempt. */
  loading?: boolean;
}

// Using Google's real stock button directly instead of the pixel-designed
// overlay trick (see git history) — that relied on Google's iframe filling
// a container sized for our custom button, which kept drifting out of
// alignment with the real clickable area. Design version commented out
// below for now; swap back once the real button can be styled to match
// without breaking clickability.
export function GoogleAuthButton({
  onCredential,
  onError,
  className,
  loading = false,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(360);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width;
      if (width) setButtonWidth(Math.round(width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn("flex h-12 w-full items-center justify-center", className)}>
      {loading ? (
        <Loader2Icon className="size-5 animate-spin" />
      ) : (
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) onCredential(response.credential);
          }}
          onError={onError}
          text="continue_with"
          width={buttonWidth}
        />
      )}

      {/* {loading ? (
        <Loader2Icon className="size-5 animate-spin" />
      ) : (
        <Image src="/icons/google.svg" alt="" width={24} height={24} />
      )}
      <Button
        type="button"
        variant="outline"
        size="cta"
        disabled={loading}
        className="w-full"
      >
        {label}
      </Button> */}
    </div>
  );
}
