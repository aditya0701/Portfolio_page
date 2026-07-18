# CLAUDE / DEV HANDOFF — Portfolio Site (v2)

Supersedes the original `HANDOFF_Portfolio_Site.md`. That document described a repo state that no longer exists and asked for decisions that have since been made. Read this one instead. Where the two conflict, this one wins.

Last updated: July 2026. Owner: Aditya Rawat.

---

## 0. How to use this document

The site has had a full audit and a round of improvements, delivered as a single git patch (`portfolio-improvements.patch`) that has not yet been applied to `main`. This document records what that patch does, what was decided and by whom, what is still open, and the constraints that must not be broken. If you are continuing the work: apply the patch on a branch first (see §7), then pick up from §5 (what remains) and §6 (the open design decision).

---

## 1. Owner context

Aditya Rawat. M.Sc. Data Science, RWTH Aachen, expected 06/2026. Job hunting now (mid-2026) for AI/ML engineering, ML engineering, and computer vision roles. Success metric, unchanged from the original brief: a recruiter or hiring manager reaching out for an interview.

## 2. Current state of the repo

- React 19 + TypeScript + Vite, Tailwind v4, framer-motion, react-router. Oxlint. Deployed to GitHub Pages at `aditya0701.github.io/Protfolio_page` (the repo-name typo is still live; see §5).
- `PRODUCT.md` is the design brief and remains authoritative for design direction. The patch updates its Users and Product Purpose sections to dual-track; it does **not** change the aesthetic direction.
- The site is a static SPA. Deploy is a plain `npm run build` in `.github/workflows/deploy.yml`.
- Five case-study routes exist and are content-complete: the thesis (new), TechDrishti plus two sub-pages (`/evolution`, `/sarvam-vs-deepseek`), and the deep research agent.

### What the patch changes, in one paragraph

