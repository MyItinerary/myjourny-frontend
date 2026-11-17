"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";

import type { SignInLoaderViewModel } from "../view-model/use-sign-in-loader-view-model";

// Full screen, white, the logo gently pulsing in the middle: shown from
// signing in until the page it leads to has loaded.
export function SignInLoaderView({ visible }: SignInLoaderViewModel) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sign-in-loader"
          role="status"
          aria-live="polite"
          data-testid="sign-in-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
        >
          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [1, 0.55, 1] }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
          >
            <Image
              src="/logo/myjourny-logo.svg"
              alt="MyJourny"
              width={188}
              height={40}
              priority
              className="h-10 w-auto object-contain"
            />
          </motion.div>
          <span className="sr-only">Signing you in…</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
