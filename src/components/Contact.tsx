import { motion } from 'framer-motion';
import { type FormEvent, useState } from 'react';
import { CV_PATH, EMAIL, FORMSPREE_ENDPOINT, GITHUB_URL, LINKEDIN_URL } from '../config';
import { fadeUp } from '../lib/motion';
import { Reveal } from './Reveal';

const LINKS = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { label: 'LinkedIn', value: 'linkedin.com/in/amr-ali-sultan', href: LINKEDIN_URL, external: true },
  { label: 'GitHub', value: GITHUB_URL.replace('https://', ''), href: GITHUB_URL, external: true },
];

export function Contact() {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
      setStatus('Form endpoint not set. Add your Formspree form URL in src/config.ts to go live.');
      return;
    }
    setSending(true);
    setStatus('Sending…');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('bad status');
      form.reset();
      setStatus('Sent. I reply within one business day.');
    } catch {
      setStatus(`Could not send. Email ${EMAIL} directly.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="bg-dark px-7 pb-[clamp(64px,8vw,96px)] pt-[clamp(96px,13vw,190px)] text-dark-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-[clamp(44px,6vw,88px)]">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.16em] text-dark-accent">Contact</div>
          <h2 className="m-0 mt-6 max-w-[14ch] text-[clamp(34px,5.4vw,76px)] font-semibold leading-[0.98] tracking-[-0.05em]">
            Tell me what you need built.
          </h2>
          <p className="m-0 mt-[26px] max-w-[44ch] text-[17px] leading-[1.62] text-dark-muted-3">
            Send a few lines about the problem and the deadline. I reply with a scope, a timeline, and a price — or
            an honest no.
          </p>
          <div className="mt-[46px] border-t border-dark-border-2">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noopener' : undefined}
                className="flex items-baseline gap-[18px] border-b border-dark-border-2 py-[22px] text-dark-ink transition-colors duration-200 hover:text-dark-accent"
              >
                <span className="min-w-[80px] text-xs uppercase tracking-[0.14em] text-dark-muted">{l.label}</span>
                <span className="text-[clamp(17px,1.6vw,20px)]">{l.value}</span>
              </a>
            ))}
          </div>
          <a
            href={CV_PATH}
            download="Amr-Ali-Sultan-CV.pdf"
            className="mt-[34px] inline-flex items-center gap-2.5 rounded-full border border-[#35353C] px-[26px] py-[14px] text-[15px] font-medium text-dark-ink transition-colors duration-200 hover:border-dark-accent hover:text-dark-accent"
          >
            <span>Download CV</span>
            <span className="text-[13px] text-dark-muted">PDF ↓</span>
          </a>
        </Reveal>

        <motion.form
          onSubmit={onSubmit}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={fadeUp}
          className="flex flex-col gap-[18px] rounded-[28px] border border-dark-border-2 bg-dark-2 p-[clamp(28px,3.5vw,44px)]"
        >
          <label className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-[0.12em] text-dark-muted">Name</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              className="rounded-2xl border border-[#2C2C32] bg-dark px-4 py-[15px] text-base text-dark-ink outline-none transition-colors duration-200 focus:border-dark-accent"
            />
          </label>
          <label className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-[0.12em] text-dark-muted">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-2xl border border-[#2C2C32] bg-dark px-4 py-[15px] text-base text-dark-ink outline-none transition-colors duration-200 focus:border-dark-accent"
            />
          </label>
          <label className="flex flex-col gap-2.5">
            <span className="text-xs uppercase tracking-[0.12em] text-dark-muted">What are you building?</span>
            <textarea
              name="message"
              rows={5}
              required
              className="min-h-[140px] resize-y rounded-2xl border border-[#2C2C32] bg-dark px-4 py-[15px] text-base text-dark-ink outline-none transition-colors duration-200 focus:border-dark-accent"
            />
          </label>
          <motion.button
            type="submit"
            disabled={sending}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full bg-dark-ink px-[22px] py-4 text-[15px] font-semibold text-dark transition-colors duration-200 hover:bg-dark-accent disabled:opacity-60"
          >
            Send message
          </motion.button>
          <div className="min-h-[18px] text-[13px] leading-[1.6] text-dark-muted">{status}</div>
        </motion.form>
      </div>
    </section>
  );
}
