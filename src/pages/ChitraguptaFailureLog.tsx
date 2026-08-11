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

/* v2's log. Quotes are from this project's decision log and from the session
   exports captured while each bug was live — not reconstructed afterwards. */
const CASES: Case[] = [
  {
    no: "01",
    title: "It read the label into the document, then said nothing about it",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "Reported three separate times. The camera reads something the user is clearly waiting on, the model folds it into the document correctly, updates the right task — and never tells them.",
    cause: [
      "One model call was being scored on two objectives that pull against each other: keep the document accurate, which rewards quiet bookkeeping, and decide whether to speak, which rewards noticing the user. Silence kept winning, because it was also the stated default for the other job.",
      "Split into two calls. Stage 1 does bookkeeping and its prose is discarded unread. Stage 2 gets a separate, deliberately cheap prompt — no tools, no system brief, no full document, roughly a third of the size — and answers one question. A cheap arithmetic check between them skips Stage 2 entirely when nothing happened, so an idle tick still costs exactly one reasoning call.",
    ],
    rule: "If one call is scored on two objectives that trade against each other, it will optimise the one that is also the default. Split the call, not the wording.",
  },
  {
    no: "02",
    title: "The camera spent a session narrating the camera",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "An entire session of captions describing the videographer instead of the kitchen. Full price per frame, and zero task information in any of them.",
    wire: `"the camera pulls back and tilts upward"
"the camera pushes in close"
"the camera angle shifts to the right"`,
    cause: [
      "An honest failure rather than a stupid one. The user is holding the phone and walking around, so the largest frame-to-frame delta genuinely is camera motion — and the instruction to describe change rather than re-describe the scene points straight at it.",
      "Fixed with an explicit ban plus a redirect: if the view moved to a new place, name what is now visible there — “pantry shelf: onions in a wooden bowl” — never the motion that got you there. The change instruction was also taught that a different viewpoint is not a change.",
    ],
    rule: "An instruction to report change will find the largest change. If the largest change is an artifact of how the data arrives, the instruction has to say so.",
  },
  {
    no: "03",
    title: "An inference stood in for an observation, and reported beans that were lentils",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "The user was looking for black-eyed beans. The caption said “several bags of lentils”. The reasoning model reported “I can see the beans”.",
    cause: [
      "Nothing had actually been asked. The brief reached the vision model only as a soft “these are relevant, be detailed” nudge at the end of the prompt, so nothing sharp ever came back — and with no answer to read, the reasoning model filled the gap itself.",
      "Watches are now asked first, before the description, one line each, in a fixed format where NOT VISIBLE and UNCLEAR are real answers rather than the absence of one. Separately, the found state was closed off entirely: no tool can set it, and only plain string matching over the caption can. The inference has no door left to walk through.",
    ],
    rule: "If you want an observation, ask a question. A soft nudge gets you an inference, and downstream an inference is indistinguishable from an observation.",
  },
  {
    no: "04",
    title: "Answering the user silenced the exact follow-up they were waiting for",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "Asked to find the onions, the assistant replied “I'll point them out as soon as they're in view” — and that reply gagged it for the entire 90-second search. It found them at +27 seconds, logged them silently, and said nothing until it was asked again.",
    cause: [
      "Speaking reset the politeness budget, so the assistant's own helpful acknowledgement spent the whole allowance on saying nothing.",
      "A user turn now opens a follow-up window instead of closing a gap, and the two timestamps are tracked separately on purpose. The window is deliberately not folded into the general check: a stale-task nag firing seconds after a conversation is exactly what the politeness gap is right to suppress. Only the path where the model is reacting to something it can actually see opts in.",
    ],
    rule: "Speaking should make an assistant quieter; being asked should make it more forthcoming. One timestamp cannot express both.",
  },
  {
    no: "05",
    title: "A dead camera reported that nothing had changed",
    status: "open",
    statusLabel: "Fixed, with a hole left",
    symptom:
      "The camera view was entirely black and the system cheerfully reported that nothing had changed. Correct, and useless.",
    cause: [
      "To a frame-difference comparison, a dead camera is indistinguishable from a perfectly still scene. A standard-deviation liveness test now runs before the diff gate, and a persistently flat frame gets a red capture border, a distinct warning, and track diagnostics. Camera startup was hardened at the same time, because an autoplay refusal leaves a black poster frame that looks exactly like a dead sensor.",
      "Caption reuse made this worse and is why the two shipped together — before it, every chat turn sent a frame, so a dead camera still got looked at eventually.",
      "Still open: flat frames are detected and reported, and they are still captioned at full price. The one live session spent five vision calls describing a blackout.",
    ],
    rule: "A liveness test and a change test are different tests. Absence of change is not evidence of a working sensor.",
  },
  {
    no: "06",
    title: "One flag in the browser defeated every fix on the server",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "The lock restructure, the yield points, the phase split — none of it reached a user. A typed question still waited for the current camera tick to finish.",
    wire: `if (busy) {
  queuedPrompt = prompt;
  setStatus('queued — waiting for the current tick to finish…');
  return;
}`,
    cause: [
      "The client held a single busy flag covering both ticks and chat. The message never left the browser, and the status line was apologising for a constraint that existed nowhere else in the system.",
      "Split into two flags protecting genuinely different things: frames must not stack, and replies must not interleave. A second question still queues behind the first — with voice input there is no visible input box in which to notice a dropped message.",
    ],
    rule: "A server-side concurrency fix is not done until the client can exercise it. Both halves need a test.",
  },
  {
    no: "07",
    title: "The first live session died on a provider it should never have been able to reach",
    status: "fixed",
    statusLabel: "Fixed — made impossible",
    symptom:
      "Eighteen minutes into the first real run, on someone's actual dinner. The daily cap belonged to a provider this version cannot run on at all.",
    wire: `429 — Rate limit reached for model \`qwen/qwen3.6-27b\` …
      tokens per day (TPD): Limit 200000, Used 199109`,
    cause: [
      "The interesting part is that nothing was wrong on disk. Every config file named the correct provider, and the factory routed it correctly, so there was no artifact anyone could inspect and find a mistake in. The running process simply predated the configuration. That is the actual defect: the system had a hard requirement and no point at which it compared that requirement against reality.",
      "Three changes, in order of how much each carries. The default was the bug — it defaulted to the one configuration that cannot work, a leftover from before the right backend existed, so the one thing you got by not choosing was the thing that fails. Which provider gets the pixels was not knowable to any code: the hybrid backend extends the other one and replaces a client its parent constructed, so the class name, the mode string and the module name all fail to answer the question — backends now declare it. And startup refuses outright unless an environment variable says the wrong provider was deliberate.",
      "Three details are deliberate. The escape hatch is per-run and explicit, because choosing that provider for a one-off comparison is legitimate — arriving there is the bug. The check runs at boot but does not re-raise, because v1 shares the process and is the system in daily use; v2's own routes still fail loudly. And every character of it is ASCII: the first version used arrows and section marks, and printing it on a Windows console raised a UnicodeEncodeError — a diagnostic that crashed while reporting the problem it existed to explain.",
    ],
    rule: "The default nobody sets must be the one that works. And a hard requirement with no point of enforcement is a comment, not a requirement.",
  },
  {
    no: "08",
    title: "A correct plan shipped as a bare colon",
    status: "open",
    statusLabel: "Repaired, guard still too narrow",
    symptom:
      "The turn ended mid-sentence: “Got it — we just need the tadka. Here's the plan:” The plan itself had gone into a tool, so no second call happened and the naked preamble shipped.",
    wire: `"Let me also make a note of what's on the menu so it stays consistent:"
                                    — the live session, 2026-08-10`,
    cause: [
      "The user is listening, not reading. A task list that exists only in the document panel does not reach someone whose hands are in the dal, and they had to ask to be told what the plan was.",
      "Repaired deterministically rather than with another model call — it costs nothing and cannot itself dangle. It fires on the exact shape of the failure, a trailing colon or dash plus a plan tool in the results, and appends the step count and only the first step. Reading six steps aloud is how you lose someone at a stove. For a proposal it appends “Shall I go with that?” instead, because a dangling proposal is the worse version: the plan is not only unseen, it is waiting on an answer nobody was asked for.",
      "Still open, and the live session proved it: the guard requires a plan tool in the results, so a turn that trailed off after writing an environment fact shipped with a bare colon anyway. The trailing-colon test matched; the tool guard rejected it.",
    ],
    rule: "A deterministic repair beats another model call. But a repair keyed to the shape of one failure catches exactly that shape, and the next one arrives wearing something else.",
  },
  {
    no: "09",
    title: "It reported an error beside a perfectly built plan",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "Asked for help with chole, the model wrote a correct seven-step plan into the document, emitted no prose at all, and the user was shown “(no reply — something went wrong, try again)” next to work that had entirely succeeded.",
    cause: [
      "On a camera tick, empty text is the answer. On a user turn it never is — and the code did not distinguish them, so a turn that did all its work through tools reported itself as a failure.",
      "Four escalating rescues now run, and the third is the one that matters: a forced text-only call with the tools taken away. While tools are offered the model can always answer with another call instead of prose, which is precisely what it did on “walk me through changing an oil filter” — a chain that spent both earlier calls on tools. Taking them away leaves it nothing to reply with except words.",
    ],
    rule: "Reporting a failure beside work that succeeded is worse than saying nothing useful. It tells the user to redo something that already worked.",
  },
  {
    no: "10",
    title: "The brief turned a perfectly good setup into a list of absent items",
    status: "fixed",
    statusLabel: "Fixed",
    symptom:
      "Briefs written as checklists — “whether a wheel chock sits behind a rear wheel; whether a drain pan is directly underneath the filter” — so a different but entirely fine arrangement read back as a series of things that were missing.",
    cause: [
      "The reasoning model was writing the whole vision block, and it cannot see the user's kitchen or garage. So it was describing an imagined one, and the camera was scoring reality against it.",
      "It now writes only the activity — “user is dicing onions on a board at the counter”. The grip, posture and danger wording is standard text attached to every frame, identical for every task, and carries the counter-instruction that makes it survive contact with a real frame: this is not a checklist, and if something mentioned is simply not in this frame, absence is not a finding.",
    ],
    rule: "A model that cannot see the scene must not be the one describing it. Given the chance it will enumerate one imagined arrangement and treat every difference as a fault.",
  },
];

