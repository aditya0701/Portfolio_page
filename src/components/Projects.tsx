import { Section } from "./Section";
import { FlagshipProjectCard, LeadProjectCard, ProjectCard } from "./ProjectCard";
import { projects, coursework } from "../data/projects";
import { ExternalLink } from "lucide-react";

export function Projects() {
  const lead = projects.filter((p) => p.weight === "lead");
  const flagships = projects.filter((p) => p.weight === "flagship");
  const supporting = projects.filter((p) => p.weight === "supporting");

  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Projects"
      intro="Two tracks. Segmentation models trained and benchmarked on real 3D scientific data, and LLM systems that run in production without me watching them."
    >
      <div className="flex flex-col gap-6">
        {lead.map((p) => (
          <LeadProjectCard key={p.slug} project={p} />
        ))}

        <div className="grid gap-6 lg:grid-cols-2">
          {flagships.map((p, i) => (
            <FlagshipProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>

      <h3 className="font-hero-mono mt-14 mb-6 text-[13px] uppercase tracking-[0.2em] text-ink-300">
        Also built
      </h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {supporting.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="notch-corner mt-10 border border-ink-700 bg-ink-900/40 p-6">
        <h3 className="mb-3 text-[14px] font-medium text-ink-100">Coursework & experiments</h3>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
          {coursework.map((c) => (
            <li key={c.href}>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[14px] text-ink-300 hover:text-neon-300"
              >
                {c.label}
                <ExternalLink size={12} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
