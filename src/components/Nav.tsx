import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { profile } from "../data/profile";
import { GithubIcon } from "./icons";

const links = [
  { href: "#projects", label: "Work" },
  { href: "#experience", label: "Background" },
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
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled ? "border-b border-rule-hard bg-paper/90 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[74rem] items-center justify-between px-[var(--gutter,clamp(1.25rem,4vw,3.5rem))] py-[0.85rem]">
        <a
          href="#top"
          className="font-display text-[0.95rem] font-[800] uppercase tracking-[0.02em] text-ink"
          style={{ fontVariationSettings: '"wdth" 118, "wght" 800' }}
        >
          Aditya Rawat
        </a>
        <ul className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-hero-mono border-b border-transparent px-0 py-[0.15rem] text-[0.72rem] uppercase tracking-[0.09em] text-ink-mid transition-colors hover:border-ink hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/certifications"
              className="font-hero-mono border-b border-transparent px-0 py-[0.15rem] text-[0.72rem] uppercase tracking-[0.09em] text-ink-mid transition-colors hover:border-ink hover:text-ink"
            >
              Certifications
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-ink-mid transition-colors hover:text-ink"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="text-ink-mid transition-colors hover:text-ink"
          >
            <Mail size={18} />
          </a>
        </div>
      </nav>
    </header>
  );
}
