/** Skills for one case study, grouped by what they did in *that* system.
 *
 *  Grouped rather than a flat chip cloud, because the grouping is the claim: a
 *  reader screening for one track finds their row without reading the other
 *  three. Deliberately uncoloured — the instance hues are categorical data
 *  colour, and a skill tag is not a category in the data. */

export type SkillGroup = [group: string, tags: string[]];

export function SkillTags({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="flex flex-col gap-3">
      {groups.map(([group, tags]) => (
        <div key={group} className="grid gap-x-5 gap-y-2 sm:grid-cols-[9.5rem_1fr] sm:items-baseline">
          <span className="font-hero-mono text-[11.5px] uppercase tracking-wide text-ink-soft">{group}</span>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="notch-corner-sm border border-rule-hard bg-panel px-2.5 py-1 text-[12px] text-panel-text"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
