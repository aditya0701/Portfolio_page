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
        <p className="font-pixel mb-3 text-[10px] tracking-wider text-saffron-400">{eyebrow}</p>
        <h2 className="font-display text-2xl font-semibold text-ink-50 sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
