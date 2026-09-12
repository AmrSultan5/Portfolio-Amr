import { motion } from 'framer-motion';
import { qa } from '../data/qa';
import { useTypingStream } from '../hooks/useTypingStream';
import { EASE } from '../lib/motion';
import { ChatCard } from './ChatCard';
import { HeroHead } from './HeroHead';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.12 } },
};

/** Lines rise out of a mask rather than just fading — reads editorial, not templated. */
const lineMask = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 1.05, ease: EASE } },
};

const soft = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export function Hero() {
  const { qText, aText, streamState } = useTypingStream(qa, 30);

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-54px)] flex-col justify-center overflow-hidden px-[clamp(18px,5vw,28px)] py-[clamp(28px,5vh,64px)]"
    >
      {/* Ambient backdrop. No blur filter — a radial gradient is already a soft
          falloff, and filtering a ~560px element every frame is expensive on
          mobile for no visible difference. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-[6%] top-[10%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px] animate-[drift_20s_ease-in-out_infinite] rounded-full will-change-transform"
          style={{ background: 'radial-gradient(circle, rgba(44,111,181,0.15) 0%, rgba(44,111,181,0) 70%)' }}
        />
        <div
          className="absolute bottom-[4%] right-[4%] h-[40vw] max-h-[480px] w-[40vw] max-w-[480px] animate-[drift_26s_ease-in-out_infinite_reverse] rounded-full will-change-transform"
          style={{ background: 'radial-gradient(circle, rgba(61,155,240,0.13) 0%, rgba(61,155,240,0) 70%)' }}
        />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-[clamp(20px,4vw,64px)] gap-y-[clamp(32px,6vh,56px)]"
      >
        <div
          className="relative z-[3] flex flex-col items-start gap-[clamp(14px,2.2vh,22px)]"
          style={{ flex: '1 1 380px' }}
        >
          <motion.div
            variants={soft}
            className="inline-flex items-center gap-2.5 rounded-full border border-border-2 bg-white/70 px-[15px] py-[7px] text-xs text-muted-2 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-[livedot_3s_ease-in-out_infinite] rounded-full bg-accent" />
            <span>Open for freelance · Web · AI agents · Android</span>
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
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="rounded-full bg-ink px-[30px] py-[15px] text-center text-[15px] font-medium text-bg shadow-[0_2px_10px_rgba(16,16,17,0.12)] transition-colors duration-300 hover:bg-accent hover:shadow-[0_18px_36px_-8px_rgba(44,111,181,0.5)]"
            >
              Start a project
            </motion.a>
            <motion.a
              href="#work"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="rounded-full border border-border-3 bg-white/60 px-[30px] py-[15px] text-center text-[15px] font-medium text-ink transition-colors duration-300 hover:border-ink"
            >
              See selected work
            </motion.a>
          </motion.div>
        </div>

        {/* Head + card as one composition, not two loose objects */}
        {/* mx-auto centres this block on the row it lands on — without it the
            visual stays pinned left once the columns wrap at tablet widths. */}
        <motion.div
          variants={soft}
          className="relative mx-auto flex flex-col items-center"
          style={{ flex: '0 1 380px', minWidth: 'min(100%, 300px)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[38%] aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                'radial-gradient(ellipse, rgba(61,155,240,0.15) 0%, rgba(61,155,240,0.04) 46%, rgba(61,155,240,0) 72%)',
            }}
          />
          <HeroHead streamState={streamState} />
          <div className="relative -mt-6 w-full px-2">
            <ChatCard qText={qText} aText={aText} streamState={streamState} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
