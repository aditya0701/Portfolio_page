import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, ChevronDown } from "lucide-react";
import { SignalBar } from "../components/SignalBar";

const WHY = [
  {
    tag: "NOT A PIPELINE",
    title: "Step count is undecidable in advance",
    desc: "TechDrishti (a prior project of mine) always runs the same ~6 calls in the same order for every article — the number of steps is decided by code, not by the model. This project's whole point is the opposite: the model decides how many searches to run, what to search next based on what it already found, and when it's confident enough to stop.",
  },
  {
    tag: "GROUNDING BY CODE, NOT BY ASKING NICELY",
    title: "\"Don't hallucinate\" was tried twice in the prior project and failed twice",
    desc: "Two rounds of increasingly explicit anti-hallucination prompt wording both failed, reproducing the identical wrong comparison 2-3 times out of 3. What actually worked was a hard, code-level check on the output — so that's the default here, not an afterthought.",
  },
];

const CORE_RULES = [
  {
    tag: "RULE 1 · DECOMPOSE",
    title: "Search engines return facts, not judgments",
    example:
      "\"What is the strategic significance of Z.ai's open-source release given the US ban on Anthropic?\" is not a search query — nothing anyone published \"answers\" it. The agent has to decompose it into fact sub-questions (pricing, dates, deal terms), retrieve those, and do the synthesis itself in its final report.",
  },
  {
    tag: "RULE 2 · SAME KIND OF THING",
    title: "Sharing a category isn't enough to license a comparison",
    example:
      "A bathroom tap and a sink are both plumbing fixtures in the same field, but a tap is a valve mechanism and a sink is a basin — comparing them head-to-head is a category error even though \"they're both bathroom fixtures\" sounds like a match. The agent has to verify what kind of thing each side actually is (with a search, not a guess from training data) before treating a comparison as valid.",
  },
  {
    tag: "RULE 3 · CITE BY URL, NEVER [1]",
    title: "A bracket number with nothing to resolve it against is as uncited as nothing at all",
    example:
      "The final report is often consumed programmatically — by another model, or an API caller — with no separate numbered source list attached. So every claim gets its actual source URL written inline, next to the claim, not a footnote marker.",
  },
  {
    tag: "RULE 5 · RETRY BEFORE GIVING UP",
    title: "A dead link isn't a dead trail",
    example:
      "web_search and news_search return several results per query for free — if fetch_page fails on one URL, try another from the same result set before concluding the information isn't available, and rephrase the query itself before spending a whole extra search on it.",
  },
  {
    tag: "RULE 6 · NEVER DO MATH IN YOUR HEAD",
    title: "A CAGR calculation done in reasoning is error-prone, even when the model is confident",
    example:
      "calculate() evaluates arithmetic through Python's ast module, not eval() — it can't execute anything beyond + - * / ** % and parentheses, so it's safe to expose directly as a tool with no sandboxing risk.",
  },
];