/* Not bugs — known gaps with no fix designed yet. Listed because a failure log
   that only contains solved problems is a marketing document. */
const STILL_OPEN = [
  [
    "The close-up tier has never been used live",
    "Every caption in the one real session is coarse, including while reading a patent binder and searching a fridge. The tier passes its harness; the model does not reach for it. Whether the prompt is steering away from it is unresolved.",
  ],
  [
    "Nothing throttles a twenty-minute simmer",
    "There is no adaptive backoff. A step where nothing will change for a long time ticks at the same rate as one where everything is changing.",
  ],
  [
    "The diff gate saves nothing while walking",
    "Every frame differs, so the single largest cost control switches itself off exactly when the user is moving around a shop. Visible in the live export during the fridge and pantry search.",
  ],
  [
    "A compound step can be completed from a quarter of the evidence",
    "“Prep: dice onions, dice tomatoes, make paste, cut chicken” can be marked done from a frame showing one of the four. It needs sub-items, not a better prompt.",
  ],
  [
    "Timezone is one server-wide setting",
    "Standing in until there is somewhere to store per-user preferences at all. Every timestamp in the document is rendered in it, including the header all temporal arithmetic is done against.",
  ],
];

/* v1's log is archived rather than deleted: several of its rules are still the
   reason v2's code looks the way it does. */
