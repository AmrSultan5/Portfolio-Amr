import { motion, type Variants } from 'framer-motion';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { fadeUp } from '../lib/motion';

/** Trigger point shared by every reveal: fires once the element is ~12% in. */
const VIEWPORT = { once: true, amount: 0.12, margin: '0px 0px -8% 0px' } as const;

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  variants?: Variants;
  delay?: number;
}

/** Fades + slides an element in as it scrolls into view. */
export function Reveal({ children, as = 'div', className, style, variants = fadeUp, delay = 0 }: RevealProps) {
  const MotionTag = motion[as as 'div'] ?? motion.div;
  return (
    <MotionTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={variants}
      custom={delay}
    >
      {children}
    </MotionTag>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

/**
 * Layout wrapper only — it deliberately does NOT orchestrate its children.
 *
 * Orchestrating from the parent meant one element crossing the threshold
 * revealed the entire section at once, so scrolling produced a single burst
 * and then nothing. Each RevealItem now carries its own viewport trigger, so
 * transitions keep firing continuously as you scroll through a section.
 */
export function RevealGroup({ children, className, as = 'div' }: RevealGroupProps) {
  const Tag = as as 'div';
  return <Tag className={className}>{children}</Tag>;
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variants?: Variants;
  as?: ElementType;
  delay?: number;
}

/** A self-triggering reveal — animates when it personally enters the viewport. */
export function RevealItem({
  children,
  className,
  style,
  variants = fadeUp,
  as = 'div',
  delay = 0,
}: RevealItemProps) {
  const MotionTag = motion[as as 'div'] ?? motion.div;
  return (
    <MotionTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={variants}
      custom={delay}
    >
      {children}
    </MotionTag>
  );
}
