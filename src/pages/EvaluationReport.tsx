import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

// Headline numbers, tone === which accent the big figure takes.
const HEAD_STATS = [
  { num: "81.9%", tone: "good", label: "Triage accuracy, after fix (from 73.8%)" },
  { num: "74.7%", tone: "neutral", label: "Entity-extraction judge agreement vs. human grades" },
  { num: "26.3%", tone: "bad", label: "Hallucination rate (1,091 factual claims checked)" },
] as const;

const META = [
  { n: "1,505", rest: "hand-labeled rows across 3 golden sets" },
  { n: "2", rest: "verified prompt iterations" },
  { n: "1,107", rest: "claims fact-checked for the faithfulness pass" },
];

// A metric row: delta tone "good" (green) or "bad" (rust).
const TRIAGE_ROWS = [
  { metric: "Overall accuracy", before: "73.8%", after: "81.9%", delta: "+8.1pp", tone: "good", mono: false },
  { metric: "Skip precision", before: "75.6%", after: "86.7%", delta: "+11.1pp", tone: "good", mono: false },
  { metric: "Skip recall", before: "51.7%", after: "65.0%", delta: "+13.3pp", tone: "good", mono: false },
  { metric: "off_topic recall", before: "12.5% (3/24)", after: "50.0% (12/24)", delta: "+37.5pp", tone: "good", mono: true },
  { metric: "too_thin recall", before: "33.3% (1/3)", after: "0% (0/3)", delta: "−33.3pp", tone: "bad", mono: true },
] as const;

const TRIAGE_FIXES = [
  {
    title: "“God Of War TV series is recasting Kratos”",
    before: "before: wrongly published (off-topic entertainment news)",
    after: "after: correctly skipped",
  },
  {
    title: "Nanako0129/pilotfish (GitHub repo)",
    before: "before: wrongly skipped (“not a news event”)",
    after: "after: correctly published",
  },
];

const FAITHFULNESS_BARS = [
  { label: "repo_analysis", pct: 35.1, worst: true },
  { label: "general", pct: 25.5, worst: false },
  { label: "model_release", pct: 24.2, worst: false },
  { label: "ban_regulation", pct: 19.0, worst: false },
  { label: "acquisition", pct: 11.5, worst: false },
];

const FAITHFULNESS_EVIDENCE = [
  {
    source: "Grok 4.5 release article · deep_dive_and_context",
    claim:
      "“Grok 4.5 is mid-pack in coding evals, scoring lower than GPT-4o and Claude 3 Opus on MMLU-Pro.”",
    verdict:
      "the source states real benchmark metrics, but never this specific comparative ranking: a fabricated competitive claim, not a vague embellishment.",
  },
  {
    source: "9Router v2 (AMRouter) · introduction_lede",
    claim: "“…a significant milestone for AI developers.”",
    verdict:
      "the source README describes the architectural rewrite; it never frames it this way. Editorial overclaiming, the same pattern behind repo_analysis's high rate above.",
  },
  {
    source: "Figma / Orchids acquisition · strategic_analysis",
    claim:
      "“Failing to fix [the vulnerability] would erode user trust and hinder adoption of Figma's new platform.”",
    verdict:
      "the source reports the security issue itself; this consequence is the model's own unhedged speculation, stated as fact.",
  },
];

const LIMITATIONS = [
  {
    lead: "Single-annotator golden sets.",
    rest: "One person's judgment, not inter-rater agreement. Real disagreement was found even within the same labeler on structurally similar cases.",
  },
  {
    lead: "26.3% is very likely an overestimate,",
    rest: "concentrated in repo_analysis. Stage 3 also uses search-derived entity_context, which this eval never checked. Confirmed directly on one article where “unsupported” numbers were real, just sourced from search results this eval couldn't see.",
  },
  {
    lead: "Faithfulness judge validated on 49 claims,",
    rest: "not the full 1,107 (a disclosed tradeoff), and that sample happened to contain zero hedged_opinion human labels.",
  },
  {
    lead: "Fluency and writing quality are not measured at all.",
    rest: "Every number here is about factual/editorial correctness.",
  },
  {
    lead: "Stage 1's judgment is documented as run-to-run inconsistent",
    rest: "on borderline cases: a known, accepted property, not something these evals eliminate.",
  },
];

// Small shared bits ----------------------------------------------------------

function toneText(tone: string) {
  return tone === "good" ? "text-i3" : tone === "bad" ? "text-i1" : "text-ink";
}

