import { motion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { EASE } from '../lib/motion';

interface MaskRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
}

const inner = {
  hidden: { y: '110%' },
  show: (delay: number) => ({
    y: '0%',
    transition: { duration: 1, ease: EASE, delay },
  }),
};

/**
 * Text rises out of a clipping mask instead of fading in place. Used for the
 * large section headings — the extra weight suits display type, where a plain
 * fade reads flat.
 *
 * The viewport trigger lives on the clipping wrapper, not the element that
 * moves: IntersectionObserver accounts for ancestor `overflow: hidden`, so
 * observing the translated child would report zero visible area and never fire.
 */
export function MaskReveal({ children, as = 'div', className, delay = 0 }: MaskRevealProps) {
  const Tag = as as 'div';
  return (
    <Tag className={className}>
      <motion.span
        className="block overflow-hidden pb-[0.08em]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.span className="block" variants={inner} custom={delay}>
          {children}
        </motion.span>
      </motion.span>
    </Tag>
  );
}
