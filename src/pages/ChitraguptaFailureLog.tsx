import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

type Case = {
  no: string;
  title: string;
  status: "fixed" | "open";
  statusLabel: string;
  symptom: string;
  wire?: string;
  cause: string[];
  rule: string;
};

const CASES: Case[] = [
  {
    no: "01",
    title: "The camera kept switching itself off",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "The user spent most of a session asking why the camera kept closing. One step — “Prepare tadka” — was marked complete off a note reading “oil poured into an empty pan, no ingredients added yet”.",
    cause: [
      "One boolean on log_observation was doing three unrelated jobs: it guaranteed a spoken alert, it marked the task item complete, and it closed the camera. It was described to the model as “important enough to guarantee they're told” — so the model set it on ordinary progress notes. It was behaving exactly as documented.",
      "Split into two flags with one effect each, and the completion path guarded so it only fires on a genuine “find X” goal. A stray flag is now logged, spoken, and explained back to the model in the tool result so it corrects itself next turn.",
    ],
    rule: "One flag, one consequence. If a boolean drives both a user-visible action and a state mutation, split it.",
  },
  {
    no: "02",
    title: "Frames disappeared, leaving no trace at all",
    status: "fixed",
    statusLabel: "Fixed",
    symptom: "Nothing. That is the entire problem — there was no symptom to find.",
    cause: [
      "A cheap yes/no call ran before the real one: is this frame relevant to the current goal? If it said no, the tick returned empty. On the client that is byte-identical to a legitimate “nothing has changed” silence. A frame showing exactly the thing the user asked for could be discarded by a crude misjudgement and leave no evidence anywhere in the system. It also doubled the vision calls per tick.",
      "Removed entirely, with no replacement. The browser-side diff gate and the model's own silence protocol are the cost controls, and relevance is decided in one documented place rather than two.",
    ],
    rule: "Never add a pre-filter whose “no” is indistinguishable from a legitimate quiet outcome. Failures must be traceable, or they are not failures — they are behaviour.",
  },
  {
    no: "03",
    title: "The camera contradicted itself every few seconds",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "Four consecutive captions of the same pan, seconds apart, with the scene barely changing — and the reasoning model logging the contradictions as fact.",
    wire: `"Cumin seeds and chopped red onions are sauteing"
"Chopped onions and red chilies are being sauteed"          ← cumin gone
"The cumin seeds ... have not yet been added"               ← now denied
"Cumin seeds or other spices are visible among the onions"  ← back`,
    cause: [
      "Two causes. First, the prompt named the step's ingredients, which turned the job into a roll-call — and a roll-call over small ambiguous items (cumin among browned onions, at 640 px) produces confident false negatives. “Not yet added” is a claim about a negative that a single frame usually cannot support.",
      "Second, every vision call is independent: no memory, no shared attention. The previous caption was already sitting in a buffer and the vision stage simply never used it. It is now passed back as text, with an instruction to describe change — because a hosted API cannot share attention state across calls, so the comparison baseline has to arrive in words.",
    ],
    rule: "Absence is only reportable when it is positively visible. “I cannot tell” is a valid answer; a confident false negative is not.",
  },
  {
    no: "04",
    title: "A blocked search was reported as “nothing found”",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "No web search results found for \"…\" — returned to the model as authoritative, on exactly the does-this-contain-beef questions where being wrong matters most.",
    cause: [
      "The search provider serves its bot CAPTCHA with HTTP 202. So the status check passed, the parser found zero results in a CAPTCHA page, and a hard block was rendered to the model as a confident absence. The tool was not failing loudly; it was succeeding at returning nothing.",
      "Now a block raises its own error type, so “blocked” and “genuinely empty” are visibly different results, and a provider chain replaces the single endpoint. Two counter-intuitive findings fell out of measuring it: a spoofed browser user-agent draws more CAPTCHAs than an honest bot one, and the “slow endpoint” was a cold TLS handshake.",
    ],
    rule: "A failed tool must never render like an empty result. The model cannot tell the difference, and it will treat silence as evidence.",
  },
  {
    no: "05",
    title: "Correctly shipped work was invisible for an entire session",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "Voice input, the camera toggle and several other features were deployed, verified in the repo, and simply absent in the browser.",
    cause: [
      "The progressive-web-app service worker is cache-first for the app shell and only re-fetches when its own bytes change. Its cache key sat unchanged for a whole development session, so every browser that had ever loaded the app kept serving the stale shell through every deploy. The code was right; the delivery was frozen.",
    ],
    rule: "Any change to the shell must bump the cache key. It is a one-line ritual that replaces an entire category of unreproducible bug.",
  },
  {
    no: "06",
    title: "It forgot everything for three turns, and I could not prove why",
    status: "open",
    statusLabel: "Instrumented, unresolved",
    symptom:
      "Thirty-six seconds after receiving detailed instructions, the assistant answered “You'll need to give me a bit more context — what is it that you've managed? Are we working on a recipe, a project…?” Both the conversation memory and the task list had vanished together.",
    wire: `turn context: history_turns=12 (sending 10) task_items=6
              task_list_in_prompt=True prompt_chars=3184`,
    cause: [
      "Ruled out: camera ticks polluting memory, the reply not being recorded, an accidental reset, and the free-tier server sleeping — the gap was four minutes, not fifteen.",
      "The root cause is still unknown, and that is the finding. It could not be diagnosed after the fact because nothing recorded how much context a turn actually carried. “The model ignored the task list” and “the task list never reached the prompt” look identical in a transcript and need opposite repairs. So I shipped the measurement above instead of a guess — one line per turn, on both code paths.",
    ],
    rule: "When two hypotheses need opposite fixes and the evidence cannot separate them, ship the measurement. A speculative fix here would have added machinery that addressed nothing.",
  },
  {
    no: "07",
    title: "A wrong answer survived being corrected",
    status: "open",
    statusLabel: "Open · top priority",
    symptom:
      "The model found “toor dal” in a plastic bag. The user corrected it — “the thing in the plastic bag is black eyed beans not toor dal”. It apologised, then repeated the claim for four more turns, adding detail it had invented: “on an upper shelf, open and upright, with a black loaf pan behind it”.",
    cause: [
      "A design gap rather than a bug: nothing is doing the wrong thing, the capability simply does not exist. Observations are append-only. There is no way to retract one, and no way to move a wrongly-completed item back to in progress — so the false note kept riding along in the prompt on every subsequent turn, indistinguishable from a verified one.",
      "It also interacts with case 03: the grounding rule tells the model not to contradict the previous caption about something it can no longer see clearly. That is right for a scene going out of focus and wrong once the user has said the caption was mistaken. Whatever fixes this has to carry an “…unless the user corrected you” clause.",
    ],
    rule: "A false observation that survives an explicit correction is worse than no observation at all. If a system can write memory, it needs a way to unwrite it.",
  },
  {
    no: "08",
    title: "The cost control was a suggestion, and the session died",
    status: "open",
    statusLabel: "Open",
    symptom:
      "Close-up mode costs 2.4× a normal frame, so it is opt-in per step and the schema explicitly instructs the model to set it back when the close look is done. It never did.",
    wire: `11:26:40   frame detail → fine (live ticks now 1024px)
           …never switches back

           429   198,310 / 200,000 tokens per day`,
    cause: [
      "Its cost was bounded by scope — finishing the step ends it. The step stayed in progress for the rest of the session, so every later frame ran at full resolution until the daily ceiling hit.",
      "The fix is not better wording. It needs a hard bound underneath the soft one: a count of close-up frames per item that reverts automatically, stored on the item so it survives a restart.",
    ],
    rule: "A cost control that depends on the model's judgement does not hold. Instructions are a hint; the budget needs arithmetic.",
  },
];

