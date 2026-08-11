import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { ChitraguptaDiagram } from "../components/ChitraguptaDiagram";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

/* ── v2 ────────────────────────────────────────────────────────────────────
 * This page describes v2, the world-document architecture. v1 — one model
 * asked "what do I say about this frame?" on every frame — still runs and is
 * not being developed; it appears here only where the comparison is the
 * argument. Every quote is from the project's own decision log or from the
 * 2026-08-10 session export it cites. Nothing is reconstructed for the page. */


function Figure({ children, caption }: { children: React.ReactNode; caption: React.ReactNode }) {
  return (
    <figure className="m-0 mt-6 flex flex-col gap-3">
      <div className="notch-corner overflow-x-auto border border-rule-hard bg-panel px-3 py-4 sm:px-4">
        {children}
      </div>
      <figcaption className="text-[14px] leading-relaxed text-ink-mid">{caption}</figcaption>
    </figure>
  );
}

/** The deployed prototype.
 *
 *  Deliberately `/live` and not the bare origin. The server now serves v2 at
 *  `/` and keeps `/live` as a permanent alias, but that change ships on the
 *  server's own deploy cycle — and until it lands, the bare origin still
 *  returns v1. `/live` is correct on both sides of that deploy, so this link
 *  cannot spend a week pointing at the superseded system. */
const LIVE_URL = "https://chitragupta-k6ek.onrender.com/live";

/* ── Static content ───────────────────────────────────────────────────── */

const STATS = [
  {
    num: "0.01",
    unit: "s",
    label:
      "for a question to reach the wire while a tick is mid-reasoning. It was 2.00 s when one lock covered the whole tick",
  },
  {
    num: "0",
    unit: " tokens",
    label:
      "to decide whether the user is owed something. The trigger engine is arithmetic over the document, not a model call",
  },
  {
    num: "$0.26",
    unit: "/1k",
    label:
      "measured vision cost per thousand ticks on DeepInfra. Matching a whole free-tier daily allowance costs about four cents",
  },
  {
    num: "18",
    unit: " min",
    label:
      "of real traffic. v2 has been run live exactly once, on 2026-08-10, and everything on this page is written from that export",
  },
];

/* The three routes to a live camera assistant. The third row is this project.
 * Written to be defensible rather than flattering — the honest differentiator
 * is the last column, not the middle one. */
const APPROACHES = [
  {
    name: "Train a streaming model",
    eg: "VideoLLM-online",
    needs: "GPUs, and instruction data purpose-built for every task it assists with",
    cost: "Cheap per frame once trained. The training run is the bill",
    change: "Anything — by retraining. Which means nothing, without the hardware",
    ours: false,
  },
  {
    name: "Run a realtime multimodal model",
    eg: "Qwen3-VL self-hosted · Gemini Live",
    needs: "GPUs to serve it, or a hosted stream you do not control",
    cost: "Metered by the second of stream, whether or not anything happened",
    change: "The prompt. When it speaks is the model's judgement, and you cannot inspect it",
    ours: false,
  },
  {
    name: "Compose hosted models around a document",
    eg: "this project",
    needs: "Two API keys and a phone",
    cost: "~$0.26 per 1,000 ticks — and an unchanged scene never becomes a request at all",
    change: "Everything that matters is code. The silence policy is arithmetic you can read and test",
    ours: true,
  },
];

/* Capabilities that fall out of the reasoning stage being a general
 * tool-calling model rather than a video head. */
const ADDS = [
  {
    k: "Web search at runtime",
    v: "it can attempt a task nobody prepared data for. The trained approach's answer to an unfamiliar job is a new dataset; this one's is a search and a page fetch, mid-conversation.",
  },
  {
    k: "Time-anchored expectations",
    v: "a deadline stored as wall-clock and checked by subtraction, which costs no inference and survives a restart. Tracking elapsed time from a frame stream is the paper's weakest point, and it does not improve on a sampled feed.",
  },
  {
    k: "State that is a file, not a context window",
    v: "the plan, the environment facts and the search list are on disk. A streaming session's memory dies with the connection; this is still there tomorrow.",
  },
  {
    k: "A silence policy you can audit",
    v: "why it did or did not speak at any moment is arithmetic over that file, so it can be read, tuned and unit-tested — rather than inferred from a model's behaviour.",
  },
];

/* The five phases. `lock` is the column that matters: only the odd-numbered
 * phases hold it, and every model call happens outside one. */
