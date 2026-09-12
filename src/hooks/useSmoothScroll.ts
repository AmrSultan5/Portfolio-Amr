import Lenis from 'lenis';
import { useEffect } from 'react';

/**
 * Inertial scrolling for the whole page. Anchor links are routed through Lenis
 * so in-page navigation eases instead of jumping, and reduced-motion users keep
 * native scrolling untouched.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) return;

    const lenis = new Lenis({
      // lerp rather than duration: it tracks the wheel continuously instead of
      // restarting a tween per event, which is what makes fast flicks feel
      // gluey.
      lerp: 0.1,
      wheelMultiplier: 1,
      // Native momentum on touch already feels right; smoothing it fights the OS.
      syncTouch: false,
      touchMultiplier: 1.8,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      // Offset for the sticky header.
      lenis.scrollTo(target as HTMLElement, { offset: -54 });
    };
    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}
