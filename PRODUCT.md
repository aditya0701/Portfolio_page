# Product

## Register

brand

## Users

Recruiters, hiring managers, and technical interviewers screening for AI engineering, ML engineering, and computer vision roles. Two distinct screener audiences read this site: one is looking for model-training and CV depth, the other for LLM systems that survive production. They arrive from a CV, LinkedIn, or GitHub link, spend a short window deciding whether to dig deeper, and are evaluating both technical rigor (can this person actually do the work) and communication quality (can they explain it clearly). Deep-diving visitors read the full case studies; most others scan.

## Product Purpose

A portfolio for Aditya Rawat (M.Sc. Data Science, RWTH Aachen, expected 06/2026) targeting AI engineering, ML engineering, and computer vision roles.

**Positioning: dual-track.** Two flagship tracks carry equal weight, because the combination is the differentiator: the thesis is model-training credibility that most AI-engineering applicants do not have, and the LLM systems are shipping evidence that most CV applicants do not have. Splitting them would waste that. The hero names both explicitly rather than picking one.

- **Computer vision track (lead):** the master's thesis (microglomeruli/synaptic bouton segmentation in Drosophila confocal microscopy, benchmarking MicroSAM/Cellpose3D/nnU-Net v2/SwinUNETR) paired with BoutonViewer, the napari tool built on top of it. Research and delivery as one project.
- **LLM systems track:** TechDrishti (a fully autonomous Hindi tech-news publication running daily on GitHub Actions with cost-tiered model routing) and the Deep Research Agent (an autonomous research loop with code-enforced grounding verification). Both are production systems with measured behaviour, not demos.
- **Bridge:** Chitragupt, a vision-language agent with tool use, is the project where the tracks meet.
- **Supporting projects** (YOLO-based detection, full-stack lab work) stay lightweight so they do not dilute the flagships.

The dual track is carried by structure, not by two competing headlines: track labels on each project card, a skills block grouped into named tracks, and a project order that leads with the thesis. Success is a recruiter or hiring manager reaching out for an interview.

## Brand Personality

Precise & technical, hacker-terminal, 90s-cyberpunk. The voice is an engineer who takes the work seriously but doesn't take themselves too seriously — rigorous claims (benchmarks, metrics, architecture decisions) delivered with a bit of visual wit rather than corporate polish. The identity is a classic phosphor-terminal aesthetic (Matrix-style green-on-black, monospace/pixel type, CRT scanline texture, neon glow) — a nod to "hacking the mainframe" 90s movie computing rather than a modern SaaS dashboard. Confidence comes from depth of explanation and a distinctive point of view, not from selling language or corporate polish.

## Anti-references

- Generic SaaS/startup portfolio templates (hero-metric blocks, gradient text, identical project cards, tiny uppercase eyebrows).
- Overly corporate/agency-style personal sites that read as impersonal.
- The prior Indo-futurist direction (bronze/vermillion palette, yantra/lotus radial motif, sun-wheel mark): explored and retired — not the current direction. Don't reference it or revive it.
- Multi-neon "Blade Runner" maximalism or Y2K hacker-zine chaos: the palette stays disciplined around one dominant neon (green) with a rare second signal color, not a rainbow of neons.

## Design Principles

- Show, don't tell: benchmarks, architecture diagrams, and concrete metrics carry more weight than adjectives. Research work in particular must have something clickable: a figure, a demo, or a table, never a bullet list standing in for evidence.
- Depth on demand: each of the three flagships gets full case-study treatment; supporting projects stay lightweight so they don't dilute them.
- Precision as aesthetic: technical rigor should be visible in the craft of the page itself, not just claimed in the copy. This is why the build refuses to ship an unresolved metric placeholder: the page holds itself to the standard its copy claims.
- Terminal as identity: the hacker/CRT aesthetic should surface through real UI logic (a terminal-window frame, a blinking cursor, monospace type, scanline texture) rather than being pasted on as a color swap over a generic layout.
- One clear conversion path: every surface should make it obvious how to reach out (email/GitHub), without ever publishing personal contact info like a phone number.

## Accessibility & Inclusion

WCAG AA baseline: contrast ratios, keyboard navigation, and reduced-motion alternatives for all animation. Reduced motion is handled globally (framer-motion MotionConfig set to reducedMotion "user", plus Tailwind motion-safe: for CSS animation) rather than per-component. Body copy sits at 14px and never below 12px: the audience is skimming under time pressure, and unreadable-but-atmospheric is a failure of the "precision as aesthetic" principle, not an expression of it. Chart/data-viz colors must remain colorblind-safe (already evidenced by the CVD-safe two-series chart palette in the codebase) — carry that standard forward into any future visualizations.