function Chip({ tone, children }: { tone: "good" | "bad" | "neutral"; children: React.ReactNode }) {
  const cls =
    tone === "good"
      ? "border-i3/40 bg-i3/[0.08] text-i3"
      : tone === "bad"
        ? "border-i1/40 bg-i1/[0.08] text-i1"
        : "border-panel-border bg-panel text-ink-soft";
  return (
    <span
      className={`font-hero-mono inline-block whitespace-nowrap border px-2 py-0.5 text-[10.5px] uppercase tracking-wide ${cls}`}
    >
      {children}
    </span>
  );
}

function MetricsTable({
  caption,
  headers,
  children,
}: {
  caption: string;
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="font-hero-mono mb-2 text-[11px] uppercase tracking-wide text-ink-soft">{caption}</div>
      <div className="overflow-x-auto border border-rule-hard">
        <table className="w-full min-w-[440px] border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-rule-hard bg-panel">
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={`font-hero-mono px-4 py-3 text-[12px] tracking-wide text-panel-mid ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EvaluationReport() {
  usePageTitle(ROUTE_META["/case-study/techdrishti/evaluation"].title);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/case-study/techdrishti"
          className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          <ArrowLeft size={13} /> Back to case study
        </Link>
        <a
          href="https://github.com/aditya0701/Local_news_aggregator"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          Source <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        {/* Masthead */}
        <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i3">
          TECHDRISHTI · EVALUATION REPORT · 2026-07-19
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Measuring what the pipeline actually gets wrong
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Three hand-labeled golden sets, judge-validated where a metric can't be re-run directly, checked against
          the pipeline's real output, not anecdotes. This is the evidence behind the numbers in the case study, held
          to the same honesty standard as every field report: the one regression here is reported as-is, not tuned
          away.
        </p>

        <div className="mt-6 flex flex-col gap-1.5 border-l-2 border-rule-hard pl-4">
          {META.map((m) => (
            <p key={m.rest} className="text-[13px] leading-relaxed text-panel-mid">
              <span className="font-mono font-semibold text-ink">{m.n}</span> {m.rest}
            </p>
          ))}
        </div>

        {/* Headline stat strip */}
        <div className="mt-8 grid grid-cols-1 gap-px border border-rule-hard bg-rule-hard sm:grid-cols-3">
          {HEAD_STATS.map((s) => (
            <div key={s.label} className="bg-panel p-5">
              <div className={`font-display text-3xl font-semibold tabular-nums ${toneText(s.tone)}`}>{s.num}</div>
              <div className="mt-2 text-[12px] leading-relaxed text-panel-mid">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 01 — Triage */}
        <section className="mt-16">
          <SectionHead num="01" title="Deciding what's worth writing about" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            149 hand-labeled items (news, job postings, listicles, Show HN posts) run through Stage 1's skip/publish
            decision twice, once per prompt version, against the identical golden set, so the table below is a
            direct, apples-to-apples before/after on the same 149 items.
          </p>

          <div className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <div className="font-hero-mono text-[11px] uppercase tracking-wide text-i2">What changed</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-x-4">
              <div className="font-mono text-[12px] text-ink-soft">
                <span className="mr-2 uppercase tracking-wide">before</span>stage1_skip_v1.txt
              </div>
              <p className="text-[13px] leading-relaxed text-panel-mid">
                Only rejected job postings, marketplace/Show HN listings, blog/tutorial pages, and stories with no
                identifiable news event. Never checked whether the topic itself was actually about technology: a
                company name anywhere in the piece was enough to pass.
              </p>
              <div className="font-mono text-[12px] text-ink">
                <span className="mr-2 uppercase tracking-wide text-ink">after</span>stage1_skip_v2.txt
              </div>
              <p className="text-[13px] leading-relaxed text-panel-mid">
                Added an explicit off-topic category covering 6 concrete shapes (retail promos, non-tech
                business/legal news, entertainment news, unrelated pure-science research, multi-topic newsletter
                digests, personal-reaction gadget posts), each built from a real misclassified example below, not a
                guess. Also added a rule protecting genuine new GitHub tool releases from being wrongly skipped as
                “not a news event.”
              </p>
            </div>
          </div>

          <MetricsTable
            caption="evals/triage/results/20260717T195235Z.json → 20260718T162006Z.json"
            headers={["Metric", "Before", "After", "Δ"]}
          >
            {TRIAGE_ROWS.map((r, i) => (
              <tr key={r.metric} className={i !== TRIAGE_ROWS.length - 1 ? "border-b border-panel-border" : ""}>
                <td className={`px-4 py-2.5 text-ink ${r.mono ? "font-mono text-[13px]" : ""}`}>{r.metric}</td>
                <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">{r.before}</td>
                <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">{r.after}</td>
                <td className={`px-4 py-2.5 text-right font-mono font-semibold tabular-nums ${toneText(r.tone)}`}>
                  {r.delta}
                </td>
              </tr>
            ))}
          </MetricsTable>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            The one regression (n=3) is reported as-is, not re-tuned away. Same standard applied throughout this eval
            work.
          </p>

          <div className="mt-6 notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <div className="font-hero-mono mb-3 text-[11px] uppercase tracking-wide text-ink-soft">
              real misclassifications, before → after
            </div>
            <div className="flex flex-col gap-3">
              {TRIAGE_FIXES.map((f) => (
                <div
                  key={f.title}
                  className="grid items-center gap-2 border-b border-panel-border pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_auto_1fr]"
                >
                  <div>
                    <div className="font-display text-[14.5px] text-ink">{f.title}</div>
                    <Chip tone="bad">{f.before}</Chip>
                  </div>
                  <span className="hidden font-mono text-ink-soft sm:block">→</span>
                  <div>
                    <Chip tone="good">{f.after}</Chip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 — Entity & query extraction */}
        <section className="mt-16">
          <SectionHead num="02" title="Getting the right names, typed correctly" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            Stage 1's entity/query output is genuinely run-to-run inconsistent (re-running the identical input can
            change the answer), so it can't be graded with a single before/after run the way triage was. Two separate
            things are measured here; don't read them as one before/after.
          </p>

          <div className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <p className="text-[13px] leading-relaxed text-panel-mid">
              <span className="font-mono font-semibold text-ink">① Is the judge trustworthy?</span> A
              sarvam-105b judge was graded against 293 hand-labeled entities and 56 hand-labeled queries: how often
              does the judge's grade match a human's, on the exact same fixed output? This is a one-time calibration
              number, not a before/after.
            </p>
          </div>

          <MetricsTable
            caption="evals/entity_quality/results/20260718T151414Z.json · judge calibration"
            headers={["Judged set", "Rows", "Judge vs. human agreement"]}
          >
            <tr className="border-b border-panel-border">
              <td className="px-4 py-2.5 text-ink">Entity extraction</td>
              <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">293</td>
              <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">74.7%</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-ink">Search-query quality</td>
              <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">56</td>
              <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">66.1%</td>
            </tr>
          </MetricsTable>

          <div className="mt-8 notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <div className="font-hero-mono mb-3 text-[11px] uppercase tracking-wide text-i2">
              ② What changed: the actual fix
            </div>
            <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-x-4">
              <div className="font-mono text-[12px] text-ink-soft">
                <span className="mr-2 uppercase tracking-wide">before</span>stage1_analysis_v1.txt
              </div>
              <p className="text-[13px] leading-relaxed text-panel-mid">
                Listed the 12 valid entity types, but never said a type had to be exactly one of them. Nothing
                stopped the model from reusing the article's own topic label, inventing a new category, or listing a
                bare place name as an “entity.”
              </p>
              <div className="font-mono text-[12px] text-ink">
                <span className="mr-2 uppercase tracking-wide text-ink">after</span>stage1_analysis_v2.txt
              </div>
              <p className="text-[13px] leading-relaxed text-panel-mid">
                Added an explicit rule: type must be one of the 12 words, never the article's own topic label, never
                an invented category; excluded bare place names and spec numbers from extraction entirely.
              </p>
            </div>
            <p className="mt-4 border-t border-dashed border-panel-border pt-3 text-[12px] leading-relaxed text-ink-soft">
              Measured differently from the calibration table above: this is a <b className="text-ink">live
              re-extraction</b> on 97 fresh entities from real articles, not the frozen 293-row golden set (which
              can't be re-run against a newer prompt), comparing the resulting type-validity rate directly. No judge
              opinion involved.
            </p>
          </div>

          <MetricsTable
            caption="experiments/stage1_analysis_v2_live_check · before → after"
            headers={["Metric", "Before (v1, 293)", "After (v2, 97)", "Δ"]}
          >
            <tr>
              <td className="px-4 py-2.5 text-ink">Entity-type schema violations</td>
              <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">22.2% (65/293)</td>
              <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">3.1% (3/97)</td>
              <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums text-i3">−19.1pp</td>
            </tr>
          </MetricsTable>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="notch-corner flex-1 border border-rule-hard bg-panel p-4 pl-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-hero-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  the bug, 63% of all v1 type errors
                </span>
                <Chip tone="bad">before</Chip>
              </div>
              <p className="font-display text-[15px] italic leading-relaxed text-ink">
                “Hal Abelson (general)” · “Y Combinator (general)”
              </p>
              <p className="mt-2 border-l-2 border-panel-border pl-3 text-[13px] leading-relaxed text-panel-mid">
                The model was reusing the article's own TYPE classification (general, model_release), a label for
                the whole article, as if it were an individual entity's type. Should have been (person) and
                (organization).
              </p>
            </div>
            <div className="notch-corner flex-1 border border-rule-hard bg-panel p-4 pl-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-hero-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  one added rule in v2
                </span>
                <Chip tone="good">after</Chip>
              </div>
              <p className="font-display text-[15px] italic leading-relaxed text-ink">
                “Hal Abelson (person)” · “Y Combinator (organization)”
              </p>
              <p className="mt-2 border-l-2 border-panel-border pl-3 text-[13px] leading-relaxed text-panel-mid">
                With the rule that a type must be exactly one of the 12 valid words and never the article's own topic
                label, the same two entities are typed correctly, and this whole error class drops from 14.0%
                (41/293) of v1 entities to 0 in the v2 re-extraction.
              </p>
            </div>
          </div>
        </section>

        {/* 03 — Faithfulness */}
        <section className="mt-16">
          <SectionHead num="03" title="Does the Hindi article actually say what the source said?" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            1,107 claim-level sentences from 40 published articles, checked against each article's real scraped
            source text. A free deterministic layer catches claims stating a number absent from the source; an LLM
            judge (validated at 69.4% agreement on 49 human-graded claims) handles the rest.
          </p>

          <div className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <div className="font-hero-mono mb-2 text-[11px] uppercase tracking-wide text-ink-soft">
              No before/after here
            </div>
            <p className="text-[13px] leading-relaxed text-panel-mid">
              Faithfulness had never been measured on this pipeline before. There is no earlier prompt version or
              prior number to compare against. <b className="text-ink">26.3%</b> is a first baseline, not a delta.
              The next faithfulness prompt/pipeline change will be the “before” this number gets compared
              to.
            </p>
          </div>

          <div className="mt-6">
            {FAITHFULNESS_BARS.map((b) => (
              <div key={b.label} className="grid grid-cols-[110px_1fr_52px] items-center gap-3 py-1.5 sm:grid-cols-[130px_1fr_52px]">
                <span className={`font-mono text-[12px] ${b.worst ? "text-i1" : "text-ink"}`}>{b.label}</span>
                <div className="h-3.5 border border-panel-border bg-panel">
                  <div
                    className={`h-full ${b.worst ? "bg-i1" : "bg-i2"} opacity-80`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <span className={`text-right font-mono text-[12px] tabular-nums ${b.worst ? "font-semibold text-i1" : "text-ink-soft"}`}>
                  {b.pct}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Unsupported-claim rate by article category. acquisition is a single article (n=26 claims), too small to
            trust on its own.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {FAITHFULNESS_EVIDENCE.map((e) => (
              <div key={e.source} className="notch-corner border border-rule-hard bg-panel p-4 pl-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-hero-mono text-[11px] uppercase tracking-wide text-ink-soft">{e.source}</span>
                  <Chip tone="bad">unsupported</Chip>
                </div>
                <p className="font-display text-[15px] italic leading-relaxed text-ink">{e.claim}</p>
                <p className="mt-2 border-l-2 border-panel-border pl-3 text-[13px] leading-relaxed text-panel-mid">
                  <b className="text-i1">Judge:</b> {e.verdict}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 04 — Limitations */}
        <section className="mt-16">
          <SectionHead num="04" title="Limitations, stated plainly" />
          <div className="flex flex-col gap-3">
            {LIMITATIONS.map((l) => (
              <div key={l.lead} className="flex gap-3">
                <span className="mt-[0.15rem] font-mono text-i1" aria-hidden="true">
                  ·
                </span>
                <p className="text-[13.5px] leading-relaxed text-panel-mid">
                  <b className="text-ink">{l.lead}</b> {l.rest}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-rule-hard pt-8">
          <div className="font-hero-mono flex flex-wrap justify-between gap-2 text-[11px] tracking-wide text-ink-soft">
            <span>Full reports: evals/{"{triage,entity_quality,faithfulness}"}/results/</span>
            <span>aditya0701/Local_news_aggregator</span>
          </div>
          <Link
            to="/case-study/techdrishti"
            className="font-hero-mono mt-6 inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
          >
            <ArrowLeft size={13} /> Back to the TechDrishti case study
          </Link>
        </footer>
      </main>
    </div>
  );
}
