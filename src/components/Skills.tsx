import { Section } from "./Section";
import { skills } from "../data/profile";

export function Skills() {
  return (
    <Section id="skills" eyebrow="Toolbox" title="Skills">
      <div className="grid gap-6 sm:grid-cols-2">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group} className="pixel-corners border border-ink-700 bg-ink-900/40 p-5">
            <h3 className="font-pixel mb-4 text-[10px] uppercase tracking-wide text-ink-400">{group}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((s) => (
                <span
                  key={s}
                  className="pixel-corners-sm border border-ink-700 bg-ink-800 px-3 py-1.5 text-[11px] text-ink-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
