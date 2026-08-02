import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";
import { thesisResults, thesisResultsMeta } from "../data/thesisResults";

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

const FIGURES = [
  {
    src: "figures/original.webp",
    alt: "Raw confocal microscopy volume of the Drosophila mushroom body calyx, rotating in 3D. Boutons appear as faint overlapping blobs against background signal.",
    caption: "Raw input",
    note: "What the microscope gives you.",
  },
  {
    src: "figures/ground_truth.webp",
    alt: "Hand-annotated ground-truth instance labels for the same volume, each bouton rendered as a distinctly coloured 3D object.",
    caption: "Ground truth",
    note: "Hand-annotated in napari, one label per bouton.",
  },
  {
    src: "figures/prediction.webp",
    alt: "Predicted instance segmentation from the fine-tuned MicroSAM model on a held-out volume, closely matching the ground-truth labels.",
    caption: "Prediction",
    note: "Fine-tuned MicroSAM (vit_l_lm), held-out volume.",
  },
];

const HARD = [
  {
    tag: "INSTANCES, NOT PIXELS",
    title: "Boutons touch, and touching is the whole point",
    desc: "Microglomeruli sit packed against each other in the calyx. Semantic segmentation would happily paint one confluent blob across a dozen of them and score well on pixel overlap while being useless: the biological question is how many boutons there are and how big each one is. That makes this an instance problem, and it makes the interesting failure mode a merge, not a miss.",
  },
  {
    tag: "3D, AND ANISOTROPIC",
    title: "A confocal Z-stack is not a cube of equal voxels",
    desc: "Z resolution is coarser than XY. A model that reasons in voxels rather than micrometres will systematically misjudge volume along one axis, so evaluation has to happen in physical units. Instance matching here accounts for voxel volume rather than counting voxels as if they were isotropic.",
  },
  {
    tag: "NO DATASET EXISTED",
    title: "The annotations had to be made before the models could be trained",
    desc: "There is no public benchmark for this structure at this acquisition setting. The ground truth was hand-annotated from scratch in napari, which caps how much data there is and makes the choice of a foundation model with a strong prior a practical decision rather than a fashionable one.",
  },
  {
    tag: "THE END USER IS NOT AN ENGINEER",
    title: "A checkpoint on a cluster helps nobody",
    desc: "The people who need these counts are biologists, not PyTorch users. If the deliverable had stopped at a weights file and a table of scores, the thesis would be complete and the work would be worthless. That is why BoutonViewer is part of this project rather than a follow-up to it.",
  },
];

const ARCHITECTURES = [
  {
    name: "MicroSAM (vit_l_lm)",
    kind: "Foundation model, fine-tuned",
    why: "A microscopy-specialised SAM variant. Strong prior, so it can be fine-tuned on a small hand-annotated set. Trained here in 2D with Kornia augmentations and custom post-processing to assemble instances.",
    selected: true,
  },
  {
    name: "Cellpose 3D",
    kind: "Generalist cell segmentation",
    why: "The default in the microscopy community, and the honest baseline to beat. If a general-purpose tool already solves this, the rest of the thesis is unnecessary.",
    selected: false,
  },
  {
    name: "nnU-Net v2",
    kind: "Self-configuring U-Net",
    why: "The standard against which medical and biological segmentation is measured, precisely because it removes architecture tuning as an excuse. Included so that a win is a real win.",
    selected: false,
  },
  {
    name: "SwinUNETR",
    kind: "Transformer encoder, 3D (MONAI)",
    why: "Tests whether native 3D attention beats a 2D foundation model with a strong prior, on a dataset this size. A genuinely open question at small n.",
    selected: false,
  },
];

const VARIANTS = [
  { key: "original", label: "Raw", desc: "Unprocessed acquisition. The control." },
  {
    key: "dog",
    label: "Difference-of-Gaussians",
    desc: "Classical blob enhancement. Tests whether a hand-designed prior still buys anything once a foundation model is doing the work.",
  },
  {
    key: "psf",
    label: "PSF-deconvolved",
    desc: "Richardson-Lucy against the measured point-spread function. Physically motivated, and expensive.",
  },
  { key: "all", label: "Combined", desc: "All variants pooled into one training set." },
];

