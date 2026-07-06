import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { Project } from "../data/projects";

export function FeaturedProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="pixel-corners group relative border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-ink-600 sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-saffron-500 via-ink-50/60 to-green-600" />
      <div className="mb-1 text-[10px] text-saffron-400">{project.period}</div>
      <h3 className="font-display text-xl font-semibold text-ink-50 sm:text-2xl">{project.title}</h3>
      <p className="mt-1 text-[13px] text-ink-300">{project.tagline}</p>
      <p className="mt-4 text-[13px] leading-loose text-ink-200">{project.description}</p>
      <ul className="mt-4 space-y-2.5">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[12px] leading-loose text-ink-300">
            <span className="pixel-dot mt-1.5 h-1.5 w-1.5 shrink-0 bg-saffron-500" />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span
            key={t}
            className="pixel-corners-sm border border-ink-700 bg-ink-800 px-2.5 py-1 text-xs text-ink-300"
          >
            {t}
          </span>
        ))}
      </div>
      {project.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-saffron-400 hover:text-saffron-500"
            >
              {l.label}
              <ExternalLink size={13} />
            </a>
          ))}
        </div>
      )}
    </motion.article>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const dotColor = index % 2 === 0 ? "bg-saffron-500" : "bg-green-500";
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="pixel-corners flex flex-col border border-ink-700 bg-ink-900/60 p-6 transition-colors hover:border-ink-600"
    >
      <div className="mb-1 text-[10px] text-ink-400">{project.period}</div>
      <h3 className="font-display text-lg font-semibold text-ink-50">{project.title}</h3>
      <p className="mt-1 text-[12px] text-ink-300">{project.tagline}</p>
      <p className="mt-3 text-[12px] leading-loose text-ink-300">{project.description}</p>
      <ul className="mt-3 space-y-2">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-[11px] leading-loose text-ink-400">
            <span className={`pixel-dot mt-1 h-1.5 w-1.5 shrink-0 ${dotColor}`} />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="pixel-corners-sm border border-ink-700 bg-ink-800 px-2 py-0.5 text-[11px] text-ink-400"
          >
            {t}
          </span>
        ))}
      </div>
      {project.links.length > 0 && (
        <div className="mt-auto pt-4 flex flex-wrap gap-4">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-saffron-400 hover:text-saffron-500"
            >
              {l.label}
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      )}
    </motion.article>
  );
}