Repositions the whole site to dual-track (CV + LLM systems) in copy, project order, skills, and PRODUCT.md; adds a full thesis case study with the first images on the site (a raw / ground-truth / prediction segmentation triptych) and wires in the real benchmark numbers from the model card; adds the missing Chitragupt project; adds a build-time metric guard that refuses to ship an unmeasured number; adds Open Graph / Twitter / JSON-LD / noscript for link previews and crawlers; does an accessibility pass (global reduced-motion, AA contrast fix, type-size floor); sharpens the existing case studies (cross-links, per-page titles, a "measured it, chose not to ship it" section on the agent's own page, a rule-numbering fix); and does repo hygiene (real README, package name, gitignore). It does **not** touch the green/terminal aesthetic — that is the open decision in §6.

## 3. Decisions locked (do not re-litigate without the owner)

1. **Positioning: dual-track.** Owner-confirmed. Two flagship tracks carry equal weight because the combination is the differentiator: the thesis is model-training credibility most AI-engineering applicants lack, and the LLM systems are shipping evidence most CV applicants lack. The dual track is carried by structure (track badges, grouped skills, project order, cross-links) rather than by two competing hero headlines. The hero names both in one honest line.
2. **TechDrishti's on-page numbers are real measured runs.** Owner-confirmed. The cost tables and percentages already on the TechDrishti case study and its sub-pages are measurements, not estimates, and must not be stripped or altered.
3. **Thesis figures and benchmark numbers are cleared to publish.** Owner-confirmed. The segmentation figures and the model-card numbers are on the site.

## 4. The numbers, and the guard that protects them

This is the most important section. The site's credibility rests on every number being real.

### Thesis benchmark (sourced from the published model card)

Source: `https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation`. Lives in `src/data/thesisResults.ts`, rendered on the thesis case study.

- The metric is **recall / matched-instance mIoU / recall-weighted panoptic quality (RWPQ)**, not Dice/IoU. Recall leads because a missed bouton is a permanent counting error while a false positive is filterable. There is deliberately no Dice column; the card does not report one, and inventing one would defeat the guard.
- **MicroSAM Large (`vit_l_lm`, `MicroSAM_L_all`):** recall 61/61, mIoU **0.758** (highest of all models), RWPQ 0.787 (deconvolved-condition matched pair), 30 false positives (aggregate). Primary published checkpoint.
- **MicroSAM Base (`vit_b_lm`, `MicroSAM_B_all`):** recall 61/61, mIoU 0.755, RWPQ 0.771, 12 false positives. The recommended low-memory substitute.
- Baselines are **CellposeSAM, Swin UNETR, nnU-Net, and the lab's semi-manual Imaris workflow.** The card does not break out per-model baseline figures, so those rows on the site claim only what the card supports and no more. Do not fill them in from memory.
- Test set: 2 specimens, 61 ground-truth instances. Small n; the card is honest about it, and so is the page.
- Supervisors: Prof. Dr. Abigail Morrison (first), Prof. Dr.-Ing. Johannes Stegmaier (second examiner). Imaris references from the Tavosanis lab.

### The agent's "not shipped" figures

`+~81 min` onto a 9-20 min run, and `~$0.01` to `~$0.17` per run, for integrating the research agent into TechDrishti. These are the owner's own measurements. State them as approximate. Do not derive new figures from them.

### The metric guard (`scripts/check-metrics.mjs`)

`npm run build` runs this first and **fails the build** if any `TODO(metric: ...)` placeholder remains in `src/`. The rule it enforces: a number is either measured and real, or visibly absent — never plausible-looking filler, because a reader cannot tell an estimate from a measurement. It currently passes (all placeholders resolved). `npm run dev` does not run the check, so future placeholders stay workable locally. If you add a metric you do not yet have, write `TODO(metric: what it is)` rather than a guess, and the build will hold the line for you.

## 5. What remains — owner-only tasks (not yet done)

These need GitHub settings access or an editorial call, so the patch cannot do them.

1. **Rename the repo.** `Protfolio_page` → `aditya0701.github.io` (recommended: serves from the root user domain, no subpath, cleaner on a CV) or `portfolio`. The deploy path lives in one place now: edit the `BASE` constant in `vite.config.ts` (`'/'` for the user domain). Then update the og/canonical URLs in `index.html` and the links in `README.md`. `main.tsx` derives the router basename from `import.meta.env.BASE_URL`, so nothing else needs touching.
2. **Set the repo description, topics, and website field** (all currently null). Suggested topics: `computer-vision`, `machine-learning`, `llm`, `agentic-ai`, `pytorch`, `portfolio`.
3. **Untrack the design scratch.** `concept_images/` (7.7 MB of concept art) and `.impeccable/` are now gitignored, but the patch deliberately does not delete them (a patch that deletes files would wipe your local copies). Run: `git rm -r --cached concept_images .impeccable && git commit -m "Untrack design scratch"`.
4. **English README + description on `Local_news_aggregator`.** TechDrishti's repo README and GitHub description are in Hindi. Correct for the project's real audience, but a recruiter reading the English case study and clicking through hits a wall. Add an English case-study README and set an English repo description. This is an addition, not a replacement.
5. **Update the portfolio link on your CV and LinkedIn** once the repo is renamed.

## 6. The open design decision

The site currently uses a green-on-black CRT/terminal aesthetic (digital rain, scanlines, VT323 pixel type). The patch keeps it and only improves structure, numbers, figures, and accessibility on top of it.

There is a standalone alternative direction mocked up: **"the figure plate"** (`direction-figure-plate.html`). Cold lab-paper background, black data panels, an accent palette sampled from the owner's own instance-label predictions, an epistemic status system (`MEASURED` / `SHIPPED` / `PENDING` / `NOT SHIPPED`), Archivo + IBM Plex Mono, no rain or scanlines. Rationale: the green terminal look is itself a common developer-portfolio trope and works against the "precision as aesthetic" principle; the strongest visual the owner has is their own segmentation output, which should lead rather than compete with a screensaver.

**This is an owner decision and is not in the patch.** Adopting it is a larger, separate job: port the tokens into `index.css`, reshape both existing case studies, and rewrite PRODUCT.md's Brand Personality and Anti-references sections. If keeping the current aesthetic (a legitimate choice), the accessibility constraints in §8 must hold.

## 7. How to apply the patch

```bash
cd /path/to/Protfolio_page
git checkout -b portfolio-dual-track
git apply --binary /path/to/portfolio-improvements.patch   # --binary carries the figures + OG cover
npm install
npm run build      # passes: real numbers wired in, guard green
npm run dev        # review locally
```

Verified with `git apply --check --binary` against a fresh clone of `main`, and a full `npm run build` on that clone succeeds. Use `--binary` or the WebP figures and OG image will not apply.

## 8. Hard constraints (carried forward — do not break)

- **Never invent, estimate, or placeholder-with-plausible-numbers any metric.** The guard enforces this at build time. Thesis numbers come from the model card; TechDrishti numbers are the owner's real measurements; the agent's `~81 min` / `~$0.01-$0.17` are approximate owner measurements stated as approximate. Where a number does not exist, use a visible `TODO(metric: ...)` and ask the owner.
- **Do not soften the "measured it, chose not to ship it" framing.** The honest version is the strong one. It now appears on the agent's own case study page (as a full section) and on the TechDrishti terminal block (as TechDrishti's reason for not calling the heavy agent). See the note in §9 about that duplication.
- **Do not rewrite PRODUCT.md's design direction** unless the §6 decision says so. Do not revive the retired Indo-futurist direction.
- **Scope stays a static portfolio.** No blog, CMS, analytics, or contact-form backend.
- **No personal contact info beyond email, GitHub, and Hugging Face.** No phone number anywhere. One clear conversion path per surface.
- **Supporting projects stay lightweight.** If a supporting project (YOLO detection, Celonis lab work, Chitragupt) starts growing a full case study, stop and ask.
- If keeping the current aesthetic: glow and scanlines are low-opacity decoration only, never over body copy; all text meets AA without relying on glow; reduced motion is honored (handled globally now via `MotionConfig reducedMotion="user"` plus Tailwind `motion-safe:`); body copy stays at 14px and never below 12px.

