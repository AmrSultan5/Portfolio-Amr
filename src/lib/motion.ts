import type { Transition, Variants } from 'framer-motion';

/**
 * Shared easing: a long, decelerating tail. Motion should arrive quickly then
 * settle, never coast at constant speed.
 */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const REVEAL_TRANSITION: Transition = { duration: 0.85, ease: EASE };

/** `custom` on the motion element supplies the delay. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...REVEAL_TRANSITION, delay },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
};

export function staggerContainer(stagger = 0.09, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}
