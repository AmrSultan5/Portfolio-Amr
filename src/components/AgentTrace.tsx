import { AnimatePresence, motion } from 'framer-motion';
import { agentRuns } from '../data/agentRuns';
import { useAgentRun, type StepStatus } from '../hooks/useAgentRun';
import { EASE } from '../lib/motion';

export function AgentTrace() {
  const { run, runIndex, query, stepStatus, answer, elapsed, phase } = useAgentRun(agentRuns);
  const live = phase === 'steps' || phase === 'answer';

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      {/* Ambient bloom, strongest while the run is executing */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-12 rounded-[48px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(61,155,240,0.26) 0%, rgba(61,155,240,0.08) 46%, rgba(61,155,240,0) 72%)',
        }}
        animate={{ opacity: live ? 0.95 : 0.4 }}
        transition={{ duration: 0.9, ease: EASE }}
      />

      {/* Gradient hairline — a flat 1px stroke reads cheap at this size */}
      <div
        className="relative rounded-[22px] p-px shadow-[0_40px_90px_-24px_rgba(8,10,14,0.6)]"
        style={{
          background:
            'linear-gradient(155deg, rgba(130,180,238,0.42) 0%, rgba(60,72,90,0.22) 40%, rgba(28,34,44,0.16) 100%)',
        }}
      >
        <div
          className="relative overflow-hidden rounded-[21px]"
          style={{ background: 'linear-gradient(162deg, #0F131A 0%, #080A0E 64%)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-70"
            style={{
              background:
                'radial-gradient(120% 100% at 18% 0%, rgba(125,185,238,0.13) 0%, rgba(125,185,238,0) 72%)',
            }}
          />

          {/* Header */}
          <div className="relative flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-3.5">
            <span className="relative flex h-1.5 w-1.5">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-accent-glow"
                animate={{ opacity: live ? [0.35, 1, 0.35] : 0.5, scale: live ? [1, 1.7, 1] : 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-glow" />
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#7C8899]">
              agent · run
            </span>
            <span className="ml-auto font-mono text-[10.5px] tabular-nums text-[#5E6979]">
              {run.model}
            </span>
            <span className="font-mono text-[10.5px] tabular-nums text-[#5E6979]">
              {(elapsed / 1000).toFixed(2)}s
            </span>
          </div>

          <div className="relative px-5 pb-5 pt-4">
            {/* Query */}
            <div className="flex gap-2.5">
              <span className="mt-[3px] font-mono text-[12px] leading-none text-accent-glow">›</span>
              <p className="m-0 min-h-[19px] text-[13.5px] leading-[1.45] text-[#C3CCD9]">
                {query}
                {phase === 'query' && (
                  <span className="ml-[2px] inline-block h-[0.92em] w-[1.5px] translate-y-[0.12em] animate-[caret_1s_step-end_infinite] rounded-full bg-accent-glow align-baseline" />
                )}
              </p>
            </div>

            {/* Steps — a connected vertical run, like a graph execution path */}
            <div className="relative mt-4">
              <span
                aria-hidden
                className="absolute bottom-2 left-[3.5px] top-2 w-px bg-gradient-to-b from-accent-glow/40 via-white/10 to-transparent"
              />
              <AnimatePresence initial={false}>
                {run.steps.map((step, i) =>
                  stepStatus[i] === 'pending' ? null : (
                    <motion.div
                      key={`${runIndex}-${step.label}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="relative flex items-center gap-3 py-[5px] pl-5"
                    >
                      <StepMarker status={stepStatus[i]} />
                      <span className="w-[74px] shrink-0 font-mono text-[11.5px] text-[#D2DAE6]">
                        {step.label}
                      </span>
                      <span className="truncate font-mono text-[11.5px] text-[#68748A]">
                        {step.detail}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-[#4F5A6B]">
                        {stepStatus[i] === 'done' ? `${step.ms}ms` : '···'}
                      </span>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
            </div>

            {/* Answer */}
            <AnimatePresence>
              {(phase === 'answer' || phase === 'complete') && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3"
                >
                  <p className="m-0 text-[13.5px] leading-[1.55] tracking-[-0.008em] text-[#EEF3FA]">
                    {answer}
                    {phase === 'answer' && (
                      <span className="ml-[2px] inline-block h-[0.92em] w-[1.5px] translate-y-[0.12em] animate-[caret_1s_step-end_infinite] rounded-full bg-accent-glow align-baseline" />
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-4 flex items-center gap-3 border-t border-white/[0.06] pt-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#4F5A6B]">
                grounded · {run.steps.length} steps
              </span>
              <span className="ml-auto font-mono text-[10.5px] tabular-nums text-[#4F5A6B]">
                {run.cost}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepMarker({ status }: { status: StepStatus }) {
  return (
    <span className="absolute left-0 flex h-2 w-2 items-center justify-center">
      {status === 'running' ? (
        <motion.span
          className="block h-2 w-2 rounded-[2px] bg-accent-glow"
          animate={{ rotate: 45, opacity: [0.45, 1, 0.45] }}
          transition={{ opacity: { duration: 1, repeat: Infinity }, rotate: { duration: 0 } }}
        />
      ) : (
        <motion.span
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="block h-2 w-2 rotate-45 rounded-[2px] bg-accent-glow/85 shadow-[0_0_8px_rgba(61,155,240,0.7)]"
        />
      )}
    </span>
  );
}
