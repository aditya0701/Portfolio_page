import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Check } from "lucide-react";
import { TricolorBar } from "../components/TricolorBar";

const STAGES = [
  {
    tag: "COLLECT",
    title: "RSS (8 feeds) + GitHub trending",
    desc: "Deterministic filters strip job listings, listicle spam, and low-traction repos before any model ever sees them.",
  },
  {
    tag: "CLUSTER",
    title: "Same-story detection",
    desc: "Sentence embeddings (all-mpnet-base-v2) group outlets covering the same event so it's written once, not once per source.",
  },
  {
    tag: "GATE",
    title: "Scrape, language check, relevance",
    desc: "Non-English source text is translated before Stage 1 ever reads it; thin or non-news pages are rejected for free, before any paid call.",
    model: "sarvam-30b · reasoning off",
  },
  {
    tag: "RESEARCH",
    title: "Entity + gap analysis, cache, search",
    desc: "Extracted entities check a 45-day knowledge cache before anything is searched; only genuine gaps trigger a live query.",
    model: "sarvam-30b · 3 calls",
  },
  {
    tag: "PLAN",
    title: "Editorial strategy",
    desc: "A paragraph-by-paragraph writing plan with the specific facts each paragraph must use: planning and prose are separate jobs.",
    model: "sarvam-105b",
  },
  {
    tag: "WRITE",
    title: "Hindi article, JSON out",
    desc: "Executes the plan into flowing Hindi prose; one automatic retry absorbs transient API failures before falling back to plain translation.",
    model: "sarvam-105b",
  },
];

const REPORTS = [
  {
    no: "01",
    title: "The pipeline that occasionally said nothing at all",
    claim: "One Sarvam call could decide “is this news?”, extract entities, and flag research gaps all at once.",
    found:
      "Hidden reasoning silently consumed the entire token budget before the model wrote an answer: the exact same prompt, run three times, produced three different outcomes, one of them empty.",
    fixLabel: "The fix",
    fix: "Split into three narrow calls (skip-gate → entity/gap analysis → JSON transcription) with reasoning turned off. Inside the skip-gate itself: ask for the model's stated REASON before its SKIP verdict. With reasoning off, it commits to answers strictly in the order asked, so verdict-first meant guessing before reasoning existed.",
    verified: "Reordering alone took the skip-gate from 0/5 correct to 10/10 correct across two real articles.",
  },
  {
    no: "02",
    title: "Entities that were never wrong, just never seen",
    claim: "The first 800 characters of a scraped article were enough to find the people, products, and institutions in it.",
    found:
      "On a real eye-perfusion device story, the device's own name, the lead researcher, and the institution behind it all sat past character 800, everything before that was generic scene-setting. The model had nothing to extract but “device” and “researchers.”",
    fixLabel: "The fix",
    fix: "Raised the truncation window to 2,000 characters, matching what the editorial-strategy stage already used successfully on the same articles.",
    verified: "3 repeat runs on the same article pulled the real named entities every time, versus generic nouns every time before.",
  },
  {
    no: "03",
    title: "A model that kept citing a rival that isn't in the story",
    claim: "Telling the model in plain English not to invent unlisted competitor names would stop it from doing that.",
    found:
      "Reviewing a 2026 model release, it kept comparing it to “GPT-4 Turbo” (a name never mentioned anywhere in the source), the identical wrong query, 3 runs straight. A more careful second rewrite of the same instruction still failed 2 of 3 runs.",
    fixLabel: "The fix",
    fix: "Stopped asking nicely. Added a code-level filter that checks every comparison-shaped query against the article's own extracted entities and source text, and silently drops it if the named rival was never actually there.",
    verified: "3 fresh runs, zero hallucinated competitors reached search, including one run where the model tried anyway and the filter caught it first.",
  },
  {
    no: "04",
    title: "Choosing which kind of wrong to live with",
    claim: "Detecting whether two headlines describe the same event is a matter of picking the right similarity threshold.",
    found:
      "Word-overlap and TF-IDF both missed genuine duplicates worded differently: a real pair about the same story scored 0.236, indistinguishable from confirmed false positives. Switching to sentence embeddings fixed that, but created a new failure: two unrelated Anthropic stories (a product launch, a funding round) scored 0.645, higher than an actual duplicate pair.",
    fixLabel: "The decision",
    fix: "Kept the embeddings anyway. A reader seeing the same story published twice was judged worse than one distinct story occasionally folding into another's write-up, a deliberate trade, not an oversight.",
    verified: "Threshold tuned to 0.44 against the full known set of true/false positives collected during testing; the one accepted exception is documented, not hidden.",
  },
  {
    no: "05",
    title: "The token cap wasn't the problem",
    claim: "Articles were coming out short because of Sarvam's 4,096-token completion cap.",
    found:
      "Real usage measured at ~468 tokens (about 11% of the cap). The actual cause was the editorial plan itself, which asked for “3-4 paragraphs, 1-2 sentences each.”",
    fixLabel: "The fix",
    fix: "Rewrote the planning and writing prompts to require 4-6 paragraphs with the specific facts each one must use, and told the writer explicitly to use its budget.",
    verified: "The same real article grew from 930 to 2,075–2,269 characters, and recovered a researcher's quote the shorter version had dropped entirely, using only ~14% of the token cap.",
  },
];

