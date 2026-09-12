# Amr Ali Sultan — Portfolio

Freelance portfolio site. React + TypeScript + Vite, styled with Tailwind CSS v4,
animated with Framer Motion, with a Three.js hero centerpiece.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks and outputs to dist/
npm run preview  # preview the production build locally
```

## Before deploying — fill in your real values

Everything below is a clearly-marked placeholder. Edit `src/config.ts`:

- `FORMSPREE_ENDPOINT` — create a form at [formspree.io](https://formspree.io) and paste its endpoint. Until this is set, the contact form shows a "not configured" message instead of submitting.
- `GITHUB_URL` — your GitHub profile URL.
- `CV_PATH` — defaults to `/cv.pdf`. Drop your actual CV PDF into `public/cv.pdf` (the filename must match).

## Deploying

The project builds to a static `dist/` folder.

**Vercel / Netlify** — point either at this repo and use the default Vite
settings (`npm run build`, output directory `dist`).

**GitHub Pages** — `.github/workflows/deploy.yml` builds and publishes on every
push to `main`. Enable it once under *Settings → Pages → Source → GitHub
Actions*.

`vite.config.ts` sets `base: './'` so assets are referenced with relative URLs.
This matters: Vite's default (`/`) emits `/assets/…`, which 404s when the site
is served from a subpath like `username.github.io/repo/` — the symptom is a
blank white page. Relative URLs work from a subpath and from a domain root, so
the same build deploys anywhere. Don't change it without re-testing on Pages.

## Project structure

- `src/components/` — one component per page section
- `src/data/` — content (project case studies, Q&A pairs, stack list) kept separate from markup
- `src/three/heroHeadScene.ts` — the hero's Three.js scene, mounted imperatively by `src/components/HeroHead.tsx`
- `src/lib/motion.ts` + `src/components/Reveal.tsx` — the shared Framer Motion scroll-reveal system used across every section

## Reference

`reference-original/` holds the original Claude-artifact export this project was migrated from — kept for reference, not part of the build.