const PHASES = [
  {
    n: "1+2",
    what: "Caption the frame",
    who: "vision",
    lock: false,
    cost: "~1.5 s · one vision call",
    why: "The frame plus a standing brief go to a model that reads scenes and writes prose. It never reasons and never decides.",
  },
  {
    n: "3a",
    what: "Fold the caption in, claim triggers",
    who: "doc",
    lock: true,
    cost: "~1 ms",
    why: "A trigger claims its own state before anything awaits, or it fires again on the next tick while the first one is still thinking.",
  },
  {
    n: "3b",
    what: "Stage 1 — bookkeeping, tools only",
    who: "reason",
    lock: false,
    cost: "~2 s · one reasoning call",
    why: "Scored on one thing: is the document now accurate? Its prose is thrown away unread.",
  },
  {
    n: "3c",
    what: "Is the speech question even worth asking?",
    who: "doc",
    lock: true,
    cost: "~1 ms",
    why: "Arithmetic. When nothing happened, the next phase never runs at all — which is what makes an idle tick cost exactly one reasoning call.",
  },
  {
    n: "3d",
    what: "Stage 2 — the speech decision",
    who: "reason",
    lock: false,
    cost: "~1 s · skipped when idle",
    why: "A small, separate prompt: no tools, no system brief, no full document. One question, and the user's own words.",
  },
  {
    n: "3e",
    what: "Politeness gate, record the utterance",
    who: "doc",
    lock: true,
    cost: "~1 ms",
    why: "90 seconds between unprompted remarks, bypassed by [URGENT] and by the follow-up window a user's question opens.",
  },
];

const PHASE_WHO: Record<string, { label: string; cls: string }> = {
  vision: { label: "vision", cls: "border-i5/50 bg-i5/[0.09] text-i5" },
  reason: { label: "reasoning", cls: "border-i2/50 bg-i2/[0.09] text-i2" },
  doc: { label: "document", cls: "border-rule-hard bg-panel text-ink-mid" },
};

/* Quoted from the 2026-08-10 export, via this project's decision log. Six
 * things that worked and three that did not, from the same eighteen minutes —
 * because a session that only produced good lines would not be evidence. */
const EVIDENCE: { quote: string; proves: string; ok: boolean }[] = [
  {
    quote: "I'm still waiting to hear if that style works for you",
    proves:
      "Said unprompted, minutes after proposing a six-step plan. A proposal nobody answered re-raises itself, because the assistant is blocked on the user and the user has no idea it is waiting.",
    ok: true,
  },
  {
    quote: "yes this style works for me",
    proves:
      "The user's assent, on which commit_plan fired together with update_tasks and set_vision_focus. Until that line, the plan existed only as a proposal and nothing was tracking it.",
    ok: true,
  },
  {
    quote: "my view is completely black (looks like a lens cap)… carry me with you and the moment the view clears I'll look",
    proves:
      "A dead camera reported as a dead camera. To a frame-difference comparison a black frame is a perfectly still scene, so this needed a separate liveness test to be sayable at all.",
    ok: true,
  },
  {
    quote: "⚠️ Slow down—path is tight by the door and shelving",
    proves:
      "[URGENT], fired off a motion-blurred frame while the user was walking. It bypasses the 90-second politeness gate and does nothing else — one flag, one consequence.",
    ok: true,
  },
  {
    quote: "BREASTS — keep short to avoid drying out",
    proves:
      "A mid-plan correction — breasts, not thighs — propagated into two task notes with the reasoning attached, so it is read back at the step where it changes what to do.",
    ok: true,
  },
  {
    quote: "capture: user turn — scene unchanged, reusing the last caption",
    proves:
      "An idle question answered without paying for a fresh caption. The server tells the model this outright, rather than letting it conclude it has gone blind.",
    ok: true,
  },
  {
    quote: "Let me also make a note of what's on the menu so it stays consistent:",
    proves:
      "The end of the turn. A dangling reply that the deterministic repair should have caught, but the guard requires a plan tool in the results and this turn's only tool was log_environment. Still open.",
    ok: false,
  },
  {
    quote: "429 — Rate limit reached for model qwen/qwen3.6-27b … TPD: Limit 200000, Used 199109",
    proves:
      "How the session ended: on a provider v2 should never have been able to reach. Every config file on disk said otherwise, which is exactly why it is now checked at startup instead of documented.",
    ok: false,
  },
  {
    quote: "every caption in the session is (coarse)",
    proves:
      "The close-up tier was never once chosen live, including while reading a patent binder and searching a fridge. It passes its harness; the model does not reach for it. Unresolved.",
    ok: false,
  },
];

const PAPER_ROWS = [
  {
    paper: "Pools each frame to a single vector",
    why: "An unconditional compression — it cannot preserve a label, a torque figure, or where fingertips sit relative to a blade",
    instead:
      "A query-conditioned caption: the brief tells the vision model what matters before it looks, which is why read mode can transcribe a packet at all",
  },
  {
    paper: "Grows a KV cache of frame tokens",
    why: "Decoding is memory-bandwidth bound, so latency degrades over a long session",
    instead:
      "No image tokens ever accumulate. Each frame is captioned independently and only text persists, bounded at 24 captions with span-preserving compaction behind it",
  },
  {
    paper: "Trains an EOS head to decide when to speak",
    why: "No training budget",
    instead:
      "A zero-token arithmetic engine over the document decides *whether* to ask, and a separate small prompt answers *what* to say",
  },
  {
    paper: "Inference on every frame",
    why: "A continuous tick loop is the heaviest thing in the system",
    instead: "A perceptual diff gate in the browser — an unchanged scene never becomes a request at all",
  },
  {
    paper: "Instruction data built for the tasks it assists with",
    why: "No dataset, and no budget to build one",
    instead: "It searches the web at runtime, so it can attempt a task nobody prepared data for",
  },
  {
    paper: "Tracking elapsed time from the frame stream",
    why: "The paper's weakest point, and it does not improve on a sampled feed",
    instead:
      "A time-anchored expectation: a stored deadline checked by subtraction, which also carries a resolution path a timer never had",
  },
];

