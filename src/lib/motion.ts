import type { Transition, Variants } from 'framer-motion';

/** Shared easing curve — matches the site's original scroll-reveal feel. */
export const EASE = [0.16, 0.84, 0.44, 1] as const;

export const REVEAL_TRANSITION: Transition = { duration: 0.9, ease: EASE };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export function staggerContainer(stagger = 0.09, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}
