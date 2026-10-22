import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignalBar } from "./SignalBar";
import { usePageTitle } from "../hooks/usePageTitle";

/** Shell shared by the Impressum and the privacy notice. */
export function LegalPage({ title, label, children }: { title: string; label: string; children: ReactNode }) {
  usePageTitle(title);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/"
          className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          <ArrowLeft size={13} /> Back to portfolio
        </Link>
        <nav aria-label="Language" className="font-hero-mono flex gap-4 text-[12px] tracking-wide text-ink-mid">
          <a href="#de" className="transition-colors hover:text-i3">
            Deutsch
          </a>
          <a href="#en" className="transition-colors hover:text-i3">
            English
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <p className="font-hero-mono mb-2 text-[12px] tracking-wider text-i3">{label}</p>
        <div className="flex flex-col gap-16">{children}</div>
      </main>
    </div>
  );
}

/** One language of a legal page. */
export function LegalLanguage({
  id,
  lang,
  heading,
  children,
}: {
  id: "de" | "en";
  lang: "de" | "en";
  heading: string;
  children: ReactNode;
}) {
  return (
    <section id={id} lang={lang} className="scroll-mt-6">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{heading}</h1>
      <div className="mt-6 flex flex-col gap-4 text-[14px] leading-relaxed text-ink-mid">{children}</div>
    </section>
  );
}

export function LegalHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-display mt-4 text-lg font-semibold text-ink">{children}</h2>;
}