const INSTRUMENTS = [
  [
    "the session export",
    "Every turn, every tool call, and — after this was fixed — every vision prompt and answer, silent frames included",
  ],
  [
    "Groq vision usage:",
    "Per-frame image cost. Before this, the number that governs the entire architecture was literally unmeasurable",
  ],
  ["turn context:", "How much history and state each turn actually carried into the prompt"],
];

function CaseCard({ c }: { c: Case }) {
  const open = c.status === "open";
  return (
    <article className="notch-corner border border-rule-hard bg-panel p-6 sm:p-7">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="font-hero-mono text-[12px] tracking-wide text-ink-soft">CASE {c.no}</span>
        <span
          className={`font-hero-mono border px-2 py-[0.1rem] text-[10.5px] tracking-[0.11em] uppercase ${
            open ? "border-i1/40 bg-i1/[0.08] text-i1" : "border-i3/40 bg-i3/[0.08] text-i3"
          }`}
        >
          {c.statusLabel}
        </span>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">{c.title}</h3>

      <dl className="mt-4 flex flex-col gap-3">
        <div className="notch-corner border border-i1/30 bg-i1/[0.06] px-4 py-3">
          <dt className="font-hero-mono mb-1 text-[12px] tracking-wide text-i1">SYMPTOM</dt>
          <dd className="text-[14px] leading-relaxed text-ink">{c.symptom}</dd>
        </div>

        {c.wire && (
          <div className="notch-corner-sm overflow-x-auto border border-rule-hard bg-paper-hi px-4 py-3">
            <pre className="font-hero-mono m-0 text-[12px] leading-relaxed whitespace-pre text-ink">{c.wire}</pre>
          </div>
        )}

        <div>
          <dt className="font-hero-mono mb-1 text-[12px] tracking-wide text-ink-soft">ROOT CAUSE</dt>
          {c.cause.map((p) => (
            <dd key={p.slice(0, 40)} className="mb-2 text-[14px] leading-relaxed text-ink-mid last:mb-0">
              {p}
            </dd>
          ))}
        </div>

        <div className="notch-corner border border-i2/40 bg-i2/[0.07] px-4 py-3">
          <dt className="font-hero-mono mb-1 text-[12px] tracking-wide text-i2">THE RULE IT PRODUCED</dt>
          <dd className="font-display text-[15px] leading-relaxed text-ink">{c.rule}</dd>
        </div>
      </dl>
    </article>
  );
}

