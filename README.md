# aditya0701.github.io

Personal portfolio for **Aditya Rawat** (M.Sc. Data Science, RWTH Aachen).

**Live:** https://aditya0701.github.io/Portfolio_page/

Two tracks of work, each with a full case study rather than a card blurb:

| Project | What it is | Case study |
| --- | --- | --- |
| **Microglomeruli Segmentation** + BoutonViewer | Master's thesis. 3D instance segmentation of synaptic boutons in *Drosophila* confocal microscopy, benchmarking MicroSAM, Cellpose 3D, nnU-Net v2 and SwinUNETR, shipped as a napari desktop tool. | [/case-study/microglomeruli-segmentation](https://aditya0701.github.io/Portfolio_page/case-study/microglomeruli-segmentation) |
| **TechDrishti** | A fully autonomous Hindi tech-news publication running daily on GitHub Actions. | [/case-study/techdrishti](https://aditya0701.github.io/Portfolio_page/case-study/techdrishti) |
| **Deep Research Agent** | An autonomous research loop with code-enforced grounding verification. | [/case-study/deep-research-agent](https://aditya0701.github.io/Portfolio_page/case-study/deep-research-agent) |

## Stack

React 19 + TypeScript + Vite, Tailwind v4, framer-motion, react-router. Oxlint.
Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # runs check:metrics, then tsc -b && vite build
npm run lint
```

## The metric guard

`npm run build` runs `scripts/check-metrics.mjs` first, which fails the build if any
`TODO(metric: ...)` placeholder is still in `src/`.

The rule it enforces: **a number on this site is either measured and real, or it is
visibly absent.** There is no third state where a plausible-looking figure sits in the
markup waiting to be noticed. A reader cannot tell an estimate from a measurement, so
the build refuses to ship the ambiguity. `npm run dev` does not run the check, so
placeholders stay visible and workable while the underlying work is still in progress.

To resolve one: replace the placeholder with the real value via the `<Metric>` component
in `src/components/Metric.tsx`.

## Renaming the repo

`vite.config.ts` exports a single `BASE` constant. `main.tsx` derives the router
basename from `import.meta.env.BASE_URL`, and asset paths are built from it too, so the
deploy path lives in exactly one place. Serving from the root user domain
(`aditya0701.github.io`) means `base: '/'`.

## Design

`PRODUCT.md` holds the design brief: users, purpose, brand personality, anti-references,
design principles and the accessibility baseline. It is authoritative for design
direction. `CLAUDE.md` is the short pointer for agent sessions.
