import { motion, useScroll, useSpring } from 'framer-motion';
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

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="sticky top-0 z-40 border-b border-border bg-bg/72 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-[50px] max-w-6xl items-center gap-5 px-[clamp(18px,5vw,28px)]">
        <a href="#top" className="group flex items-center gap-2.5 text-[13.5px] font-semibold tracking-[-0.005em] text-ink">
          <span className="h-[7px] w-[7px] animate-[livedot_3s_ease-in-out_infinite] rounded-full bg-accent" />
          <span>Amr Ali Sultan</span>
        </a>
        <nav className="ml-auto hidden items-center gap-1 min-[720px]:flex">
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
          className="ml-2 rounded-full bg-ink px-[17px] py-2 text-[13px] font-medium text-bg transition-colors duration-300 hover:bg-accent"
        >
          Contact
        </motion.a>
      </div>

      {/* Reading progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
      />
    </motion.header>
  );
}
