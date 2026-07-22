import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, ChevronDown } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { usePageTitle } from "../hooks/usePageTitle";

// Highlight tokens embedded in the case text: [[g:...]] correct/superior,
// [[r:...]] wrong/misleading, [[a:...]] extended (extra depth beyond the baseline).
// Content inside a token must not contain a "]" character.
const MARK: Record<string, string> = {
  g: "bg-i3/15 border-b-2 border-i3",
  r: "bg-i1/15 border-b-2 border-i1",
  a: "bg-i2/20 border-b-2 border-i2",
};

function Hi({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\[\[[gra]:[^\]]*\]\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[\[([gra]):([^\]]*)\]\]$/);
        if (!m) return <span key={i}>{p}</span>;
        return (
          <mark key={i} className={`box-decoration-clone rounded-[2px] px-1 text-ink ${MARK[m[1]]}`}>
            {m[2]}
          </mark>
        );
      })}
    </>
  );
}

type Verdict = "agent" | "tie" | "fail";
const VERDICT_LABEL: Record<Verdict, string> = {
  agent: "AGENT WINS",
  tie: "TIE",
  fail: "AGENT FAILED",
};
const VERDICT_CLASS: Record<Verdict, string> = {
  agent: "border-i3 text-i3",
  tie: "border-rule-hard text-ink-mid",
  fail: "border-i1 text-i1",
};

type Case = {
  id: string;
  diff: string;
  verdict: Verdict;
  verdictText?: string;
  query: string;
  leftWho: string;
  left: string;
  rightWho: string;
  right: string;
  note: string;
};

const QUESTIONS: Case[] = [
  {
    id: "concise_fictional_trap",
    diff: "faulty-info trap",
    verdict: "agent",
    query: "What are the benchmark scores of the Zephyr-Q9 reasoning model released last week?",
    leftWho: "Tavily",
    left: "Returned five [[r:real benchmark leaderboards for other models (GPT-5.6, Gemini 3.1 Pro, Claude Opus 4.8)]] — with [[r:nothing signalling that Zephyr-Q9 does not exist]]. A reader skimming them could misattribute stray numbers to the fake model.",
    rightWho: "This agent",
    right: "[[g:Could not find any evidence of a model called 'Zephyr-Q9']]. Noted the real Zephyr models (7B-beta, 7B-Gemma) but [[g:none by that name]], and asked for a link rather than inventing scores.",
    note: "The clearest grounding win: refuse to hallucinate, vs authoritative-looking but irrelevant data.",
  },
  {
    id: "concise_complex_pricing",
    diff: "complex",
    verdict: "agent",
    query: "For a high-volume RAG workload, is DeepSeek's V4 API actually cheaper than a frontier hosted API once you account for token pricing?",
    leftWho: "Tavily",
    left: "[[r:No synthesized answer]] — five pricing links. The numbers exist across the pages, but [[r:the reader must gather and compare them by hand]].",
    rightWho: "This agent",
    right: "Classified COMPLEX, then answered: '[[g:Yes … DeepSeek V4 Flash is $0.14/M input and $0.28/M output]] versus GPT-4o at $2.50 / $10.00,' and [[a:worked the RAG-specific math — input tokens dominate; a cache hit at ~$0.0028/M cuts effective cost ~98%]]. Its own derived percentages were flagged by the grounding check.",
    note: "Scattered prices turned into a decision, with the arithmetic shown and self-policed.",
  },
  {
    id: "ask_trend_synthesis",
    diff: "complex",
    verdict: "agent",
    query: "What is driving the 2026 move by AI-inference startups toward custom silicon, and who are the main players?",
    leftWho: "Tavily",
    left: "[[r:No synthesized answer]] — good source links that name players and drivers, but [[r:leave the 'why' unassembled]].",
    rightWho: "This agent",
    right: "A structured report with a thesis: '[[g:inference accounts for ~two-thirds of all AI compute demand, up from one-third in 2023]],' then [[a:profiled the players and the landmark deals — IPOs, chip-backed loans, multi-gigawatt supply agreements — that show it is a real transition, not R&D]].",
    note: "Cross-source synthesis of a trend is exactly what a single search cannot do.",
  },
  {
    id: "ask_policy_multipart",
    diff: "moderate",
    verdict: "agent",
    query: "How has the EU AI Act's enforcement timeline affected open-source model releases, and which obligations apply specifically to open-weight models?",
    leftWho: "Tavily",
    left: "[[r:No synthesized answer]] — strong links, but the reader must extract the timeline and the open-weight carve-outs and relate them.",
    rightWho: "This agent",
    right: "Answered [[g:both sub-parts]] — a dated timeline table ('[[g:Aug 2, 2025 — GPAI obligations apply — the most relevant date for open-weight models]]') and [[a:the concrete effects the deadline has already had on releases]].",
    note: "A two-part question answered in two parts, not just the half a search surfaces.",
  },
  {
    id: "ask_tco_comparison",
    diff: "complex",
    verdict: "fail",
    query: "Self-host an open Llama-class model on rented GPUs vs a frontier hosted API — cheaper for a high-volume RAG workload?",
    leftWho: "Tavily",
    left: "[[r:No synthesized answer]], but five genuinely on-topic links, including a break-even calculator (crossover near ~264M tokens/day).",
    rightWho: "This agent",
    right: "[[r:Returned an empty report]]. It burned all 8 iterations and 55 fetches on the hardest question and [[r:hit the iteration cap without ever writing a conclusion]] — worse than the baseline here, which at least returned relevant links.",
    note: "The honest failure of the run. Ask-mode has no early-stop and no forced conclusion at the cap — the top fix. (On the Sarvam backend, this same case concluded.)",
  },
  {
    id: "concise_ambiguous_grok",
    diff: "moderate · disambiguation",
    verdict: "tie",
    verdictText: "TIE — BOTH MISSED",
    query: "A teammate said we should 'use grok for our new chatbot's inference.' What could they mean?",
    leftWho: "Tavily",
    left: "Links covered [[g:the verb 'grok']] and [[g:xAI's Grok model]], but [[r:nothing on Groq, the inference-hardware company]] — the meaning 'inference' most points to.",
    rightWho: "This agent",
    right: "Enumerated [[g:the verb]] and [[g:xAI's Grok]] and picked Grok given 'inference' — but [[r:also missed Groq, the inference company]], arguably the intended reading.",
    note: "A genuinely hard near-homophone. Both missed it, so it is not just an agent bug — but a cheap prompt fix.",
  },
  {
    id: "simple_lookups",
    diff: "simple · tie tests",
    verdict: "tie",
    verdictText: "TIE (agent over-worked)",
    query: "Llama 3.3 70B context window?  ·  gpt-oss-120b max context window?",
    leftWho: "Tavily",
    left: "Links converge cleanly: [[g:128K for Llama 3.3 70B]], [[g:131,072 for gpt-oss-120b]]. This is what single-shot search is for.",
    rightWho: "This agent",
    right: "Same correct answers — [[g:a 128,000-token context window]] and [[g:131,072 tokens]] — and even [[g:flagged an unsupported source as unverified]]. But it spent [[r:8 iterations / 28 sources]] on a one-fact lookup.",
    note: "The answers tie; the agent over-researches trivial questions — slower for the same result.",
  },
];

