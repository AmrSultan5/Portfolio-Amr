import { stack } from '../data/qa';
import { MaskReveal } from './MaskReveal';
import { Reveal, RevealGroup, RevealItem } from './Reveal';

export function Stack() {
  return (
    <section id="stack" className="px-7 pb-[clamp(96px,13vw,200px)]">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-xs uppercase tracking-[0.16em] text-accent">Technical stack</Reveal>
        <MaskReveal as="h2" className="m-0 mt-[22px] max-w-[20ch] text-[clamp(30px,5vw,72px)] font-semibold leading-[1] tracking-[-0.046em]">
          What I actually work in, day to day.
        </MaskReveal>
        <RevealGroup className="mt-[clamp(48px,6vw,88px)] flex flex-col gap-[clamp(36px,4vw,56px)]">
          {stack.map((row) => (
            <RevealItem key={row.label} className="flex flex-wrap gap-x-11 gap-y-2.5">
              <div
                className="flex-none pt-2 text-xs uppercase tracking-[0.12em] text-muted-2"
                style={{ width: '130px', color: row.accent ? 'var(--color-accent)' : undefined }}
              >
                {row.label}
              </div>
              <div className="flex-1 text-[clamp(19px,2.2vw,28px)] font-medium leading-[1.34] tracking-[-0.028em] text-ink" style={{ minWidth: '300px' }}>
                {row.value}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
