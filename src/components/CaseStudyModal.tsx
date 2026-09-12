import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Project } from '../data/projects';

interface CaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
}

export function CaseStudyModal({ project, onClose }: CaseStudyModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[rgba(8,8,10,0.58)] px-5 py-[5vh] backdrop-blur-2xl"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 0.84, 0.44, 1] }}
            className="relative w-full max-w-[840px] rounded-[30px] bg-bg p-[clamp(30px,4.5vw,60px)] text-ink shadow-[0_50px_110px_rgba(8,8,10,0.4)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 h-9 w-9 rounded-full border border-border-2 bg-[#EDEBE6] text-base text-muted transition-colors duration-200 hover:border-ink hover:text-ink"
              aria-label="Close"
            >
              ×
            </button>
            <div className="text-xs uppercase tracking-[0.14em] text-accent">{project.meta}</div>
            <h3 className="m-0 mt-[18px] max-w-[22ch] text-[clamp(26px,3.6vw,44px)] font-semibold leading-[1.02] tracking-[-0.044em]">
              {project.title}
            </h3>
            <div className="mt-[38px] flex flex-col gap-[30px] border-t border-border-2 pt-[34px]">
              <Field label="Problem" accent={false}>
                {project.problem}
              </Field>
              <Field label="What I built" accent={false}>
                {project.built}
              </Field>
              <div className="flex flex-wrap gap-2 gap-y-2 sm:gap-x-8">
                <div className="flex-none text-xs uppercase tracking-[0.14em] text-muted-2" style={{ width: '120px' }}>
                  Stack
                </div>
                <div className="flex-1 text-base leading-[1.7] text-muted" style={{ minWidth: '260px' }}>
                  {project.stackLine}
                </div>
              </div>
              <Field label="Result" accent>
                {project.result}
              </Field>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, accent, children }: { label: string; accent: boolean; children: string }) {
  return (
    <div className="flex flex-wrap gap-2 gap-y-2 sm:gap-x-8">
      <div
        className="flex-none text-xs uppercase tracking-[0.14em]"
        style={{ width: '120px', color: accent ? 'var(--color-accent)' : 'var(--color-muted-2)' }}
      >
        {label}
      </div>
      <p
        className="m-0 flex-1 text-[16.5px] leading-[1.66]"
        style={{ minWidth: '260px', color: accent ? 'var(--color-ink)' : 'var(--color-ink-soft)' }}
      >
        {children}
      </p>
    </div>
  );
}
