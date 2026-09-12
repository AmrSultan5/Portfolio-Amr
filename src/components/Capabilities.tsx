import { capabilities } from '../data/qa';
import { MaskReveal } from './MaskReveal';
import { Reveal, RevealGroup, RevealItem } from './Reveal';

export function Capabilities() {
  return (
    <section id="capabilities" className="px-7 py-[clamp(96px,13vw,200px)]">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-xs uppercase tracking-[0.16em] text-accent">What I build</Reveal>
        <MaskReveal as="h2" className="m-0 mt-[22px] max-w-[22ch] text-[clamp(30px,5vw,72px)] font-semibold leading-[1] tracking-[-0.046em]">
          Three things, done properly. Not a menu of everything.
        </MaskReveal>
        <RevealGroup
          className="mt-[clamp(56px,7vw,112px)] grid grid-cols-[repeat(auto-fit,minmax(min(290px,100%),1fr))] gap-[clamp(36px,5vw,72px)]"
          stagger={0.1}
        >
          {capabilities.map((c) => (
            <RevealItem
              key={c.title}
              className="flex flex-col gap-4 border-t pt-[26px]"
              style={{ borderTopColor: c.accent ? 'var(--color-accent)' : 'var(--color-ink)' }}
            >
              <div className="text-xs uppercase tracking-[0.14em] text-muted-2" style={{ color: c.accent ? 'var(--color-accent)' : undefined }}>
                {c.index}
              </div>
              <div className="text-[clamp(24px,2.6vw,32px)] font-semibold tracking-[-0.034em]">{c.title}</div>
              <p className="m-0 text-[16.5px] leading-[1.62] text-muted">{c.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
