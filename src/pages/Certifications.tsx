import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";
import { credentials, totalCourseCount, completedSpecializations, type Credential } from "../data/certificates";

const HUE_TEXT: Record<Credential["hue"], string> = {
  i1: "text-i1",
  i2: "text-i2",
  i3: "text-i3",
  i4: "text-i4",
  i5: "text-i5",
  i6: "text-i6",
};

const HUE_BG: Record<Credential["hue"], string> = {
  i1: "bg-i1",
  i2: "bg-i2",
  i3: "bg-i3",
  i4: "bg-i4",
  i5: "bg-i5",
  i6: "bg-i6",
};

const HUE_BORDER: Record<Credential["hue"], string> = {
  i1: "border-i1",
  i2: "border-i2",
  i3: "border-i3",
  i4: "border-i4",
  i5: "border-i5",
  i6: "border-i6",
};

function ProgressTicks({ done, total, hue }: { done: number; total: number; hue: Credential["hue"] }) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-4 ${i < done ? HUE_BG[hue] : "bg-rule"}`}
        />
      ))}
    </div>
  );
}

function CredentialPanel({ cred }: { cred: Credential }) {
  const done = cred.courses.length;
  const complete = Boolean(cred.certificateHref);
  return (
    <section className="notch-corner border border-rule-hard bg-panel p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className={`font-hero-mono text-[12px] tracking-wide ${HUE_TEXT[cred.hue]}`}>
            {cred.kind.toUpperCase()} · {cred.provider}
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">{cred.program}</h2>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <span className="font-mono text-[13px] text-panel-mid">
            <span className={`font-semibold ${HUE_TEXT[cred.hue]}`}>{done}</span>
            <span className="text-panel-mid"> / {cred.totalCourses} courses</span>
          </span>
          <ProgressTicks done={done} total={cred.totalCourses} hue={cred.hue} />
        </div>
      </div>

      <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-panel-mid">{cred.blurb}</p>

      {complete ? (
        <a
          href={cred.certificateHref}
          target="_blank"
          rel="noreferrer"
          className={`notch-corner-sm group/cert mt-4 flex items-center justify-between gap-3 border ${HUE_BORDER[cred.hue]} bg-paper-hi px-4 py-2.5 transition-transform hover:-translate-y-0.5`}
        >
          <span className="flex items-center gap-2.5">
            <span className={`h-2 w-2 rounded-full ${HUE_BG[cred.hue]}`} aria-hidden="true" />
            <span className={`font-hero-mono text-[11px] tracking-wide ${HUE_TEXT[cred.hue]}`}>
              {cred.kind === "Professional Certificate" ? "CERTIFICATE COMPLETE" : "SPECIALIZATION COMPLETE"}
              <span className="text-ink-soft"> · {cred.certificateDate}</span>
            </span>
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[12px] ${HUE_TEXT[cred.hue]}`}>
            Program certificate <ExternalLink size={13} aria-hidden="true" />
          </span>
        </a>
      ) : (
        <div className="notch-corner-sm mt-4 flex items-center gap-2.5 border border-panel-border bg-paper-hi px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-ink-soft" aria-hidden="true" />
          <span className="font-hero-mono text-[11px] tracking-wide text-ink-soft">
            {done} OF {cred.totalCourses} COURSES · IN PROGRESS
          </span>
        </div>
      )}

      <ol className="mt-5 flex flex-col divide-y divide-panel-border border-t border-panel-border">
        {cred.courses.map((course, i) => (
          <li key={course.href}>
            <a
              href={course.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 py-3 transition-colors sm:gap-4"
            >
              <span className="font-mono text-[12px] text-ink-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-[14px] leading-snug text-panel-text transition-colors group-hover:text-i3">
                {course.title}
              </span>
              <span className="hidden shrink-0 font-mono text-[12px] text-ink-soft sm:inline">
                {course.date}
              </span>
              <ExternalLink
                size={13}
                className="shrink-0 text-ink-soft transition-colors group-hover:text-i3"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Certifications() {
  usePageTitle(ROUTE_META["/certifications"].title);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/"
          className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          <ArrowLeft size={13} /> Back to portfolio
        </Link>
        <a
          href="https://www.coursera.org/learn"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          Coursera <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <div className="notch-corner relative overflow-hidden border border-rule-hard bg-panel px-6 py-12 text-center">
          <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i3">VERIFIED CREDENTIALS</p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">Certifications</h1>
          <p className="font-display mt-2 text-lg italic text-panel-text">
            The coursework behind the two tracks — every credential links to its Coursera verification page
          </p>
          <div className="signal-bar mx-auto mt-5 w-24" />
          <p className="font-hero-mono mt-4 text-[12px] tracking-wide text-panel-mid">
            {totalCourseCount} COURSES · {completedSpecializations} COMPLETED PROGRAMS · DEEPLEARNING.AI · STANFORD · GOOGLE · U-MICHIGAN
          </p>
        </div>

        <p className="mt-10 text-[14px] leading-relaxed text-ink-mid">
          Grouped by credential rather than listed flat, because the sequences are the point: the full
          deep-learning and machine-learning foundations from{" "}
          <span className="text-ink">DeepLearning.AI and Stanford</span>, then the applied
          data-science and analytics stacks that put them to work. Three of these programs are finished
          end to end — each carries a whole-program certificate on top of its individual courses. Every
          row is a real, publicly verifiable credential; click any of them to open it on Coursera.
        </p>

        <div className="mt-10 flex flex-col gap-5">
          {credentials.map((cred) => (
            <CredentialPanel key={cred.id} cred={cred} />
          ))}
        </div>

        <footer className="mt-16 border-t border-rule-hard pt-8">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            These certificates are the taught foundation under the work on the{" "}
            <Link to="/#projects" className="text-i3 transition-colors hover:text-i3">
              projects
            </Link>{" "}
            — the measured, shipped systems are where that foundation is actually put to the test.
          </p>
          <Link
            to="/"
            className="font-hero-mono mt-5 inline-flex items-center gap-2 text-[12px] tracking-wide text-panel-mid transition-colors hover:text-i3"
          >
            <ArrowLeft size={13} /> Back to portfolio
          </Link>
        </footer>
      </main>
    </div>
  );
}
