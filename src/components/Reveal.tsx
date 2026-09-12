import { motion, type Variants } from 'framer-motion';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { fadeUp } from '../lib/motion';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  variants?: Variants;
  /** Stagger index — offsets the reveal delay for siblings entering together. */
  index?: number;
}

/** Fades + slides an element in once it scrolls into view. Reduced-motion users get an instant appearance via the global CSS override. */
export function Reveal({ children, as = 'div', className, variants = fadeUp, index = 0 }: RevealProps) {
  const MotionTag = motion[as as 'div'] ?? motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      custom={index}
    >
      {children}
    </MotionTag>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: ElementType;
}

/** Wraps a set of RevealItem children so they stagger in together instead of firing independently. */
export function RevealGroup({ children, className, stagger = 0.09, as = 'div' }: RevealGroupProps) {
  const MotionTag = motion[as as 'div'] ?? motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </MotionTag>
  );
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variants?: Variants;
  as?: ElementType;
}

/** A child of RevealGroup — inherits the group's viewport trigger and stagger timing instead of animating independently. */
export function RevealItem({ children, className, style, variants = fadeUp, as = 'div' }: RevealItemProps) {
  const MotionTag = motion[as as 'div'] ?? motion.div;
  return (
    <MotionTag className={className} style={style} variants={variants}>
      {children}
    </MotionTag>
  );
}
