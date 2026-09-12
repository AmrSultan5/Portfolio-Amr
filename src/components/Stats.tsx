import { stats } from '../data/qa';
import { CountUp } from './CountUp';
import { RevealGroup, RevealItem } from './Reveal';

export function Stats() {
  return (
    <section className="border-t border-border px-7 pb-[clamp(80px,11vw,160px)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3.5 py-[18px] pb-[clamp(56px,8vw,110px)] text-xs uppercase tracking-[0.08em] text-muted-2">
        <span>Cairo · GMT+2 · Remote</span>
        <span className="ml-auto">Freelance capacity: open</span>
      </div>
      <RevealGroup className="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-[clamp(40px,6vw,88px)]">
        {stats.map((s, i) => (
          <RevealItem key={s.label} delay={i * 0.08}>
            <CountUp
              value={s.value}
              className="tabular-nums text-[clamp(56px,7vw,104px)] font-semibold leading-[0.94] tracking-[-0.05em]"
              style={{ color: s.accent ? 'var(--color-accent)' : undefined }}
            />
            <div className="mt-[18px] max-w-[24ch] text-[15px] leading-[1.6] text-muted">{s.label}</div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