const ARTICLES: Case[] = [
  {
    id: "article_research_ev_subsidy",
    diff: "faulty-info fixer",
    verdict: "tie",
    verdictText: "BOTH CORRECT",
    query: "DRAFT (with planted false claims): 'Buyers receive [[r:Rs 15,000 per vehicle]], the programme [[r:covers all electric two-wheelers]] … the scheme [[r:runs indefinitely]].'",
    leftWho: "Claude",
    left: "[[g:'The incentive amount is wrong … Rs 2,500 per kWh, capped at Rs 5,000']]. [[g:'It does not cover all … above Rs 1.5 lakh are ineligible']]. [[g:'It does not run indefinitely … extended until July 31, 2026']]. Also [[a:softened the unsupported 'cheaper than petrol outright' claim to total cost of ownership]].",
    rightWho: "This agent",
    right: "[[g:Not a flat Rs 15,000 — under PM E-DRIVE it is Rs 2,500 per kWh, capped at Rs 5,000]]; the Rs 15,000 figure [[a:matches the defunct FAME-II scheme]]. [[g:Not 'all' — a Rs 1.5 lakh price cap applies]]. [[g:Not indefinite — fund-limited, extended only to 31 Jul 2026]].",
    note: "Proof the tests also cover faulty-information fixing: both caught every planted lie and traced the wrong figure to its real source.",
  },
  {
    id: "article_research_indiaai",
    diff: "complex",
    verdict: "agent",
    verdictText: "AGENT EDGE",
    query: "DRAFT: 'India's IndiaAI Mission has been expanding shared GPU compute … at subsidised rates … expected to grow further this year.'",
    leftWho: "Claude",
    left: "[[g:Strong, accurate coverage]] of scale, pricing, providers, and the parallel G42/Cerebras supercomputer, plus [[a:a fair implementation-risk caveat]] — but not the budget-underspend signal.",
    rightWho: "This agent",
    right: "Found the same scale facts ([[g:Rs 10,371.92 cr outlay; 34,000 to 38,000 GPUs; 100k target]]) and the angle Claude missed: [[a:the disbursement lag — the 2024-25 allocation cut 69% after underspend, and 2026-27's annual allocation halved year-on-year]].",
    note: "Both excellent; the agent adds one genuinely non-obvious analytical angle.",
  },
  {
    id: "article_write",
    diff: "the deliverable",
    verdict: "agent",
    verdictText: "AGENT WINS DELIVERABLE",
    query: "TASK: research what's missing, then write the full article.  (Claude → English · this agent → Hindi)",
    leftWho: "Claude (English)",
    left: "[[g:Polished, well-structured, accurate]]. Broader on some stakeholders — [[a:the Internet Freedom Foundation / Editors Guild press-freedom critique, and Nasscom's cross-border objection on DPDP]] — but wrote in English, so an editor still needs it translated.",
    rightWho: "This agent (Hindi)",
    right: "DPDP: added angles Claude lacked — [[a:GDPR's 4%-of-turnover fines vs India's fixed-rupee penalties; the Esya survey (57% of AI firms expect >10%-of-turnover compliance cost); ITI lobbying to delay the children's-data rules]]. Heat: [[a:the mortality-undercount thesis — the government's 500-1,500/yr vs a Frontiers estimate of ~3,400 excess deaths per extreme-heat day]].",
    note: "Near-parity research (complementary strengths); the agent wins the deliverable outright — a finished, grounded Hindi article, not an English draft to translate.",
  },
];

