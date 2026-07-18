import { Section } from "./Section";
import { FlagshipProjectCard, LeadProjectCard, ProjectCard } from "./ProjectCard";
import { projects, coursework } from "../data/projects";
import { ExternalLink } from "lucide-react";

export function Projects() {
  const lead = projects.filter((p) => p.weight === "lead");
  const flagships = projects.filter((p) => p.weight === "flagship");
  const supporting = projects.filter((p) => p.weight === "supporting");
  const pending = projects.filter((p) => p.weight === "pending");

  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Flagship &amp; supporting projects"
      intro="Segmentation models trained and benchmarked on real 3D scientific data, and LLM systems that run in production without me watching them."
    >
      {lead.map((p) => (
        <LeadProjectCard key={p.slug} project={p} />
      ))}

      {flagships.map((p, i) => (
        <FlagshipProjectCard key={p.slug} project={p} index={i} />
      ))}

      <h3 className="font-hero-mono mt-10 mb-4 text-[0.7rem] uppercase tracking-[0.09em] text-ink-soft">
        Also built
      </h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {supporting.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
        {pending.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="mt-10 border border-rule-hard p-[0.8rem]">
        <h3 className="mb-3 font-hero-mono text-[0.72rem] font-[600] text-ink">Coursework &amp; experiments</h3>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
          {coursework.map((c) => (
            <li key={c.href}>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-hero-mono text-[0.72rem] text-ink-mid transition-colors hover:text-ink"
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