export function CaseStudySegmentation() {
  usePageTitle(ROUTE_META["/case-study/microglomeruli-segmentation"].title);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/"
          className="font-hero-mono inline-flex items-center gap-2 text-[13px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          <ArrowLeft size={13} /> Back to portfolio
        </Link>
        <a
          href="https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[13px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          Model weights <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <div className="notch-corner relative overflow-hidden border border-rule-hard bg-panel px-6 py-12 text-center">
          <p className="font-hero-mono mb-4 text-[13px] tracking-wider text-i3">
            RESEARCH CASE STUDY
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
            Microglomeruli Segmentation
          </h1>
          <p className="font-display mt-2 text-lg italic text-panel-text">
            Fine-tuning a foundation model to count synaptic boutons in a fly brain, and proving it
            against the state of the art
          </p>
          <div className="signal-bar mx-auto mt-5 w-24" />
          <p className="font-hero-mono mt-4 text-[12px] tracking-wide text-panel-mid">
            M.SC. THESIS · RWTH AACHEN · 3D INSTANCE SEGMENTATION · MICROSAM / NNU-NET V2 / SWINUNETR
          </p>
        </div>

        <p className="font-display mt-10 text-lg leading-relaxed text-ink sm:text-xl">
          A reproducible deep-learning pipeline that{" "}
          <mark className="box-decoration-clone bg-i3/20 px-1 text-ink">
            fine-tunes a foundation model for 3D instance segmentation
          </mark>{" "}
          of synaptic boutons in confocal Z-stacks of the Drosophila mushroom body calyx, then
          benchmarks it head-to-head against three SOTA 3D architectures &mdash; nnU-Net v2,
          Cellpose, SwinUNETR &mdash; under a physically-calibrated, instance-matching evaluation
          protocol.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
          Supervised by Prof. Dr. Abigail Morrison (Software Engineering Group, RWTH Aachen), with
          Prof. Dr.-Ing. Johannes Stegmaier as second examiner. Built for the Tavosanis lab, who
          count these structures by hand today.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="https://github.com/aditya0701/Image_segmentation_thesis"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 bg-i3 px-5 py-2.5 text-[14px] font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Thesis code <ExternalLink size={14} />
          </a>
          <a
            href="https://github.com/aditya0701/Fluorescent-Microscopy-Image-Segmentation-and-Quantification"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 border border-panel-border bg-panel px-5 py-2.5 text-[14px] font-medium text-panel-text transition-colors hover:border-i3 hover:text-i3"
          >
            BoutonViewer <ExternalLink size={14} />
          </a>
        </div>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="01" title="What it looks like" />
          <figure>
            <div className="grid gap-3 sm:grid-cols-3">
              {FIGURES.map((f) => (
                <div key={f.src} className="notch-corner-sm border border-rule-hard bg-black">
                  <img
                    src={asset(f.src)}
                    alt={f.alt}
                    loading="lazy"
                    decoding="async"
                    width={560}
                    height={560}
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="border-t border-rule-hard px-3 py-2">
                    <div className="font-hero-mono text-[12px] uppercase tracking-wide text-i3">
                      {f.caption}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink-soft">{f.note}</div>
                  </figcaption>
                </div>
              ))}
            </div>
            <figcaption className="mt-4 text-[14px] leading-relaxed text-ink-soft">
              One held-out volume, rotating. Left is what the microscope produces. Middle is what a
              human said the answer was. Right is what the fine-tuned model said, having never seen
              this volume. Each colour is one bouton instance.
            </figcaption>
          </figure>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="02" title="Why this is hard" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {HARD.map((h) => (
              <div
                key={h.tag}
                className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6"
              >
                <span className="font-hero-mono text-[12px] tracking-wide text-i3">{h.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink">{h.title}</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-panel-text">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="03" title="The benchmark, and why each model is in it" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            Four architectures, one dataset, one evaluation protocol. The dataset is 13 volumetric
            stacks hand-annotated from scratch in napari across seven Drosophila brain preparations
            and two acquisition systems (confocal LSM and Airyscan), split nine train / two
            validation / two test. The point of including nnU-Net v2 and Cellpose 3D is not to have
            them lose. It is that a fine-tuned foundation model beating a self-configuring U-Net and
            the community default is a claim worth making, and beating nothing is not.
          </p>
          <div className="flex flex-col gap-3">
            {ARCHITECTURES.map((a) => (
              <div
                key={a.name}
                className={`notch-corner border p-5 ${
                  a.selected ? "border-i3 bg-i3/[0.06]" : "border-rule-hard bg-panel"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-lg font-semibold text-ink">{a.name}</span>
                  <span className="font-hero-mono text-[12px] uppercase tracking-wide text-panel-mid">
                    {a.kind}
                  </span>
                  {a.selected && (
                    <span className="notch-corner-sm border border-rule-hard px-2 py-0.5 font-hero-mono text-[12px] uppercase tracking-wide text-i3">
                      selected
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-panel-text">{a.why}</p>
              </div>
            ))}
          </div>

          <h3 className="font-hero-mono mt-10 mb-4 text-[13px] uppercase tracking-[0.2em] text-ink-mid">
            Each trained across four preprocessing variants
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {VARIANTS.map((v) => (
              <div key={v.key} className="notch-corner-sm border border-rule-hard bg-panel p-4">
                <div className="flex items-baseline gap-2">
                  <code className="font-mono text-[13px] text-i3">{v.key}</code>
                  <span className="font-display text-[15px] text-ink">{v.label}</span>
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">{v.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
            Four architectures times four variants is a grid, not a single run, which is why
            training is launched through HTCondor submit files on the LFB cluster rather than by
            hand.
          </p>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="04" title="Results" />

          <p className="text-[14px] leading-relaxed text-ink-mid">
            Recall is the headline metric, not accuracy or Dice, and that is deliberate: a missed
            bouton is a permanent counting error, while a false positive can be filtered
            downstream. Evaluation prioritises recall, matched-instance mIoU, and a recall-weighted
            panoptic quality score. Test set: {thesisResultsMeta.testSet}.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Bouton instance-segmentation benchmark: recall, matched mIoU, recall-weighted
                panoptic quality and false-positive count across models.
              </caption>
              <thead>
                <tr className="border-b border-rule-hard">
                  {["Model", "Recall", "Matched mIoU", "RWPQ", "False pos."].map((h) => (
                    <th
                      key={h}
                      className="py-3 pr-4 font-hero-mono text-[12px] uppercase tracking-wide text-ink-mid"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {thesisResults.map((m) => (
                  <tr
                    key={m.name}
                    className={`border-b border-panel-border ${m.selected ? "bg-i3/[0.06]" : ""}`}
                  >
                    <td
                      className={`py-4 pr-4 text-[14px] ${
                        m.selected ? "font-semibold text-i3" : "text-ink"
                      }`}
                    >
                      {m.name}
                      {m.variant && <span className="ml-2 text-[12px] text-ink-soft">{m.variant}</span>}
                    </td>
                    {m.role ? (
                      <td colSpan={4} className="py-4 text-[13px] text-ink-soft">
                        {m.role}
                      </td>
                    ) : (
                      <>
                        <td className="py-4 pr-4 text-[14px] text-ink">{m.recall}</td>
                        <td className="py-4 pr-4 text-[14px] font-semibold text-i3">{m.miou}</td>
                        <td className="py-4 pr-4 text-[14px] text-ink">{m.rwpq}</td>
                        <td className="py-4 text-[14px] text-ink">{m.fp}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-[14px] leading-relaxed text-ink-mid">{thesisResultsMeta.headline}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            The honest limitation, stated on the card: MicroSAM Large trades that perfect recall for
            a higher false-positive count (16 on the deconvolved condition), several of them large
            boutons split into multiple predicted components rather than spurious detections in empty
            regions. The card is explicit that predictions should be reviewed before unsupervised
            quantification &mdash; which is exactly why BoutonViewer surfaces oversized and merged
            predictions instead of silently filtering them. The model was fine-tuned on a
            comparatively small annotated set drawn from two brain specimens, so performance under
            substantially different imaging or labelling has not been verified.
          </p>
          <p className="mt-4 font-mono text-[12px] text-ink-soft">{thesisResultsMeta.rwpqNote}</p>
          <a
            href={thesisResultsMeta.source}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-i3 hover:text-i3"
          >
            Full model card <ExternalLink size={13} />
          </a>

          <p className="mt-8 text-[14px] leading-relaxed text-ink-soft">
            Evaluation is instance matching, not per-pixel overlap, and it weights by physical
            voxel volume so that anisotropic Z spacing does not quietly inflate or deflate a score.
            The code is in{" "}
            <code className="font-mono text-[14px] text-i3">tools/evaluate_segmentation.py</code>.
          </p>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="05" title="Two decisions worth defending" />

          <div className="notch-corner border border-rule-hard bg-panel p-5 sm:p-6">
            <span className="font-hero-mono text-[12px] tracking-wide text-i3">
              DECISION 1 · A 2D FOUNDATION MODEL FOR A 3D PROBLEM
            </span>
            <div className="mt-1 font-display text-lg font-semibold text-ink">
              Prior beats dimensionality when the dataset is hand-made
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-panel-text">
              The obvious move on a 3D problem is a native 3D architecture, which is why SwinUNETR
              and nnU-Net v2 are in the benchmark. But every training example here was annotated by
              hand, which puts a hard ceiling on n. A model carrying a strong microscopy prior can
              be fine-tuned into that regime; a 3D transformer trained from a much weaker starting
              point has to learn more from less. Running both was the only honest way to find out
              which effect dominates, rather than asserting it.
            </p>
          </div>

          <div className="notch-corner mt-4 border border-rule-hard bg-panel p-5 sm:p-6">
            <span className="font-hero-mono text-[12px] tracking-wide text-i3">
              DECISION 2 · TWO ACQUISITION PIPELINES, NOT ONE AVERAGE
            </span>
            <div className="mt-1 font-display text-lg font-semibold text-ink">
              LSM and Airyscan are different instruments and get different preprocessing
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-panel-text">
              BoutonViewer runs rolling-ball background subtraction plus Richardson-Lucy
              deconvolution for confocal LSM stacks, and lightweight normalisation for Airyscan,
              which is already deconvolved by the microscope. Collapsing both into one path would
              have been less code and quietly wrong: you would be deconvolving already-deconvolved
              data. Voxel calibration is auto-derived from acquisition type and image size (LSM
              uses the confocal pitch 0.3 &times; 0.0709 &times; 0.0709 µm; a native super-resolution
              Airyscan image gets the finer 0.3 &times; 0.0425 &times; 0.0425 µm), and the stats are
              live-recomputed if a user overrides those fields, because the failure mode of getting
              this wrong is a plausible number in the wrong units rather than a crash. The Base
              variant on LSM also skips deconvolution entirely and takes the lighter path, so a
              GPU-limited run stays fast without a separate code branch.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="06" title="Shipping it: BoutonViewer" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            A napari desktop application that runs the pipeline on a confocal or Airyscan TIFF
            stack, shows the raw channels and predicted labels in 3D, and reports per-bouton volume
            and surface area in µm³ and µm². A biologist loads a file and gets a table.
          </p>
          <ul className="mt-5 space-y-2.5">
            {[
              "Interactive stats table: hover or click a bouton in the viewer to inspect it, or delete a false positive without touching the model",
              "Prediction caching, so changing a display setting does not re-run inference",
              "Oversized and merged predictions are deliberately not auto-removed. A silent filter would hide exactly the failure mode that matters, so the tool surfaces them and lets a human decide",
              "Model and data notes shipped alongside the tool: what it was trained on, at which voxel sizes, and where it should not be trusted",
            ].map((b) => (
              <li key={b} className="flex gap-2.5 text-[14px] leading-relaxed text-panel-text">
                <span className="square-dot mt-2 h-1.5 w-1.5 shrink-0 bg-i3" />
                {b}
              </li>
            ))}
          </ul>
          <a
            href="https://github.com/aditya0701/Fluorescent-Microscopy-Image-Segmentation-and-Quantification/wiki/Model-Notes"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-i3 hover:text-i3"
          >
            Model &amp; data notes <ExternalLink size={13} />
          </a>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="07" title="Reproducibility" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            The thesis claim is reproducibility, so the repo has to earn it. Training, inference
            and evaluation are separate scripts with a{" "}
            <code className="font-mono text-[14px] text-i3">--dataset</code> flag selecting
            the preprocessing variant, cluster jobs are committed as submit files rather than
            remembered, and the selected checkpoints are published on Hugging Face with the
            rejected experiment runs left out. Two environment definitions exist on purpose: the
            annotation machine runs napari tooling under mamba, the training machine runs pip,
            because micro_sam is not reliably installable from PyPI and pretending otherwise would
            break the first person who tried to reproduce this.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-i3 hover:text-i3"
            >
              Checkpoints on Hugging Face <ExternalLink size={13} />
            </a>
          </div>
        </section>

        <div className="mt-20 border-t border-rule-hard pt-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/case-study/techdrishti"
              className="notch-corner flex-1 border border-rule-hard bg-panel p-4 transition-colors hover:border-i3/60"
            >
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">LLM SYSTEMS</span>
              <div className="mt-1 font-display text-[15px] font-semibold text-ink">TechDrishti &rarr;</div>
              <p className="mt-1 text-[13px] leading-relaxed text-panel-mid">
                The other track: an autonomous Hindi newsroom running daily on GitHub Actions.
              </p>
            </Link>
            <Link
              to="/case-study/deep-research-agent"
              className="notch-corner flex-1 border border-rule-hard bg-panel p-4 transition-colors hover:border-i3/60"
            >
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">LLM SYSTEMS</span>
              <div className="mt-1 font-display text-[15px] font-semibold text-ink">
                Deep Research Agent &rarr;
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-panel-mid">
                An autonomous research loop with grounding enforced in code.
              </p>
            </Link>
          </div>
          <Link
            to="/"
            className="font-hero-mono inline-flex items-center gap-2 text-[13px] tracking-wide text-ink-mid transition-colors hover:text-i3"
          >
            <ArrowLeft size={13} /> Back to portfolio
          </Link>
        </div>
      </main>
    </div>
  );
}
