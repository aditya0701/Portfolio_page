import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { Project } from "../data/projects";
import { TechDrishtiIcon } from "./icons/TechDrishtiIcon";

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

export function FeaturedProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="notch-corner group relative border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-ink-600 sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-neon-500 to-transparent" />
      {project.slug === "techdrishti" && <TechDrishtiIcon size={36} className="mb-3" />}
      <div className="mb-1 text-[10px] text-neon-300">{project.period}</div>
      <h3 className="font-display text-xl font-semibold text-ink-50 sm:text-2xl">{project.title}</h3>
      <p className="mt-1 text-[13px] text-ink-300">{project.tagline}</p>
      <p className="mt-4 text-[13px] leading-loose text-ink-200">{project.description}</p>
      <ul className="mt-4 space-y-2.5">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[12px] leading-loose text-ink-300">
            <span className="square-dot mt-1.5 h-1.5 w-1.5 shrink-0 bg-neon-500" />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span
            key={t}
            className="notch-corner-sm border border-ink-700 bg-ink-800 px-2.5 py-1 text-xs text-ink-300"
          >
            {t}
          </span>
        ))}
      </div>
      {project.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4">
          {project.links.map((l) => (
            <ProjectLink
              key={l.href}
              label={l.label}
              href={l.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neon-300 hover:text-neon-200"
            />
          ))}
        </div>
      )}
    </motion.article>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const dotColor = index % 2 === 0 ? "bg-neon-500" : "bg-neon-300";
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="notch-corner flex flex-col border border-ink-700 bg-ink-900/60 p-6 transition-colors hover:border-ink-600"
    >
      <div className="mb-1 text-[10px] text-ink-400">{project.period}</div>
      <h3 className="font-display text-lg font-semibold text-ink-50">{project.title}</h3>
      <p className="mt-1 text-[12px] text-ink-300">{project.tagline}</p>
      <p className="mt-3 text-[12px] leading-loose text-ink-300">{project.description}</p>
      <ul className="mt-3 space-y-2">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[11px] leading-loose text-ink-400">
            <span className={`square-dot mt-1 h-1.5 w-1.5 shrink-0 ${dotColor}`} />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="notch-corner-sm border border-ink-700 bg-ink-800 px-2 py-0.5 text-[11px] text-ink-400"
          >
            {t}
          </span>
        ))}
      </div>
      {project.links.length > 0 && (
        <div className="mt-auto pt-4 flex flex-wrap gap-4">
          {project.links.map((l) => (
            <ProjectLink
              key={l.href}
              label={l.label}
              href={l.href}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neon-300 hover:text-neon-200"
            />
          ))}
        </div>
      )}
    </motion.article>
  );
}
