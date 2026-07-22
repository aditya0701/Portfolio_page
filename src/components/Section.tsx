import type { ReactNode } from "react";

export function Section({
  id,
  title,
  sub,
  intro,
  children,
}: {
  id: string;
  /** The big display heading (left). */
  title: string;
  /** The small mono descriptor sitting to its right. */
  sub: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-[74rem] px-[var(--gutter,clamp(1.25rem,4vw,3.5rem))] py-[clamp(3.5rem,7vw,6rem)]">
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-ink pb-[0.5rem]">
        <h2
          className="font-display m-0 text-[clamp(1.05rem,2vw,1.3rem)] font-[800] uppercase tracking-[-0.005em] text-ink"
          style={{ fontVariationSettings: '"wdth" 118, "wght" 800' }}
        >
          {title}
        </h2>
        <span className="font-hero-mono text-[0.7rem] uppercase tracking-[0.09em] text-ink-soft">{sub}</span>
      </div>
      {intro && <p className="mb-6 mt-3 max-w-[64ch] text-[0.92rem] leading-[1.68] text-ink-mid">{intro}</p>}
      {children}
    </section>
  );
}
