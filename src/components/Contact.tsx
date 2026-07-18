import { Mail, ExternalLink } from "lucide-react";
import { profile } from "../data/profile";
import { GithubIcon, TerminalMark } from "./icons";

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-ink-700">
      <div className="neon-glow-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
        <p className="font-hero-mono mb-4 flex items-center justify-center gap-2 text-[13px] uppercase tracking-[0.22em] text-neon-300">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-magenta-500" aria-hidden="true" />
          Get in touch
        </p>
        <h2 className="font-display text-balance text-2xl font-semibold text-ink-50 sm:text-3xl">
          Open to AI / ML engineering and computer vision roles
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-ink-200">
          Based in {profile.location}, graduating 06/2026. Reach out about a role, a project, or
          anything on this page you want to argue with.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="notch-corner-sm inline-flex items-center gap-2 bg-neon-500 px-5 py-2.5 text-xs font-hero-mono uppercase tracking-wider text-ink-950 transition-[background-color,box-shadow] hover:bg-neon-400 hover:shadow-[0_0_24px_color-mix(in_oklch,var(--color-neon-500)_55%,transparent)]"
          >
            <Mail size={15} />
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 border border-neon-700 bg-ink-900 px-5 py-2.5 text-xs font-hero-mono uppercase tracking-wider text-phosphor-100 transition-colors hover:border-neon-400 hover:text-neon-300"
          >
            <GithubIcon size={15} />
            GitHub
          </a>
          <a
            href={profile.huggingface}
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 border border-neon-700 bg-ink-900 px-5 py-2.5 text-xs font-hero-mono uppercase tracking-wider text-phosphor-100 transition-colors hover:border-neon-400 hover:text-neon-300"
          >
            Hugging Face
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
      <footer className="relative flex items-center justify-center gap-2 border-t border-ink-700 py-6 text-center font-hero-mono text-[13px] tracking-wide text-ink-400">
        <TerminalMark size={12} />© {new Date().getFullYear()} {profile.name}
      </footer>
    </section>
  );
}