const STATS = [
  { num: "61", unit: "/run", label: "usable RSS candidates per run, up from ~15 after expanding 2 feeds to 8" },
  { num: "2.3", unit: "×", label: "article length after fixing the editorial plan, not the token cap (930 → ~2,150 chars)" },
  { num: "45", unit: "-day", label: "TTL on the entity knowledge cache, so a name researched once isn't re-searched next time" },
  { num: "3", unit: "-stage", label: "plan-execute LLM pipeline: research → editorial strategy → prose, each a separate call" },
];

const PRICES = [
  { model: "sarvam-30b", input: "$0.029", cached: "$0.017", discount: "40%", output: "$0.115" },
  { model: "sarvam-105b", input: "$0.046", cached: "$0.029", discount: "37.5%", output: "$0.184" },
  { model: "deepseek-v4-flash", input: "$0.140", cached: "$0.0028", discount: "98%", output: "$0.280" },
  { model: "deepseek-v4-pro", input: "$0.435", cached: "$0.0036", discount: "~99%", output: "$0.870" },
];

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <span className="font-mono text-xs text-ink-500">{num}</span>
      <h2 className="font-display text-2xl font-semibold text-ink-50 sm:text-3xl">{title}</h2>
      <span className="h-px flex-1 bg-ink-700" aria-hidden="true" />
    </div>
  );
}

