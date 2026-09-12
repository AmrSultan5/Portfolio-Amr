import { motion } from 'framer-motion';
import type { StreamState } from '../three/heroHeadScene';

const WAVE_HEIGHTS = [22, 38, 58, 34, 72, 46, 88, 54, 30, 66, 42, 80, 36, 60, 26, 48, 70, 32];

const STATE_LABEL: Record<StreamState, string> = {
  listening: 'listening',
  thinking: 'thinking',
  streaming: 'streaming',
  complete: 'listening',
};

interface ChatCardProps {
  qText: string;
  aText: string;
  streamState: StreamState;
}

export function ChatCard({ qText, aText, streamState }: ChatCardProps) {
  const live = streamState === 'streaming';

  return (
    <div className="relative w-[196px] max-w-[196px]">
      <motion.div
        aria-hidden
        className="absolute -inset-3 rounded-[24px] bg-accent-glow/25 blur-2xl"
        animate={{ opacity: live ? 0.9 : 0.35 }}
        transition={{ duration: 0.6 }}
      />
      <div
        className="relative flex flex-col gap-2 rounded-[18px] border border-[#1F242D] p-4 shadow-[0_22px_50px_rgba(8,10,14,0.28),0_2px_0_rgba(255,255,255,0.06)_inset]"
        style={{ background: 'linear-gradient(168deg, #101318 0%, #07080B 58%)' }}
      >
        <div className="absolute left-[-7px] top-[26px] h-[13px] w-[13px] rounded-[3px] border-b border-l border-[#1F242D] bg-[#101318]" style={{ transform: 'rotate(45deg)' }} />

        <div className="flex items-center gap-2.5">
          <span className="h-[7px] w-[7px] animate-[livedot_2.4s_ease-in-out_infinite] rounded-full bg-accent-glow shadow-[0_0_10px_rgba(61,155,240,0.9)]" />
          <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.14em] text-dark-muted">
            {STATE_LABEL[streamState]}
          </span>
        </div>

        <div className="h-[31px] overflow-hidden text-[11px] leading-[1.4] text-dark-muted">{qText}</div>

        <div className="min-h-[28px]">
          <p className="m-0 text-[13px] leading-[1.46] tracking-[-0.008em] text-dark-ink">
            {aText}
            <span className="ml-[3px] inline-block h-[1em] w-[1.5px] translate-y-[0.13em] animate-[caret_1s_step-end_infinite] bg-accent-glow align-baseline" />
          </p>
        </div>

        <div className="flex h-[18px] items-center justify-between gap-[2px] border-t border-[#171C24]">
          {WAVE_HEIGHTS.map((h, i) => (
            <span
              key={i}
              className="w-[2px] origin-center rounded-full opacity-85 transition-transform duration-500 ease-out"
              style={{
                height: `${h}%`,
                background: 'linear-gradient(#3D9BF0,#1E5F9E)',
                animation: `wave 1.5s ease-in-out ${i * 83}ms infinite`,
                transform: live ? 'scaleY(1)' : 'scaleY(0.12)',
                opacity: live ? 0.85 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
