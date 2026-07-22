import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Section } from "./Section";
import { experience, education } from "../data/profile";
import { totalCourseCount } from "../data/certificates";

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
    <div className="relative pl-5">
      <span className="absolute left-0 top-[0.35rem] h-2 w-2 rounded-full bg-i4" />
      <span className="absolute left-[3px] top-4 bottom-[-2rem] w-px bg-rule last:hidden" />
      <div className="mb-1 font-hero-mono text-[0.78rem] text-ink-mid">{period}</div>
      <h4 className="font-display text-[1.05rem] font-[700] text-ink">{title}</h4>
      <p className="text-[0.86rem] text-ink-mid">{place}</p>
      <p className="mt-1.5 text-[0.82rem] leading-[1.55] text-ink-soft">{detail}</p>
    </div>
  );
}

export function Experience() {
  return (
    <Section id="experience" title="Background" sub="Experience &amp; Education">
      <div className="grid gap-12 sm:grid-cols-2">
        <div>
          <h3 className="font-hero-mono mb-6 text-[0.7rem] font-[500] uppercase tracking-[0.11em] text-ink-soft">Experience</h3>
          <div className="flex flex-col gap-7">
            {experience.map((e) => (
              <TimelineItem key={e.title} {...e} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-hero-mono mb-6 text-[0.7rem] font-[500] uppercase tracking-[0.11em] text-ink-soft">Education</h3>
          <div className="flex flex-col gap-7">
            {education.map((e) => (
              <TimelineItem key={e.title} {...e} />
            ))}
          </div>
          <Link
            to="/certifications"
            className="notch-corner-sm group mt-8 flex items-center justify-between gap-3 border border-rule-hard bg-panel px-4 py-3 transition-colors hover:border-i3"
          >
            <span>
              <span className="font-hero-mono text-[0.7rem] uppercase tracking-[0.11em] text-i3">
                Certifications
              </span>
              <span className="mt-0.5 block text-[0.82rem] text-ink-mid">
                {totalCourseCount} verified Coursera credentials — DeepLearning.AI, Stanford, Google, Michigan
              </span>
            </span>
            <ArrowUpRight
              size={16}
              className="shrink-0 text-ink-soft transition-colors group-hover:text-i3"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </Section>
  );
}