const PROVEN = [
  "Propose-then-commit: a six-step plan held unwritten across several minutes and many ticks, raised unprompted, committed on assent",
  "The plan read aloud in the same reply that committed it — the user never had to ask what was in the document",
  "A dead camera reported honestly and usefully, rather than as “nothing has changed”",
  "[URGENT] reaching the user immediately, off a motion-blurred frame in a tight passage",
  "Compaction preserving a time span — one narrative entry covering 13:24:56 to 13:36:58, not just the facts inside it",
  "Eight durable environment facts by the end, including the fridge shelf the chicken came off",
];

const UNPROVEN = [
  "One eighteen-minute session is one session. Nothing on this page is a distribution",
  "The close-up tier has never been chosen by the model in live traffic, including while reading small print",
  "Flat frames are detected and still captioned at full price — five vision calls went on describing a blackout",
  "Streaming speech (/v2/chat/stream) is designed, with the constraint written down, and not built",
  "Nothing throttles a twenty-minute simmer, and the diff gate saves nothing at all while the user is walking",
  "No automated test suite. Verification is a folder of ad-hoc harnesses plus reading the export, and harnesses cannot tell you whether the model behaves",
];

const SKILLS = [
  "Multi-model pipeline design",
  "State-machine design for LLM agents",
  "Concurrency under a single lock",
  "LLM cost engineering",
  "Agent tool-calling & persistent state",
  "Prompt engineering from failure data",
  "Observability for non-deterministic systems",
  "Hallucination mitigation",
  "Research → production translation",
  "Python · FastAPI · asyncio",
];

const ASYNC_USES = [
  {
    k: "asyncio.Lock",
    v: "Held only inside a write window — reload, mutate, save, release — measured in milliseconds. Every model call happens outside one, including the reasoning that produces the tool calls. It used to cover the whole tick, and a question arriving mid-reasoning waited 2.00 s to reach the wire; it now waits 0.01 s.",
  },
  {
    k: "reload-on-entry",
    v: "The price of releasing the lock is that the document may have moved. Every window reloads from disk unconditionally, because a window reusing a document read before a model call silently rolls back whoever wrote in the meantime — and both writes report success.",
  },
  {
    k: "asyncio.to_thread",
    v: "Network tools are flagged blocking=True and dispatched to a thread. Before that they ran on the event loop, so one slow web search stalled every camera tick behind it.",
  },
];

function Wire({ children }: { children: React.ReactNode }) {
  return (
    <div className="notch-corner-sm overflow-x-auto border border-rule-hard bg-paper-hi px-4 py-3">
      <pre className="font-hero-mono m-0 text-[13px] leading-relaxed whitespace-pre-wrap text-ink">{children}</pre>
    </div>
  );
}