function ReportCard({ report }: { report: (typeof REPORTS)[number] }) {
  return (
    <article className="pixel-corners border border-ink-700 bg-ink-900/60 p-6 sm:p-7">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-pixel text-[9px] tracking-wide text-ink-500">FIELD REPORT {report.no}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-50 sm:text-xl">{report.title}</h3>
      <dl className="mt-4 flex flex-col gap-3">
        <div>
          <dt className="font-pixel mb-1 text-[9px] tracking-wide text-ink-500">THE CLAIM</dt>
          <dd className="text-[13px] leading-relaxed text-ink-300">{report.claim}</dd>
        </div>
        <div className="border-l-2 border-rust-500 bg-rust-500/10 px-4 py-3">
          <dt className="font-pixel mb-1 text-[9px] tracking-wide text-rust-400">WHAT WE FOUND</dt>
          <dd className="text-[13px] leading-relaxed text-ink-200">{report.found}</dd>
        </div>
        <div>
          <dt className="font-pixel mb-1 text-[9px] tracking-wide text-saffron-400">{report.fixLabel.toUpperCase()}</dt>
          <dd className="text-[13px] leading-relaxed text-ink-300">{report.fix}</dd>
        </div>
        <div className="border-l-2 border-green-600 bg-green-500/10 px-4 py-3">
          <dt className="font-pixel mb-1 text-[9px] tracking-wide text-green-400">VERIFIED</dt>
          <dd className="flex gap-2 text-[13px] leading-relaxed text-ink-200">
            <Check size={15} className="mt-0.5 shrink-0 text-green-400" />
            <span>{report.verified}</span>
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function CaseStudyTechDrishti() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">
      <TricolorBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/"
          className="font-pixel inline-flex items-center gap-2 text-[10px] tracking-wide text-ink-300 transition-colors hover:text-saffron-400"
        >
          <ArrowLeft size={13} /> Back to portfolio
        </Link>
        <a
          href="https://github.com/aditya0701/Local_news_aggregator"
          target="_blank"
          rel="noreferrer"
          className="font-pixel inline-flex items-center gap-1.5 text-[10px] tracking-wide text-ink-300 transition-colors hover:text-saffron-400"
        >
          Source <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <div className="jali-bg pixel-corners relative overflow-hidden border border-ink-700 bg-ink-900/60 px-6 py-12 text-center">
          <p className="font-pixel mb-4 text-[10px] tracking-wider text-saffron-400">ENGINEERING CASE STUDY</p>
          <h1 className="font-display text-4xl font-semibold text-ink-50 sm:text-5xl">टेकदृष्टि</h1>
          <p className="font-display mt-2 text-lg italic text-ink-300">TechDrishti, an unattended newsroom</p>
          <div className="tricolor-bar mx-auto mt-5 w-24" />
          <p className="font-pixel mt-4 text-[9px] tracking-wide text-ink-500">
            PUBLISHES DAILY AT 8:00 AM IST &middot; BUILDING SINCE JUNE 2026
          </p>
        </div>

        <p className="font-display mt-10 text-xl leading-relaxed text-ink-100 sm:text-2xl">
          Every morning, before most of India is awake, an unattended GitHub Actions job reads the day's English tech
          news, decides for itself which stories are worth covering, and writes each one from scratch, in original
          Hindi prose rather than machine translation, through a three-stage AI pipeline it has to be caught arguing
          with itself along the way.
        </p>
        <p className="mt-4 text-[13px] leading-loose text-ink-400">
          This page is the log of that build: what the architecture actually does, and five real bugs found in
          production, each with what was claimed, what broke, what fixed it, and how it was verified. Nothing below
          is hypothetical.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="https://aditya0701.github.io/Local_news_aggregator/"
            target="_blank"
            rel="noreferrer"
            className="pixel-corners-sm inline-flex items-center gap-2 bg-saffron-500 px-5 py-2.5 text-xs font-medium text-ink-950 shadow-[4px_4px_0_var(--color-ink-700)] transition-transform hover:-translate-y-0.5"
          >
            Read today's edition <ExternalLink size={14} />
          </a>
          <a
            href="https://github.com/aditya0701/Local_news_aggregator"
            target="_blank"
            rel="noreferrer"
            className="pixel-corners-sm inline-flex items-center gap-2 border border-ink-700 bg-ink-900 px-5 py-2.5 text-xs font-medium text-ink-100 transition-colors hover:border-ink-500"
          >
            View source <ExternalLink size={14} />
          </a>
        </div>

        <section className="mt-20">
          <SectionHead num="01" title="How the newsroom thinks" />
          <p className="mb-6 text-sm text-ink-400">
            No server, no database, no standing infrastructure: the entire operation runs inside a daily GitHub
            Actions job and pushes its own output back to the repo.
          </p>
          <div className="flex flex-col gap-3">
            {STAGES.map((s) => (
              <div key={s.tag} className="pixel-corners border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6">
                <span className="font-pixel text-[9px] tracking-wide text-saffron-400">{s.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink-50">{s.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{s.desc}</p>
                {s.model && <span className="font-mono mt-2 inline-block text-[11px] text-green-400">{s.model}</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="02" title="Five bugs that shaped it" />
          <p className="mb-6 text-sm text-ink-400">
            Every fix below was reproduced against real articles, not synthetic test cases: the honest failure rate
            is included alongside the fix.
          </p>
          <div className="flex flex-col gap-5">
            {REPORTS.map((r) => (
              <ReportCard key={r.no} report={r} />
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="03" title="By the numbers" />
          <div className="grid grid-cols-2 gap-px border border-ink-700 bg-ink-700 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-ink-900 p-5">
                <div className="font-display text-2xl font-semibold text-ink-50">
                  {s.num}
                  <span className="font-mono text-sm text-ink-500">{s.unit}</span>
                </div>
                <div className="mt-2 text-[11px] leading-relaxed text-ink-400">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="mb-4 mt-8 text-sm text-ink-400">
            Model choice was a cost decision, checked against the obvious alternative rather than assumed:
          </p>
          <div className="overflow-x-auto border border-ink-700">
            <table className="w-full min-w-[480px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-ink-700 bg-ink-900/60">
                  <th className="font-pixel px-4 py-3 text-left text-[9px] tracking-wide text-ink-500">Per 1M tokens</th>
                  <th className="font-pixel px-4 py-3 text-right text-[9px] tracking-wide text-ink-500">Input</th>
                  <th className="font-pixel px-4 py-3 text-right text-[9px] tracking-wide text-ink-500">Cached</th>
                  <th className="font-pixel px-4 py-3 text-right text-[9px] tracking-wide text-ink-500">Discount</th>
                  <th className="font-pixel px-4 py-3 text-right text-[9px] tracking-wide text-ink-500">Output</th>
                </tr>
              </thead>
              <tbody>
                {PRICES.map((p, i) => (
                  <tr key={p.model} className={i !== PRICES.length - 1 ? "border-b border-ink-800" : ""}>
                    <td className="px-4 py-2.5 text-ink-200">{p.model}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink-300 tabular-nums">{p.input}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink-300 tabular-nums">{p.cached}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-green-400 tabular-nums">{p.discount}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink-300 tabular-nums">{p.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] text-ink-500">
            Sarvam runs 5–9× cheaper per raw token than the closest DeepSeek equivalent: the reason it was kept
            even though its own cache discount is far shallower than DeepSeek's.
          </p>
        </section>

        <footer className="mt-20 border-t border-ink-700 pt-8">
          <p className="text-[13px] leading-relaxed text-ink-400">
            Built solo, end to end: collection, deduplication, a 3-stage LLM writing pipeline, an entity knowledge
            cache, and the reading frontend, running on GitHub Actions with no server and no hosting cost.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Python", "Sarvam-30B / 105B", "sentence-transformers", "BeautifulSoup", "GitHub Actions", "pytest"].map(
              (t) => (
                <span key={t} className="pixel-corners-sm border border-ink-700 bg-ink-800 px-2.5 py-1 text-[11px] text-ink-400">
                  {t}
                </span>
              ),
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
