import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, ChevronDown } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

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
    tag: "RULE 4 · RETRY BEFORE GIVING UP",
    title: "A dead link isn't a dead trail",
    example:
      "web_search and news_search return several results per query for free — if fetch_page fails on one URL, try another from the same result set before concluding the information isn't available, and rephrase the query itself before spending a whole extra search on it.",
  },
  {
    tag: "RULE 5 · NEVER DO MATH IN YOUR HEAD",
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
    tag: "MODE 1 · ASK A QUESTION",
    title: "Direct research question in, full cited report out",
    desc: "The plain research loop end to end — for someone who wants the whole write-up, not a distilled answer.",
  },
  {
    tag: "MODE 2 · QUICK GROUNDED ANSWER",
    title: "Classify the question before deciding how hard to work on it",
    desc: "The model tags its own final answer SIMPLE_ANSWER, AMBIGUOUS_ANSWER, or COMPLEX_REPORT on its first line — a fixed, code-checked tag rather than trusting the model to \"just keep it short\" from memory. Simple questions get a fast verified answer; ambiguous ones get every plausible meaning plus which one fits the given context; genuinely complex questions are still fully researched — a second LLM pass just turns that research into a distilled, grounded conclusion instead of handing back the raw write-up.",
  },
  {
    tag: "MODE 3 · RESEARCH AN ARTICLE",
    title: "Feed it an article; it finds what the article doesn't say",
    desc: "One continuous session, not a dossier of independently-researched questions — gap-finding happens inside the model's own first-turn thinking, sharing full article context and one retrieved-evidence pool. Returns the raw findings, not a rewritten article.",
  },
  {
    tag: "MODE 4 · WRITE AN ARTICLE",
    title: "Same gap research, one more pass to weave it into a finished piece",
    desc: "Reuses mode 3's exact research session — same code path, one flag flipped (write_hindi=true) — then hands the findings to a separate, non-agentic writing pass (no tools, no search budget) that weaves them together with the original article into one complete Hindi-language piece. Kept as its own LLM call rather than folded into the research loop, since turning findings into prose is a writing job, not a research-decision job.",
  },
];

const STATS = [
  { num: "8", unit: "-turn", label: "hard iteration cap (MAX_ITERATIONS), code-enforced regardless of what the model wants" },
  { num: "5", unit: "", label: "CORE_RULES shared verbatim across every mode: ask, quick answer, research an article, write an article" },
  { num: "4", unit: "", label: "chat modes on one agent loop: ask, quick grounded answer, research an article, write an article" },
  { num: "2", unit: "", label: "swappable backends (DeepSeek V4 Flash / Sarvam) behind one LLM_PROVIDER env var" },
];


function FlowStep({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="notch-corner-sm flex-1 border border-rule-hard bg-panel px-3 py-3 text-center">
      <div className="font-hero-mono text-[12px] tracking-wide text-i3">{label}</div>
      <div className="mt-1 text-[12px] text-panel-mid">{sub}</div>
    </div>
  );
}

function FlowArrow() {
  return <div className="hidden shrink-0 items-center px-1 text-panel-mid sm:flex">&rarr;</div>;
}

