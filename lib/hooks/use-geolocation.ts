"use client";

import { useEffect, useState } from "react";

export type GeolocationResult =
  | "pending"
  | { latitude: number; longitude: number }
  | "unavailable";

const TIMEOUT_MS = 5000;

// Best-effort only, non-blocking, no fallback guessing (no hardcoded
// "default city"). "unavailable" covers denial, timeout, error, and
// unsupported browsers alike — the caller treats all of them the same way
// (fall through to a location-agnostic query), so they're not
// distinguished further.
export function useGeolocation(): GeolocationResult {
  const [result, setResult] = useState<GeolocationResult>("pending");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setResult("unavailable");
      return;
    }

    let settled = false;
    const settle = (value: GeolocationResult) => {
      if (settled) return;
      settled = true;
      setResult(value);
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        settle({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => settle("unavailable"),
      { timeout: TIMEOUT_MS }
    );

    // Backstop in case the browser never calls either callback (some
    // browsers don't reliably honor the options.timeout above).
    const timer = setTimeout(() => settle("unavailable"), TIMEOUT_MS + 1000);
    return () => clearTimeout(timer);
  }, []);

  return result;
}
