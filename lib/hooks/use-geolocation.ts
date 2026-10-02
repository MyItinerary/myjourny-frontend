"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export type Coordinates = { latitude: number; longitude: number };

export type GeolocationResult =
  | "pending"
  | Coordinates
  | "unavailable";

const STORAGE_KEY = "myjourny:lastKnownCoords";

function readCachedCoords(): Coordinates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.latitude === "number" && typeof parsed?.longitude === "number") {
      return { latitude: parsed.latitude, longitude: parsed.longitude };
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

function saveCoords(coords: Coordinates) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // Ignore storage quota
  }
}

function clearCoords() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage error
  }
}

/**
 * Robust geolocation hook mirroring mobile-app's Location & lastKnownCoords pattern:
 * - Instantly initializes from cached coordinates (localStorage) if available.
 * - Continuously watches position via watchPosition so turning on location immediately updates coordinates.
 * - Actively requests position on mount and on window focus (useFocusEffect equivalent).
 * - Listens to browser permission changes: if location is turned off or denied, immediately
 *   clears cached coords and sets state to "unavailable".
 */
export function useGeolocation(): GeolocationResult {
  const [result, setResult] = useState<GeolocationResult>(() => {
    const cached = readCachedCoords();
    return cached ?? "pending";
  });

  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const coords: Coordinates = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
    saveCoords(coords);
    setResult(coords);
  }, []);

  const handleError = useCallback(() => {
    clearCoords();
    setResult("unavailable");
  }, []);

  const requestPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      handleError();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => {
        // If location was denied or unavailable (e.g. user turned off location), clear & mark unavailable immediately
        if (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE) {
          handleError();
          return;
        }
        // Fallback to balanced accuracy if high accuracy timed out (err.code === 3)
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          handleError,
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [handleSuccess, handleError]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      handleError();
      return;
    }

    // 1. Check permission state immediately if supported
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((permission) => {
          if (permission.state === "denied") {
            handleError();
            return;
          }
          if (permission.state === "granted") {
            requestPosition();
          }
          permission.onchange = () => {
            if (permission.state === "granted") {
              requestPosition();
            } else if (permission.state === "denied") {
              handleError();
            }
          };
        })
        .catch(() => {
          requestPosition();
        });
    } else {
      requestPosition();
    }

    // 2. Watch position continuously — when location is turned on/off, this notifies immediately
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        (err) => {
          if (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE) {
            handleError();
          }
        },
        { enableHighAccuracy: false, maximumAge: 60000 }
      );
    } catch {
      // Ignore watch failure
    }

    // 3. Focus & visibility change — re-evaluates location when user returns to tab
    const onFocus = () => {
      if (typeof navigator !== "undefined" && navigator.permissions?.query) {
        navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((permission) => {
            if (permission.state === "denied") {
              handleError();
            } else {
              requestPosition();
            }
          })
          .catch(() => requestPosition());
      } else {
        requestPosition();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [requestPosition, handleSuccess, handleError]);

  return result;
}
