import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { profile } from "../data/profile";
import { GithubIcon, TerminalMark } from "./icons";

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-ink-700 bg-ink-950/80 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 font-display text-base font-semibold text-ink-50">
          <TerminalMark size={18} />
          Aditya Rawat
        </a>
        <ul className="hidden items-center gap-8 sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-hero-mono text-[13px] tracking-wide text-ink-200 transition-colors hover:text-neon-300"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-ink-300 transition-colors hover:text-neon-300"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="text-ink-300 transition-colors hover:text-neon-300"
          >
            <Mail size={18} />
          </a>
        </div>
      </nav>
    </header>
  );
}
