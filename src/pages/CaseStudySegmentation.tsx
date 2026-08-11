import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { DataSheet, type DataRow } from "../components/DataSheet";
import { SkillTags, type SkillGroup } from "../components/SkillTags";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";
import { thesisResults, thesisResultsMeta } from "../data/thesisResults";

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

// Head matter. Every figure here is already defended further down the page or
// transcribed from the published model card — the datasheet introduces none of
// its own. The last two rows are the unflattering ones, and they are in the
// block on purpose: a research result presented without its failure mode is a
// claim, not a result.
const DATASHEET: DataRow[] = [
  {
    k: "Work",
    v: "M.Sc. thesis, RWTH Aachen. Supervised by Prof. Dr. Abigail Morrison, second examiner Prof. Dr.-Ing. Johannes Stegmaier. Built for the Tavosanis lab, who counted these structures by hand.",
    s: "shipped",
    label: "Shipped",
  },
  {
    k: "Task",
    v: "3D instance segmentation of synaptic boutons in confocal Z-stacks of the Drosophila mushroom body calyx — how many, and how big each one is.",
    s: "shipped",
    label: "Shipped",
  },
  {
    k: "Dataset",
    v: (
      <>
        <span className="font-mono tabular-nums">13</span> volumetric stacks, hand-annotated from scratch in
        napari across seven brain preparations and two acquisition systems. No public benchmark for this
        structure existed.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "Benchmark",
    v: (
      <>
        <span className="font-mono tabular-nums">4</span> architectures &times;{" "}
        <span className="font-mono tabular-nums">4</span> preprocessing variants under one evaluation
        protocol — MicroSAM against nnU-Net v2, Cellpose 3D and SwinUNETR.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "Headline result",
    v: (
      <>
        Fine-tuned MicroSAM Large recovered every bouton — recall{" "}
        <span className="font-mono tabular-nums">1.000</span>, matched mIoU{" "}
        <span className="font-mono tabular-nums">0.787</span>, the best of any model evaluated.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "Baseline beaten",
    v: (
      <>
        The lab&rsquo;s current semi-manual Imaris workflow scores recall{" "}
        <span className="font-mono tabular-nums">0.735</span>, mIoU{" "}
        <span className="font-mono tabular-nums">0.505</span> on the same test set.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "In production",
    v: "BoutonViewer is in active use by biologists today, on their own acquisitions rather than on the held-out volumes. A napari desktop app that turns a TIFF stack into a per-bouton table in µm³ and µm²; checkpoints published on Hugging Face with the rejected runs left out.",
    s: "shipped",
    label: "In use",
  },
  {
    k: "Known weakness",
    v: (
      <>
        That perfect recall is bought with <span className="font-mono tabular-nums">16</span> false positives,
        several of them one large bouton split into parts. The model card says predictions should be reviewed
        before unsupervised quantification.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "Not verified",
    v: (
      <>
        The scored test set is <span className="font-mono tabular-nums">2</span> images and{" "}
        <span className="font-mono tabular-nums">33</span> ground-truth boutons, from two specimens. Performance
        under substantially different imaging or labelling has never been formally measured —{" "}
        <strong className="font-semibold">daily use is adoption evidence, not benchmark evidence</strong>, and
        the two are not interchangeable.
      </>
    ),
    s: "pending",
    label: "Unverified",
  },
];

const SKILL_GROUPS: SkillGroup[] = [
  [
    "Computer vision",
    ["3D instance segmentation", "Foundation-model fine-tuning", "MicroSAM / SAM", "nnU-Net v2", "SwinUNETR", "Cellpose 3D"],
  ],
  [
    "Evaluation",
    ["Instance matching", "Volume-weighted metrics", "Recall-weighted panoptic quality", "Held-out specimen splits"],
  ],
  [
    "Imaging data",
    ["Hand annotation in napari", "Anisotropic voxel calibration", "Richardson-Lucy deconvolution", "Difference-of-Gaussians"],
  ],
  ["Engineering", ["PyTorch", "MONAI", "Kornia", "HTCondor cluster jobs", "napari plugin", "Hugging Face Hub"]],
];

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
    tag: "NO CANONICAL BOUTON",
    title: "Two boutons in the same image can look nothing alike",
    desc: "Shape and intensity both vary, and they vary within a single volume rather than only between specimens: there is no reference size to filter on and no reference brightness to threshold at. That is exactly the assumption classical detection rests on — a threshold, a blob filter, a size prior all expect the thing you are looking for to look roughly the same wherever it turns up — which is why those methods fall over here. And the failure cuts both ways. Noise and background signal throw up structures that pass the same tests a real bouton passes, so a pipeline tuned far enough down to catch the faint ones starts reporting boutons that were never there. Beating that trade is what a learned model with a strong prior is actually being asked to do.",
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

/* ── The experiment, as one figure ─────────────────────────────────────────
 * Read downward. The shape of this page's argument is a grid, not a pipeline:
 * the claim is not "a model worked" but "a model beat three SOTA backbones and
 * the lab's existing tool under one protocol", and that claim is only worth
 * anything because 16 runs sit behind it. So the matrix is the centrepiece and
 * everything else is what feeds it or what comes out.
 *
 * The two instruments get their own colour because they are a real category
 * with real consequences — they take different preprocessing paths, and
 * collapsing them would mean deconvolving already-deconvolved data. Green marks
 * the path that shipped; red marks the failure mode the evaluation is designed
 * around. Every number is stated elsewhere on this page. */

const F_TAG = { fontFamily: "var(--font-data)", fontSize: 10.5, letterSpacing: ".09em" };
const F_SUB = { fontFamily: "var(--font-data)", fontSize: 9.5 };
const F_NOTE = { fontFamily: "var(--font-sans)", fontSize: 10, fontStyle: "italic" as const };
const F_BIG = { fontFamily: "var(--font-display)", fontSize: 12.5, fontWeight: 600 };

const VARIANT_COLS = ["raw", "DoG", "PSF", "all"];
const ARCH_ROWS = [
  { name: "MicroSAM", selected: true },
  { name: "Cellpose 3D", selected: false },
  { name: "nnU-Net v2", selected: false },
  { name: "SwinUNETR", selected: false },
];

const CELL_W = 52;
const CELL_H = 32;
const CELL_X0 = 272;
/** Pushed down from the dataset box so the incoming arrow, the "16 training
 *  runs" tag and the column headers each get their own band instead of
 *  crowding into one. Everything below is measured off this. */
const GRID_Y0 = 230;

function ExperimentDiagram() {
  return (
    <svg
      viewBox="0 0 720 566"
      className="block h-auto w-full min-w-[32rem]"
      role="img"
      aria-label="The experiment read downward. Two microscopes — confocal LSM and Airyscan — feed one hand-annotated dataset of 13 volumes from seven brain preparations, split nine train, two validation, two test. That dataset feeds a four-by-four grid of 16 training runs: four architectures (MicroSAM, Cellpose 3D, nnU-Net v2, SwinUNETR) each trained on four preprocessing variants (raw, difference-of-Gaussians, PSF-deconvolved, and all combined), launched as HTCondor submit files. Every run is scored by the same protocol: instance matching weighted by physical voxel volume, rather than per-pixel overlap. Two things come out — the selected checkpoints, published on Hugging Face, and BoutonViewer, a napari application that turns a microscope stack into a per-bouton table."
    >
      <defs>
        <marker id="sg-arw" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-rule-hard)" />
        </marker>
      </defs>

      <text {...F_NOTE} x={360} y={13} textAnchor="middle" fill="var(--color-ink-soft)">
        two instruments, two preprocessing paths — one shared path would deconvolve already-deconvolved data
      </text>

      {/* Sources */}
      <rect x={88} y={22} width={252} height={62} fill="color-mix(in oklch, var(--color-i4) 8%, transparent)" stroke="var(--color-i4)" strokeWidth="1.3" />
      <text {...F_TAG} x={214} y={42} textAnchor="middle" fill="var(--color-i4)">CONFOCAL LSM</text>
      <text {...F_SUB} x={214} y={58} textAnchor="middle" fill="var(--color-ink)">0.3 × 0.0709 × 0.0709 µm</text>
      <text {...F_NOTE} x={214} y={74} textAnchor="middle" fill="var(--color-ink-soft)">rolling-ball + Richardson-Lucy</text>

      <rect x={380} y={22} width={252} height={62} fill="color-mix(in oklch, var(--color-i6) 8%, transparent)" stroke="var(--color-i6)" strokeWidth="1.3" />
      <text {...F_TAG} x={506} y={42} textAnchor="middle" fill="var(--color-i6)">AIRYSCAN</text>
      <text {...F_SUB} x={506} y={58} textAnchor="middle" fill="var(--color-ink)">0.3 × 0.0425 × 0.0425 µm</text>
      <text {...F_NOTE} x={506} y={74} textAnchor="middle" fill="var(--color-ink-soft)">already deconvolved — light normalise</text>

      <path d="M214 84 L214 98 L360 98 L360 112" fill="none" stroke="var(--color-rule-hard)" strokeWidth="1.4" markerEnd="url(#sg-arw)" />
      <path d="M506 84 L506 98 L360 98" fill="none" stroke="var(--color-rule-hard)" strokeWidth="1.4" />

      {/* Dataset */}
      <rect x={140} y={114} width={440} height={58} fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...F_TAG} x={360} y={134} textAnchor="middle" fill="var(--color-ink)">13 HAND-ANNOTATED VOLUMES</text>
      <text {...F_NOTE} x={360} y={152} textAnchor="middle" fill="var(--color-ink-soft)">
        7 brain preparations · 9 train / 2 validation / 2 test
      </text>
      <text {...F_NOTE} x={8} y={132} fill="var(--color-ink-soft)">no public benchmark</text>
      <text {...F_NOTE} x={8} y={144} fill="var(--color-ink-soft)">existed — the ground</text>
      <text {...F_NOTE} x={8} y={156} fill="var(--color-ink-soft)">truth had to be made</text>
      <text {...F_NOTE} x={8} y={168} fill="var(--color-ink-soft)">before anything ran</text>

      <line x1={360} y1={172} x2={360} y2={196} stroke="var(--color-rule-hard)" strokeWidth="1.4" markerEnd="url(#sg-arw)" />

      {/* The 4 × 4 grid — the centrepiece */}
      <text {...F_TAG} x={150} y={212} fill="var(--color-ink)">16 TRAINING RUNS</text>
      {VARIANT_COLS.map((c, j) => (
        <text key={c} {...F_SUB} x={CELL_X0 + j * CELL_W + CELL_W / 2} y={GRID_Y0 - 6} textAnchor="middle" fill="var(--color-ink-soft)">
          {c}
        </text>
      ))}
      {ARCH_ROWS.map((r, i) => (
        <g key={r.name}>
          <text
            {...F_SUB}
            x={262}
            y={GRID_Y0 + i * CELL_H + CELL_H / 2 + 3}
            textAnchor="end"
            fill={r.selected ? "var(--color-i3)" : "var(--color-ink-mid)"}
          >
            {r.name}
          </text>
          {VARIANT_COLS.map((c, j) => (
            <rect
              key={c}
              x={CELL_X0 + j * CELL_W}
              y={GRID_Y0 + i * CELL_H}
              width={CELL_W}
              height={CELL_H}
              fill={r.selected ? "color-mix(in oklch, var(--color-i3) 9%, transparent)" : "var(--color-paper-hi)"}
              stroke={r.selected ? "var(--color-i3)" : "var(--color-rule)"}
            />
          ))}
        </g>
      ))}
      <text {...F_NOTE} x={496} y={GRID_Y0 + 14} fill="var(--color-ink-soft)">four architectures × four</text>
      <text {...F_NOTE} x={496} y={GRID_Y0 + 26} fill="var(--color-ink-soft)">preprocessing variants is a</text>
      <text {...F_NOTE} x={496} y={GRID_Y0 + 38} fill="var(--color-ink-soft)">grid, not a run — launched as</text>
      <text {...F_NOTE} x={496} y={GRID_Y0 + 50} fill="var(--color-ink-soft)">HTCondor submit files on the</text>
      <text {...F_NOTE} x={496} y={GRID_Y0 + 62} fill="var(--color-ink-soft)">cluster, not started by hand</text>
      <text {...F_NOTE} x={496} y={GRID_Y0 + 82} fill="var(--color-i3)">green = the row that shipped</text>

      <line x1={360} y1={GRID_Y0 + 4 * CELL_H} x2={360} y2={GRID_Y0 + 4 * CELL_H + 20} stroke="var(--color-rule-hard)" strokeWidth="1.4" markerEnd="url(#sg-arw)" />

      {/* Evaluation */}
      <rect x={140} y={380} width={440} height={62} fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...F_TAG} x={360} y={400} textAnchor="middle" fill="var(--color-ink)">INSTANCE MATCHING, NOT PIXEL OVERLAP</text>
      <text {...F_NOTE} x={360} y={417} textAnchor="middle" fill="var(--color-ink-soft)">
        weighted by physical voxel volume, so coarse Z spacing
      </text>
      <text {...F_NOTE} x={360} y={432} textAnchor="middle" fill="var(--color-ink-soft)">
        cannot quietly inflate or deflate a score
      </text>
      <text {...F_NOTE} x={8} y={400} fill="var(--color-i1)">a pixel score can’t</text>
      <text {...F_NOTE} x={8} y={412} fill="var(--color-i1)">say whether one</text>
      <text {...F_NOTE} x={8} y={424} fill="var(--color-i1)">object became two</text>
      <text {...F_NOTE} x={596} y={406} fill="var(--color-ink-soft)">recall leads:</text>
      <text {...F_NOTE} x={596} y={418} fill="var(--color-ink-soft)">a missed bouton</text>
      <text {...F_NOTE} x={596} y={430} fill="var(--color-ink-soft)">is permanent</text>

      <path d="M360 442 L360 458 L214 458 L214 474" fill="none" stroke="var(--color-rule-hard)" strokeWidth="1.4" markerEnd="url(#sg-arw)" />
      <path d="M360 458 L506 458 L506 474" fill="none" stroke="var(--color-rule-hard)" strokeWidth="1.4" markerEnd="url(#sg-arw)" />

      {/* What comes out */}
      <rect x={88} y={476} width={252} height={58} fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...F_TAG} x={214} y={496} textAnchor="middle" fill="var(--color-ink)">CHECKPOINTS</text>
      <text {...F_NOTE} x={214} y={513} textAnchor="middle" fill="var(--color-ink-soft)">on Hugging Face, with the</text>
      <text {...F_NOTE} x={214} y={526} textAnchor="middle" fill="var(--color-ink-soft)">rejected runs left out</text>

      <rect x={380} y={476} width={252} height={58} fill="color-mix(in oklch, var(--color-i3) 8%, transparent)" stroke="var(--color-i3)" strokeWidth="1.3" />
      <text {...F_BIG} x={506} y={497} textAnchor="middle" fill="var(--color-ink)">BoutonViewer</text>
      <text {...F_NOTE} x={506} y={514} textAnchor="middle" fill="var(--color-ink-soft)">a biologist loads a TIFF stack</text>
      <text {...F_NOTE} x={506} y={527} textAnchor="middle" fill="var(--color-ink-soft)">and gets a table in µm³</text>

      <text {...F_NOTE} x={360} y={556} textAnchor="middle" fill="var(--color-ink-soft)">
        A checkpoint on a cluster helps nobody — which is why the napari app is part of this project, and why biologists use it now.
      </text>
    </svg>
  );
}

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
          Prof. Dr.-Ing. Johannes Stegmaier as second examiner. Built for the Tavosanis lab, who counted
          these structures by hand &mdash;{" "}
          <strong className="font-semibold text-ink">and who are using the tool now</strong>.
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
          {/* The file tree rather than the repo root: someone who clicks a button
              labelled "model weights" wants the checkpoints, not the card. The
              card is one click away from here, and linked in full below. */}
          <a
            href="https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation/tree/main"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 border border-panel-border bg-panel px-5 py-2.5 text-[14px] font-medium text-panel-text transition-colors hover:border-i3 hover:text-i3"
          >
            Model weights <ExternalLink size={14} />
          </a>
        </div>

        <div className="mt-10">
          <DataSheet title="THESIS DATASHEET" rows={DATASHEET} />
        </div>

        <div className="mt-8">
          <SkillTags groups={SKILL_GROUPS} />
        </div>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="01" title="The whole experiment, in one figure" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            The claim on this page is not that a model worked. It is that a fine-tuned foundation model{" "}
            <strong className="font-semibold text-ink">
              beat three SOTA 3D backbones and the lab&rsquo;s existing tool under one protocol
            </strong>
            , and that claim is only worth making because sixteen runs sit behind it. So the grid is the
            centre of the figure, and everything else is what feeds it or what came out.
          </p>
          <figure className="m-0 mt-6 flex flex-col gap-3">
            <div className="notch-corner overflow-x-auto border border-rule-hard bg-panel px-3 py-4 sm:px-4">
              <ExperimentDiagram />
            </div>
            <figcaption className="text-[13px] leading-relaxed text-ink-mid">
              <b className="text-ink">Two constraints shape the whole thing.</b> Every training example was
              annotated by hand, which puts a hard ceiling on how much data can ever exist — that is what makes a
              model with a strong microscopy prior a practical choice rather than a fashionable one. And the two
              microscopes are genuinely different instruments, so they take different preprocessing paths;
              averaging them into one would mean deconvolving data the microscope had already deconvolved.
            </figcaption>
          </figure>
        </section>

        {/* ------------------------------------------------------------ */}
        <section className="mt-20">
          <SectionHead num="02" title="What it looks like" />
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
          <SectionHead num="03" title="Why this is hard" />
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
          <SectionHead num="04" title="The benchmark, and why each model is in it" />
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
          <SectionHead num="05" title="Results" />

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
          <SectionHead num="06" title="Two decisions worth defending" />

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
          <SectionHead num="07" title="Shipping it: BoutonViewer" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            A napari desktop application that runs the pipeline on a confocal or Airyscan TIFF
            stack, shows the raw channels and predicted labels in 3D, and reports per-bouton volume
            and surface area in µm³ and µm². A biologist loads a file and gets a table.{" "}
            <strong className="font-semibold text-ink">
              It is in active use in the lab today, on their own acquisitions
            </strong>{" "}
            — which is the part of this project that a benchmark table cannot show.
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
          <SectionHead num="08" title="Reproducibility" />
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
