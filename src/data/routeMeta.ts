/**
 * Per-route <head> content, and the canonical list of prerendered routes.
 *
 * Two consumers, one source of truth:
 *   1. `scripts/prerender.mjs` walks these keys, renders each one to a physical
 *      `dist/<route>/index.html`, and stamps the title/description into its head.
 *      That file is what curl, ATS parsers and link-preview bots actually read —
 *      they never run the JS that would otherwise populate #root.
 *   2. Each page calls `usePageTitle(ROUTE_META[...].title)` at runtime, so the
 *      browser tab label and the prerendered <title> cannot drift apart.
 *
 * Descriptions are trimmed from copy that already exists on the page itself
 * (a project's tagline in `projects.ts`, or the page's own lede paragraph) so
 * the search snippet promises exactly what the page delivers.
 *
 * Adding a route to `App.tsx` means adding it here too, otherwise it ships with
 * no prerendered file and falls back to the 404.html redirect.
 */

export type RouteMeta = {
  title: string;
  description: string;
};

export const ROUTE_META = {
  "/": {
    title: "Aditya Rawat | ML Systems, Computer Vision & LLM Engineering",
    description:
      "M.Sc. Data Science at RWTH Aachen. I build 3D microscopy segmentation pipelines (MicroSAM, nnU-Net v2, SwinUNETR) and production LLM systems: an autonomous Hindi newsroom and a research agent with code-enforced grounding.",
  },

  "/case-study/microglomeruli-segmentation": {
    title: "Microglomeruli Segmentation — M.Sc. thesis | Aditya Rawat",
    description:
      "Instance segmentation of synaptic boutons in Drosophila brain microscopy, and the napari tool that ships it to the lab. MicroSAM fine-tuned and benchmarked against Cellpose 3D, nnU-Net v2, StarDist 3D and SwinUNETR.",
  },

  "/case-study/techdrishti": {
    title: "TechDrishti — autonomous AI news agent | Aditya Rawat",
    description:
      "An agentic AI workflow for Hindi tech journalism, running unattended every day on GitHub Actions. Multi-stage LLM pipeline, cheap-model triage, entity cache, and embedding-based deduplication at roughly a cent per run.",
  },

  "/case-study/techdrishti/sarvam-vs-deepseek": {
    title: "Sarvam vs DeepSeek, measured | Aditya Rawat",
    description:
      "37 live calls per provider, 74 total, against one fixed question set pulled from real pipeline output. The evidence behind choosing Sarvam for the RESEARCH stage, not just an assertion of it.",
  },

  "/case-study/techdrishti/evaluation": {
    title: "TechDrishti — evaluation report | Aditya Rawat",
    description:
      "Three hand-labeled golden sets checked against the pipeline's real output rather than anecdotes: 81.9% triage accuracy, 74.7% judge agreement, and a 26.3% hallucination rate over 1,091 factual claims.",
  },

  "/case-study/techdrishti/evolution": {
    title: "TechDrishti — nine field reports | Aditya Rawat",
    description:
      "Nine real failures found while building the pipeline, each with what was claimed, what actually broke, the fix, and how it was verified — quoted from the surviving artifacts rather than paraphrased.",
  },

  "/case-study/deep-research-agent": {
    title: "Deep Research Agent — code-enforced grounding | Aditya Rawat",
    description:
      "An autonomous ReAct agent that plans its own searches and enforces grounding in code, not in a prompt. Code-enforced iteration budget, AST-based calculator, and a grounding check that flags unverified comparison claims.",
  },

  "/case-study/deep-research-agent/comparison": {
    title: "How the research agent compares — measured vs Tavily & Claude | Aditya Rawat",
    description:
      "Twelve real queries across the agent's four modes, compared against the tools people would otherwise reach for: Tavily on the eight question cases, Claude on the four article cases.",
  },

  "/case-study/chitragupta": {
    title: "Chitragupta — a camera assistant built for a cost ceiling | Aditya Rawat",
    description:
      "A hands-free camera assistant where one model writes the brief for the other model's eyes. A two-model split forced by an 8,000 token/minute cap, engineered to run inside a 200,000-token daily ceiling.",
  },

  "/case-study/chitragupta/architecture": {
    title: "Chitragupta — how it works | Aditya Rawat",
    description:
      "Every diagram on this page exists because of a number. The shape of the system is not a preference — it is what fits inside 200,000 vision tokens a day.",
  },

  "/case-study/chitragupta/failure-log": {
    title: "Chitragupta — eight failures and the rules they left | Aditya Rawat",
    description:
      "Eight things that broke, and the rule each one left behind: symptom, root cause, and the rule that came out. Two are still open, and they are here for the same reason as the rest.",
  },

  "/certifications": {
    title: "Certifications — Coursera credentials | Aditya Rawat",
    description:
      "The coursework behind the two tracks — every credential links to its Coursera verification page. DeepLearning.AI, Stanford, Google and U-Michigan programs.",
  },
} as const satisfies Record<string, RouteMeta>;

export type PrerenderedRoute = keyof typeof ROUTE_META;

/** Route paths in prerender order. Router-relative: no `base` prefix. */
export const PRERENDER_ROUTES = Object.keys(ROUTE_META) as PrerenderedRoute[];
