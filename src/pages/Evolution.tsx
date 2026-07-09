import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Check, X } from "lucide-react";
import { SignalBar } from "../components/SignalBar";

const REPORTS = [
  {
    no: "01",
    title: "The pipeline that occasionally said nothing at all",
    claim:
      "Stage 1 had two jobs bundled into one call: decide whether an article was even worth writing about, and, if so, work out what still needed researching to enrich it.",
    found:
      "Both jobs shared the same 4,096-token budget as the model's own hidden reasoning. When reasoning ran long, it could consume that whole budget before either job produced an answer, so a genuinely bad article could slip through unrejected, with zero research questions attached to enrich it, and the exact same prompt, run three times, produced three different outcomes, one of them a completely empty response.",
    fixLabel: "The fix",
    fix: "Split the single call into two phases: a narrow skip-gate that decides only keep or reject, and, only for what survives that gate, a separate research phase that works out the entities and the gap queries needed to enrich the piece (itself split further into an analysis call and a JSON-transcription call, with reasoning off throughout). Inside the skip-gate itself: ask for the model's stated REASON before its SKIP verdict. With reasoning off, it commits to answers strictly in the order asked, so verdict-first meant guessing before any reasoning existed.",
    verified: "Reordering alone took the skip-gate from 0/5 correct to 10/10 correct across two real articles.",
    evidence: [
      {
        tone: "before" as const,
        label: "THE ACTUAL FAILURE",
        text: "finish_reason: \"length\", but content was empty: the entire 4,096-token completion budget had gone to invisible reasoning_content before the model ever wrote SKIP or KEEP.",
      },
    ],
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
    evidence: [
      { tone: "before" as const, label: "BEFORE — entities extracted (800 chars)", text: "“device”, “researchers”" },
      {
        tone: "after" as const,
        label: "AFTER — same article, 2,000-char window",
        text: "“ECaBox”, “Shannon Tessier”, “Barcelona Institute of Science and Technology”",
      },
    ],
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
    evidence: [
      {
        tone: "before" as const,
        label: "THE HALLUCINATED QUERY, VERBATIM",
        text: "“Leanstral 1.5 vs. GPT-4 Turbo performance on PutnamBench” — GPT-4 Turbo is never named anywhere in the source article; the real comparison point the source actually gives is Opus 4.6.",
      },
    ],
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
    fix: "Rewrote the planning and writing prompts, and kept rewriting them as later runs found new ways to under-write. The current version no longer trusts “write more” as an instruction: it sets an explicit word-count target for every section of the article and for the piece as a whole, puts a floor under how many real sentences a single paragraph is allowed to be, and explicitly tells the writer not to treat the plan's one-line paragraph instruction as a length ceiling, expand it with the actual facts, mechanism, and stakes behind it instead of restating it. A separate editorial-quality pass, fact before interpretation, attribution for opinions, consistent hedging, no filler adjectives, no repeated ideas, runs before the model is allowed to finalize, so length is a side effect of writing a genuinely complete article, not a target chased on its own.",
    verified: "The same real article grew from 930 to 2,075–2,269 characters under the first version of this fix, using only ~14% of the token cap; later revisions kept the same headroom while adding the section-by-section targets and editorial pass above.",
  },
  {
    no: "06",
    title: "The planner that got token-starved by its own good judgment",
    claim:
      "The editorial-strategy stage, the planner that hands the writer its paragraph-by-paragraph instructions, was one call: reason through the story's core narrative, key facts, and category, and hand back the finished plan, all in the same response.",
    found:
      "On a real front-page story, that plan came back as a bare, contentless stub instead of a real set of instructions, and the article silently published without one. Reproducing it live: the call had used its entire completion budget, but the visible answer was barely 600 characters, cut off mid-object. Nearly all of that budget had gone to invisible reasoning tokens before the call ever got around to writing the plan itself.",
    fixLabel: "The fix",
    fix: "Split the planner into two calls, the same shape already proven elsewhere in the pipeline: the first reasons through the editorial strategy out loud, in plain text, with reasoning explicitly turned off, so its visible output is the actual thinking rather than something competing with hidden reasoning tokens for the same budget; a second call transcribes that finished thinking into the strict JSON schema the writer consumes. The writer itself stays a single call; this split happens entirely inside planning, before the writer ever runs.",
    verified: "Reran the same real inputs 3 times: zero of 16 captured API calls hit the token cap afterward, versus both broken calls hitting it exactly before.",
    evidence: [
      {
        tone: "before" as const,
        label: "THE ACTUAL FAILURE",
        text: "prompt_tokens: 978 (a normal, real prompt), completion_tokens: 4096 (hit the hard cap exactly), but the visible content was only 594 characters, far too short for a complete JSON object.",
      },
    ],
  },
  {
    no: "07",
    title: "A fix that looked done, then broke on the very next live call",
    claim: "Telling the model to always name the real entity instead of “this”/“it” would stop research queries from referring to context a stateless research agent never sees.",
    found:
      "A live test built specifically to check this, not a unit test, reproduced the identical bug class on the next real call: a query asking “how does this differ” with no entity named anywhere in it, dispatched to an agent with no memory of the sibling question it was quietly relying on.",
    fixLabel: "The fix",
    fix: "Attach the article's own opening question as background context to any later query that still dangles a “this”/“it” with no named entity, rather than guessing which entity it means or dropping the question outright.",
    verified: "Ran the same real GAP queries through the actual research agent twice, with and without the fix, and diffed the answers side by side: without it the agent gave up and guessed at unrelated CVEs, with it the agent answered specifically about the real vulnerability. A second opinion, given the comparison blind, independently called it a working fix.",
    evidence: [
      {
        tone: "before" as const,
        label: "BEFORE — the agent's real response",
        text: "“The term 'the vulnerability' could refer to several distinct security issues... it is impossible to definitively select one interpretation... Please clarify which system, CVE, or scenario you're referring to.” It then guessed at unrelated CVEs: a GitHub Actions self-hosted runner injection, a GitLab CI/CD token leak, a Jenkins agent RCE, an Azure DevOps token leak, none of them the real vulnerability.",
      },
      {
        tone: "after" as const,
        label: "AFTER — same query, GAP1 attached as context",
        text: "Answered correctly and specifically: the actual crafted-issue payload wording, the real 5-step attack sequence, and how it differs from a genuine access-control bypass.",
      },
    ],
  },
  {
    no: "08",
    title: "The writer that copied its own instructions instead of following them",
    claim: "Telling the writer to follow each paragraph instruction “exactly as specified” would make it execute the plan, not repeat it.",
    found:
      "On a real article, the model wrote the plan's own instruction wording back as if it were the article itself, not an explanation of it, an explanation that never actually happened.",
    fixLabel: "The fix",
    fix: "Added an explicit instruction-vs-content distinction to the prompt, with this exact WRONG/CORRECT pair shown to the model, plus a rule: if a sentence about to be written contains a verb telling the reader what to do (व्याख्या करें, वर्णन करें), that's the instruction leaking through, not the article, rewrite it as a direct statement of fact instead.",
    verified: "Reproduced on a fixed test fixture (same real Stage 1+2 output, reused across every trial): the old prompt bled through on 1 of 3 runs; the new prompt was clean 8 of 8 runs.",
    evidence: [
      {
        tone: "before" as const,
        label: "BEFORE — real captured output",
        text: "“उपकरण के पीछे की तकनीक की व्याख्या करें। वर्णन करें कि यह कैसे काम करता है।” (“Explain the technology behind the device. Describe how it works.”) — literally the instruction, not an explanation.",
      },
      {
        tone: "after" as const,
        label: "AFTER — same article, fixed prompt",
        text: "“यह उपकरण परफ्यूजन तकनीक का उपयोग करता है, जो आंख की धमनी के माध्यम से ऑक्सीजन युक्त तरल पहुँचाता है।” (“This device uses perfusion technology, delivering oxygenated fluid through the eye's artery.”)",
      },
    ],
  },
  {
    no: "09",
    title: "Stray English commentary the reader was never supposed to see",
    claim: "A prompt telling the model to write entirely in Hindi means every line it produces is Hindi.",
    found:
      "The model would sometimes preface or annotate its Hindi article with English meta-commentary about the writing task itself, sentences narrating what it was about to do rather than part of the article, written in English and left sitting in the output.",
    fixLabel: "The fix",
    fix: "Added a code-level post-processing filter, not just a prompt instruction, that strips any English-only line matching this pattern before an article is ever saved or published, a backstop rather than trusting the prompt alone to prevent it.",
    verified: "Runs automatically on every article Stage 3 produces, as part of the same cleanup pass as the decimal-aware sentence trimming used elsewhere in the pipeline; a stray line is removed silently rather than reaching a reader.",
    evidence: [
      {
        tone: "before" as const,
        label: "THE PATTERN CAUGHT",
        text: "English-only lines starting with “Let me”, “Here's”, “I'll”, or “Note:”, the model narrating its own writing process instead of just writing the article.",
      },
    ],
  },
];