export function ChitraguptaFailureLog() {
  usePageTitle(ROUTE_META["/case-study/chitragupta/failure-log"].title);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/case-study/chitragupta"
          className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          <ArrowLeft size={13} /> Back to case study
        </Link>
        <a
          href="https://github.com/aditya0701/Chitragupta---A-Vision-based-AI-helper"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          Source <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i2">CHITRAGUPTA &middot; FAILURE LOG</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Eight things that broke, and the rule each one left behind
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Nearly every non-obvious line in this codebase is scar tissue from a specific bug. This is
          the log kept alongside it — symptom, root cause, and the rule that came out. Two of these
          are still open, and they are here for the same reason as the rest.
        </p>

        <div className="notch-corner mt-6 border border-panel-border bg-panel p-4 text-[13px] leading-relaxed text-panel-mid">
          <b className="text-ink">On these quotes.</b> They come from this project's own decision log
          and from session exports captured while each bug was live, not reconstructed afterwards for
          this page.
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {CASES.map((c) => (
            <CaseCard key={c.no} c={c} />
          ))}
        </div>

        <section className="mt-16">
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-xs text-ink-soft">09</span>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Most of these were found by reading, not by watching
            </h2>
            <span className="h-px flex-1 bg-rule-hard" aria-hidden="true" />
          </div>
          <p className="text-[14px] leading-relaxed text-ink-mid">
            There is no test suite here, and I would not claim otherwise. Verification is throwaway
            harnesses plus one artifact that turned out to be worth more than all of them: a full
            session export.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Instrument", "What it makes visible"].map((h) => (
                    <th
                      key={h}
                      className="font-hero-mono border-b border-rule-hard px-3 py-2 text-left text-[11px] tracking-wider uppercase text-ink-soft"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INSTRUMENTS.map(([k, v]) => (
                  <tr key={k}>
                    <td className="font-hero-mono border-b border-rule px-3 py-3 align-top whitespace-nowrap text-ink">
                      {k}
                    </td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-ink-mid">
            The vision round trip was invisible three times over: it never leaves the server as its
            own request, so it is not a network call anyone can inspect; most camera ticks answer{" "}
            <code className="font-hero-mono text-[13px]">[SILENT]</code>, and the client only logged a
            turn when there was something to render, so the majority of frames left no trace
            whatsoever; and the one log that did carry it was capped and rolled off. That cap is
            exactly why case 06 could not be diagnosed — the window had already scrolled past.
          </p>
          <div className="notch-corner mt-5 border border-i2/40 bg-i2/[0.07] p-5">
            <p className="font-display text-[15px] italic leading-relaxed text-ink">
              Case 03 is invisible in any single turn. Only the sequence shows it — which is the whole
              argument for logging the thing nobody is looking at.
            </p>
          </div>
        </section>

        <div className="mt-16">
          <Link
            to="/case-study/chitragupta/architecture"
            className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i2/60 sm:p-6"
          >
            <div>
              <div className="font-display text-lg font-semibold text-ink">How it works &rarr;</div>
              <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">
                The pipeline diagram, the blind/mute protocol, and what one minute of watching costs.
              </p>
            </div>
            <ArrowRight size={18} className="shrink-0 text-i2" aria-hidden="true" />
          </Link>
        </div>

        <footer className="mt-12 border-t border-rule-hard pt-8">
          <Link
            to="/case-study/chitragupta"
            className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
          >
            <ArrowLeft size={13} /> Back to the Chitragupta case study
          </Link>
        </footer>
      </main>
    </div>
  );
}
