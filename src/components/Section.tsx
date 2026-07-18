import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      <div className="mb-10 sm:mb-14">
        <p className="font-hero-mono mb-3 flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-neon-300">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-magenta-500" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 className="font-display text-2xl font-semibold text-ink-50 sm:text-3xl">{title}</h2>
        {intro && <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-300">{intro}</p>}
      </div>
      {children}
    </section>
  );
}
