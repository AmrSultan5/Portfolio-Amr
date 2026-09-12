import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface CountUpProps {
  /** e.g. "228", "100%", "3" — any non-digit characters are preserved as a suffix. */
  value: string;
  className?: string;
  style?: CSSProperties;
}

/** Counts a stat up from zero the first time it scrolls into view. */
export function CountUp({ value, className, style }: CountUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const target = parseFloat(value);
  const suffix = value.replace(/^[\d.]+/, '');
  // Reduced-motion users start at the final value rather than being counted up.
  const [display, setDisplay] = useState(() => {
    if (Number.isNaN(target)) return value;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    return reduced ? String(target) : '0';
  });

  useEffect(() => {
    if (!inView || Number.isNaN(target)) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: [0.16, 0.84, 0.44, 1],
      onUpdate: (v) => setDisplay(String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <div ref={ref} className={className} style={style}>
      {Number.isNaN(target) ? value : display + suffix}
    </div>
  );
}
