import { useEffect, useRef, useState } from 'react';
import type { HeroHeadHandle, StreamState } from '../three/heroHeadScene';

interface HeroHeadProps {
  streamState: StreamState;
}

export function HeroHead({ streamState }: HeroHeadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<HeroHeadHandle | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('../three/heroHeadScene')
      .then(({ mountHeroHead }) => {
        if (cancelled || !canvasRef.current) return;
        handleRef.current = mountHeroHead(canvasRef.current);
        setReady(true);
      })
      .catch(() => {
        // Three.js failed to init (e.g. no WebGL) — the fallback orb stays visible.
      });
    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  useEffect(() => {
    handleRef.current?.setStreamState(streamState);
  }, [streamState]);

  return (
    <div className="relative h-[clamp(208px,34vh,360px)] w-[clamp(158px,20vw,272px)]">
      {/* Grounding pedestal — without it the head reads as floating debris */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[2%] left-1/2 h-[9%] w-[78%] -translate-x-1/2 rounded-[50%] blur-md"
        style={{ background: 'radial-gradient(ellipse, rgba(10,12,18,0.30) 0%, rgba(10,12,18,0) 72%)' }}
      />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 w-[min(58%,168px)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
      >
        <div
          className="relative flex w-full items-center justify-center rounded-[34%/26%] shadow-[0_34px_64px_rgba(6,7,10,0.32)]"
          style={{
            aspectRatio: 0.74,
            background: 'radial-gradient(120% 85% at 32% 8%, #45474D 0%, #15161B 36%, #07070A 74%)',
          }}
        >
          <div className="h-[3px] w-[52%] animate-[eyeglow_4s_ease-in-out_infinite] rounded-full bg-accent-glow shadow-[0_0_14px_rgba(61,155,240,0.85)]" />
        </div>
      </div>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" />
    </div>
  );
}
