import { Reveal } from './Reveal';

export function About() {
  return (
    <section id="about" className="px-7 pb-[clamp(96px,13vw,200px)]">
      <div className="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-[clamp(36px,5vw,88px)]">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.16em] text-accent">About</div>
          <h2 className="m-0 mt-[22px] max-w-[18ch] text-[clamp(28px,4vw,56px)] font-semibold leading-[1.02] tracking-[-0.046em]">
            Data Science at GIU, then production systems inside an enterprise.
          </h2>
        </Reveal>
        <Reveal className="flex flex-col gap-6 pt-2">
          <p className="m-0 text-[clamp(16px,1.5vw,18.5px)] leading-[1.68] text-ink-soft">
            I'm a Data Science senior at the German International University in Cairo. Alongside the degree I joined
            the Data &amp; AI team at a large multinational FMCG company as an intern and stayed on as a trainee —
            which is where I learned the difference between a demo and a system: authentication, cost per request,
            retrieval quality, deployment, and the people who depend on it working on Monday morning.
          </p>
          <p className="m-0 text-[clamp(16px,1.5vw,18.5px)] leading-[1.68] text-ink-soft">
            Since then I've shipped internal AI assistants, a rule-driven data-quality agent, and a full e-learning
            platform on Azure. I hold Anthropic Academy certifications in building with the Claude API, MCP, and
            agent design. I take on freelance work in web applications, AI agents and LLM systems, and Android apps.
          </p>
          <div className="mt-2 text-[13px] leading-[1.9] tracking-[0.04em] text-muted-2">
            Anthropic Academy — Claude API · MCP · Agent design
          </div>
        </Reveal>
      </div>
    </section>
  );
}
