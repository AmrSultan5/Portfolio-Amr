import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EASE } from '../lib/motion';

const NAV_LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#stack', label: 'Stack' },
  { href: '#about', label: 'About' },
];

export function Header() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="sticky top-0 z-50 border-b border-border bg-bg/72 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-[54px] max-w-6xl items-center gap-5 px-[clamp(18px,5vw,28px)]">
        <a
          href="#top"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 text-[13.5px] font-semibold tracking-[-0.005em] text-ink"
        >
          <span className="h-[7px] w-[7px] animate-[livedot_3s_ease-in-out_infinite] rounded-full bg-accent" />
          <span>Amr Ali Sultan</span>
        </a>

        <nav className="ml-auto hidden items-center gap-1 min-[860px]:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-full px-3 py-1.5 text-[13px] text-muted-2 transition-colors duration-300 hover:text-ink"
            >
              {link.label}
              <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-ink/30 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <motion.a
          href="#contact"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className="ml-auto inline-flex min-h-[42px] items-center rounded-full bg-ink px-[18px] text-[13px] font-medium text-bg transition-colors duration-300 hover:bg-accent min-[860px]:ml-2 min-[860px]:min-h-0 min-[860px]:py-2"
        >
          Contact
        </motion.a>

        {/* Mobile menu toggle — 44px hit area */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-[#EBE9E3] min-[860px]:hidden"
        >
          <span className="relative block h-[10px] w-[18px]">
            <motion.span
              className="absolute left-0 block h-[1.5px] w-full rounded-full bg-current"
              animate={open ? { top: 4, rotate: 45 } : { top: 0, rotate: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
            <motion.span
              className="absolute left-0 block h-[1.5px] w-full rounded-full bg-current"
              animate={open ? { top: 4, rotate: -45 } : { top: 8, rotate: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </span>
        </button>
      </div>

      {/* Reading progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
      />

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: EASE }}
            className="overflow-hidden border-t border-border bg-bg/95 backdrop-blur-xl min-[860px]:hidden"
          >
            <div className="flex flex-col px-[clamp(18px,5vw,28px)] py-2">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.4, ease: EASE }}
                  className="border-b border-border/60 py-3.5 text-[17px] font-medium tracking-[-0.02em] text-ink last:border-b-0"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
