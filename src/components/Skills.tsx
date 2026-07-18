import { Section } from "./Section";
import { skills } from "../data/profile";

export function Skills() {
  return (
    <Section id="skills" eyebrow="Toolbox" title="Skills &amp; tools">
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group} className="border border-ink p-5">
            <h3 className="font-hero-mono mb-4 text-[0.7rem] font-[500] uppercase tracking-[0.11em] text-ink-soft">{group}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((s) => (
                <span
                  key={s}
                  className="border border-rule bg-paper-hi px-3 py-1.5 font-hero-mono text-[0.78rem] text-ink"
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
