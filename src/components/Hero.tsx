import { motion } from 'framer-motion';
import { qa } from '../data/qa';
import { useTypingStream } from '../hooks/useTypingStream';
import { EASE, staggerContainer } from '../lib/motion';
import { ChatCard } from './ChatCard';
import { HeroHead } from './HeroHead';

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

export function Hero() {
  const { qText, aText, streamState } = useTypingStream(qa, 30);

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-50px)] flex-col justify-center overflow-hidden px-7 py-[clamp(24px,4vh,56px)]"
    >
      {/* Ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-[8%] top-[12%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px] animate-[drift_18s_ease-in-out_infinite] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(44,111,181,0.14) 0%, rgba(44,111,181,0) 70%)' }}
        />
        <div
          className="absolute bottom-[6%] right-[6%] h-[38vw] max-h-[460px] w-[38vw] max-w-[460px] animate-[drift_22s_ease-in-out_infinite_reverse] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(61,155,240,0.12) 0%, rgba(61,155,240,0) 70%)' }}
        />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer(0.12, 0.05)}
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-wrap items-center gap-[clamp(14px,2vw,40px)]"
      >
        <div className="relative z-[3] flex flex-1 flex-col items-start gap-[clamp(12px,2vh,20px)] py-[clamp(10px,2vh,36px)]" style={{ flexBasis: '340px' }}>
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2.5 rounded-full border border-border-2 bg-white/72 px-[15px] py-[7px] text-xs text-muted-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>Open for freelance · Web · AI agents · Android</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="m-0 max-w-[16ch] text-[clamp(29px,5.2vw,82px)] font-semibold leading-[0.96] tracking-[-0.046em] text-ink"
          >
            Most freelancers have side projects.
          </motion.h1>
          <motion.h1
            variants={item}
            className="m-0 -mt-2 max-w-[16ch] text-[clamp(29px,5.2vw,82px)] font-semibold leading-[0.96] tracking-[-0.046em] text-accent"
          >
            I have systems in production.
          </motion.h1>

          <motion.div variants={item} className="mt-3.5 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="rounded-full bg-ink px-[30px] py-[15px] text-[15px] font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-[0_16px_32px_rgba(44,111,181,0.28)]"
            >
              Start a project
            </a>
            <a
              href="#work"
              className="rounded-full border border-border-3 bg-white/60 px-[30px] py-[15px] text-[15px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink"
            >
              See selected work
            </a>
          </motion.div>
        </div>

        <motion.div
          variants={item}
          className="relative flex flex-wrap items-center justify-center gap-[clamp(8px,1.4vw,18px)] py-[clamp(4px,1vh,16px)]"
          style={{ flex: '0 1 456px', minWidth: 'min(100%, 448px)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-[34%] top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'radial-gradient(ellipse, rgba(61,155,240,0.16) 0%, rgba(61,155,240,0.05) 44%, rgba(61,155,240,0) 72%)' }}
          />
          <HeroHead streamState={streamState} />
          <ChatCard qText={qText} aText={aText} streamState={streamState} />
        </motion.div>
      </motion.div>
    </section>
  );
}
