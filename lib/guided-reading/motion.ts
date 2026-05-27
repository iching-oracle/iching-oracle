import type { Transition, Variants } from "framer-motion";

export const gentleEase: Transition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export const glowPulse: Variants = {
  animate: {
    opacity: [0.4, 0.7, 0.4],
    scale: [1, 1.03, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};
