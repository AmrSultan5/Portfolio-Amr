import { motion } from 'framer-motion';

const NAV_LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#stack', label: 'Stack' },
  { href: '#about', label: 'About' },
];

export function Header() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 0.84, 0.44, 1] }}
      className="sticky top-0 z-40 border-b border-border bg-bg/72 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-[50px] max-w-6xl items-center gap-5 px-[clamp(18px,5vw,28px)]">
        <a href="#top" className="flex items-center gap-2.5 text-[13.5px] font-semibold tracking-[-0.005em] text-ink">
          <span className="h-[7px] w-[7px] animate-[livedot_3s_ease-in-out_infinite] rounded-full bg-accent" />
          <span>Amr Ali Sultan</span>
        </a>
        <nav className="ml-auto hidden items-center gap-1 min-[720px]:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-[13px] text-muted-2 transition-colors duration-200 hover:bg-[#EBE9E3] hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="ml-2 rounded-full bg-ink px-[17px] py-2 text-[13px] font-medium text-bg transition-colors duration-200 hover:bg-accent hover:text-white"
        >
          Contact
        </a>
      </div>
    </motion.header>
  );
}