function EvidenceBox({ evidence }: { evidence: (typeof REPORTS)[number]["evidence"] }) {
  if (!evidence) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {evidence.map((e) => {
        const isBefore = e.tone === "before";
        return (
          <div
            key={e.label}
            className={`flex-1 rounded border px-4 py-3 ${
              isBefore ? "border-rust-500/40 bg-rust-500/10" : "border-green-600/40 bg-green-500/10"
            }`}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              {isBefore ? (
                <X size={12} className="shrink-0 text-rust-400" aria-hidden="true" />
              ) : (
                <Check size={12} className="shrink-0 text-green-400" aria-hidden="true" />
              )}
              <span className={`font-hero-mono text-[9px] tracking-wide ${isBefore ? "text-rust-400" : "text-green-400"}`}>
                {e.label}
              </span>
            </div>
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap text-ink-200">{e.text}</p>
          </div>
        );
      })}
    </div>
  );
}

function ReportCard({ report }: { report: (typeof REPORTS)[number] }) {
  return (
    <article className="notch-corner border border-ink-700 bg-ink-900/60 p-6 sm:p-7">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-hero-mono text-[9px] tracking-wide text-ink-500">FIELD REPORT {report.no}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-50 sm:text-xl">{report.title}</h3>
      <dl className="mt-4 flex flex-col gap-3">
        <div>
          <dt className="font-hero-mono mb-1 text-[9px] tracking-wide text-ink-500">THE CLAIM</dt>
          <dd className="text-[13px] leading-relaxed text-ink-300">{report.claim}</dd>
        </div>
        <div className="border-l-2 border-rust-500 bg-rust-500/10 px-4 py-3">
          <dt className="font-hero-mono mb-1 text-[9px] tracking-wide text-rust-400">WHAT WE FOUND</dt>
          <dd className="text-[13px] leading-relaxed text-ink-200">{report.found}</dd>
        </div>
        {"evidence" in report && <EvidenceBox evidence={report.evidence} />}
        <div>
          <dt className="font-hero-mono mb-1 text-[9px] tracking-wide text-neon-300">{report.fixLabel.toUpperCase()}</dt>
          <dd className="text-[13px] leading-relaxed text-ink-300">{report.fix}</dd>
        </div>
        <div className="border-l-2 border-green-600 bg-green-500/10 px-4 py-3">
          <dt className="font-hero-mono mb-1 text-[9px] tracking-wide text-green-400">VERIFIED</dt>
          <dd className="flex gap-2 text-[13px] leading-relaxed text-ink-200">
            <Check size={15} className="mt-0.5 shrink-0 text-green-400" />
            <span>{report.verified}</span>
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function Evolution() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="scanlines min-h-screen bg-ink-950">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/case-study/techdrishti"
          className="font-hero-mono inline-flex items-center gap-2 text-[10px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
        >
          <ArrowLeft size={13} /> Back to case study
        </Link>
        <a
          href="https://github.com/aditya0701/Local_news_aggregator"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[10px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
        >
          Source <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <p className="font-hero-mono mb-4 text-[10px] tracking-wider text-neon-300">TECHDRISHTI &middot; NINE FIELD REPORTS</p>
        <h1 className="font-display text-3xl font-semibold text-ink-50 sm:text-4xl">The evolution, bug by bug</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-400">
          Nine real failures found while building the pipeline, each with what was claimed, what actually broke, the
          fix, and how it was verified. Where a real before/after artifact survives, it's quoted directly rather than
          paraphrased, an empty API response, a wrong query the model actually sent, a Hindi sentence it actually
          wrote.
        </p>

        <div className="mt-6 notch-corner border border-ink-700 border-l-2 border-l-ink-500 bg-ink-900/60 p-4 text-[12px] leading-relaxed text-ink-400">
          <b className="text-ink-200">On these quotes.</b> They're pulled from this project's own build log, test
          fixtures, and one raw experiment output captured at the time each bug was live, not re-created after the
          fact for this page.
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {REPORTS.map((r) => (
            <ReportCard key={r.no} report={r} />
          ))}
        </div>

        <footer className="mt-16 border-t border-ink-700 pt-8">
          <Link
            to="/case-study/techdrishti"
            className="font-hero-mono inline-flex items-center gap-2 text-[10px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
          >
            <ArrowLeft size={13} /> Back to the TechDrishti case study
          </Link>
        </footer>
      </main>
    </div>
  );
}
