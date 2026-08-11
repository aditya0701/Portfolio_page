import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { EpistemicStatus, Project } from "../data/projects";
import { TRACK_LABEL } from "../data/projects";

const STATUS_META: Record<EpistemicStatus, { label: string; cls: string }> = {
  measured: { label: "Measured", cls: "measured" },
  shipped: { label: "Shipped", cls: "shipped" },
  prototype: { label: "Prototype", cls: "prototype" },
  pending: { label: "Pending", cls: "pending" },
  "not-shipped": { label: "Not shipped", cls: "excluded" },
};

/** Assets live under Vite's base, which changes if the repo is renamed. */
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

function TrackBadge({ project }: { project: Project }) {
  return (
    <span className={`track-badge ${project.track}`}>
      {TRACK_LABEL[project.track]}
    </span>
  );
}

export function StatusBadge({ project }: { project: Project }) {
  if (!project.status) return null;
  const { label, cls } = STATUS_META[project.status];
  return <span className={`status-badge ${cls}`}>{label}</span>;
}

function ProjectLink({ label, href, className }: { label: string; href: string; className: string }) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {label}
      <ExternalLink size={12} />
    </a>
  );
}

function LinkRow({ project }: { project: Project }) {
  if (project.links.length === 0) return null;
  return (
    <div className="links" style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "1.3rem" }}>
      {project.links.map((l) => (
        <ProjectLink
          key={l.href}
          label={l.label}
          href={l.href}
          className="inline-flex items-center gap-1 border border-rule-hard px-[0.7rem] py-[0.4rem] font-hero-mono text-[0.72rem] tracking-[0.05em] text-ink no-underline transition-colors hover:bg-ink hover:text-paper hover:border-ink"
        />
      ))}
    </div>
  );
}

/**
 * The lead project: full width with the triptych.
 */
export function LeadProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      style={{ padding: "1.7rem 0", borderBottom: "1px solid var(--color-rule)" }}
    >
      <div className="entry-top" style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem 1rem", alignItems: "center", marginBottom: "0.6rem" }}>
        <TrackBadge project={project} />
        <StatusBadge project={project} />
        <span className="font-hero-mono text-[0.7rem] tracking-[0.04em] text-ink-soft">{project.period}</span>
      </div>

      <h3
        className="font-display m-0 text-[clamp(1.3rem,2.6vw,1.75rem)] font-[700] tracking-[-0.015em] text-ink"
        style={{ fontVariationSettings: '"wdth" 112, "wght" 700' }}
      >
        {project.title}
      </h3>
      <p className="mt-[0.45rem] max-w-[64ch] text-[1rem] leading-[1.55] text-ink-mid">{project.tagline}</p>

      {project.figures && (
        <figure className="mt-7">
          <div className="grid gap-[0.65rem] sm:grid-cols-3">
            {project.figures.map((f) => (
              <figure key={f.src} className="m-0">
                <div className="panel-bg relative aspect-square overflow-hidden">
                  <img
                    src={asset(f.src)}
                    alt={f.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="pt-[0.5rem] font-hero-mono text-[0.72rem] leading-[1.45] text-ink-mid">
                  {f.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-[0.86rem] leading-[1.62] text-ink-mid">
            Fine-tuned MicroSAM (vit_l_lm) on a held-out volume. Each colour is one predicted bouton instance.
          </p>
        </figure>
      )}

      <p className="mt-[1rem] max-w-[70ch] text-[0.92rem] leading-[1.68] text-ink">{project.description}</p>

      <ul className="mt-4 max-w-[70ch] space-y-1.5">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[0.86rem] leading-[1.6] text-ink-mid">
            <span className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full bg-i3" />
            {b}
          </li>
        ))}
      </ul>

      <LinkRow project={project} />
    </motion.article>
  );
}

export function FlagshipProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ padding: "1.7rem 0", borderBottom: "1px solid var(--color-rule)" }}
    >
      <div className="entry-top" style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem 1rem", alignItems: "center", marginBottom: "0.6rem" }}>
        <TrackBadge project={project} />
        <StatusBadge project={project} />
        <span className="font-hero-mono text-[0.7rem] tracking-[0.04em] text-ink-soft">{project.period}</span>
      </div>

      <h3
        className="font-display m-0 text-[clamp(1.3rem,2.6vw,1.75rem)] font-[700] tracking-[-0.015em] text-ink"
        style={{ fontVariationSettings: '"wdth" 112, "wght" 700' }}
      >
        {project.title}
      </h3>
      <p className="mt-[0.45rem] max-w-[64ch] text-[1rem] leading-[1.55] text-ink-mid">{project.tagline}</p>
      <p className="mt-[1rem] max-w-[70ch] text-[0.92rem] leading-[1.68] text-ink">{project.description}</p>

      <ul className="mt-4 max-w-[70ch] space-y-1.5">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[0.86rem] leading-[1.6] text-ink-mid">
            <span className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full bg-i3" />
            {b}
          </li>
        ))}
      </ul>

      <LinkRow project={project} />
    </motion.article>
  );
}

/** Deliberately lighter than the work above it. */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="flex flex-col border-b border-rule pb-[1.7rem]"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <TrackBadge project={project} />
        <StatusBadge project={project} />
      </div>
      <div className="font-hero-mono text-[0.7rem] tracking-[0.04em] text-ink-soft">{project.period}</div>
      <h3 className="font-display mt-1 text-[1.15rem] font-[700] text-ink">{project.title}</h3>
      <p className="mt-1 text-[0.92rem] leading-[1.55] text-ink-mid">{project.tagline}</p>
      <p className="mt-2 text-[0.86rem] leading-[1.6] text-ink-mid">{project.description}</p>

      <ul className="mt-3 space-y-1.5">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2 text-[0.82rem] leading-[1.55] text-ink-soft">
            <span className="mt-[0.3rem] h-1 w-1 shrink-0 rounded-full bg-i3" />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <LinkRow project={project} />
      </div>
    </motion.article>
  );
}