const QUIRKS = [
  {
    tag: "PARSING · TOOL-CALL LEAKS",
    title: "Sarvam occasionally answers in someone else's tool-call dialect",
    desc: "Swap the backend to sarvam-30b and the model sometimes leaks a Hermes/Qwen-style <tool_call> block as raw text in message.content instead of using the API's structured tool_calls field — a tool named \"search\" with a \"numResults\" arg, neither of which this agent defined.",
    detail:
      "Left unhandled, the agent loop sees an empty message.tool_calls and treats that raw XML-ish text as the model's finished answer — it leaks straight into the final report instead of the search ever happening. The fix is a regex recovery pass (_parse_fallback_tool_calls) that extracts the tag, maps invented tool/arg names onto the real ones through a small alias table (search → web_search, numResults → max_results), drops anything it can't map, and re-injects it as a synthetic tool call so the loop executes it normally. A second, simpler regex is applied right before any text is accepted as a final answer, to strip a dangling, never-closed <tool_call> tag left over from a response that got cut off mid-generation — belt and suspenders, so a leaked tag can never reach the user regardless of which code path produced the text.",
  },
  {
    tag: "REASONING · INHERITED THE HARD WAY",
    title: "reasoning_effort is a real API switch; /no_think in the prompt is not",
    desc: "A lesson carried over verbatim from the prior project: reasoning and the final answer share one token budget on these models. If reasoning runs long, there's nothing left to write — the API returns content: None with the thinking dumped into a separate reasoning_content field instead.",
    detail:
      "Confirmed directly there, not assumed: the exact same prompt with the exact same /no_think instruction in the system message still burned 3000+ tokens on hidden reasoning before writing a single word of output, because /no_think is plain text the model may or may not follow — not an API control. Only an actual parameter (reasoning_effort=None on Sarvam, thinking: {\"type\": \"disabled\"} sent via extra_body on DeepSeek V4) reliably turns it off. agent.py reads reasoning_content defensively with getattr(..., None) rather than assuming it exists, since it's not part of the official OpenAI spec either provider otherwise mirrors.",
  },
  {
    tag: "TOOLS · A FAILED FETCH ISN'T TEXT",
    title: "An error message that looks like content gets treated like content",
    desc: "fetch_page used to return a plain string like \"Fetch failed: ...\" on any failure — which looked exactly like genuine retrieved page text to the model, with nothing distinguishing the two.",
    detail:
      "Now a failure returns a structured {\"error\": ...} dict instead, and extract_sources() checks for that key before ever listing a URL as a real source. The same distinction matters for the grounding check: only web_search, news_search, and fetch_page's successful output count as \"evidence\" a claim can be checked against — calculate's output never does, since a fabricated number run through calculate would otherwise make itself look grounded just by being present in the conversation.",
  },
  {
    tag: "BUDGET · CODE-ENFORCED, NOT PROMPTED",
    title: "\"Stop after enough searches\" was a documented runaway-loop risk before this project existed",
    desc: "TechDrishti's own history includes a model that repeatedly ignored a \"max 3 items\" instruction and produced 300+ near-identical lines in one run — only a hard code-level cap ever actually stopped it, not the prompt asking nicely.",
    detail:
      "MAX_ITERATIONS = 8 is enforced in the loop itself, not left to the model's judgment. Once it's hit, web_search/news_search/fetch_page are forcibly removed from the next call — the model gets one final turn with only calculate available, so it can still finish computing a stat it already retrieved without being able to search further. If that final report is itself cut off (finish_reason: length), the agent asks for one more, shorter attempt rather than silently publishing a sentence fragment.",
  },
];

const MODES = [
  {
    tag: "MODE 1 · ASK",
    title: "Direct research question in, full cited report out",
    desc: "The plain research loop end to end — for a caller that wants the whole write-up, not a distilled answer.",
  },
  {
    tag: "MODE 2 · ARTICLE ENRICHMENT",
    title: "Feed it an article; it finds what the article doesn't say",
    desc: "One continuous session, not a dossier of independently-researched questions — gap-finding happens inside the model's own first-turn thinking, sharing full article context and one retrieved-evidence pool. A separate, non-agentic writing pass (no tools, no search budget) then turns the report into a final article, since turning findings into prose is a writing job, not a research-decision job.",
  },
  {
    tag: "MODE 3 · CONCISE",
    title: "Classify the question before deciding how hard to work on it",
    desc: "The model tags its own final answer SIMPLE_ANSWER, AMBIGUOUS_ANSWER, or COMPLEX_REPORT on its first line — a fixed, code-checked tag rather than trusting the model to \"just keep it short\" from memory. Only COMPLEX questions get a second LLM pass that turns the research report into a grounded conclusion; SIMPLE and AMBIGUOUS answers are already short and returned as-is.",
  },
];

