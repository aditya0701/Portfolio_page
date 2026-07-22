import { Mail, ExternalLink } from "lucide-react";
import { profile } from "../data/profile";
import { GithubIcon } from "./icons";

export function Contact() {
  return (
    <section id="contact" className="border-t border-rule-hard">
      <div className="mx-auto max-w-[74rem] px-[var(--gutter,clamp(1.25rem,4vw,3.5rem))] py-[clamp(3rem,6vw,5rem)] text-center">
        <p className="font-hero-mono mb-4 text-[0.7rem] uppercase tracking-[0.11em] text-ink-mid">
          Get in touch
        </p>
        <h2
          className="font-display text-balance m-0 text-[clamp(1.5rem,3vw,2.2rem)] font-[800] uppercase tracking-[-0.01em] text-ink"
          style={{ fontVariationSettings: '"wdth" 118, "wght" 800' }}
        >
          Open to AI / ML engineering and computer vision roles
        </h2>
        <p className="mx-auto mt-4 max-w-[50ch] text-[0.92rem] leading-[1.6] text-ink-mid">
          Based in {profile.location}, graduating September 2026. Reach out about a role, a project, or
          anything on this page you want to argue with.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 border border-rule-hard bg-ink px-5 py-2.5 font-hero-mono text-[0.72rem] uppercase tracking-[0.05em] text-paper transition-colors hover:bg-i5 hover:border-i5"
          >
            <Mail size={15} />
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-rule-hard px-5 py-2.5 font-hero-mono text-[0.72rem] uppercase tracking-[0.05em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <GithubIcon size={15} />
            GitHub
          </a>
          <a
            href={profile.huggingface}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-rule-hard px-5 py-2.5 font-hero-mono text-[0.72rem] uppercase tracking-[0.05em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Hugging Face
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
      <footer className="flex items-center justify-center gap-2 border-t border-rule py-6 text-center font-hero-mono text-[0.72rem] tracking-[0.05em] text-ink-soft">
        &copy; {new Date().getFullYear()} {profile.name}
      </footer>
    </section>
  );
}
