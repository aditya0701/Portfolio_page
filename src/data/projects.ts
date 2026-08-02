export type Track = "cv" | "llm" | "both" | "data";

/** Epistemic status, mirrored in the hero legend. `not-shipped` renders with the
 *  muted `excluded` style: built and measured, but deliberately left out. */
export type EpistemicStatus = "measured" | "shipped" | "pending" | "not-shipped";

export type Figure = {
  src: string;
  alt: string;
  caption: string;
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  tags: string[];
  links: { label: string; href: string }[];
  /** `lead` gets the full-width treatment; `flagship` gets a large card;
   *  `supporting` stays lightweight; `pending` marks a project still in progress. */
  weight: "lead" | "flagship" | "supporting" | "pending";
  track: Track;
  /** Real epistemic status for the badge. Omit on lightweight older work. */
  status?: EpistemicStatus;
  period: string;
  figures?: Figure[];
};

export const TRACK_LABEL: Record<Track, string> = {
  cv: "Computer vision",
  llm: "LLM systems",
  both: "Vision + LLM",
  data: "Data & process mining",
};

export const projects: Project[] = [
  {
    slug: "microglomeruli-segmentation",
    status: "measured",
    title: "Microglomeruli Segmentation",
    tagline:
      "Instance segmentation of synaptic boutons in Drosophila brain microscopy, and the tool that ships it to the lab",
    period: "11/2025 – present · Master's thesis, RWTH Aachen",
    track: "cv",
    description:
      "A fully reproducible deep-learning pipeline that segments and quantifies synaptic boutons in confocal Z-stacks of the Drosophila mushroom body calyx, plus BoutonViewer: the napari desktop tool that puts the model in the hands of the biologists it was built for. Research and delivery as one project, because a model nobody can run is not a result.",
    bullets: [
      "Fine-tuned MicroSAM (vit_l_lm) with custom post-processing on a hand-annotated 3D dataset built from scratch in napari",
      "Benchmarked four SOTA 3D instance-segmentation backbones head to head: Cellpose 3D, nnU-Net v2, StarDist 3D and SwinUNETR",
      "Trained across three preprocessing variants (raw, difference-of-Gaussians, PSF-deconvolved) and evaluated with instance-matching metrics that account for physical voxel volume, not pixel counts",
      "BoutonViewer reports per-bouton volume and surface area in µm³ / µm², auto-derives voxel calibration from acquisition type, and lets a biologist click away a false positive without touching code",
      "Final checkpoints published on Hugging Face for reuse",
    ],
    tags: ["PyTorch", "MicroSAM", "Cellpose 3D", "nnU-Net v2", "SwinUNETR", "MONAI", "napari", "PyQt"],
    figures: [
      {
        src: "figures/original.webp",
        alt: "Raw confocal microscopy volume of the Drosophila mushroom body calyx, rotating in 3D.",
        caption: "Raw input",
      },
      {
        src: "figures/ground_truth.webp",
        alt: "Hand-annotated ground-truth instance labels for the same volume, each bouton a distinct colour.",
        caption: "Ground truth",
      },
      {
        src: "figures/prediction.webp",
        alt: "Predicted instance segmentation from the fine-tuned MicroSAM model on a held-out volume.",
        caption: "Prediction (held out)",
      },
    ],
    links: [
      { label: "Case Study", href: "/case-study/microglomeruli-segmentation" },
      { label: "Thesis code", href: "https://github.com/aditya0701/Image_segmentation_thesis" },
      {
        label: "BoutonViewer",
        href: "https://github.com/aditya0701/Fluorescent-Microscopy-Image-Segmentation-and-Quantification",
      },
      {
        label: "Model weights",
        href: "https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation",
      },
    ],
    weight: "lead",
  },
  {
    slug: "techdrishti",
    status: "shipped",
    title: "TechDrishti",
    tagline: "An agentic AI workflow for Hindi tech journalism, running unattended every day on GitHub Actions",
    period: "06/2026 – present · Solo project",
    track: "llm",
    description:
      "A fully autonomous newsroom. Every morning it collects English tech news, decides for itself what is genuine news versus a job listing or SEO spam, calls out to its own research agent for anything a keyword search cannot answer, and writes an original Hindi article per story through a multi-stage LLM pipeline. Not machine translation. Zero servers, zero hosting cost.",
    bullets: [
      "Agentic multi-stage plan-execute pipeline across sarvam-30b/105b, engineered around real token-starvation and hallucination failure modes found in production, not anticipated in design",
      "Cheap-model triage filters non-news before the expensive model ever sees it, which is what makes the economics work at roughly a cent per run",
      "Persistent entity cache with a 45-day TTL and sense disambiguation, so the same name is never researched twice",
      "Sentence-embedding clustering merges duplicate coverage of one story across 8 RSS feeds and GitHub trending",
      "Every fix documented as claim, root cause, fix, verified on real articles, rather than a green test",
    ],
    tags: ["Agentic AI", "Python", "LLM Pipelines", "Sarvam AI", "sentence-transformers", "GitHub Actions"],
    links: [
      { label: "Case Study", href: "/case-study/techdrishti" },
      { label: "Live Edition", href: "https://aditya0701.github.io/Local_news_aggregator/" },
      { label: "GitHub", href: "https://github.com/aditya0701/Local_news_aggregator" },
    ],
    weight: "flagship",
  },
  {
    slug: "deep-research-agent",
    status: "shipped",
    title: "Deep Research Agent",
    tagline: "An autonomous ReAct agent that plans its own searches and enforces grounding in code, not in a prompt",
    period: "06/2026 – present · Solo project, spun out of TechDrishti",
    track: "llm",
    description:
      "An autonomous ReAct agent that plans its own searches, reasons over what each result adds, and decides for itself when the evidence is enough — then returns a cited report with every comparison claim verified in code, not just promised in a prompt. It began as a free-search extension for TechDrishti and grew into a standalone, four-mode system: ask, quick grounded answer, research an article, and an automated Hindi article writer. Live and usable on Hugging Face Spaces.",
    bullets: [
      "Code-enforced iteration budget (MAX_ITERATIONS = 8): when it is exhausted the search tools are forcibly removed, but calculate survives so the report can still finish",
      "A grounding check flags any comparison claim whose named target was not found in retrieved sources, because two rounds of increasingly explicit 'don't hallucinate' prompting failed reproducibly",
      "AST-based calculator, structured tool errors, and evidence-tool separation, so a fabricated number cannot launder itself into looking grounded",
      "Measured against TechDrishti integration and consciously left out of production. The case study does not spin that as a win",
      "Free keyless retrieval layer (DuckDuckGo + Google News RSS + page/PDF fetch) instead of a metered search API",
    ],
    tags: ["ReAct agents", "Tool use / function calling", "LLM orchestration", "Python", "DeepSeek V4 Flash", "Sarvam", "Chainlit", "FastAPI"],
    links: [
      { label: "Case Study", href: "/case-study/deep-research-agent" },
      { label: "Live Demo", href: "https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool" },
    ],
    weight: "flagship",
  },
  {
    slug: "chitragupta",
    status: "pending",
    title: "Chitragupta",
    tagline:
      "A hands-free camera assistant where one model writes the brief for the other model's eyes",
    period: "07/2026 – present · Solo project",
    track: "both",
    description:
      "A voice assistant that watches through a phone camera while your hands are busy — tracking steps, substitutions and timers, and speaking back. Two models split the job: one converts frames to text and nothing else, the second does all reasoning and tool calling and never sees a pixel. That split exists because a single-model design could not survive its provider's per-minute cap, and the whole system is engineered to run continuously inside a 200,000-token daily ceiling on free tiers.",
    bullets: [
      "Hybrid pipeline (Groq Qwen3.6-27B for vision, DeepSeek v4-flash for reasoning + 10 native tools), forced by an 8,000 token/minute cap that made a one-model design impossible",
      "The reasoning model writes its own brief to the vision stage, so the system can look for things nobody anticipated in advance — and asks for observations, never judgements",
      "Cost engineering measured, not guessed: a browser-side perceptual diff gate drops unchanged frames before any request, and an opt-in close-up tier costs a measured 2.4× per frame",
      "Persisted task and timer state on disk, injected into every prompt, so a restart loses nothing and timer checks cost no inference",
      "Verified against a real 40-minute phone session, with two known failure modes documented rather than hidden",
    ],
    tags: [
      "Vision-language models",
      "Agentic AI",
      "LLM cost engineering",
      "Tool use / function calling",
      "FastAPI",
      "Python",
      "Groq · DeepSeek",
    ],
    links: [
      { label: "Case Study", href: "/case-study/chitragupta" },
      { label: "How it works", href: "/case-study/chitragupta/architecture" },
      { label: "Failure log", href: "/case-study/chitragupta/failure-log" },
      { label: "GitHub", href: "https://github.com/aditya0701/Chitragupta---A-Vision-based-AI-helper" },
    ],
    weight: "flagship",
  },
  {
    slug: "human-detection-and-counting",
    title: "Realtime Human Detection & Counting",
    tagline: "YOLOv3-based distance enforcement during COVID-19",
    period: "10/2020 – 05/2021 · Bachelor's project",
    track: "cv",
    description:
      "Led a team of 3 building a real-time human detection system to help enforce COVID-19 distancing restrictions, combining object detection with geometric distance estimation.",
    bullets: [
      "Real-time human detection using YOLOv3",
      "Perspective transformation to convert image-space distances into real-world distances between individuals",
    ],
    tags: ["YOLOv3", "OpenCV", "Python", "Computer Vision"],
    links: [{ label: "GitHub", href: "https://github.com/aditya0701/Human_Detection_and_Counting" }],
    weight: "supporting",
  },
  {
    slug: "boutonviewer",
    status: "shipped",
    title: "BoutonViewer",
    tagline: "The napari desktop tool that puts the thesis segmentation model in biologists' hands",
    period: "2025 – present · Thesis delivery tool",
    track: "cv",
    description:
      "The delivery half of the thesis, packaged as its own tool: a napari app that runs the bouton-segmentation pipeline on a confocal or Airyscan stack, reports per-bouton volume and surface area in µm³ / µm², and lets a biologist delete a false positive without touching code. A step-by-step usage manual lives on the repo's GitHub wiki.",
    bullets: [
      "One-file-in, table-out workflow for non-programmers, with prediction caching so a display change never re-runs inference",
      "Usage manual and model/data notes shipped alongside the tool, including where the model should not be trusted",
    ],
    tags: ["napari", "PyQt", "Python", "3D segmentation"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/aditya0701/Fluorescent-Microscopy-Image-Segmentation-and-Quantification",
      },
      {
        label: "Usage manual (wiki)",
        href: "https://github.com/aditya0701/Fluorescent-Microscopy-Image-Segmentation-and-Quantification/wiki",
      },
      {
        label: "Model card (Hugging Face)",
        href: "https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation",
      },
    ],
    weight: "supporting",
  },
  {
    slug: "celonis-cohort-discovery",
    title: "Cohort Discovery & Analysis Web App",
    tagline: "Cohort discovery on event data — a proof-of-concept built for Celonis",
    period: "04/2024 – 07/2025 · Interdisciplinary lab course with Celonis",
    track: "data",
    description:
      "A proof-of-concept for Celonis: an event-data application that segments event logs into behavioural cohorts by implementing a cohort-discovery research paper — data clustering over event sequences, then interactive analysis of the cohorts it finds. A light LLM assist sits on the analysis options, but the work is event-data mining, not an LLM system.",
    bullets: [
      "Full-stack app in React + Flask, tested with PyTest, for filtering, visualizing and comparing discovered cohorts",
      "Bi-weekly Agile sprints, test-driven development. Grade: 1.7",
    ],
    tags: ["React", "Flask", "PyTest", "Process mining", "Event data", "Clustering"],
    links: [],
    weight: "supporting",
  },
];

export const coursework = [
  { label: "FastAI / fastbook course exercises", href: "https://github.com/aditya0701/Fastbook_codes_course_2022" },
  {
    label: "Introduction to TensorFlow (Coursera)",
    href: "https://github.com/aditya0701/Introduction_to_Tensorflow_my_Solutions",
  },
  {
    label: "Stable Diffusion & foundations — study notes",
    href: "https://github.com/aditya0701/Stable_Diffusion_and_Foundations",
  },
];
