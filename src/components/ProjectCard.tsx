import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { Project } from "../data/projects";
import { TRACK_LABEL } from "../data/projects";
import { TechDrishtiIcon } from "./icons/TechDrishtiIcon";

/** Assets live under Vite's base, which changes if the repo is renamed. */
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

function TrackBadge({ project }: { project: Project }) {
  const tone =
    project.track === "cv"
      ? "border-neon-700 text-neon-300"
      : project.track === "llm"
        ? "border-magenta-600 text-magenta-500"
        : "border-ink-600 text-ink-200";
  return (
    <span
      className={`notch-corner-sm border px-2 py-0.5 font-hero-mono text-[12px] uppercase tracking-[0.14em] ${tone}`}
    >
      {TRACK_LABEL[project.track]}
    </span>
  );
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

function LinkRow({ project, className }: { project: Project; className: string }) {
  if (project.links.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
      {project.links.map((l) => (
        <ProjectLink key={l.href} label={l.label} href={l.href} className={className} />
      ))}
    </div>
  );
}

function TagRow({ tags, size = "md" }: { tags: string[]; size?: "sm" | "md" }) {
  const cls =
    size === "md"
      ? "notch-corner-sm border border-ink-700 bg-ink-800 px-2.5 py-1 text-[13px] text-ink-200"
      : "notch-corner-sm border border-ink-700 bg-ink-800 px-2 py-0.5 text-[13px] text-ink-300";
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className={cls}>
          {t}
        </span>
      ))}
    </div>
  );
}

/**
 * The lead project: full width, and the only card that carries figures.
 * Research work with nothing clickable reads as a claim; the triptych is the
 * evidence, so it sits above the prose rather than under it.
 */
export function LeadProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="notch-corner relative border border-ink-700 bg-ink-900 p-6 sm:p-9"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-neon-500 to-transparent" />

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <TrackBadge project={project} />
        <span className="text-[13px] text-neon-300">{project.period}</span>
      </div>

      <h3 className="font-display text-2xl font-semibold text-ink-50 sm:text-3xl">{project.title}</h3>
      <p className="mt-1.5 max-w-2xl text-[14px] text-ink-200">{project.tagline}</p>

      {project.figures && (
        <figure className="mt-7">
          <div className="grid gap-3 sm:grid-cols-3">
            {project.figures.map((f) => (
              <div key={f.src} className="notch-corner-sm border border-ink-700 bg-black">
                <img
                  src={asset(f.src)}
                  alt={f.alt}
                  loading="lazy"
                  decoding="async"
                  width={560}
                  height={560}
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="border-t border-ink-700 px-3 py-1.5 font-hero-mono text-[12px] uppercase tracking-wide text-ink-300">
                  {f.caption}
                </figcaption>
              </div>
            ))}
          </div>
          <figcaption className="mt-3 text-[14px] text-ink-400">
            Fine-tuned MicroSAM (vit_l_lm) on a held-out volume. Each colour is one predicted bouton instance.
          </figcaption>
        </figure>
      )}

      <p className="mt-7 max-w-3xl text-[14px] leading-relaxed text-ink-200">{project.description}</p>

      <ul className="mt-5 max-w-3xl space-y-2.5">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-300">
            <span className="square-dot mt-2 h-1.5 w-1.5 shrink-0 bg-neon-500" />
            {b}
          </li>
        ))}
      </ul>

      <TagRow tags={project.tags} />
      <LinkRow
        project={project}
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neon-300 hover:text-neon-200"
      />
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
      className="notch-corner group relative flex flex-col border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-ink-600 sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-neon-500 to-transparent" />
      {project.slug === "techdrishti" && <TechDrishtiIcon size={36} className="mb-3" />}

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <TrackBadge project={project} />
        <span className="text-[13px] text-neon-300">{project.period}</span>
      </div>

      <h3 className="font-display text-xl font-semibold text-ink-50 sm:text-2xl">{project.title}</h3>
      <p className="mt-1.5 text-[14px] text-ink-200">{project.tagline}</p>
      <p className="mt-4 text-[14px] leading-relaxed text-ink-200">{project.description}</p>

      <ul className="mt-4 space-y-2.5">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-300">
            <span className="square-dot mt-2 h-1.5 w-1.5 shrink-0 bg-neon-500" />
            {b}
          </li>
        ))}
      </ul>

      <TagRow tags={project.tags} />
      <div className="mt-auto">
        <LinkRow
          project={project}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neon-300 hover:text-neon-200"
        />
      </div>
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
      className="notch-corner flex flex-col border border-ink-700 bg-ink-900/60 p-6 transition-colors hover:border-ink-600"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <TrackBadge project={project} />
      </div>
      <div className="mb-1 text-[13px] text-ink-400">{project.period}</div>
      <h3 className="font-display text-lg font-semibold text-ink-50">{project.title}</h3>
      <p className="mt-1 text-[14px] text-ink-200">{project.tagline}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-300">{project.description}</p>

      <ul className="mt-3 space-y-2">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-400">
            <span className="square-dot mt-2 h-1.5 w-1.5 shrink-0 bg-neon-500" />
            {b}
          </li>
        ))}
      </ul>

      <TagRow tags={project.tags} size="sm" />
      <div className="mt-auto">
        <LinkRow
          project={project}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neon-300 hover:text-neon-200"
        />
      </div>
    </motion.article>
  );
}
