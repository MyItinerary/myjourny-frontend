"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

// Scroll-triggered fade/slide-up, played once per section (not replayed on
// scroll-back-up). whileInView handles the viewport detection natively —
// no hand-rolled IntersectionObserver needed.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
