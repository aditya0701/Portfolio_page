export type Track = "cv" | "llm" | "both";

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
   *  `supporting` stays deliberately lightweight so it cannot dilute the
   *  work above it. */
  weight: "lead" | "flagship" | "supporting";
  track: Track;
  period: string;
  figures?: Figure[];
};

export const TRACK_LABEL: Record<Track, string> = {
  cv: "Computer vision",
  llm: "LLM systems",
  both: "Vision + LLM",
};

export const projects: Project[] = [
  {
    slug: "microglomeruli-segmentation",
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
    title: "TechDrishti (टेकदृष्टि)",
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
    title: "Deep Research Agent",
    tagline: "An autonomous research loop where grounding is enforced by code, not requested in a prompt",
    period: "06/2026 – present · Solo project, spun out of TechDrishti",
    track: "llm",
    description:
      "Given a research question, the agent decides how many searches to run, what to search next based on what it already found, and when it has enough grounded evidence to stop. It hands back a cited report with every comparison claim checked in code against what was actually retrieved. Built directly out of a measured limitation in TechDrishti's fixed, single-shot search pipeline.",
    bullets: [
      "Code-enforced iteration budget (MAX_ITERATIONS = 8): when it is exhausted the search tools are forcibly removed, but calculate survives so the report can still finish",
      "A grounding check flags any comparison claim whose named target was not found in retrieved sources, because two rounds of increasingly explicit 'don't hallucinate' prompting failed reproducibly",
      "AST-based calculator, structured tool errors, and evidence-tool separation, so a fabricated number cannot launder itself into looking grounded",
      "Measured against TechDrishti integration and consciously left out of production. The case study does not spin that as a win",
      "Free keyless retrieval layer (DuckDuckGo + Google News RSS + page/PDF fetch) instead of a metered search API",
    ],
    tags: ["Python", "DeepSeek V4 Flash", "Sarvam", "Chainlit", "FastAPI", "Agentic Search"],
    links: [
      { label: "Case Study", href: "/case-study/deep-research-agent" },
      { label: "Live Demo", href: "https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool" },
    ],
    weight: "flagship",
  },
  {
    slug: "chitragupt",
    title: "Chitragupt",
    tagline: "A vision-language agent that can see, reason and use tools",
    period: "07/2026 – present · Solo project",
    track: "both",
    description:
      "An agentic assistant built on a vision-language model: it takes images, reasons about them, calls tools and holds conversation context. The VLM runs on Colab's free GPU tier, bridged through a FastAPI server to a web UI, a desktop app and a CLI. The project where the two tracks meet.",
    bullets: [
      "VLM inference on a free Colab GPU, bridged to a local FastAPI server so no client ever talks to Colab directly",
      "Tool use and conversation context on top of a vision model, with three clients (web, Tkinter desktop, CLI) against one API",
    ],
    tags: ["VLM", "Agentic AI", "FastAPI", "Python", "Computer Vision"],
    links: [{ label: "GitHub", href: "https://github.com/aditya0701/Chitragupta---A-Vision-based-AI-helper" }],
    weight: "supporting",
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
    slug: "celonis-cohort-discovery",
    title: "Cohort Discovery & Analysis Web App",
    tagline: "Process-mining cohort analysis, built with Celonis",
    period: "04/2024 – 07/2025 · Interdisciplinary lab course with Celonis",
    track: "llm",
    description:
      "Implemented a data-driven algorithm from a research paper to parse and segment Celonis process/event data into distinct cohorts, wrapped in a full-stack web app for interactive analysis.",
    bullets: [
      "Full-stack app in React + Flask, tested with PyTest, for filtering, visualizing and comparing discovered cohorts",
      "Bi-weekly Agile sprints, test-driven development. Grade: 1.7",
    ],
    tags: ["React", "Flask", "PyTest", "Process Mining"],
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