const INHERITED = [
  [
    "One flag, one consequence",
    "A single boolean once guaranteed a spoken alert, marked a task complete, and closed the camera. In v2, [URGENT] bypasses the politeness gate and does nothing else — and found and announced are two flags, because one is about the world and the other about speech.",
  ],
  [
    "Never add a pre-filter whose “no” looks like silence",
    "v1 ran a cheap relevance call before the real one, and its rejection was byte-identical to a legitimate quiet frame. In v2, NOT VISIBLE is a first-class answer with its own format, and a frame dropped by the browser gate is a distinct, visible state.",
  ],
  [
    "A failed tool must never render like an empty result",
    "The search provider served its bot CAPTCHA with HTTP 202, so a hard block reached the model as a confident “nothing found”. The provider chain and the distinct error type carried into v2 unchanged.",
  ],
  [
    "Flag network tools as blocking",
    "They run on the event loop otherwise, and one slow web search stalls every camera tick behind it.",
  ],
  [
    "Ship the measurement when two hypotheses need opposite fixes",
    "v1 lost its memory for three turns and the transcript could not distinguish “the model ignored the task list” from “the task list never reached the prompt”. v2's startup line naming its own vision provider is the same move, one version later — and case 07 is what it was built for.",
  ],
  [
    "A cost control that depends on the model's judgement does not hold",
    "v1 switched close-up mode on and never switched it back, ending a session at 198,310 of 200,000 tokens. v2 renders the running count into the document so the drift is visible to the thing causing it, and puts a hard cap underneath the instruction.",
  ],
];

