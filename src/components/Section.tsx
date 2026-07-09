import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      <div className="mb-10 sm:mb-14">
        <p className="font-hero-mono mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-neon-300">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-magenta-500" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 className="font-display text-2xl font-semibold text-ink-50 sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
