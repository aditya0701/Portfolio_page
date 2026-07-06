import { Section } from "./Section";
import { experience, education } from "../data/profile";

function TimelineItem({
  period,
  title,
  place,
  detail,
}: {
  period: string;
  title: string;
  place: string;
  detail: string;
}) {
  return (
    <div className="relative pl-6">
      <span className="pixel-dot absolute left-0 top-1.5 h-2 w-2 bg-saffron-500" />
      <span className="absolute left-[3px] top-4 bottom-[-2rem] w-px bg-ink-700 last:hidden" />
      <div className="mb-1.5 text-[10px] text-ink-400">{period}</div>
      <h4 className="font-display font-medium text-ink-50">{title}</h4>
      <p className="text-[12px] text-ink-300">{place}</p>
      <p className="mt-2 text-[12px] leading-loose text-ink-400">{detail}</p>
    </div>
  );
}

export function Experience() {
  return (
    <Section id="experience" eyebrow="Background" title="Experience & Education">
      <div className="grid gap-12 sm:grid-cols-2">
        <div>
          <h3 className="font-pixel mb-7 text-[11px] uppercase tracking-wide text-ink-200">Experience</h3>
          <div className="flex flex-col gap-8">
            {experience.map((e) => (
              <TimelineItem key={e.title} {...e} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-pixel mb-7 text-[11px] uppercase tracking-wide text-ink-200">Education</h3>
          <div className="flex flex-col gap-8">
            {education.map((e) => (
              <TimelineItem key={e.title} {...e} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
