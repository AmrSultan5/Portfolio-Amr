import { motion } from 'framer-motion';
import { qa } from '../data/qa';
import { useTypingStream } from '../hooks/useTypingStream';
import { EASE } from '../lib/motion';
import { ChatCard } from './ChatCard';
import { HeroHead } from './HeroHead';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

/** Lines rise out of a mask rather than just fading — reads editorial. */
const lineMask = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 1.15, ease: EASE } },
};

const soft = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.95, ease: EASE } },
};

export function Hero() {
  const { qText, aText, streamState } = useTypingStream(qa, 30);

  return (
    <section id="top" className="relative overflow-hidden px-[clamp(20px,5vw,28px)]">
      {/* Ambient backdrop. No blur filter — a radial gradient is already a soft
          falloff, and filtering a ~560px element every frame is expensive on
          mobile for no visible difference. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-[4%] top-[8%] h-[52vw] max-h-[640px] w-[52vw] max-w-[640px] animate-[drift_20s_ease-in-out_infinite] rounded-full will-change-transform"
          style={{ background: 'radial-gradient(circle, rgba(44,111,181,0.16) 0%, rgba(44,111,181,0) 70%)' }}
        />
        <div
          className="absolute bottom-[2%] right-[2%] h-[44vw] max-h-[520px] w-[44vw] max-w-[520px] animate-[drift_26s_ease-in-out_infinite_reverse] rounded-full will-change-transform"
          style={{ background: 'radial-gradient(circle, rgba(61,155,240,0.13) 0%, rgba(61,155,240,0) 70%)' }}
        />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="mx-auto flex w-full max-w-6xl flex-col lg:flex-row lg:items-center lg:gap-[clamp(24px,4vw,72px)]"
      >
        {/* On phones this column alone fills the first screen, so the robot sits
            below the fold and is discovered on scroll. */}
        <div
          className="flex min-h-[calc(100svh-54px)] flex-col justify-center gap-[clamp(14px,2.2vh,22px)] py-[clamp(24px,5vh,56px)] lg:min-h-[calc(100svh-54px)] lg:flex-1 lg:py-0"
        >
          <motion.div variants={soft} className="flex">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-border-2 bg-white/70 px-[15px] py-[7px] text-xs text-muted-2 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-[livedot_3s_ease-in-out_infinite] rounded-full bg-accent" />
              <span>Open for freelance · Web · AI agents · Android</span>
            </span>
          </motion.div>

          <h1 className="m-0 max-w-[15ch] text-[clamp(31px,5.4vw,80px)] font-semibold leading-[0.98] tracking-[-0.047em]">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span variants={lineMask} className="block text-ink">
                Most freelancers have side projects.
              </motion.span>
            </span>
            <span className="mt-[0.06em] block overflow-hidden pb-[0.06em]">
              <motion.span variants={lineMask} className="block text-accent">
                I have systems in production.
              </motion.span>
            </span>
          </h1>

          <motion.div variants={soft} className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <motion.a
              href="#contact"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="rounded-full bg-ink px-[30px] py-[15px] text-center text-[15px] font-medium text-bg shadow-[0_2px_10px_rgba(16,16,17,0.12)] transition-colors duration-300 hover:bg-accent hover:shadow-[0_18px_36px_-8px_rgba(44,111,181,0.5)]"
            >
              Start a project
            </motion.a>
            <motion.a
              href="#work"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="rounded-full border border-border-3 bg-white/60 px-[30px] py-[15px] text-center text-[15px] font-medium text-ink transition-colors duration-300 hover:border-ink"
            >
              See selected work
            </motion.a>
          </motion.div>

        </div>

        {/* Head + card as one composition */}
        <motion.div
          variants={soft}
          className="relative mx-auto flex flex-col items-center pb-[clamp(72px,12vh,120px)] lg:mx-0 lg:pb-0"
          style={{ flex: '0 1 380px', minWidth: 'min(100%, 300px)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[38%] aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                'radial-gradient(ellipse, rgba(61,155,240,0.16) 0%, rgba(61,155,240,0.04) 46%, rgba(61,155,240,0) 72%)',
            }}
          />
          <HeroHead streamState={streamState} />
          <div className="relative -mt-6 w-full px-2">
            <ChatCard qText={qText} aText={aText} streamState={streamState} />
          </div>
        </motion.div>
      </motion.div>

      {/* Absolutely positioned rather than a flex child: as a child with mt-auto
          it absorbed the column's free space and defeated justify-center,
          pushing the whole hero to the top of the screen. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[11.5px] uppercase tracking-[0.14em] text-muted-2 lg:flex"
      >
        <span>Scroll</span>
        <motion.span
          aria-hidden
          className="block h-px w-10 origin-left bg-muted-2/50"
          animate={{ scaleX: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