const STATS = [
  { num: "8", unit: "-turn", label: "hard iteration cap (MAX_ITERATIONS), code-enforced regardless of what the model wants" },
  { num: "6", unit: "", label: "CORE_RULES shared across every mode — direct Q&A, article enrichment, concise answers" },
  { num: "3", unit: "", label: "task framings on one agent loop: ask, article-gap research, classify-then-answer" },
  { num: "2", unit: "", label: "swappable backends (DeepSeek V4 Flash / Sarvam) behind one LLM_PROVIDER env var" },
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

function FlowStep({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="notch-corner-sm flex-1 border border-ink-700 bg-ink-900/60 px-3 py-3 text-center">
      <div className="font-hero-mono text-[10px] tracking-wide text-neon-300">{label}</div>
      <div className="mt-1 text-[11px] text-ink-400">{sub}</div>
    </div>
  );
}

function FlowArrow() {
  return <div className="hidden shrink-0 items-center px-1 text-ink-600 sm:flex">&rarr;</div>;
}

export function CaseStudyDeepResearch() {
  const [openQuirk, setOpenQuirk] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="scanlines min-h-screen bg-ink-950">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/"
          className="font-hero-mono inline-flex items-center gap-2 text-[10px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
        >
          <ArrowLeft size={13} /> Back to portfolio
        </Link>
        <a
          href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[10px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
        >
          Live demo <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <div className="neon-glow-bg notch-corner relative overflow-hidden border border-ink-700 bg-ink-900/60 px-6 py-12 text-center">
          <p className="font-hero-mono mb-4 text-[10px] tracking-wider text-neon-300">ENGINEERING CASE STUDY</p>
          <h1 className="font-display text-4xl font-semibold text-ink-50 sm:text-5xl">Deep Research Agent</h1>
          <p className="font-display mt-2 text-lg italic text-ink-300">
            A Tavily-grade research answer, for the cost of one LLM call and a free search stack
          </p>
          <div className="signal-bar mx-auto mt-5 w-24" />
          <p className="font-hero-mono mt-4 text-[9px] tracking-wide text-ink-500">
            AUTONOMOUS AGENT LOOP · CODE-ENFORCED GROUNDING · DEEPSEEK V4 / SARVAM
          </p>
        </div>

        <p className="font-display mt-10 text-xl leading-relaxed text-ink-100 sm:text-2xl">
          Given a research question, this agent decides for itself how many searches to run, what
          to search next based on what it already found, and when it has enough grounded evidence
          to stop — then hands back a cited report with every comparison claim checked in code
          against what it actually retrieved, not what the model merely says it retrieved.
        </p>
        <p className="mt-4 text-[13px] leading-loose text-ink-400">
          It was born directly out of a measured limitation in{" "}
          <Link to="/case-study/techdrishti" className="text-neon-300 transition-colors hover:text-neon-200">
            TechDrishti
          </Link>
          , a Hindi tech-journalism pipeline I built first: that project fires one search per
          question and takes whatever comes back, with no ability to notice "this didn't actually
          answer it, let me search again differently." This page is the log of the project that
          exists to be the opposite of that.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 bg-neon-500 px-5 py-2.5 text-xs font-medium text-ink-950 shadow-[4px_4px_0_var(--color-ink-700)] transition-transform hover:-translate-y-0.5"
          >
            Try the live agent <ExternalLink size={14} />
          </a>
        </div>

        <section className="mt-20">
          <SectionHead num="01" title="Why an agent, not another pipeline" />
          <p className="mb-6 text-sm text-ink-400">
            TechDrishti is deliberately a cost-controlled, deterministic workflow — it has to run
            unattended every day on a fixed budget, so predictable behavior beats research depth.
            This project inverts that trade-off on purpose: research depth is inherently unbounded
            in advance, so a fixed step count would just be a workflow wearing an agent's clothes.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {WHY.map((w) => (
              <div key={w.tag} className="notch-corner border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6">
                <span className="font-hero-mono text-[9px] tracking-wide text-neon-300">{w.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink-50">{w.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="02" title="The research loop" />
          <p className="mb-6 text-sm text-ink-400">
            One orchestration loop underneath all three modes. The model owns the reasoning —
            deciding what to search, whether a result is enough, when to stop. Everything the
            model cannot itself do — actually making the HTTP request, enforcing a hard budget
            regardless of what it wants, checking its own final claims — is owned by code.
          </p>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <FlowStep label="THINK" sub="LLM call, rules + tools" />
            <FlowArrow />
            <FlowStep label="ACT" sub="tool call executed" />
            <FlowArrow />
            <FlowStep label="EVALUATE" sub="enough evidence yet?" />
            <FlowArrow />
            <FlowStep label="GROUND" sub="claims checked vs. sources" />
          </div>
          <p className="mt-3 text-center text-[11px] text-ink-500">
            THINK &rarr; ACT &rarr; EVALUATE repeats up to 8 times; GROUND runs once, on the final report only.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="notch-corner border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6">
              <span className="font-hero-mono text-[9px] tracking-wide text-neon-300">TOOLS AVAILABLE</span>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-300">
                web_search (DuckDuckGo via ddgs), news_search (Google News RSS, recency-sensitive),
                fetch_page (full body text of a URL, HTML or PDF), get_current_date (the model's
                training cutoff isn't "now"), calculate (AST-evaluated arithmetic only, no eval()).
              </p>
            </div>
            <div className="notch-corner border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6">
              <span className="font-hero-mono text-[9px] tracking-wide text-neon-300">BUDGET ENFORCEMENT</span>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-300">
                At iteration 8, web_search/news_search/fetch_page are forcibly removed from the
                request — calculate stays available so the model can still finish computing
                something it already retrieved, rather than being cut off mid-writeup.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="03" title="The rules that came from getting it wrong once already" />
          <p className="mb-6 text-sm text-ink-400">
            CORE_RULES is shared verbatim across every mode. Each one exists because a specific
            failure was reproduced and fixed in TechDrishti first — this is what carrying that
            lesson forward into a system built to do real research actually looks like.
          </p>
          <div className="flex flex-col gap-3">
            {CORE_RULES.map((r) => (
              <div key={r.tag} className="notch-corner border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6">
                <span className="font-hero-mono text-[9px] tracking-wide text-neon-300">{r.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink-50">{r.title}</div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-300">{r.example}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="04" title="Prompt quirks that make it hold up" />
          <p className="mb-6 text-sm text-ink-400">
            Click a card for how it actually works. Every one of these exists because of a live,
            reproduced failure — not a hypothetical edge case.
          </p>
          <div className="flex flex-col gap-3">
            {QUIRKS.map((q, i) => {
              const isOpen = openQuirk === i;
              return (
                <div key={q.tag} className="notch-corner border border-ink-700 bg-ink-900/60">
                  <button
                    type="button"
                    onClick={() => setOpenQuirk(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 p-4 pl-5 text-left sm:p-5 sm:pl-6"
                  >
                    <div className="flex-1">
                      <span className="font-hero-mono text-[9px] tracking-wide text-neon-300">{q.tag}</span>
                      <div className="mt-1 font-display text-base font-semibold text-ink-50">{q.title}</div>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{q.desc}</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`mt-1 shrink-0 text-ink-500 transition-transform duration-200 motion-reduce:transition-none ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-ink-800 px-4 pb-4 pl-5 pt-3 sm:px-5 sm:pb-5 sm:pl-6">
                        <p className="text-[13px] leading-relaxed text-ink-300">{q.detail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="05" title="Three modes, one loop" />
          <p className="mb-6 text-sm text-ink-400">
            Every mode is the same ResearchAgent with a different system prompt and a different
            final-answer contract — not three separate codepaths to keep in sync.
          </p>
          <div className="flex flex-col gap-3">
            {MODES.map((m) => (
              <div key={m.tag} className="notch-corner border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6">
                <span className="font-hero-mono text-[9px] tracking-wide text-neon-300">{m.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink-50">{m.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="06" title="Why this is the cheap alternative to a paid search API" />
          <p className="mb-6 text-sm text-ink-400">
            A service like Tavily charges per search call — the metered cost scales with how many
            queries an agent fires. This project's retrieval layer (DuckDuckGo via{" "}
            <code className="text-ink-300">ddgs</code>, Google News RSS, direct page/PDF fetches)
            is free and keyless, inherited directly from the same free-tier search stack{" "}
            <Link
              to="/case-study/techdrishti"
              className="text-neon-300 transition-colors hover:text-neon-200"
            >
              TechDrishti
            </Link>{" "}
            already hardened in production. That leaves exactly one metered cost: the LLM calls
            themselves — and the whole loop is designed to spend that budget on searches deciding
            what to search next, not on paying per query for the privilege of searching at all.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="notch-corner border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6">
              <span className="font-hero-mono text-[9px] tracking-wide text-neon-300">FREE RETRIEVAL LAYER</span>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-300">
                web_search and news_search cost nothing per call — no API key, no per-query
                metering. The only real cost is the reasoning wrapped around them, which is
                exactly where a research agent's value actually lives.
              </p>
            </div>
            <div className="notch-corner border border-ink-700 bg-ink-900/60 p-4 pl-5 sm:p-5 sm:pl-6">
              <span className="font-hero-mono text-[9px] tracking-wide text-neon-300">SWAPPABLE BACKEND</span>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-300">
                llm_client.py is a thin, provider-generic wrapper — one <code className="text-ink-300">LLM_PROVIDER</code>{" "}
                env var switches the entire agent between DeepSeek V4 Flash (default, cheap and
                fast) and Sarvam, with no other code change, so the model behind the loop can
                chase whichever provider is cheapest without touching agent.py at all.
              </p>
            </div>
          </div>
          <p className="mt-4 text-[12px] text-ink-500">
            The budget cap (MAX_ITERATIONS = 8) is also a cost control, not just a runaway-loop
            guard: it bounds the maximum number of paid LLM calls any single question can ever
            trigger, regardless of how open-ended the question is.
          </p>
        </section>

        <section className="mt-20">
          <SectionHead num="07" title="By the numbers" />
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
        </section>

        <footer className="mt-20 border-t border-ink-700 pt-8">
          <p className="text-[13px] leading-relaxed text-ink-400">
            Built solo, end to end: the orchestration loop, the free-tier search layer, the
            code-level grounding check, and three task framings (ask / article enrichment /
            concise) on top of it, served through a Chainlit UI and a small FastAPI route for
            programmatic callers. Deployed on Hugging Face Spaces, provider-swappable between
            DeepSeek V4 Flash and Sarvam. It exists because{" "}
            <Link to="/case-study/techdrishti" className="text-neon-300 transition-colors hover:text-neon-200">
              TechDrishti
            </Link>{" "}
            called out to it for exactly the questions its own fixed pipeline couldn't answer.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Python", "DeepSeek V4 Flash", "Sarvam", "Chainlit", "FastAPI", "ddgs", "pytest"].map((t) => (
              <span key={t} className="notch-corner-sm border border-ink-700 bg-ink-800 px-2.5 py-1 text-[11px] text-ink-400">
                {t}
              </span>
            ))}
          </div>
          <a
            href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
            target="_blank"
            rel="noreferrer"
            className="font-hero-mono mt-5 inline-flex items-center gap-1.5 text-[10px] tracking-wide text-ink-300 transition-colors hover:text-neon-300"
          >
            The agent, live <ExternalLink size={12} />
          </a>
        </footer>
      </main>
    </div>
  );
}
