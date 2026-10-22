import { Link } from "react-router-dom";
import { profile } from "../data/profile";

/** Impressum and privacy links. German law wants them reachable from every page. */
export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-rule py-6 text-center font-hero-mono text-[0.72rem] tracking-[0.05em] text-ink-soft ${className}`}
    >
      <span>
        &copy; {new Date().getFullYear()} {profile.name}
      </span>
      <Link to="/impressum" className="transition-colors hover:text-i3">
        Impressum
      </Link>
      <Link to="/datenschutz" className="transition-colors hover:text-i3">
        Datenschutz
      </Link>
    </footer>
  );
}
