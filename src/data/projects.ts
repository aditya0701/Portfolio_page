export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  tags: string[];
  links: { label: string; href: string }[];
  featured: boolean;
  period: string;
};

export const projects: Project[] = [
  {
    slug: "microglomeruli-segmentation",
    title: "Microglomeruli Segmentation",
    tagline: "Instance segmentation of synaptic boutons in Drosophila brain microscopy",
    period: "11/2025 – present · Master's Thesis, RWTH Aachen",
    description:
      "Master's thesis building a fully reproducible deep-learning pipeline to segment and quantify synaptic markers (puncta and boutons) in confocal Z-stacks of the Drosophila mushroom body calyx.",
    bullets: [
      "Fine-tuned MicroSAM (vit_l_lm) with custom post-processing on a hand-annotated 3D dataset built in napari",
      "Benchmarked state-of-the-art 3D instance segmentation backbones: Cellpose 3D, nnU-Net v2, StarDist 3D, and SwinUNETR",
      "Trained across multiple preprocessing variants (raw, difference-of-Gaussians, PSF-deconvolved) and evaluated with instance-matching metrics accounting for physical voxel volume",
      "Final checkpoints published on Hugging Face for reuse",
    ],
    tags: ["PyTorch", "MicroSAM", "Cellpose 3D", "nnU-Net v2", "SwinUNETR", "napari"],
    links: [
      { label: "GitHub", href: "https://github.com/aditya0701/Image_segmentation_thesis" },
      { label: "Model weights (Hugging Face)", href: "https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation" },
    ],
    featured: true,
  },
  {
    slug: "boutonviewer",
    title: "BoutonViewer",
    tagline: "Desktop tool that puts the thesis model in front of real biologists",
    period: "11/2025 – present · Companion tool to the thesis above",
    description:
      "A napari-based desktop application that runs the MicroSAM segmentation pipeline on confocal or Airyscan TIFF stacks, visualizes raw channels and predicted labels in 3D, and reports per-bouton volume and surface area in physical units (µm³ / µm²).",
    bullets: [
      "Supports both LSM (full rolling-ball + Richardson-Lucy deconvolution) and Airyscan (lightweight normalization) acquisition pipelines",
      "Auto-derives voxel calibration from acquisition type and image size, with live-recomputed stats on manual override",
      "Interactive stats table: hover/click a bouton in the viewer to inspect or delete it, with prediction caching to avoid re-running inference unnecessarily",
      "Built for non-technical end users — the Tavosanis lab biologists this was designed for",
    ],
    tags: ["napari", "MicroSAM", "PyQt", "Python", "Desktop GUI"],
    links: [
      { label: "GitHub", href: "https://github.com/aditya0701/Fluorescent-Microscopy-Image-Segmentation-and-Quantification" },
    ],
    featured: true,
  },
  {
    slug: "local-news-aggregator",
    title: "Local News Aggregator",
    tagline: "Bringing science news to Hindi-speaking readers",
    period: "Ongoing",
    description:
      "An aggregator built to close a gap in India's media landscape: with 100+ languages spoken across the country, science and local news rarely reach readers in their own language. This project collects and surfaces local news in Hindi.",
    bullets: [
      "NLP-driven aggregation and processing pipeline for Hindi-language news content",
      "Motivated by accessibility — making science reporting available to readers underserved by English-first media",
    ],
    tags: ["Python", "NLP"],
    links: [{ label: "GitHub", href: "https://github.com/aditya0701/Local_news_aggregator" }],
    featured: false,
  },
  {
    slug: "human-detection-and-counting",
    title: "Realtime Human Detection & Counting",
    tagline: "YOLOv3-based distance enforcement during COVID-19",
    period: "10/2020 – 05/2021 · Bachelor's Project",
    description:
      "Led a team of 3 building a real-time human detection system to help enforce COVID-19 distancing restrictions, combining object detection with geometric distance estimation.",
    bullets: [
      "Real-time human detection using YOLOv3",
      "Perspective transformation to convert image-space distances into accurate real-world distance measurements between individuals",
    ],
    tags: ["YOLOv3", "OpenCV", "Python", "Computer Vision"],
    links: [{ label: "GitHub", href: "https://github.com/aditya0701/Human_Detection_and_Counting" }],
    featured: false,
  },
  {
    slug: "celonis-cohort-discovery",
    title: "Cohort Discovery & Analysis Web App",
    tagline: "Process-mining cohort analysis, built with Celonis",
    period: "04/2024 – 07/2025 · Interdisciplinary Lab Course with Celonis",
    description:
      "Designed and implemented a data-driven algorithm, based on a research paper, to parse and segment Celonis process/event data into distinct cohorts, wrapped in a full-stack web app for interactive analysis.",
    bullets: [
      "Full-stack app in React + Flask, tested with PyTest, for filtering, visualizing, and comparing discovered cohorts",
      "Ran on bi-weekly Agile sprints with test-driven development",
      "Grade: 1.7",
    ],
    tags: ["React", "Flask", "PyTest", "Process Mining"],
    links: [],
    featured: false,
  },
];

export const coursework = [
  { label: "FastAI / fastbook course exercises", href: "https://github.com/aditya0701/Fastbook_codes_course_2022" },
  { label: "Introduction to TensorFlow (Coursera)", href: "https://github.com/aditya0701/Introduction_to_Tensorflow_my_Solutions" },
  { label: "Stable Diffusion & foundations — study notes", href: "https://github.com/aditya0701/Stable_Diffusion_and_Foundations" },
];
