# How to apply

```bash
cd /path/to/Protfolio_page
git checkout -b portfolio-dual-track
git apply --binary /path/to/portfolio-improvements.patch
npm install
npm run build      # now PASSES: real numbers are wired in, no placeholders remain
npm run dev        # look at it
```

Use `--binary` (the patch carries the figure WebPs and the OG cover). Verified with
`git apply --check --binary` against a fresh clone of `main`, and a full `npm run build`
on that clone succeeds.

## What changed since the first patch

The thesis benchmark is no longer a set of blocked placeholders. The real numbers from
your model card are wired in:

| Model | Recall | Matched mIoU | RWPQ | False pos. |
| --- | --- | --- | --- | --- |
| MicroSAM Large (vit_l_lm) | 61 / 61 | **0.758** | 0.787 | 30 |
| MicroSAM Base (vit_b_lm) | 61 / 61 | 0.755 | 0.771 | 12 |

Baselines (CellposeSAM, Swin UNETR, nnU-Net, Imaris) are listed but not given per-model
figures, because the card does not break those out. The metric guard now passes because
every number on the page is real.

BoutonViewer copy now carries the real voxel pitches and the Base-skips-deconvolution
path, from the app's own README.

## Still yours to do (unchanged from before)

- **Rename the repo** (`aditya0701.github.io` recommended). Edit the single `BASE`
  constant in `vite.config.ts`, then the og/canonical URLs in `index.html` + `README.md`.
- **Set repo description, topics, website field** (all currently null).
- **Untrack the design scratch** (kept off the patch so it does not delete your local files):
  ```bash
  git rm -r --cached concept_images .impeccable && git commit -m "Untrack design scratch"
  ```
- **English README + description on `Local_news_aggregator`.**

## The design direction is a separate decision

`direction-figure-plate.html` is a standalone mockup, NOT part of this patch. The patch
keeps your current green/terminal aesthetic and only fixes structure, numbers, figures and
accessibility. If you want the figure-plate direction, that is a further, larger job:
porting tokens into `index.css`, reshaping both case studies, and rewriting PRODUCT.md's
Brand Personality / Anti-references sections.
