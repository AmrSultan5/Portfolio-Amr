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

The project builds to a static `dist/` folder, so it deploys to Vercel or Netlify
with zero extra config — just point either at this repo and use the default
Vite build settings (`npm run build`, output directory `dist`).

## Project structure

- `src/components/` — one component per page section
- `src/data/` — content (project case studies, Q&A pairs, stack list) kept separate from markup
- `src/three/heroHeadScene.ts` — the hero's Three.js scene, mounted imperatively by `src/components/HeroHead.tsx`
- `src/lib/motion.ts` + `src/components/Reveal.tsx` — the shared Framer Motion scroll-reveal system used across every section

## Reference

`reference-original/` holds the original Claude-artifact export this project was migrated from — kept for reference, not part of the build.
