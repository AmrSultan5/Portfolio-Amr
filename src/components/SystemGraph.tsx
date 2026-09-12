import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { SystemGraphHandle } from '../lib/systemGraph';
import { EASE } from '../lib/motion';

export function SystemGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<SystemGraphHandle | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('../lib/systemGraph').then(({ mountSystemGraph }) => {
      if (cancelled || !canvasRef.current) return;
      handleRef.current = mountSystemGraph(canvasRef.current);
    });
    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative aspect-[7/5] w-full sm:aspect-[8/5]">
        <canvas
          ref={canvasRef}
          onPointerDown={() => setTouched(true)}
          className="absolute inset-0 h-full w-full touch-manipulation"
          aria-hidden
        />
      </div>

      {/* Discoverability: without a nudge most visitors never learn it is
          interactive, and the interaction is the whole argument. */}
      <motion.div
        className="mt-1 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-2"
        animate={{ opacity: touched ? 0.45 : 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <motion.span
          aria-hidden
          className="h-1 w-1 rounded-full bg-accent"
          animate={touched ? { opacity: 0.5 } : { opacity: [0.35, 1, 0.35], scale: [1, 1.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span>{touched ? 'it reroutes, then recovers' : 'click a node to take it offline'}</span>
      </motion.div>
    </div>
  );
}