const STATS = [
  { num: "0", unit: " / 8", label: "questions where Tavily returned a synthesized answer" },
  { num: "8", unit: " / 8", label: "questions where this agent returned a grounded, cited answer" },
  { num: "4", unit: "", label: "clear agent wins on complex / faulty-information cases" },
  { num: "1", unit: "", label: "honest failure surfaced (an empty report at the iteration cap)" },
];

function VerdictPill({ v, text }: { v: Verdict; text?: string }) {
  return (
    <span
      className={`font-hero-mono shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${VERDICT_CLASS[v]}`}
    >
      {text ?? VERDICT_LABEL[v]}
    </span>
  );
}

function CaseCard({ c, defaultOpen = false }: { c: Case; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="notch-corner border border-rule-hard bg-panel">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
      >
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-hero-mono text-[11px] tracking-wide text-ink-soft">{c.id}</span>
            <span className="font-hero-mono text-[11px] tracking-wide text-i3">· {c.diff}</span>
          </div>
          <p className="font-mono text-[13px] leading-relaxed text-ink-mid">
            <Hi text={c.query} />
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <VerdictPill v={c.verdict} text={c.verdictText} />
          <ChevronDown
            size={16}
            className={`text-ink-soft transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-panel-border p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="notch-corner-sm border border-panel-border bg-paper-hi p-3 sm:p-4">
                <div className="font-hero-mono mb-2 text-[11px] tracking-wide text-ink-soft">
                  {c.leftWho.toUpperCase()}
                </div>
                <p className="text-[13px] leading-relaxed text-panel-text">
                  <Hi text={c.left} />
                </p>
              </div>
              <div className="notch-corner-sm border border-panel-border bg-paper-hi p-3 sm:p-4">
                <div className="font-hero-mono mb-2 text-[11px] tracking-wide text-i3">
                  {c.rightWho.toUpperCase()}
                </div>
                <p className="text-[13px] leading-relaxed text-panel-text">
                  <Hi text={c.right} />
                </p>
              </div>
            </div>
            <p className="mt-3 border-t border-panel-border pt-3 text-[13px] italic leading-relaxed text-panel-mid">
              {c.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <span className="font-mono text-xs text-ink-soft">{num}</span>
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      <span className="h-px flex-1 bg-rule-hard" aria-hidden="true" />
    </div>
  );
}

export function DeepResearchComparison() {
  usePageTitle("How the research agent compares — measured vs Tavily & Claude | Aditya Rawat");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/case-study/deep-research-agent"
          className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          <ArrowLeft size={13} /> Back to case study
        </Link>
        <a
          href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          Research agent, live <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i3">
          DEEP RESEARCH AGENT &middot; HEAD-TO-HEAD EVALUATION
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          How it compares, case by case
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Twelve real queries across the agent's four modes, run on the DeepSeek backend and compared against the
          tools people would otherwise reach for: <b className="text-ink">Tavily</b> (a paid single-shot search API)
          on the eight question cases, and <b className="text-ink">Claude</b> on the four article cases. Every
          external tool saw the exact same input. The distinguishing passages are highlighted so the verdict is
          legible at a glance, not asserted.
        </p>

        <div className="mt-6 notch-corner border border-panel-border bg-panel p-4 text-[13px] leading-relaxed text-panel-mid">
          <b className="text-ink">Reproducibility.</b> The agent's answers are read verbatim from the raw run
          output (one JSON file per backend); Tavily's are its literal Search API responses; Claude's are its
          verbatim replies to the same prompts. Numerical claims were checked by actually running the calculation.{" "}
          <b className="text-ink">The honest boundary is included, not hidden</b> — the one case where the agent's
          loop returned nothing is in here with a red verdict.
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px border border-rule-hard bg-rule-hard sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-panel p-4 sm:p-5">
              <div className="font-display text-2xl font-semibold text-ink">
                {s.num}
                <span className="font-mono text-sm text-panel-mid">{s.unit}</span>
              </div>
              <div className="mt-2 text-[12px] leading-relaxed text-panel-mid">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 notch-corner border border-panel-border bg-panel p-4 sm:p-5">
          <div className="font-hero-mono mb-3 text-[11px] tracking-wide text-ink-soft">READING THE HIGHLIGHTS</div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="flex items-baseline gap-2 text-[13px]">
              <mark className="box-decoration-clone rounded-[2px] border-b-2 border-i3 bg-i3/15 px-1 text-ink">correct</mark>
              <span className="text-panel-mid">grounded / superior</span>
            </div>
            <div className="flex items-baseline gap-2 text-[13px]">
              <mark className="box-decoration-clone rounded-[2px] border-b-2 border-i1 bg-i1/15 px-1 text-ink">wrong</mark>
              <span className="text-panel-mid">misleading / unsupported</span>
            </div>
            <div className="flex items-baseline gap-2 text-[13px]">
              <mark className="box-decoration-clone rounded-[2px] border-b-2 border-i2 bg-i2/20 px-1 text-ink">extended</mark>
              <span className="text-panel-mid">extra depth / angle</span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SectionHead num="01" title="Questions — vs Tavily" />
          <p className="mb-5 text-[14px] leading-relaxed text-ink-mid">
            The headline finding: on all eight questions, Tavily returned{" "}
            <code className="text-ink-mid">"answer": null</code> — five raw links and no synthesized answer. So the
            real contrast is a grounded, cited answer versus a pile of links the reader has to reconcile. Tap a case
            for the side-by-side.
          </p>
          <div className="flex flex-col gap-3">
            {QUESTIONS.map((c, i) => (
              <CaseCard key={c.id} c={c} defaultOpen={i === 0} />
            ))}
          </div>
        </div>

        <div className="mt-14">
          <SectionHead num="02" title="Articles — vs Claude" />
          <p className="mb-5 text-[14px] leading-relaxed text-ink-mid">
            Tavily is not a comparator here — it cannot fact-check a draft or write. So the article modes were run
            against Claude on identical prompts. Note the deliverable difference: the agent produces publication-ready
            Hindi; Claude produced English.
          </p>
          <div className="flex flex-col gap-3">
            {ARTICLES.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
        </div>

        <div className="mt-14">
          <SectionHead num="03" title="What it proved, and what it didn't" />
          <div className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <p className="text-[14px] leading-relaxed text-panel-text">
              On complex, interpretive questions and on faulty-information cases, the agent decisively beats
              single-shot search — because Tavily returns links, not answers, and the agent grounds and synthesizes.
              On article work it matches or edges Claude on research and wins the deliverable outright with a finished,
              grounded Hindi article. The two honest weaknesses the run surfaced are in the cards above, not buried: an
              empty report on the hardest question when the loop hit its cap, and over-researching trivial lookups —
              both fixable with the early-stop / forced-conclusion discipline that concise mode already applies (it
              stopped the ambiguous case at 3 iterations). The one miss shared with Tavily — Groq the company, on the
              &ldquo;grok&rdquo; query — is a near-homophone worth a small prompt nudge.
            </p>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            The backend axis — DeepSeek vs Sarvam on this same suite — has its own page:{" "}
            <Link
              to="/case-study/techdrishti/sarvam-vs-deepseek"
              className="text-i3 transition-colors hover:text-i3"
            >
              Sarvam vs DeepSeek, measured
            </Link>
            .
          </p>
        </div>

        <footer className="mt-16 border-t border-rule-hard pt-8">
          <Link
            to="/case-study/deep-research-agent"
            className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
          >
            <ArrowLeft size={13} /> Back to the Deep Research Agent case study
          </Link>
        </footer>
      </main>
    </div>
  );
}