export function CaseStudyDeepResearch() {
  const [openQuirk, setOpenQuirk] = useState<number | null>(null);

  usePageTitle(ROUTE_META["/case-study/deep-research-agent"].title);

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
          href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          Live demo <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <div className="notch-corner relative overflow-hidden border border-rule-hard bg-panel px-6 py-12 text-center">
          <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i3">ENGINEERING CASE STUDY</p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">Deep Research Agent</h1>
          <p className="font-display mt-2 text-lg italic text-panel-text">
            A Tavily-grade research answer, for the cost of one LLM call and a free search stack
          </p>
          <div className="signal-bar mx-auto mt-5 w-24" />
          <p className="font-hero-mono mt-4 text-[12px] tracking-wide text-panel-mid">
            AUTONOMOUS ReAct LOOP · TOOL USE · CODE-ENFORCED GROUNDING · DEEPSEEK V4 / SARVAM
          </p>
        </div>

        <p className="font-display mt-10 text-lg leading-relaxed text-ink sm:text-xl">
          Given a research question, this{" "}
          <mark className="box-decoration-clone bg-i3/20 px-1 text-ink">autonomous ReAct agent</mark>{" "}
          decides for itself how many searches to run, what to search next based on what it already
          found, and when it has enough grounded evidence to stop — then hands back a cited report
          with every comparison claim checked in code against what it actually retrieved, not what the
          model merely says it retrieved.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
          It began as an extension of{" "}
          <Link to="/case-study/techdrishti" className="text-i3 transition-colors hover:text-i3">
            TechDrishti
          </Link>{" "}
          — one job: give the daily Hindi newsroom a free search layer that could actually reason,
          instead of firing one query and taking whatever came back. It has since grown well past that
          into a standalone system with four modes, including an{" "}
          <strong className="font-semibold text-ink">automated article writer</strong> and a full{" "}
          <strong className="font-semibold text-ink">deep-research loop</strong>. Building it end to end
          is the clearest evidence I have of{" "}
          <mark className="box-decoration-clone bg-i3/20 px-1 text-ink">AI engineering</mark> applied to
          real{" "}
          <mark className="box-decoration-clone bg-i3/20 px-1 text-ink">
            autonomous LLM workflows and agentic tooling
          </mark>
          , not a notebook demo.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 bg-i3 px-5 py-2.5 text-[13px] font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Try the live agent <ExternalLink size={14} />
          </a>
        </div>

        <section className="mt-20">
          <SectionHead num="01" title="Why an agent, not another pipeline" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            TechDrishti is deliberately a cost-controlled, deterministic workflow — it has to run
            unattended every day on a fixed budget, so predictable behavior beats research depth.
            This project inverts that trade-off on purpose: research depth is inherently unbounded
            in advance, so a fixed step count would just be a workflow wearing an agent's clothes.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {WHY.map((w) => (
              <div key={w.tag} className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
                <span className="font-hero-mono text-[12px] tracking-wide text-i3">{w.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink">{w.title}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="02" title="The research loop" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
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
          <p className="mt-3 text-center text-[12px] text-ink-soft">
            THINK &rarr; ACT &rarr; EVALUATE repeats up to 8 times; GROUND runs once, on the final report only.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">TOOLS AVAILABLE</span>
              <p className="mt-2 text-[14px] leading-relaxed text-panel-text">
                web_search (DuckDuckGo via ddgs), news_search (Google News RSS, recency-sensitive),
                fetch_page (full body text of a URL, HTML or PDF), get_current_date (the model's
                training cutoff isn't "now"), calculate (AST-evaluated arithmetic only, no eval()).
              </p>
            </div>
            <div className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">BUDGET ENFORCEMENT</span>
              <p className="mt-2 text-[14px] leading-relaxed text-panel-text">
                At iteration 8, web_search/news_search/fetch_page are forcibly removed from the
                request — calculate stays available so the model can still finish computing
                something it already retrieved, rather than being cut off mid-writeup.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="03" title="The rules that came from getting it wrong once already" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            CORE_RULES is shared verbatim across every mode. Each one exists because a specific
            failure was reproduced and fixed in TechDrishti first — this is what carrying that
            lesson forward into a system built to do real research actually looks like.
          </p>
          <div className="flex flex-col gap-3">
            {CORE_RULES.map((r) => (
              <div key={r.tag} className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
                <span className="font-hero-mono text-[12px] tracking-wide text-i3">{r.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink">{r.title}</div>
                <p className="mt-2 text-[14px] leading-relaxed text-panel-text">{r.example}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="04" title="Prompt quirks that make it hold up" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            Click a card for how it actually works. Every one of these exists because of a live,
            reproduced failure — not a hypothetical edge case.
          </p>
          <div className="flex flex-col gap-3">
            {QUIRKS.map((q, i) => {
              const isOpen = openQuirk === i;
              return (
                <div key={q.tag} className="notch-corner border border-rule-hard bg-panel">
                  <button
                    type="button"
                    onClick={() => setOpenQuirk(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 p-4 pl-5 text-left sm:p-5 sm:pl-6"
                  >
                    <div className="flex-1">
                      <span className="font-hero-mono text-[12px] tracking-wide text-i3">{q.tag}</span>
                      <div className="mt-1 font-display text-base font-semibold text-ink">{q.title}</div>
                      <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">{q.desc}</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`mt-1 shrink-0 text-panel-mid transition-transform duration-200 motion-reduce:transition-none ${
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
                      <div className="border-t border-panel-border px-4 pb-4 pl-5 pt-3 sm:px-5 sm:pb-5 sm:pl-6">
                        <p className="text-[14px] leading-relaxed text-panel-text">{q.detail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="05" title="Four modes, one loop" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            Every mode is the same ResearchAgent with a different system prompt and a different
            final-answer contract — not four separate codepaths to keep in sync. "Research an
            article" and "Write an article" are even the same function under the hood, one
            boolean flag apart.
          </p>
          <div className="flex flex-col gap-3">
            {MODES.map((m) => (
              <div key={m.tag} className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
                <span className="font-hero-mono text-[12px] tracking-wide text-i3">{m.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink">{m.title}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="notch-corner mt-3 border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <span className="font-hero-mono text-[12px] tracking-wide text-i3">ALSO CALLABLE OVER PLAIN HTTP</span>
            <div className="mt-1 font-display text-base font-semibold text-ink">
              Not chat-only — a GitHub Actions job or another model can call this directly
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-panel-text">
              Three POST routes (<code className="text-panel-text">/api/concise</code>,{" "}
              <code className="text-panel-text">/api/research</code>,{" "}
              <code className="text-panel-text">/api/article</code>) mirror the quick-answer, ask,
              and article modes for a caller that can't speak Chainlit's websocket chat protocol —
              deliberately not a second server: Hugging Face Spaces exposes exactly one port, so
              these routes mount directly onto Chainlit's own FastAPI instance instead of standing
              up a process with nowhere to listen. Every request accepts an optional{" "}
              <code className="text-panel-text">provider</code> field, so a caller can A/B the same
              question against DeepSeek and Sarvam without touching an env var. Guarded by a
              shared-secret <code className="text-panel-text">X-API-Key</code> header that fails
              closed — if the server-side secret is ever unset, the route refuses every request
              rather than silently reopening itself to anyone on the internet with a spare API
              quota to spend.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="06" title="Why this is the cheap alternative to a paid search API" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            A service like Tavily charges per search call — the metered cost scales with how many
            queries an agent fires. This project's retrieval layer (DuckDuckGo via{" "}
            <code className="text-ink-mid">ddgs</code>, Google News RSS, direct page/PDF fetches)
            is free and keyless, inherited directly from the same free-tier search stack{" "}
            <Link
              to="/case-study/techdrishti"
              className="text-i3 transition-colors hover:text-i3"
            >
              TechDrishti
            </Link>{" "}
            already hardened in production. That leaves exactly one metered cost: the LLM calls
            themselves — and the whole loop is designed to spend that budget on searches deciding
            what to search next, not on paying per query for the privilege of searching at all.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">FREE RETRIEVAL LAYER</span>
              <p className="mt-2 text-[14px] leading-relaxed text-panel-text">
                web_search and news_search cost nothing per call — no API key, no per-query
                metering. The only real cost is the reasoning wrapped around them, which is
                exactly where a research agent's value actually lives.
              </p>
            </div>
            <div className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">SWAPPABLE BACKEND</span>
              <p className="mt-2 text-[14px] leading-relaxed text-panel-text">
                llm_client.py is a thin, provider-generic wrapper — one <code className="text-panel-text">LLM_PROVIDER</code>{" "}
                env var switches the entire agent between DeepSeek V4 Flash (default, cheap and
                fast) and Sarvam, with no other code change, so the model behind the loop can
                chase whichever provider is cheapest without touching agent.py at all.
              </p>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-ink-soft">
            The budget cap (MAX_ITERATIONS = 8) is also a cost control, not just a runaway-loop
            guard: it bounds the maximum number of paid LLM calls any single question can ever
            trigger, regardless of how open-ended the question is.
          </p>
        </section>

        <section className="mt-20">
          <SectionHead num="07" title="Measured against Tavily, not just claimed" />
          <div className="notch-corner mb-6 flex items-start gap-3 border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <span className="status-badge measured mt-0.5">Measured</span>
            <span className="text-[14px] leading-relaxed text-panel-text">
              The headline promise — a Tavily-grade answer without the paid search API — was put on
              the clock rather than left as a claim. The same eight questions (the ask and
              quick-answer modes) were run through this agent and through Tavily&rsquo;s own Search
              API on identical inputs, and the two sets of outputs compared side by side.
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="notch-corner border border-rule-hard bg-panel p-5">
              <span className="font-hero-mono text-[12px] tracking-wide text-panel-text">
                TAVILY · SYNTHESIZED ANSWERS
              </span>
              <div className="mt-2 font-display text-2xl font-semibold text-i3">
                0<span className="font-mono text-sm text-panel-mid"> / 8</span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-panel-text">
                Every response came back <code className="text-panel-text">"answer": null</code> —
                five raw result links and nothing more. As called, Tavily retrieves; it does not
                reason over what it retrieved.
              </p>
            </div>
            <div className="notch-corner border border-rule-hard bg-panel p-5">
              <span className="font-hero-mono text-[12px] tracking-wide text-panel-text">
                THIS AGENT · ON THE SAME EIGHT
              </span>
              <div className="mt-2 font-display text-2xl font-semibold text-i3">
                8<span className="font-mono text-sm text-panel-mid"> / 8</span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-panel-text">
                A grounded, cited answer every time — on the open-ended questions, the synthesis
                Tavily leaves the reader to assemble by hand from a list of links.
              </p>
            </div>
          </div>

          <div className="notch-corner mt-3 border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <span className="font-hero-mono text-[12px] tracking-wide text-i3">
              THE TELLING CASE · A MODEL THAT DOESN'T EXIST
            </span>
            <div className="mt-1 font-display text-base font-semibold text-ink">
              Asked for the benchmark scores of a fictional model, the grounding check earned its keep
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-panel-text">
              One question asked for the benchmark scores of &ldquo;Zephyr-Q9&rdquo; — a model that
              was never released. Tavily returned five real benchmark leaderboards for{" "}
              <em>other</em> models, with nothing signalling that the model in the question does not
              exist; a reader skimming them could easily misattribute stray numbers to it. This agent
              searched, found no such model, and said exactly that instead of inventing scores — the
              same code-level grounding discipline from section 03, holding up on a live adversarial
              input rather than a rehearsed one.
            </p>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            The honest boundary: on plain factual lookups — a model&rsquo;s context window, a single
            number with an obvious right answer — the two effectively tie, because that is exactly
            what single-shot search is already good at, and the agent has no business being slower to
            reach the same fact. The gap only opens on the questions that need decomposition,
            cross-source synthesis, or a refusal to hallucinate — and the whole run stays bounded by
            the 8-call cap, so matching Tavily never costs an unbounded number of LLM calls.
          </p>
          <Link
            to="/case-study/deep-research-agent/comparison"
            className="notch-corner-sm mt-6 inline-flex items-center gap-2 border border-panel-border bg-panel px-4 py-2 text-xs text-panel-text transition-colors hover:text-i3"
          >
            Full comparison, case by case (vs Tavily &amp; Claude) <ExternalLink size={14} />
          </Link>
        </section>

        <section className="mt-20">
          <SectionHead num="08" title="Sarvam vs DeepSeek, measured head-to-head" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            Since this agent runs on either backend behind one <code className="text-ink-mid">LLM_PROVIDER</code>{" "}
            switch, the two were put through the same fixed question set and compared on identical metrics rather
            than picked by feel. Three kinds of questions were run: basic factual questions, open-ended research
            queries, and disambiguation cases (an ambiguous entity with more than one plausible answer). Article
            writing was also tried manually against both models but left out of the scored comparison, since writing
            isn't this agent's job — the research loop's job is finding and grounding facts, not prose. Qualitative
            answers were judged by feeding both models' output to ChatGPT and asking which held up better and why;
            numerical claims were checked by actually running the calculation, not by asking a model whether a number
            looked plausible.
          </p>
          <Link
            to="/case-study/techdrishti/sarvam-vs-deepseek"
            className="notch-corner-sm inline-flex items-center gap-2 border border-panel-border bg-panel px-4 py-2 text-xs text-panel-text transition-colors hover:text-i3"
          >
            Full comparison, side by side <ExternalLink size={14} />
          </Link>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            A later end-to-end pass re-ran all four modes on both backends — not just the research
            questions — and reconfirmed the same split: DeepSeek goes deeper and grounds better
            (on one gap-research case Sarvam returned a list of angles to research rather than the
            researched facts themselves), while Sarvam is roughly 3&times; faster and far less
            prone to over-searching. For this tool, where grounding is the whole point, DeepSeek
            stays the default; Sarvam is the fast, cheap option better suited to the high-frequency
            loop steps than to the final synthesis.
          </p>
        </section>

        <section className="mt-20">
          <SectionHead num="09" title="Measured it, then chose not to ship it" />
          <div className="notch-corner mb-6 flex flex-col gap-2.5 border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
            <div className="flex items-start gap-3">
              <span className="status-badge shipped mt-0.5">Shipped</span>
              <span className="text-[14px] leading-relaxed text-panel-text">
                The agent itself is live and usable on Hugging Face Spaces right now — that is what the
                "Shipped" badge on this project means.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="status-badge excluded mt-0.5">Not shipped</span>
              <span className="text-[14px] leading-relaxed text-panel-text">
                Exactly one thing was left out on purpose: wiring this agent into TechDrishti's daily
                pipeline. That integration was built and measured, then cut — for the reason below.
              </span>
            </div>
          </div>
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            The obvious next move was to wire this agent back into{" "}
            <Link to="/case-study/techdrishti" className="text-i3 transition-colors hover:text-i3">
              TechDrishti
            </Link>{" "}
            as its research layer, so every ambiguous entity and comparison question got the full
            reasoning loop instead of a flat search. I built that integration and measured it against
            the production pipeline rather than guessing whether it was worth it. The numbers are why
            it is not in production.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="notch-corner border border-rule-hard bg-panel p-5">
              <span className="font-hero-mono text-[12px] tracking-wide text-panel-text">
                CURRENT BUILD · DDG-ONLY
              </span>
              <div className="mt-2 font-display text-2xl font-semibold text-i3">
                ~$0.01<span className="font-mono text-sm text-panel-mid"> / run</span>
              </div>
              <p className="mt-1 font-mono text-[13px] text-panel-text">9&ndash;20 min per run</p>
            </div>
            <div className="notch-corner border border-rule-hard bg-panel p-5">
              <span className="font-hero-mono text-[12px] tracking-wide text-panel-text">
                WITH THIS AGENT WIRED IN
              </span>
              <div className="mt-2 font-display text-2xl font-semibold text-panel-text">
                ~$0.17<span className="font-mono text-sm text-panel-mid"> / run</span>
              </div>
              <p className="mt-1 font-mono text-[13px] text-panel-text">+~81 min onto the same run</p>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
            Roughly 17&times; the cost and over an hour of extra runtime, for a marginal gain in
            research depth on a small share of a daily article's questions. TechDrishti has to finish
            unattended every morning on a fixed budget, so predictability wins there. The routing code
            is left in the repo, disabled, not deleted, because the tradeoff could flip for a use case
            that is not a daily deadline.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            The figures above are my own measurements, stated as approximate. The honest framing is
            the point: knowing when not to ship the more impressive thing is the same discipline as
            the code-level grounding check above, applied to a build decision instead of a claim.
          </p>
        </section>

        <section className="mt-20">
          <SectionHead num="10" title="By the numbers" />
          <div className="grid grid-cols-2 gap-px border border-rule-hard bg-rule-hard sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-panel p-5">
                <div className="font-display text-2xl font-semibold text-panel-text">
                  {s.num}
                  <span className="font-mono text-sm text-panel-mid">{s.unit}</span>
                </div>
                <div className="mt-2 text-[12px] leading-relaxed text-panel-mid">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 border-t border-rule-hard pt-8">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Built solo, end to end: the orchestration loop, the free-tier search layer, the
            code-level grounding check, and three task framings (ask / article enrichment /
            concise) on top of it, served through a Chainlit UI and a small FastAPI route for
            programmatic callers. Deployed on Hugging Face Spaces, provider-swappable between
            DeepSeek V4 Flash and Sarvam. It exists because{" "}
            <Link to="/case-study/techdrishti" className="text-i3 transition-colors hover:text-i3">
              TechDrishti
            </Link>{" "}
            called out to it for exactly the questions its own fixed pipeline couldn't answer.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Python", "DeepSeek V4 Flash", "Sarvam", "Chainlit", "FastAPI", "ddgs", "pytest"].map((t) => (
              <span key={t} className="notch-corner-sm border border-rule-hard bg-panel px-2.5 py-1 text-[12px] text-panel-mid">
                {t}
              </span>
            ))}
          </div>
          <a
            href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
            target="_blank"
            rel="noreferrer"
            className="font-hero-mono mt-5 inline-flex items-center gap-1.5 text-[12px] tracking-wide text-panel-mid transition-colors hover:text-i3"
          >
            The agent, live <ExternalLink size={12} />
          </a>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/case-study/techdrishti"
              className="notch-corner flex-1 border border-rule-hard bg-panel p-4 transition-colors hover:border-i3/60"
            >
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">LLM SYSTEMS</span>
              <div className="mt-1 font-display text-[15px] font-semibold text-ink">
                TechDrishti &rarr;
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-panel-mid">
                The production pipeline this agent was built out of, as its own case study.
              </p>
            </Link>
            <Link
              to="/case-study/microglomeruli-segmentation"
              className="notch-corner flex-1 border border-rule-hard bg-panel p-4 transition-colors hover:border-i3/60"
            >
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">COMPUTER VISION</span>
              <div className="mt-1 font-display text-[15px] font-semibold text-ink">
                Microglomeruli Segmentation &rarr;
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-panel-mid">
                The other track: 3D instance segmentation and the tool built on it.
              </p>
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
