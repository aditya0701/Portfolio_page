import { Mail, ExternalLink } from "lucide-react";
import { profile } from "../data/profile";
import { GithubIcon, PixelChakraIcon } from "./icons";

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-ink-700">
      <div className="jali-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
        <p className="font-pixel mb-4 text-[10px] tracking-wider text-saffron-400">Get in touch</p>
        <h2 className="font-display text-balance text-2xl font-semibold text-ink-50 sm:text-3xl">
          Open to computer vision & ML roles
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[13px] leading-loose text-ink-300">
          Based in {profile.location}. Reach out if you'd like to talk about a role, a project, or
          just computer vision.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${profile.email}`}
            className="pixel-corners-sm inline-flex items-center gap-2 bg-saffron-500 px-5 py-2.5 text-xs font-medium text-ink-950 shadow-[4px_4px_0_var(--color-ink-700)] transition-transform hover:-translate-y-0.5"
          >
            <Mail size={15} />
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="pixel-corners-sm inline-flex items-center gap-2 border border-ink-700 bg-ink-900 px-5 py-2.5 text-xs font-medium text-ink-100 transition-colors hover:border-ink-500"
          >
            <GithubIcon size={15} />
            GitHub
          </a>
          <a
            href={profile.huggingface}
            target="_blank"
            rel="noreferrer"
            className="pixel-corners-sm inline-flex items-center gap-2 border border-ink-700 bg-ink-900 px-5 py-2.5 text-xs font-medium text-ink-100 transition-colors hover:border-ink-500"
          >
            Hugging Face
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
      <footer className="relative flex items-center justify-center gap-2 border-t border-ink-700 py-6 text-center font-pixel text-[9px] tracking-wide text-ink-500">
        <PixelChakraIcon size={12} />© {new Date().getFullYear()} {profile.name}
      </footer>
    </section>
  );
}
