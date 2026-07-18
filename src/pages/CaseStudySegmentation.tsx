import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { usePageTitle } from "../hooks/usePageTitle";
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

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <span className="font-mono text-[14px] text-ink-400">{num}</span>
      <h2 className="font-display text-2xl font-semibold text-ink-50 sm:text-3xl">{title}</h2>
      <span className="h-px flex-1 bg-ink-700" aria-hidden="true" />
    </div>
  );
}

export function CaseStudySegmentation() {
  usePageTitle("Microglomeruli Segmentation — M.Sc. thesis | Aditya Rawat");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="scanlines min-h-screen bg-ink-950">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/"
          className="font-hero-mono inline-flex items-center gap-2 text-[13px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
        >
          <ArrowLeft size={13} /> Back to portfolio
        </Link>
        <a
          href="https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[13px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
        >
          Model weights <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <div className="neon-glow-bg notch-corner relative overflow-hidden border border-ink-700 bg-ink-900/60 px-6 py-12 text-center">
          <p className="font-hero-mono mb-4 text-[13px] tracking-wider text-neon-300">
            RESEARCH CASE STUDY
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink-50 sm:text-5xl">
            Microglomeruli Segmentation
          </h1>
          <p className="font-display mt-2 text-lg italic text-ink-300">
            Counting synaptic boutons in a fly brain, and handing the result to the people who
            actually need it
          </p>
          <div className="signal-bar mx-auto mt-5 w-24" />
          <p className="font-hero-mono mt-4 text-[12px] tracking-wide text-ink-400">
            M.SC. THESIS · RWTH AACHEN · 3D INSTANCE SEGMENTATION · MICROSAM / NNU-NET V2 / SWINUNETR
          </p>
        </div>

        <p className="font-display mt-10 text-xl leading-relaxed text-ink-100 sm:text-2xl">
          Segment and quantify synaptic boutons in confocal Z-stacks of the Drosophila mushroom
          body calyx, benchmark four SOTA architectures honestly against each other, and ship the
          winner as a desktop tool a biologist can run without writing code.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-300">
          Supervised by Prof. Dr. Abigail Morrison (Software Engineering Group, RWTH Aachen), with
          Prof. Dr.-Ing. Johannes Stegmaier as second examiner. Built for the Tavosanis lab, who
          count these structures by hand today.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="https://github.com/aditya0701/Image_segmentation_thesis"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 bg-neon-500 px-5 py-2.5 text-[14px] font-medium text-ink-950 shadow-[4px_4px_0_var(--color-ink-700)] transition-transform hover:-translate-y-0.5"
          >
            Thesis code <ExternalLink size={14} />
          </a>
          <a
            href="https://github.com/aditya0701/Fluorescent-Microscopy-Image-Segmentation-and-Quantification"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 border border-neon-700 bg-ink-900 px-5 py-2.5 text-[14px] font-medium text-ink-100 transition-colors hover:border-neon-400 hover:text-neon-300"
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
                <div key={f.src} className="notch-corner-sm border border-ink-700 bg-black">
                  <img
                    src={asset(f.src)}
                    alt={f.alt}
                    loading="lazy"
                    decoding="async"
                    width={560}
                    height={560}
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="border-t border-ink-700 px-3 py-2">
                    <div className="font-hero-mono text-[12px] uppercase tracking-wide text-neon-300">
                      {f.caption}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink-400">{f.note}</div>
                  </figcaption>
                </div>
              ))}
            </div>
            <figcaption className="mt-4 text-[14px] leading-relaxed text-ink-400">
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
                className="notch-corner border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6"
              >
                <span className="font-hero-mono text-[12px] tracking-wide text-neon-300">{h.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink-50">{h.title}</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-300">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="03" title="The benchmark, and why each model is in it" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-300">
            Four architectures, one dataset, one evaluation protocol. The point of including
            nnU-Net v2 and Cellpose 3D is not to have them lose. It is that a fine-tuned foundation
            model beating a self-configuring U-Net and the community default is a claim worth
            making, and beating nothing is not.
          </p>
          <div className="flex flex-col gap-3">
            {ARCHITECTURES.map((a) => (
              <div
                key={a.name}
                className={`notch-corner border p-5 ${
                  a.selected ? "border-neon-700 bg-ink-900" : "border-ink-700 bg-ink-900/50"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-lg font-semibold text-ink-50">{a.name}</span>
                  <span className="font-hero-mono text-[12px] uppercase tracking-wide text-ink-400">
                    {a.kind}
                  </span>
                  {a.selected && (
                    <span className="notch-corner-sm border border-neon-700 px-2 py-0.5 font-hero-mono text-[12px] uppercase tracking-wide text-neon-300">
                      selected
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-300">{a.why}</p>
              </div>
            ))}
          </div>

          <h3 className="font-hero-mono mt-10 mb-4 text-[13px] uppercase tracking-[0.2em] text-ink-300">
            Each trained across four preprocessing variants
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {VARIANTS.map((v) => (
              <div key={v.key} className="notch-corner-sm border border-ink-700 bg-ink-900/50 p-4">
                <div className="flex items-baseline gap-2">
                  <code className="font-mono text-[13px] text-neon-300">{v.key}</code>
                  <span className="font-display text-[15px] text-ink-100">{v.label}</span>
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-400">{v.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-400">
            Four architectures times four variants is a grid, not a single run, which is why
            training is launched through HTCondor submit files on the LFB cluster rather than by
            hand.
          </p>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="04" title="Results" />

          <p className="text-[14px] leading-relaxed text-ink-300">
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
                <tr className="border-b border-ink-600">
                  {["Model", "Recall", "Matched mIoU", "RWPQ", "False pos."].map((h) => (
                    <th
                      key={h}
                      className="py-3 pr-4 font-hero-mono text-[12px] uppercase tracking-wide text-ink-300"
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
                    className={`border-b border-ink-800 ${m.selected ? "bg-neon-500/[0.06]" : ""}`}
                  >
                    <td
                      className={`py-4 pr-4 text-[14px] text-ink-100 ${
                        m.selected ? "border-l-2 border-neon-500 pl-3" : ""
                      }`}
                    >
                      {m.name}
                      {m.variant && <span className="ml-2 text-[12px] text-ink-400">{m.variant}</span>}
                    </td>
                    {m.role ? (
                      <td colSpan={4} className="py-4 text-[13px] text-ink-400">
                        {m.role}
                      </td>
                    ) : (
                      <>
                        <td className="py-4 pr-4 text-[14px] text-ink-100">{m.recall}</td>
                        <td className="py-4 pr-4 text-[14px] font-semibold text-neon-300">{m.miou}</td>
                        <td className="py-4 pr-4 text-[14px] text-ink-100">{m.rwpq}</td>
                        <td className="py-4 text-[14px] text-ink-100">{m.fp}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-[14px] leading-relaxed text-ink-300">{thesisResultsMeta.headline}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-400">
            The honest limitation, stated on the card: Large carries a higher false-positive count
            (30 in aggregate), several of which are large boutons split into multiple predicted
            components rather than spurious detections in empty regions. Predictions should be
            reviewed before unsupervised quantification, which is exactly why BoutonViewer surfaces
            oversized and merged predictions instead of silently filtering them. Per-model baseline
            figures are not broken out on the card, so those rows claim only what the card supports.
          </p>
          <p className="mt-4 font-mono text-[12px] text-ink-400">{thesisResultsMeta.rwpqNote}</p>
          <a
            href={thesisResultsMeta.source}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-neon-300 hover:text-neon-200"
          >
            Full model card <ExternalLink size={13} />
          </a>

          <p className="mt-8 text-[14px] leading-relaxed text-ink-400">
            Evaluation is instance matching, not per-pixel overlap, and it weights by physical
            voxel volume so that anisotropic Z spacing does not quietly inflate or deflate a score.
            The code is in{" "}
            <code className="font-mono text-[14px] text-neon-300">tools/evaluate_segmentation.py</code>.
          </p>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="05" title="Two decisions worth defending" />

          <div className="notch-corner border border-ink-700 bg-ink-900/60 p-5 sm:p-6">
            <span className="font-hero-mono text-[12px] tracking-wide text-neon-300">
              DECISION 1 · A 2D FOUNDATION MODEL FOR A 3D PROBLEM
            </span>
            <div className="mt-1 font-display text-lg font-semibold text-ink-50">
              Prior beats dimensionality when the dataset is hand-made
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-300">
              The obvious move on a 3D problem is a native 3D architecture, which is why SwinUNETR
              and nnU-Net v2 are in the benchmark. But every training example here was annotated by
              hand, which puts a hard ceiling on n. A model carrying a strong microscopy prior can
              be fine-tuned into that regime; a 3D transformer trained from a much weaker starting
              point has to learn more from less. Running both was the only honest way to find out
              which effect dominates, rather than asserting it.
            </p>
          </div>

          <div className="notch-corner mt-4 border border-ink-700 bg-ink-900/60 p-5 sm:p-6">
            <span className="font-hero-mono text-[12px] tracking-wide text-neon-300">
              DECISION 2 · TWO ACQUISITION PIPELINES, NOT ONE AVERAGE
            </span>
            <div className="mt-1 font-display text-lg font-semibold text-ink-50">
              LSM and Airyscan are different instruments and get different preprocessing
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-300">
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
          <p className="text-[14px] leading-relaxed text-ink-300">
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
              <li key={b} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-300">
                <span className="square-dot mt-2 h-1.5 w-1.5 shrink-0 bg-neon-500" />
                {b}
              </li>
            ))}
          </ul>
          <a
            href="https://aditya0701.github.io/Fluorescent-Microscopy-Image-Segmentation-and-Quantification/model_notes.html"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-neon-300 hover:text-neon-200"
          >
            Model &amp; data notes <ExternalLink size={13} />
          </a>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="07" title="Reproducibility" />
          <p className="text-[14px] leading-relaxed text-ink-300">
            The thesis claim is reproducibility, so the repo has to earn it. Training, inference
            and evaluation are separate scripts with a{" "}
            <code className="font-mono text-[14px] text-neon-300">--dataset</code> flag selecting
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
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neon-300 hover:text-neon-200"
            >
              Checkpoints on Hugging Face <ExternalLink size={13} />
            </a>
          </div>
        </section>

        <div className="mt-20 border-t border-ink-700 pt-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/case-study/techdrishti"
              className="notch-corner flex-1 border border-ink-700 bg-ink-900/60 p-4 transition-colors hover:border-neon-400/60"
            >
              <span className="font-hero-mono text-[12px] tracking-wide text-neon-300">LLM SYSTEMS</span>
              <div className="mt-1 font-display text-[15px] font-semibold text-ink-50">TechDrishti &rarr;</div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
                The other track: an autonomous Hindi newsroom running daily on GitHub Actions.
              </p>
            </Link>
            <Link
              to="/case-study/deep-research-agent"
              className="notch-corner flex-1 border border-ink-700 bg-ink-900/60 p-4 transition-colors hover:border-neon-400/60"
            >
              <span className="font-hero-mono text-[12px] tracking-wide text-neon-300">LLM SYSTEMS</span>
              <div className="mt-1 font-display text-[15px] font-semibold text-ink-50">
                Deep Research Agent &rarr;
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-400">
                An autonomous research loop with grounding enforced in code.
              </p>
            </Link>
          </div>
          <Link
            to="/"
            className="font-hero-mono inline-flex items-center gap-2 text-[13px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
          >
            <ArrowLeft size={13} /> Back to portfolio
          </Link>
        </div>
      </main>
    </div>
  );
}