const INSTRUMENTS = [
  [
    "the session export",
    "Every turn, every tool call, every vision prompt and answer — silent ticks included — plus the document as it stood. Every finding in this log's “open” column came from reading it, not from a harness",
  ],
  [
    "DeepInfra vision usage:",
    "The per-frame bill. In this split the vision call is the only image cost, so its prompt tokens are the number that governs the whole architecture",
  ],
  [
    "Initialized live agent | …",
    "One startup line naming the backend mode, the vision provider and the reasoning model. It exists because case 07 could not be settled from any file on disk",
  ],
  [
    "a timed overlap harness",
    "Drives a question into a tick that is already mid-reasoning and measures how long it waits. It is the only reason the lock restructure has a number attached to it rather than a claim",
  ],
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
          <dd className="text-[15px] leading-relaxed text-ink">{c.symptom}</dd>
        </div>

        {c.wire && (
          <div className="notch-corner-sm overflow-x-auto border border-rule-hard bg-paper-hi px-4 py-3">
            <pre className="font-hero-mono m-0 text-[12px] leading-relaxed whitespace-pre text-ink">{c.wire}</pre>
          </div>
        )}

        <div>
          <dt className="font-hero-mono mb-1 text-[12px] tracking-wide text-ink-soft">ROOT CAUSE</dt>
          {c.cause.map((p) => (
            <dd key={p.slice(0, 40)} className="mb-2 text-[15px] leading-relaxed text-ink-mid last:mb-0">
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
        <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i2">CHITRAGUPTA v2 &middot; FAILURE LOG</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Ten things that broke, and the rule each one left behind
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Nearly every non-obvious line in this codebase is scar tissue from a specific bug. This is
          the log kept alongside it — symptom, root cause, and the rule that came out. Three are still
          open, and they are here for the same reason as the rest.
        </p>

        <div className="notch-corner mt-6 border border-panel-border bg-panel p-4 text-[14px] leading-relaxed text-panel-mid">
          <b className="text-ink">On these quotes.</b> They come from this project's own decision log
          and from session exports captured while each bug was live, not reconstructed afterwards for
          this page. Cases 05, 07 and 08 were all found in the same eighteen-minute live run.
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {CASES.map((c) => (
            <CaseCard key={c.no} c={c} />
          ))}
        </div>

        {/* Still open ─────────────────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-xs text-ink-soft">11</span>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Known gaps with no fix designed yet
            </h2>
            <span className="h-px flex-1 bg-rule-hard" aria-hidden="true" />
          </div>
          <p className="text-[15px] leading-relaxed text-ink-mid">
            These are not bugs and nothing is doing the wrong thing. The capability simply is not
            there, and pretending otherwise on a page like this would defeat the point of keeping the
            log at all.
          </p>
          <div className="mt-6 flex flex-col gap-[2px]">
            {STILL_OPEN.map(([k, v]) => (
              <div
                key={k}
                className="grid gap-1 border border-rule border-l-[3px] border-l-i1 bg-panel px-4 py-3 sm:grid-cols-[15rem_1fr] sm:gap-x-5"
              >
                <span className="text-[14.5px] leading-snug font-semibold text-ink">{k}</span>
                <span className="text-[14px] leading-relaxed text-ink-mid">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Inherited ──────────────────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-xs text-ink-soft">12</span>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              What v1 left behind, and where it still binds
            </h2>
            <span className="h-px flex-1 bg-rule-hard" aria-hidden="true" />
          </div>
          <p className="text-[15px] leading-relaxed text-ink-mid">
            v2 is a rewrite of the tick loop, not of the lessons. The first version had its own log of
            eight failures; it is archived rather than deleted, because several of its rules are still
            the reason v2's code looks the way it does. These are the ones that carried.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-[14px]">
              <thead>
                <tr>
                  {["The rule v1 produced", "Where it binds in v2"].map((h) => (
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
                {INHERITED.map(([k, v]) => (
                  <tr key={k}>
                    <td className="border-b border-rule px-3 py-3 align-top font-semibold text-ink">{k}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
            One v1 rule did not carry, and that is worth saying too. Its service-worker cache-key
            ritual — correctly shipped work sat invisible in browsers for a whole session — is
            sidestepped entirely in v2, because the live page and its routes are excluded from the
            service worker outright. The best outcome for a rule is a design where it cannot apply.
          </p>
        </section>

        {/* Instruments ────────────────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-xs text-ink-soft">13</span>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Most of these were found by reading, not by watching
            </h2>
            <span className="h-px flex-1 bg-rule-hard" aria-hidden="true" />
          </div>
          <p className="text-[15px] leading-relaxed text-ink-mid">
            There is no test suite here and I would not claim otherwise. Verification is a folder of
            ad-hoc harnesses plus one artifact worth more than all of them.{" "}
            <strong className="font-semibold text-ink">
              Harnesses cannot tell you whether the model behaves.
            </strong>{" "}
            They cover what is checkable without a live session; everything about judgement — does it
            propose instead of writing, does it revert to coarse, does it speak when the user is
            waiting — needs a real run and a read of the export.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-[14px]">
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
                    <td className="font-hero-mono border-b border-rule px-3 py-3 align-top text-ink">{k}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="notch-corner mt-6 border border-i2/40 bg-i2/[0.07] p-5">
            <p className="font-display text-[15px] italic leading-relaxed text-ink">
              No single turn shows a contradiction. Only the sequence does — which is the whole
              argument for logging the thing nobody is looking at.
            </p>
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">
            There is one trap in the client-side harnesses worth writing down, because a harness that
            ignores it passes against a broken file: they drive the real client in a stubbed DOM rather
            than reimplementing it, and a top-level <code className="font-hero-mono">let</code> in that
            sandbox is not a property of the sandbox object. State has to be read and poked through the
            context, or the harness is quietly testing nothing.
          </p>
        </section>

        <div className="mt-16">
          <Link
            to="/case-study/chitragupta/architecture"
            className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i2/60 sm:p-6"
          >
            <div>
              <div className="font-display text-lg font-semibold text-ink">How it works &rarr;</div>
              <p className="mt-1 text-[15px] leading-relaxed text-panel-mid">
                The session diagram, where the lock is and is not, the document section by section, and
                what one minute of watching costs.
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
