import { AnimatePresence, motion } from 'framer-motion';
import type { StreamState } from '../three/heroHeadScene';

const STATE_LABEL: Record<StreamState, string> = {
  listening: 'Listening',
  thinking: 'Thinking',
  streaming: 'Responding',
  complete: 'Listening',
};

interface ChatCardProps {
  qText: string;
  aText: string;
  streamState: StreamState;
}

export function ChatCard({ qText, aText, streamState }: ChatCardProps) {
  const live = streamState === 'streaming';
  const thinking = streamState === 'thinking';

  return (
    <div className="relative mx-auto w-full max-w-[330px]">
      {/* Ambient bloom, brightest while the model is answering */}
      <motion.div
        aria-hidden
        className="absolute -inset-6 rounded-[32px] bg-accent-glow/20 blur-3xl"
        animate={{ opacity: live ? 0.85 : thinking ? 0.5 : 0.28 }}
        transition={{ duration: 0.8, ease: [0.16, 0.84, 0.44, 1] }}
      />

      {/* Gradient hairline border — a 1px flat stroke reads cheap at this scale */}
      <div
        className="relative rounded-[20px] p-px shadow-[0_28px_60px_-12px_rgba(8,10,14,0.55)]"
        style={{
          background:
            'linear-gradient(150deg, rgba(125,175,235,0.38) 0%, rgba(60,72,90,0.22) 38%, rgba(30,36,46,0.18) 100%)',
        }}
      >
        <div
          className="relative overflow-hidden rounded-[19px] px-5 py-[18px]"
          style={{ background: 'linear-gradient(158deg, #12161C 0%, #090A0E 62%)' }}
        >
          {/* Top sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
            style={{
              background:
                'radial-gradient(120% 100% at 20% 0%, rgba(125,185,238,0.14) 0%, rgba(125,185,238,0) 70%)',
            }}
          />

          <div className="relative flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-accent-glow"
                animate={{ opacity: live ? [0.4, 1, 0.4] : 0.55, scale: live ? [1, 1.6, 1] : 1 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-glow" />
            </span>
            <span className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-[#7E8A9B]">
              {STATE_LABEL[streamState]}
            </span>
          </div>

          <div className="relative mt-3.5 min-h-[15px] text-[11.5px] leading-[1.45] text-[#79828F]">
            {qText}
          </div>

          <div className="relative mt-2 min-h-[42px]">
            <p className="m-0 text-[14px] leading-[1.5] tracking-[-0.011em] text-[#EDF1F7]">
              {aText}
              <AnimatePresence>
                {!live && aText.length === 0 && thinking ? null : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-[3px] inline-block h-[0.95em] w-[1.5px] translate-y-[0.14em] animate-[caret_1s_step-end_infinite] rounded-full bg-accent-glow align-baseline"
                  />
                )}
              </AnimatePresence>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
