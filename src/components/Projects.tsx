import { Section } from "./Section";
import { FeaturedProjectCard, ProjectCard } from "./ProjectCard";
import { projects, coursework } from "../data/projects";
import { ExternalLink } from "lucide-react";

export function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="projects" eyebrow="Selected work" title="Projects">
      <div className="grid gap-6 sm:grid-cols-2">
        {featured.map((p, i) => (
          <FeaturedProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="pixel-corners mt-10 border border-ink-700 bg-ink-900/40 p-6">
        <h3 className="mb-3 text-sm font-medium text-ink-200">Coursework & experiments</h3>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
          {coursework.map((c) => (
            <li key={c.href}>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-saffron-400"
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