export function CaseStudyChitragupta() {
  usePageTitle(ROUTE_META["/case-study/chitragupta"].title);

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
        <div className="flex items-center gap-4">
          <a
            href={LIVE_URL}
            target="_blank"
            rel="noreferrer"
            className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-i2 transition-colors hover:text-i3"
          >
            Live <ExternalLink size={12} />
          </a>
          <a
            href="https://github.com/aditya0701/Chitragupta---A-Vision-based-AI-helper"
            target="_blank"
            rel="noreferrer"
            className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
          >
            Source <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <div className="notch-corner relative overflow-hidden border border-rule-hard bg-panel px-6 py-12 text-center">
          <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i2">
            ENGINEERING CASE STUDY · v2 PROTOTYPE · ONE LIVE RUN
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">Chitragupta</h1>
          <p className="font-display mt-3 text-lg italic text-panel-text">
            A live vision assistant, without the GPUs, the dataset or the trained model the research
            assumes.
          </p>
          <div className="signal-bar mx-auto mt-5 w-24" />
          <p className="font-hero-mono mt-4 text-[12px] tracking-wide text-panel-mid">
            WORLD-DOCUMENT ARCHITECTURE · QWEN3-VL-30B ON DEEPINFRA + DEEPSEEK V4-FLASH
          </p>
        </div>

        <p className="font-display mt-10 text-lg leading-relaxed text-ink sm:text-xl">
          A hands-free camera assistant for hands-on work — cooking, repairs, a supermarket aisle. It
          watches through a phone camera, keeps a written record of everything it has seen and
          decided, and speaks only when speaking is worth it. The user is{" "}
          <mark className="box-decoration-clone bg-i2/20 px-1 text-ink">listening, not reading</mark>,
          which drives almost every design decision below.
        </p>

        {/* THE PROBLEM ──────────────────────────────────────── */}
        <section className="mt-14">
          <p className="font-hero-mono mb-3 text-[12px] tracking-wider text-i2">THE PROBLEM</p>
          <h2 className="font-display text-xl leading-snug font-semibold text-ink sm:text-2xl">
            In the literature, a live camera assistant is a training problem. I had no GPUs, no
            dataset and nothing to fine-tune — so it had to become an architecture problem instead.
          </h2>

          <p className="mt-6 text-[15px] leading-relaxed text-ink-mid">
            This began as a master's seminar. The paper I presented was{" "}
            <strong className="font-semibold text-ink">VideoLLM-online</strong>, and it is the right
            place to start because it asks the harder of the two questions. Not{" "}
            <em>what is in this frame</em> — captioning solved that — but{" "}
            <strong className="font-semibold text-ink">
              when a model watching a live stream should speak at all
            </strong>
            . An assistant that answers the first question well and the second one badly is not a
            weak assistant; it is an unusable one, because it narrates.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The paper answers it with a trained streaming head. I had a laptop and free-tier API keys.
            So the question I actually had to answer was whether that behaviour survives when every
            mechanism that produces it is out of reach —{" "}
            <strong className="font-semibold text-ink">and this is the shape of the answer.</strong>
          </p>
        </section>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="notch-corner-sm border border-rule-hard bg-panel px-4 py-3">
              <div className="font-hero-mono text-2xl tabular-nums text-i2">
                {s.num}
                <span className="text-base text-ink-soft">{s.unit}</span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-ink-mid">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 01 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="01" title="The shape of it, and why it has that shape" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            Two models that cannot see what the other sees, a document between them, and a trigger
            engine that costs nothing. The reasoning model owns every decision and every tool call and
            has never seen a pixel in its life; the vision model is looking straight at the answer and
            knows nothing about the conversation.
          </p>
          <Figure
            caption={
              <>
                <b className="text-ink">Read the two arrows out of the document.</b> One goes to a
                model, which reads and writes and costs a call. The other goes to arithmetic, which
                only reads and costs nothing — and it is the arithmetic, not the model, that decides a
                sentence is owed. Inverting those two is the entire difference between this and the
                version before it.
              </>
            }
          >
            <ChitraguptaDiagram />
          </Figure>

          <h3 className="font-display mt-9 text-[1.05rem] font-semibold text-ink">
            There are two established ways to build this, and both assume a budget
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-mid">
            <strong className="font-semibold text-ink">Train a streaming model.</strong>{" "}
            VideoLLM-online runs each frame through a CLIP tower, pools it to a single vector, and
            appends it to a context that grows as the video plays, with a trained head firing at every
            step to decide whether this is a moment worth speaking at. The temporal grounding, the
            speak-or-stay-quiet decision and the instruction data are all trained artifacts.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            <strong className="font-semibold text-ink">Or reach for a realtime multimodal model.</strong>{" "}
            Serve an open-weights VLM like Qwen3-VL yourself, or rent a hosted live API such as
            Gemini's. Perception here is genuinely solved — a pooled CLIP vector cannot preserve a
            label or a torque figure, and these read both off a phone frame — but you are paying for
            GPUs to serve it, or for a stream metered by the second whether or not anything happened.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The two differ in almost every respect except the one that mattered to me:{" "}
            <strong className="font-semibold text-ink">
              both put the intelligence inside a single model, and both assume hardware or a meter
            </strong>
            . I had a laptop and free-tier API keys.
          </p>

          <div className="mt-6 overflow-x-auto">
            {/* Four columns of prose need room to breathe more than they need
                the body size, so this one stays a step down and scrolls. */}
            <table className="w-full min-w-[42rem] border-collapse text-[13.5px]">
              <thead>
                <tr>
                  {["Approach", "What it needs", "What running it costs", "What you can change"].map((h) => (
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
                {APPROACHES.map((a) => (
                  <tr key={a.name} className={a.ours ? "bg-i2/[0.07]" : undefined}>
                    <td
                      className={`border-b border-rule px-3 py-3 align-top ${
                        a.ours ? "font-semibold text-ink" : "text-ink"
                      }`}
                    >
                      {a.name}
                      <span className="font-hero-mono mt-1 block text-[11px] tracking-wide text-ink-soft">
                        {a.eg}
                      </span>
                    </td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{a.needs}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{a.cost}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{a.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-display mt-9 text-[1.05rem] font-semibold text-ink">
            The third route: composition instead of capacity
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-mid">
            Keep the models hosted and interchangeable, and put the intelligence in the architecture
            between them. That is not only the cheap option — it is the one where{" "}
            <strong className="font-semibold text-ink">
              the behaviour everyone cares about stops being a learned weight and becomes code you can
              read
            </strong>
            . When a trained head speaks at the wrong moment you retrain it. When arithmetic speaks at
            the wrong moment you open the file and change a number, and you can write a test for it.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The same seam buys capabilities neither approach has a natural place for, because the
            reasoning stage is a general tool-calling model rather than a video head:
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {ADDS.map((a) => (
              <li key={a.k} className="flex gap-3 text-[14.5px] leading-relaxed text-ink-mid">
                <span className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-i2" />
                <span>
                  <strong className="font-semibold text-ink">{a.k}</strong> — {a.v}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
            To be fair to the alternatives: hosted live APIs do offer function calling inside a
            session, so tool use is not unique here. The difference worth defending is that this state
            <strong className="font-semibold text-ink"> outlives the session</strong> — it is a file,
            so it survives the connection dropping, the server restarting, and the user closing the
            app and coming back after lunch.
          </p>

          <div className="notch-corner mt-6 border border-i1/30 bg-i1/[0.06] p-5">
            <div className="font-hero-mono mb-2 text-[12px] tracking-wide text-i1">
              WHICH LEAVES ONE HARD PROBLEM
            </div>
            <p className="text-[15px] leading-relaxed text-ink">
              Every job the paper does with training has to move somewhere cheaper. Temporal continuity
              moves into text. Purpose-built instruction data becomes a web search. Elapsed time becomes
              wall-clock subtraction. Those are all fine. But the frame-by-frame decision to speak — the
              paper's whole contribution — has nowhere obvious to go except into the prompt, which is
              exactly where it fails.
            </p>
          </div>

          <h3 className="font-display mt-9 text-[1.05rem] font-semibold text-ink">The solution</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-mid">
            The first version put that decision in the prompt and asked it on every single frame:{" "}
            <em>what do I say about this?</em> That question has an answer every time, which is why it
            narrated. Silence had to be bolted on afterwards — a{" "}
            <code className="font-hero-mono text-[14px]">[SILENT]</code> protocol, a regex to catch the
            model narrating its own silence, and a list of near-variants to strip. Three mechanisms all
            fighting the framing of the prompt they were attached to.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            v2 stops asking it.{" "}
            <strong className="font-semibold text-ink">
              A tick's only job is to make a written record match what is now true
            </strong>{" "}
            — which is a question with a checkable answer, and one a model is good at. Whether the user
            is owed a sentence is then decided separately, from that record, by arithmetic that costs
            no tokens and involves no model. Most ticks correctly produce no speech, and not because
            silence was enforced: producing speech was never the objective being scored.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            That is the substitution for the trained head, and everything else falls out of it. State
            survives restarts because it is a file rather than a conversation. The cost model works
            because the expensive question is asked rarely and the free one continuously. And the
            failure that prompted the rewrite — reading a label into the record and then saying nothing
            about it — became fixable, because the two jobs it was failing to balance are now two
            separate calls.
          </p>

          <div className="notch-corner mt-6 border border-i2/40 bg-i2/[0.07] p-5">
            <p className="font-hero-mono mb-2 text-[12px] tracking-wide text-i2">THE THESIS</p>
            <p className="font-display text-lg leading-snug font-semibold text-ink sm:text-xl">
              If you cannot train the decision to speak, stop asking a model to make it on every
              frame. The document is what is true; speech is a side-effect of it.
            </p>
          </div>
        </section>

        {/* 02 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="02" title="What one tick actually does" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            The diagram above is a still picture of a loop. This is the loop itself: everything between
            a frame arriving and either a sentence or silence, in the order it happens. The two columns
            worth reading down are <strong className="font-semibold text-ink">what each phase costs</strong>{" "}
            and <strong className="font-semibold text-ink">whether the document is locked while it runs</strong>.
          </p>

          <div className="mt-6 flex flex-col gap-[2px]">
            {PHASES.map((p) => (
              <div
                key={p.n}
                className={`grid gap-x-3 gap-y-1 border border-rule border-l-[3px] bg-panel px-4 py-3 sm:grid-cols-[3rem_1fr_9rem] ${
                  p.lock ? "border-l-ink" : "border-l-rule"
                }`}
              >
                <span className="font-hero-mono text-[13px] tabular-nums text-ink-soft">{p.n}</span>
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className="text-[15px] font-semibold text-ink">{p.what}</span>
                  <span
                    className={`font-hero-mono shrink-0 border px-1.5 py-[0.05rem] text-[10px] tracking-[0.1em] uppercase ${PHASE_WHO[p.who].cls}`}
                  >
                    {PHASE_WHO[p.who].label}
                  </span>
                  {p.lock && (
                    <span className="font-hero-mono shrink-0 border border-ink/40 bg-ink/[0.06] px-1.5 py-[0.05rem] text-[10px] tracking-[0.1em] uppercase text-ink">
                      lock held
                    </span>
                  )}
                </div>
                <span className="font-hero-mono text-[11.5px] text-ink-soft sm:text-right">{p.cost}</span>
                <p className="text-[14px] leading-relaxed text-ink-mid sm:col-start-2 sm:col-span-2">
                  {p.why}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            Splitting phase 3b from 3d fixed a failure reported three times, where the model read a
            label into the document and then said nothing about it. One call was being scored on two
            objectives that pull against each other — keep the document accurate, which rewards quiet
            bookkeeping, and decide whether to speak, which rewards noticing the user.{" "}
            <strong className="font-semibold text-ink">
              Silence kept winning, because it was also the stated default for the other job.
            </strong>
          </p>

          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The lock column is the other thing to notice. The document is a single JSON file, so{" "}
            <code className="font-hero-mono text-[14px]">load → mutate → save</code> has to be atomic
            and there is exactly one lock — but it is held only across the three millisecond-long
            phases, and{" "}
            <strong className="font-semibold text-ink">never across a model call</strong>. It used to
            cover the whole tick, which meant a person asking a question queued behind two model round
            trips and any web search they made.
          </p>
          <div className="notch-corner mt-5 border border-i2/40 bg-i2/[0.07] p-5">
            <p className="text-[15px] leading-relaxed text-ink">
              The price of releasing it is that a turn now reasons about a document that may have moved
              by the time it writes — which is why every window reloads from disk, and why the
              document-mutating tools degrade to a harmless{" "}
              <code className="font-hero-mono text-[14px]">"no match"</code> string rather than raising
              when the thing they name is gone.
            </p>
            <p className="mt-3 font-display text-[15px] italic leading-relaxed text-ink">
              Losing a tick's bookkeeping to a race is recoverable — the next frame re-derives it.
              Making the user wait is not.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-mid">
              Measured at the moment a question arrives mid-reasoning, that took time-to-wire from
              2.00 s to 0.01 s.{" "}
              <Link
                to="/case-study/chitragupta/architecture"
                className="border-b border-i2/40 text-i2 transition-colors hover:border-i2"
              >
                How it works
              </Link>{" "}
              has the timeline diagram and the rest of the concurrency argument.
            </p>
          </div>
        </section>

        {/* 03 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="03" title="Aiming a camera you cannot look through" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            The reasoning model cannot see, so it aims the camera in writing, two ways: a standing lens
            describing what the user is physically doing, and discrete watches — conditions put to the
            camera verbatim as questions on every frame until they resolve.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <div>
              <div className="font-hero-mono mb-1.5 text-[12px] tracking-wide text-i2">
                → WHAT THE REASONING MODEL IS ALLOWED TO WRITE
              </div>
              <Wire>{`set_vision_focus(brief = "User is dicing onions on a board at the counter")`}</Wire>
            </div>
            <div>
              <div className="font-hero-mono mb-1.5 text-[12px] tracking-wide text-i5">
                ← AND WHAT THE CAMERA IS ASKED, ON EVERY FRAME
              </div>
              <Wire>{`Q1: FOUND      — <exactly where, plus any label text>
Q1: NOT VISIBLE — <what is in that part of the frame instead>
Q1: UNCLEAR    — <what you can make out, and what is blocking an answer>`}</Wire>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            Three rules here each cost a debugging session. The first is the one I would defend
            hardest:{" "}
            <strong className="font-semibold text-ink">
              a brief must ask for observations, never judgement
            </strong>
            . A model asked “is the grip safe?” reaches for reassurance; asked “are the fingertips
            curled back or extended flat?” it returns a fact. A wrong reassurance is the most damaging
            thing this stage can produce, so the prompt says outright that safe, correct, proper and
            fine are not words the camera is allowed to use.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The second: the reasoning model writes <em>only the activity</em>. When it wrote the whole
            vision block it wrote checklists — “whether a drain pan is directly underneath the filter”
            — which enumerates one imagined arrangement, so a different but perfectly fine setup read
            back as a list of absent items. It cannot see the user's kitchen, so it does not get to
            describe it. The grip and posture wording is standard text attached to every frame.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The third: <code className="font-hero-mono text-[14px]">NOT VISIBLE</code> is a real
            answer, and it is asked <em>first</em>, before the description. Without an explicit
            question the brief arrived as a soft “these are relevant” nudge and nothing sharp came
            back. Observed live: the user wanted black-eyed beans, the caption said{" "}
            <em>“several bags of lentils”</em>, and the reasoning model — with no answer to read —
            upgraded that into <em>“I can see the beans”</em>.{" "}
            <strong className="font-semibold text-ink">
              An inference stood in for an observation because no question was posed.
            </strong>
          </p>

          <div className="notch-corner mt-5 border border-rule-hard bg-panel p-4 text-[14px] leading-relaxed text-panel-mid">
            <b className="text-ink">Which is why nothing but the camera can mark a find.</b> The model
            can open a search and cancel one; there is no tool that sets an item to <i>found</i>. Only
            plain string matching over the caption does that — zero tokens, and no model-facing door
            for an inference to walk through. When a find lands, speech is forced: it routes to a
            prompt that never offers silence, and if the model declines or errors anyway the server
            speaks a deterministic sentence built from the location the camera wrote. A forced path the
            model can talk its way out of is not forced.
          </div>
        </section>

        {/* 04 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="04" title="Plans are proposed, not written" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            The model writes two categorically different things, and they need different rules.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            <strong className="font-semibold text-ink">Observations</strong> — a caption, an
            environment fact, a resolved expectation — are reports of what it saw. They write silently
            and immediately, because gating them on approval would turn every tick into a permission
            prompt and destroy the point of a hands-free assistant.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            <strong className="font-semibold text-ink">A plan</strong> is a decision about how the user
            spends the next hour, made from a photograph and a web search. Once it lands in the task
            list it is re-injected into every later prompt as settled fact — so the model reads its own
            guess back as memory and holds the user to it.
          </p>
          <div className="mt-6">
            <Wire>{`propose_plan  → a proposal, NOT tasks. Nothing tracks it, no expectations.
                Must be said out loud in the same reply — the user cannot see it.
commit_plan   → promotes it to real tasks. Fires on assent, including the
                implicit kind: “yes”, “go on”, or visibly starting step one.
discard_plan  → drops it.`}</Wire>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            An unanswered proposal re-raises itself every 150 seconds, because this is the one silence
            that costs the user something rather than sparing them: the assistant is blocked on them,
            they have no idea it is waiting, and nothing is being tracked in the meantime. And{" "}
            <strong className="font-semibold text-ink">a tick may only commit on visibly starting step
            one</strong> — a frame cannot tell you someone said yes.
          </p>
        </section>

        {/* 05 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="05" title="What one live session actually showed" />
          <p className="mb-2 text-[15px] leading-relaxed text-ink-mid">
            v2 has been run against real traffic once — an eighteen-minute chicken-curry session on
            2026-08-10, exported as fifty-six entries. Six things it got right and three it did not,
            from the same eighteen minutes. Quoted from that export, via this project's decision log.
          </p>
          <div className="mt-6 flex flex-col gap-[2px]">
            {EVIDENCE.map((e) => (
              <div
                key={e.quote}
                className={`grid gap-2 border border-rule border-l-[3px] bg-panel px-4 py-3.5 sm:grid-cols-[1fr_1fr] sm:gap-x-5 ${
                  e.ok ? "border-l-i3" : "border-l-i1"
                }`}
              >
                <p className="font-hero-mono m-0 text-[13px] leading-relaxed text-ink">“{e.quote}”</p>
                <p className="m-0 text-[14px] leading-relaxed text-ink-mid">{e.proves}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">
            The export is the highest-value artifact in this project. It carries every vision prompt
            and answer, silent ticks included, plus the document as it stood — and reading it top to
            bottom is how the contradictions were found. No single turn shows them; only the sequence
            does.
          </p>
        </section>

        {/* 06 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="06" title="Every architectural decision traces back to a number" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            The vision model is the only thing here that costs real money, and in this split it does
            nothing but look at pictures — so its prompt tokens <em>are</em> the per-frame bill. Image
            cost scales with{" "}
            <strong className="font-semibold text-ink">resolution, not file size</strong>: compressing
            the JPEG harder buys nothing at all, which took measurement to establish rather than
            assumption. Quality is fixed and is not a lever.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            So the close-up tier is opt-in, and the resolution decision has to reach the browser{" "}
            <em>before</em> the next capture — resolution discarded in the client can never be
            recovered on the server, and nothing can upscale a label back. The frame that causes an
            upgrade is therefore itself coarse.
          </p>

          <div className="notch-corner mt-6 border border-i1/30 bg-i1/[0.06] p-5">
            <div className="font-hero-mono mb-1.5 text-[12px] tracking-wide text-i1">
              THE CONSTRAINT THAT REWROTE THE PROVIDER LAYER
            </div>
            <p className="text-[15px] leading-relaxed text-ink">
              A v2 tick is roughly 1,440 tokens against the free tier's 8,000-per-minute cap — one tick
              every eleven seconds, against a four-second interval — and its 200,000-per-day cap works
              out to about <strong className="font-semibold">139 ticks total, per day</strong>. v2 ticks
              continuously by design. It is a fundamentally heavier vision consumer than v1 and cannot
              run there at all.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">
              It ran there anyway, and the session died eighteen minutes in on a rate limit.{" "}
              <strong className="font-semibold">Nothing was wrong on disk</strong> — every config file
              said the right provider, so there was no artifact anyone could inspect and find a mistake
              in. That is the actual defect: the system had a hard requirement and no point at which it
              compared that requirement against reality.
            </p>
            <p className="mt-3 font-display text-[15px] italic leading-relaxed text-ink">
              The default nobody sets must be the one that works. It defaulted to the one configuration
              that cannot.
            </p>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            Three changes came out of it, and the middle one is the reusable part.{" "}
            <em>Which provider gets the pixels</em> was not a question any code could have answered:
            the class name, the mode string and the module name all fail to tell you, because the
            hybrid backend extends the other one and replaces a client its parent constructed. Backends
            now declare it. And v2 refuses to start on the wrong one, unless an environment variable
            says the choice was deliberate — arriving there is the bug; choosing it for a one-off
            comparison is legitimate.
          </p>
          <div className="mt-4">
            <Wire>{`Initialized live agent | backend mode: deepinfra | VISION ON: deepinfra
                    | reasoning: deepseek-v4-flash`}</Wire>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            Every character in that check is ASCII. The first version used arrows and section marks,
            and printing it on a Windows console raised a <code className="font-hero-mono">UnicodeEncodeError</code> —
            a diagnostic that crashed while reporting the problem it existed to explain.
          </p>
        </section>

        {/* 07 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="07" title="Every trained mechanism, and where it had to move" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            This is the substitution table the whole project is: six things VideoLLM-online does with
            training, and what each one became once training was off the table. Read against the
            paper, <strong className="font-semibold text-ink">the substitutions are the argument</strong>.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            Worth saying plainly: I went back and examined the streaming architecture again while
            building v2, as a route to real-time, and rejected it{" "}
            <em>on the merits rather than on budget</em>. Two of the rows below would still be the
            right call with a rack of GPUs behind them.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-[14px]">
              <thead>
                <tr>
                  {["The paper does", "Why not here", "What v2 does instead"].map((h) => (
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
                {PAPER_ROWS.map((r) => (
                  <tr key={r.paper}>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{r.paper}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-soft">{r.why}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink">{r.instead}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The genuine lesson taken from it is the one about latency:{" "}
            <strong className="font-semibold text-ink">speech latency is not a real ceiling</strong>.
            Streaming the reply to synthesis lets the assistant talk while the next frame is already
            being processed. That is designed and not yet built, and it is the next thing.
          </p>
        </section>

        {/* 08 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="08" title="Go deeper" />
          <div className="flex flex-col gap-4">
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="notch-corner flex items-center justify-between gap-4 border border-i2/50 bg-i2/[0.07] p-5 transition-colors hover:border-i2 sm:p-6"
            >
              <div>
                <div className="font-display text-lg font-semibold text-ink">
                  Run the prototype &rarr;
                </div>
                <p className="mt-1 text-[15px] leading-relaxed text-panel-mid">
                  The deployed v2 instance. Two things to know before you click:{" "}
                  <strong className="font-semibold text-ink">
                    open it on a phone
                  </strong>{" "}
                  — it wants a camera, a microphone and a secure context, and a laptop webcam
                  pointed at your face is not the thing it was built for. And it is a free-tier
                  host that sleeps after about fifteen minutes, so the first request can take the
                  better part of a minute to wake it before anything happens.
                </p>
              </div>
              <ExternalLink size={18} className="shrink-0 text-i2" aria-hidden="true" />
            </a>
            <Link
              to="/case-study/chitragupta/architecture"
              className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i2/60 sm:p-6"
            >
              <div>
                <div className="font-display text-lg font-semibold text-ink">How it works &rarr;</div>
                <p className="mt-1 text-[15px] leading-relaxed text-panel-mid">
                  The document itself, section by section; what one tick costs and where; the fifteen
                  tools; and the four designs rejected along the way.
                </p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-i2" aria-hidden="true" />
            </Link>
            <Link
              to="/case-study/chitragupta/failure-log"
              className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i2/60 sm:p-6"
            >
              <div>
                <div className="font-display text-lg font-semibold text-ink">What broke &rarr;</div>
                <p className="mt-1 text-[15px] leading-relaxed text-panel-mid">
                  Ten failures with the symptom, the root cause, and the rule each one produced — plus
                  the rules v1 left behind and where they still bind.
                </p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-i2" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* 09 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="09" title="Early, and specific about it" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="notch-corner border border-i3/40 bg-i3/[0.06] p-5">
              <div className="font-hero-mono mb-3 text-[12px] tracking-wide text-i3">
                CONFIRMED IN THE ONE LIVE SESSION
              </div>
              <ul className="flex flex-col gap-2">
                {PROVEN.map((p) => (
                  <li key={p} className="flex gap-2 text-[14px] leading-relaxed text-ink">
                    <span className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-i3" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="notch-corner border border-rule-hard bg-panel p-5">
              <div className="font-hero-mono mb-3 text-[12px] tracking-wide text-ink-soft">NOT PROVEN</div>
              <ul className="flex flex-col gap-2">
                {UNPROVEN.map((p) => (
                  <li key={p} className="flex gap-2 text-[14px] leading-relaxed text-ink-mid">
                    <span className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-rule-hard" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            v1 still runs, on its own routes, and is not being developed. It is kept because it is the
            control: it is the version that narrated, and the argument for everything above is that it
            stopped.
          </p>
        </section>

        {/* 10 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="10" title="What this demonstrates" />
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <span
                key={s}
                className="font-hero-mono border border-rule-hard px-2.5 py-1 text-[11px] tracking-wide text-ink-mid"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            The one I would point at first: I once spent a session unable to explain why the assistant
            lost its memory — so I shipped instrumentation instead of a fix, because{" "}
            <em>“the model ignored the task list”</em> and{" "}
            <em>“the task list never reached the prompt”</em> look identical from a transcript and need
            opposite repairs. The provider bug above is the same shape, one version later, and this
            time the answer was to make the system check its own requirement out loud at startup.
          </p>

          <h3 className="font-display mt-9 text-[1.05rem] font-semibold text-ink">
            Where the async is actually load-bearing
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            A framework name in a list proves nothing. This one runs a single worker with a camera
            firing on an interval and a person able to interrupt it at any moment, so concurrency is a
            correctness problem, not a résumé line.
          </p>
          <div className="mt-4 flex flex-col gap-[2px]">
            {ASYNC_USES.map((a) => (
              <div
                key={a.k}
                className="grid gap-1 border border-rule border-l-[3px] border-l-i2 bg-panel px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-x-5"
              >
                <span className="font-hero-mono text-[13px] text-i2">{a.k}</span>
                <span className="text-[14px] leading-relaxed text-ink-mid">{a.v}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-rule-hard pt-8">
          <Link
            to="/"
            className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
          >
            <ArrowLeft size={13} /> Back to portfolio
          </Link>
        </footer>
      </main>
    </div>
  );
}
