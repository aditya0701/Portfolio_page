/** Shared numbered section header for the case-study pages.
 *  One definition so the three pages can't drift apart. */
export function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <span className="font-mono text-xs text-ink-soft">{num}</span>
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      <span className="h-px flex-1 bg-rule-hard" aria-hidden="true" />
    </div>
  );
}
