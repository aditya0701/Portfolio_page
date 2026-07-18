import { Section } from "./Section";
import { skills } from "../data/profile";

export function Skills() {
  return (
    <Section id="skills" eyebrow="Toolbox" title="Skills">
      <div className="grid gap-6 sm:grid-cols-2">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group} className="notch-corner border border-ink-700 bg-ink-900/40 p-5">
            <h3 className="font-hero-mono mb-4 text-[13px] uppercase tracking-[0.18em] text-ink-300">{group}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((s) => (
                <span
                  key={s}
                  className="notch-corner-sm border border-ink-700 bg-ink-800 px-3 py-1.5 text-[14px] text-ink-100"
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