## 9. Artifact inventory and where things live

Deliverables produced during the audit (outside the repo, to be placed by the owner):

- `portfolio-improvements.patch` — the single cumulative git patch. Apply per §7.
- `APPLY.md` — short apply-and-next-steps note. Overlaps this document; this one is the fuller record.
- `direction-figure-plate.html` — the alternative design mockup (§6). Self-contained, opens in a browser.
- `AUDIT_Portfolio_Site.md` — the original full audit that started this work. Historical; most of it is now done.

Key files inside the repo after the patch:

- `src/data/projects.ts` — project data, dual-track, `lead`/`flagship`/`supporting` weights, track labels, figures.
- `src/data/thesisResults.ts` — the model-card benchmark numbers with the card cited as source.
- `src/data/profile.ts` — role, summary, skills (grouped into named tracks).
- `src/pages/CaseStudySegmentation.tsx` — the new thesis case study.
- `src/pages/CaseStudyTechDrishti.tsx`, `Evolution.tsx`, `SarvamVsDeepseek.tsx`, `CaseStudyDeepResearch.tsx` — the LLM case studies (sharpened, not rewritten).
- `scripts/check-metrics.mjs` — the build guard (§4).
- `src/hooks/usePageTitle.ts` — per-page document titles.
- `public/figures/` — the segmentation triptych (WebP) and the generated OG cover.
- `vite.config.ts` — the single `BASE` constant that controls the deploy path (§5.1).

### One open editorial question for the owner

The "measured it, chose not to ship it" decision now appears in two places: the new full section on the Deep Research Agent page, and the original terminal block on the TechDrishti page. They serve different framings (the agent explaining its own exclusion vs. TechDrishti explaining why it stays lean), so both were kept. If that reads as redundant to you, the TechDrishti terminal block can be trimmed to a one-line pointer to the agent's section. Your call.

## 10. Definition of done

- [x] Positioning decision (dual-track) reflected in hero, project order, skills, and PRODUCT.md.
- [x] Three flagship case studies with figures/diagrams, links, decisions, and real numbers (no fabricated ones; guard enforces).
- [x] Thesis has visual artifacts (the triptych) and a real benchmark table from the model card.
- [x] TechDrishti entry rewritten; supporting projects kept lightweight; Chitragupt added.
- [x] OG/Twitter/JSON-LD/noscript in place; AA contrast fixed; reduced-motion global; type floor raised.
- [x] Real README, package name fixed, scratch dirs gitignored, deploy path centralized.
- [x] Case studies cross-linked, per-page titles, "not shipped" on the agent page, rule numbering consistent.
- [ ] Repo renamed; description/topics/website set; live URL updated on CV/LinkedIn. *(owner, §5)*
- [ ] English README + description on `Local_news_aggregator`. *(owner, §5)*
- [ ] `concept_images/` and `.impeccable/` untracked. *(owner, §5)*
- [ ] Design direction decided: keep current, or adopt the figure-plate direction. *(owner, §6)*
- [ ] Fresh clone builds and deploys cleanly from the renamed repo. *(verify after rename)*
