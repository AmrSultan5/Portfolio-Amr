import { process } from '../data/qa';
import { MaskReveal } from './MaskReveal';
import { Reveal, RevealGroup, RevealItem } from './Reveal';

export function Process() {
  return (
    <section className="px-7 pb-[clamp(96px,13vw,200px)]">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-xs uppercase tracking-[0.16em] text-accent">How I work</Reveal>
        <MaskReveal as="h2" className="m-0 mt-[22px] max-w-[22ch] text-[clamp(30px,5vw,72px)] font-semibold leading-[1] tracking-[-0.046em]">
          Four steps. You always know where the project stands.
        </MaskReveal>
        <RevealGroup
          className="mt-[clamp(48px,6vw,96px)] grid grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))] gap-[clamp(28px,3.5vw,48px)]"
         
        >
          {process.map((p, i) => (
            <RevealItem
              key={p.step}
              delay={i * 0.07}
              className="flex flex-col gap-3 border-t pt-6"
              style={{ borderTopColor: 'var(--color-border)' }}
            >
              <div className="text-xs uppercase tracking-[0.14em]" style={{ color: p.accent ? 'var(--color-accent)' : 'var(--color-muted-2)' }}>
                {p.step}
              </div>
              <div className="text-[21px] font-semibold tracking-[-0.026em]">{p.title}</div>
              <p className="m-0 text-[15.5px] leading-[1.6] text-muted">{p.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
