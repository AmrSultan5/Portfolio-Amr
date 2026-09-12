import { motion } from 'framer-motion';
import type { Project } from '../data/projects';
import { projects } from '../data/projects';
import { Reveal, RevealGroup, RevealItem } from './Reveal';

interface WorkProps {
  onSelect: (project: Project) => void;
}

export function Work({ onSelect }: WorkProps) {
  return (
    <section id="work" className="bg-dark px-7 py-[clamp(96px,13vw,200px)] text-dark-ink">
      <div className="mx-auto max-w-6xl">
        <Reveal
          as="p"
          className="mx-auto max-w-[22ch] text-center text-[clamp(30px,5vw,68px)] font-semibold leading-[1.02] tracking-[-0.045em]"
        >
          A demo is easy. Authentication, cost per request, retrieval quality and deployment are the job.
        </Reveal>

        <Reveal
          className="mt-[clamp(80px,11vw,160px)] flex flex-wrap items-baseline gap-5 border-b border-dark-border-2 pb-[26px]"
        >
          <div className="text-xs uppercase tracking-[0.16em] text-dark-accent">Selected work</div>
          <div className="ml-auto text-[13px] text-dark-muted">Six systems · four of them run inside an enterprise</div>
        </Reveal>

        <RevealGroup
          className="mt-[clamp(28px,4vw,44px)] grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-[clamp(16px,2vw,24px)]"
          stagger={0.08}
        >
          {projects.map((p) => (
            <RevealItem key={p.title} className={p.featured ? 'col-span-full' : undefined}>
              <ProjectCard project={p} onSelect={onSelect} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ProjectCard({ project, onSelect }: { project: Project; onSelect: (p: Project) => void }) {
  const featured = project.featured;
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(project)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.16, 0.84, 0.44, 1] }}
      className={`group flex w-full cursor-pointer flex-col gap-4 rounded-[24px] border text-left transition-colors duration-300 ${
        featured
          ? 'gap-[22px] border-dark-border-2 bg-dark-3 p-[clamp(34px,5vw,68px)] hover:border-[#4C4C55] hover:bg-dark-4'
          : 'border-dark-border bg-dark-2 p-[clamp(28px,3vw,44px)] hover:border-[#4C4C55] hover:bg-[#15151A]'
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-3.5">
        <span
          className={`text-xs uppercase tracking-[0.14em] ${featured ? 'text-dark-accent' : 'text-dark-muted'}`}
        >
          {project.tag}
        </span>
        {featured && (
          <span className="ml-auto text-xs uppercase tracking-[0.14em] text-dark-muted">Case study →</span>
        )}
      </div>
      <div
        className={`font-semibold tracking-[-0.04em] ${
          featured
            ? 'max-w-[20ch] text-[clamp(28px,4.2vw,56px)] leading-[1]'
            : 'text-[clamp(22px,2.4vw,30px)] leading-[1.1] tracking-[-0.032em]'
        }`}
      >
        {project.title}
      </div>
      <p
        className={`m-0 text-dark-muted-3 ${
          featured ? 'max-w-[62ch] text-[clamp(16px,1.5vw,19px)] leading-[1.58]' : 'text-base leading-[1.6]'
        }`}
      >
        {project.summary}
      </p>
      <div className={`text-[13px] text-dark-muted-2 ${featured ? 'mt-1 tracking-[0.04em]' : 'mt-auto pt-2'}`}>
        {project.stackLine}
      </div>
    </motion.button>
  );
}
