import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, Pause, Play, RotateCcw } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

/* ── The replay ───────────────────────────────────────────────────────────
 * Three excerpts from one real 40-minute phone session, 2026-07-28. Every
 * line is copied out of the session export: the user's words, both models'
 * traffic, the client's resolution switch, and one wrong answer left in.
 * Camera frames are excluded for privacy — the text pipeline is the point. */

type Who = "user" | "reason" | "vision" | "client";

type Beat = {
  who: Who;
  label: string;
  text: string;
  gloss?: string;
  refused?: boolean;
};

type Scene = { name: string; tab: string; beats: Beat[] };

const SCENES: Scene[] = [
  {
    name: "Reading a foreign-language label",
    tab: "Reading a label",
    beats: [
      {
        who: "user",
        label: "User",
        text: "every label here that you are going to see is in German but my German is bad… I don't eat beef so here it is called rainflyish or something like that so you should help check things",
      },
      {
        who: "reason",
        label: "Reasoning",
        text: "\"Rainflyish\" is Rindfleisch — that's German for beef, so that's the one thing you need to avoid.",
        gloss: "Decodes a phonetic guess into the correct German term before anything else happens.",
      },
      {
        who: "reason",
        label: "Reasoning → brief",
        text: 'watch_for: "Read every German label clearly. Report the product name and all ingredients. Flag if you see: Rindfleisch, Rind, Rinder-, Kalb, Kalbs-, or any other beef-related word. Also check for gelatin (Gelatine)."',
        gloss:
          "This is the whole idea. The reasoning model cannot see the camera, so it writes a brief for the model that can — expanded into every morphological variant, because the vision model knows nothing about the conversation.",
      },
      {
        who: "reason",
        label: "Reasoning → cost",
        text: 'detail: "fine"',
        gloss:
          "A spending decision, made mid-conversation. Small print needs resolution that a normal frame doesn't carry.",
      },
      {
        who: "client",
        label: "Camera",
        text: "frame detail → fine · live ticks now 1024px",
        gloss:
          "The decision has to reach the browser before capture. Resolution thrown away on the client can never be recovered on the server.",
      },
      {
        who: "vision",
        label: "Vision",
        refused: true,
        text: 'This frame is significantly more blurred and shaky… Because no words are legible, I cannot verify the presence of beef terms ("Rindfleisch") or gelatin ("Gelatine"). Consequently, I cannot assign a safe or unsafe verdict to any items in this shot.',
        gloss:
          "It refuses. On a dietary restriction, a confident guess is the dangerous answer — so the prompt forbids reporting absence it cannot actually see.",
      },
      {
        who: "vision",
        label: "Vision",
        text: 'The image is now sharply in focus… The product is identified as Surimi containing "Fish Meat" as the primary ingredient. There is no presence of beef, Rind, Gelatine, or any related terms in the visible ingredients list.',
        gloss: "Next frame, refocused. It reads the actual packaging.",
      },
      {
        who: "reason",
        label: "Reasoning",
        text: "Hey! That surimi package you're looking at — it's all fish meat, no beef or Rindfleisch in sight, so you're totally safe.",
        gloss: "Spoken aloud by a model that never saw the picture.",
      },
    ],
  },
  {
    name: "Finding something in the room",
    tab: "Searching for an object",
    beats: [
      { who: "user", label: "User", text: "help me find the dal please" },
      {
        who: "reason",
        label: "Reasoning",
        text: 'Let me start looking for it. Point your camera around your kitchen and I\'ll tell you when I see the toor dal.\n\n→ request_live_search(target: "toor dal")',
        gloss: "The model turns the camera on itself. Nobody pressed a button.",
      },
      {
        who: "reason",
        label: "Reasoning → brief",
        text: "OBJECT DETECTION. Target(s) to find: toor dal.\nReply in EXACTLY one line, in one of these two forms and nothing else:\nFOUND: <where the target is in the frame>\nNOT FOUND: <what is in view instead>",
        gloss:
          "A different brief shape from the label scene — a rigid one-line contract instead of an open question. Searching runs on every frame, so the reply has to stay small enough to be cheap.",
      },
      { who: "vision", label: "Vision", text: "FOUND: in a plastic bag on the counter" },
      {
        who: "reason",
        label: "Reasoning → memory",
        text: 'log_observation(note: "something in a plastic bag on the counter — could be the toor dal", alert: false)',
        gloss:
          "Written down, not spoken. Two separate flags decide whether a note is worth interrupting the user for — conflating them once turned the camera off mid-recipe.",
      },
      {
        who: "reason",
        label: "Reasoning",
        text: "Hey, I see the toor dal — it's right there in the clear plastic bag on the counter.\n\n→ found: true · camera closes",
        gloss: "Confident enough now to speak, and to end the search.",
      },
      {
        who: "user",
        label: "User",
        text: "the thing in the plastic bag is black eyed beans not tor dal",
        gloss:
          "It was wrong. The detector reports where something is, not what it is — and nothing in the system retracts a wrong find, so the mistake outlived the correction. That gap is the top item in the failure log, and it is why this page says early.",
      },
    ],
  },
  {
    name: "Choosing tools, with nothing useful in frame",
    tab: "When the camera sees nothing",
    beats: [
      {
        who: "user",
        label: "User",
        text: "can you help me with this process I am using a pressure cooker or a bowl for cleaning… which one is better can you help me choose the utensils for this",
      },
      {
        who: "reason",
        label: "Reasoning → brief",
        text: 'watch_for: "Show me the cup they are using to measure. Tell me how they are scooping and if water is running clear during rinsing."',
        gloss:
          "Three observations requested, none of them judgements. The vision model reports; the reasoning model decides what it means.",
      },
      {
        who: "vision",
        label: "Vision",
        refused: true,
        text: "A measuring cup is not visible in the frame. I cannot tell how anything is being scooped. I cannot tell if water is running or its clarity. No rinsing action is currently visible.",
        gloss:
          "Four honest negatives. The easy failure here is inventing a plausible kitchen — this is the behaviour the prompt is built to protect.",
      },
      {
        who: "reason",
        label: "Reasoning",
        text: "A regular vegetable colander with big holes won't work for lentils since they'll fall through — so stick with the bowl or a fine strainer. A pressure cooker is actually perfect for toor dal.",
        gloss:
          "The camera gave it nothing, so it answers from knowledge and never claims to have seen anything. Being useful and being honest are not in tension here.",
      },
      { who: "user", label: "User", text: "What is a colander?" },
      {
        who: "reason",
        label: "Reasoning",
        text: "A colander is just a bowl with small holes in it — you use it to drain water away from food while keeping the food inside. But like I said, a regular bowl works too.",
        gloss: "It used a word the user didn't have, noticed, and backed up without restarting the task.",
      },
      { who: "user", label: "User", text: "why does my cooker foam up like that" },
      {
        who: "reason",
        label: "Reasoning → state",
        text: 'note: "Soaking now, will cook after 3:00 PM. Add 1 tsp oil/ghee before pressurizing to prevent foam eruption."',
        gloss:
          "The answer to a side question, but it wasn't only spoken — it was written onto a step hours away, where it will be read back at the moment it matters. State lives in a file on disk, not in the conversation.",
      },
    ],
  },
];

const WHO_STYLE: Record<Who, { border: string; label: string; bg: string }> = {
  user: { border: "border-l-rule-hard", label: "text-ink-soft", bg: "" },
  reason: { border: "border-l-i2", label: "text-i2", bg: "bg-i2/[0.05]" },
  vision: { border: "border-l-i5", label: "text-i5", bg: "bg-i5/[0.05]" },
  client: { border: "border-l-rule", label: "text-ink-soft", bg: "" },
};

const VISIBLE = 4;

function Replay() {
  const [scene, setScene] = useState(0);
  const [idx, setIdx] = useState(0);
  // Autoplays: the replay is the evidence, and a reader who has to press play
  // before seeing any is a reader who scrolls past it.
  const [playing, setPlaying] = useState(true);
  const timer = useRef<number | undefined>(undefined);

  const beats = SCENES[scene].beats;
  const last = beats.length - 1;

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!playing || idx >= last) {
      if (playing && idx >= last) setPlaying(false);
      return;
    }
    // Long lines need longer on screen; the brief and the refusal are the ones
    // worth pausing on, so length is a fair proxy for weight here.
    const dwell = Math.min(7800, 2300 + beats[idx].text.length * 26);
    timer.current = window.setTimeout(() => setIdx((i) => i + 1), dwell);
    return () => window.clearTimeout(timer.current);
  }, [playing, idx, last, beats]);

  function pick(i: number) {
    setScene(i);
    setIdx(0);
    setPlaying(true);
  }

  const start = Math.max(0, idx - VISIBLE + 1);
  const shown = beats.slice(start, idx + 1);

  return (
    <div className="notch-corner border border-rule-hard bg-panel">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule px-4 py-2.5">
        <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-i2" aria-hidden="true" />
        <span className="font-hero-mono text-[12px] tracking-wide text-ink">{SCENES[scene].name}</span>
        <span className="font-hero-mono ml-auto text-[12px] tracking-wide text-ink-soft">
          captured 2026-07-28 · verbatim
        </span>
      </div>

      <div className="flex flex-wrap border-b border-rule" role="tablist" aria-label="Session excerpts">
        {SCENES.map((s, i) => (
          <button
            key={s.tab}
            type="button"
            role="tab"
            aria-selected={i === scene}
            onClick={() => pick(i)}
            className={`font-hero-mono border-b-2 px-3.5 py-2.5 text-[12px] tracking-wide whitespace-nowrap transition-colors ${
              i === scene
                ? "border-b-i2 text-i2"
                : "border-b-transparent text-ink-soft hover:text-ink"
            }`}
          >
            <span className="mr-1.5 tabular-nums opacity-50">{i + 1}</span>
            {s.tab}
          </button>
        ))}
      </div>

      <div
        className="flex min-h-[24rem] flex-col gap-2 p-3 sm:min-h-[22rem]"
        role="tabpanel"
        aria-label={SCENES[scene].name}
        aria-live="polite"
      >
        {shown.map((b, n) => {
          const style = WHO_STYLE[b.who];
          const isCurrent = start + n === idx;
          return (
            <div
              key={`${scene}-${start + n}`}
              className={`grid gap-y-1 border-l-2 px-3 py-2.5 transition-opacity duration-300 sm:grid-cols-[8.5rem_1fr] sm:gap-x-4 ${
                b.refused ? "border-l-i1 bg-i1/[0.05]" : `${style.border} ${style.bg}`
              } ${isCurrent ? "opacity-100" : "opacity-45"}`}
            >
              <div
                className={`font-hero-mono text-[11px] tracking-wider uppercase ${
                  b.refused ? "text-i1" : style.label
                }`}
              >
                {b.label}
              </div>
              <div className="font-hero-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-ink">
                {b.text}
              </div>
              {b.gloss && isCurrent && (
                <p className="mt-1 text-[13px] leading-relaxed text-ink-mid italic sm:col-start-2">{b.gloss}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-rule px-4 py-2.5">
        <button
          type="button"
          onClick={() => {
            if (idx >= last) {
              setIdx(0);
              setPlaying(true);
            } else setPlaying((p) => !p);
          }}
          className="font-hero-mono inline-flex items-center gap-1.5 border border-rule-hard px-3 py-1.5 text-[11px] tracking-wider uppercase text-ink transition-colors hover:border-i2 hover:text-i2"
        >
          {idx >= last ? <RotateCcw size={12} /> : playing ? <Pause size={12} /> : <Play size={12} />}
          {idx >= last ? "Replay" : playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          disabled={idx <= 0}
          onClick={() => {
            setPlaying(false);
            setIdx((i) => Math.max(0, i - 1));
          }}
          className="font-hero-mono inline-flex items-center gap-1.5 border border-rule-hard px-3 py-1.5 text-[11px] tracking-wider uppercase text-ink transition-colors hover:border-i2 hover:text-i2 disabled:opacity-30 disabled:hover:border-rule-hard disabled:hover:text-ink"
        >
          <ArrowLeft size={12} /> Prev
        </button>
        <button
          type="button"
          disabled={idx >= last}
          onClick={() => {
            setPlaying(false);
            setIdx((i) => Math.min(last, i + 1));
          }}
          className="font-hero-mono inline-flex items-center gap-1.5 border border-rule-hard px-3 py-1.5 text-[11px] tracking-wider uppercase text-ink transition-colors hover:border-i2 hover:text-i2 disabled:opacity-30 disabled:hover:border-rule-hard disabled:hover:text-ink"
        >
          Next <ArrowRight size={12} />
        </button>
        <div className="ml-auto flex gap-[3px]" aria-hidden="true">
          {beats.map((b, i) => (
            <span
              key={b.label + i}
              className={`h-[3px] w-3.5 ${i <= idx ? "bg-i2" : "bg-rule"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Static content ───────────────────────────────────────────────────── */

const STATS = [
  { num: "$0", unit: "/mo", label: "infrastructure cost — free tiers end to end, which is the constraint the architecture is built around" },
  { num: "200k", unit: "/day", label: "vision-token ceiling. In this split the vision model does nothing but look at pictures, so images are the whole budget" },
  { num: "2.4", unit: "×", label: "measured cost of a close-up frame against a normal one — 3,424 tokens versus roughly 1,400" },
  { num: "21", unit: "/42", label: "camera ticks in one live session that correctly produced no speech at all" },
];

/* One task, start to finish. Changing a tyre rather than cooking, because the
 * point is that nothing in the system is task-specific — and because a reader
 * who only ever sees kitchen examples assumes it is a recipe app. */
type Actor = "reason" | "vision" | "tool" | "client";

const ACTOR: Record<Actor, { label: string; cls: string }> = {
  reason: { label: "reasoning", cls: "border-i2/50 bg-i2/[0.09] text-i2" },
  vision: { label: "vision", cls: "border-i5/50 bg-i5/[0.09] text-i5" },
  tool: { label: "tool", cls: "border-rule-hard bg-panel text-ink-mid" },
  client: { label: "browser", cls: "border-rule-hard bg-panel text-ink-mid" },
};

const WALKTHROUGH: { actor: Actor; title: string; what: string; why: string }[] = [
  {
    actor: "reason",
    title: "You say what you are doing",
    what: "“I need to change a tyre.” It breaks the job into steps and writes them to a document on disk.",
    why: "The task list is state, not conversation. It is written to a file and injected into every later prompt, so the model never has to remember — or ask.",
  },
  {
    actor: "tool",
    title: "It looks up what it doesn't know",
    what: "If the procedure isn't something it can be trusted on, it searches the web and reads a page before planning.",
    why: "VideoLLM-online needed instruction data purpose-built for every task it could assist with. Searching at runtime means this can attempt a task nobody prepared data for — which is what makes “any hands-on task” plausible instead of a slogan.",
  },
  {
    actor: "reason",
    title: "It decides it needs to see, and opens the camera itself",
    what: "No button. The model calls a tool that turns the camera on, because the next step is one it cannot advise on blind.",
    why: "Your hands are on a wheel brace. Any design that requires you to operate a phone at this moment has already failed at the thing it exists for.",
  },
  {
    actor: "reason",
    title: "It writes a brief for eyes it does not have",
    what: "“Report which tools are in frame.” Or, on a step where technique matters: “Watch their hands and tell me what they are actually doing.”",
    why: "This is the only channel between the two models. The reasoning model knows the task but cannot see; the vision model can see but knows nothing. The brief asks for observations and never for a verdict — a model asked whether something is safe will answer whether or not the frame supports it.",
  },
  {
    actor: "vision",
    title: "The frame becomes about forty words of text",
    what: "“FOUND: wheel brace on the ground, left of frame.” The pixels are discarded at this line.",
    why: "Hosted APIs cannot reuse image tokens between calls, so keeping a visual history is impossible. Keeping a text history is nearly free — which is what lets it answer “where did I put the brace?” an hour later.",
  },
  {
    actor: "reason",
    title: "It decides whether that is worth saying out loud",
    what: "Nothing new, so the entire reply is the literal string [SILENT] and you hear nothing. Something changed, so it speaks.",
    why: "An assistant that narrates every frame is both unusable and unaffordable. Silence is the default and has to be earned out of.",
  },
  {
    actor: "client",
    title: "It closes the camera — or deliberately keeps it open",
    what: "A “find the jack” goal ends the moment the jack is found. A “watch me tighten these” step stays open until the step is done.",
    why: "The camera is the only part of this that costs real money. Whether it stays on is a spending decision, and the model makes it — which is also exactly where the cost control has failed before.",
  },
  {
    actor: "tool",
    title: "When the task has to wait, it sets an alarm for itself",
    what: "Torque the bolts after lowering the car. Potatoes on for twelve minutes. The timer carries the reason it exists, not just a duration.",
    why: "Tracking elapsed time is the thing VideoLLM-online is weakest at — a streaming model watching frames has no reliable clock. A wall-clock timer sidesteps it entirely: it stores a start and a duration, survives a restart, and checking it is subtraction, not inference.",
  },
];

const PAPER_ROWS = [
  {
    paper: "KV-cached frame history",
    why: "Hosted APIs cannot reuse image tokens across calls",
    instead: "Convert each frame to one short text fact, discard the pixels, accumulate only the text",
  },
  {
    paper: "Trained speak / stay-silent decision",
    why: "No training budget",
    instead: "A silence protocol at prompt level, plus triggers that are pure arithmetic and cost nothing",
  },
  {
    paper: "Inference on every frame",
    why: "200,000 tokens per day, total",
    instead: "A perceptual diff gate in the browser — an unchanged scene never becomes a request at all",
  },
  {
    paper: "DeepStack fine-detail attention",
    why: "Fixed resolution per call",
    instead: "A coarse/fine tier the reasoning model opts into per step, when it needs to read something small",
  },
  {
    paper: "A CLIP encoder, pooled to a handful of tokens per frame",
    why: "Too little context to answer a real question about a frame",
    instead: "A vision-language model that reads the scene and writes prose about it — which also turns a text-only reasoning model into a multimodal one",
  },
  {
    paper: "Instruction data built specifically for the tasks it assists with",
    why: "No dataset, no budget to build one",
    instead: "It searches the web at runtime, so it can attempt a task nobody prepared data for",
  },
  {
    paper: "Tracking elapsed time from the frame stream",
    why: "The paper's weakest point, and it does not get better on a sampled feed",
    instead: "A wall-clock timer the model sets for itself, carrying the reason it exists. Checking it is subtraction, not inference",
  },
];

const PROVEN = [
  "The two-model pipeline end to end, on a phone, over a real 40-minute session",
  "Reading a foreign-language ingredient list on demand, at a resolution the model chose itself",
  "Refusing to answer off a frame too blurred to read, on a dietary-restriction question",
  "Staying silent on 21 of 42 camera ticks with an active goal",
  "Persisted task state surviving restarts, read back without being prompted",
];

const UNPROVEN = [
  "Continuous conversation. The mic is push-to-talk; the camera loop is the only thing that runs on its own, and making that solid is the current work",
  "Timers and scheduling — implemented, never exercised in a real run",
  "A second architecture that passes a 27-check smoke test and has never seen live traffic",
  "No automated test suite; verification is throwaway harnesses plus reading session exports",
  "Two known failure modes still open, both documented in the failure log",
];

const SKILLS = [
  "Multi-model pipeline design",
  "LLM cost engineering",
  "Agent tool-calling & persistent state",
  "Prompt engineering from failure data",
  "Observability for non-deterministic systems",
  "Debugging silent cross-service failures",
  "Hallucination mitigation",
  "Research → production translation",
  "Python · FastAPI · asyncio",
  "Vision-language models",
];

/* Added because the skills strip on its own is exactly the unevidenced-adjective
 * move this site is supposed to avoid. "async" is a real claim here, so it gets
 * the three places it is actually load-bearing. */
const ASYNC_USES = [
  {
    k: "asyncio.Lock",
    v: "One turn mutates timers and the task list at a time. It is not reentrant, so every internal caller has to use a _locked variant — getting that wrong deadlocks the whole server rather than failing loudly.",
  },
  {
    k: "asyncio.to_thread",
    v: "Network tools are flagged blocking=True and dispatched to a thread. Before that they ran on the event loop, so one slow web search stalled every 4-second camera tick and the timer poll queued behind it.",
  },
  {
    k: "StreamingResponse",
    v: "The typed-chat path is Server-Sent Events over an async generator, so reasoning tokens and tool calls appear as they are produced. Camera ticks deliberately do not use it — they are usually silent.",
  },
];

function Wire({ children }: { children: React.ReactNode }) {
  return (
    <div className="notch-corner-sm overflow-x-auto border border-rule-hard bg-paper-hi px-4 py-3">
      <pre className="font-hero-mono m-0 text-[12.5px] leading-relaxed whitespace-pre-wrap text-ink">{children}</pre>
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
        <div className="notch-corner relative overflow-hidden border border-rule-hard bg-panel px-6 py-12 text-center">
          <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i2">ENGINEERING CASE STUDY · IN DEVELOPMENT</p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">Chitragupta</h1>
          <p className="font-display mt-3 text-lg italic text-panel-text">
            The model that reads the label can't reason. The one that reasons never sees.
          </p>
          <div className="signal-bar mx-auto mt-5 w-24" />
          <p className="font-hero-mono mt-4 text-[12px] tracking-wide text-panel-mid">
            HYBRID VISION PIPELINE · SELF-WRITTEN VISION BRIEFS · GROQ QWEN3.6 + DEEPSEEK V4
          </p>
        </div>

        <p className="font-display mt-10 text-lg leading-relaxed text-ink sm:text-xl">
          A hands-free camera assistant for when your hands are busy. It watches through a phone
          camera, tracks what is in flight — steps, substitutions, timers — and talks back. The user
          is{" "}
          <mark className="box-decoration-clone bg-i2/20 px-1 text-ink">listening, not reading</mark>,
          which turns out to drive almost every design decision in the system.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
          The category is not new — Ray-Ban Meta and Gemini Live got here first, with budgets to
          match. The approach is:{" "}
          <strong className="font-semibold text-ink">
            two models that cannot see what the other sees, and a protocol between them designed so
            this runs continuously on a hard cost ceiling
          </strong>{" "}
          instead of always-on inference. Everything below is measured from one real session on a
          phone, not from a scripted demo.
        </p>

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
          <SectionHead num="01" title="Watch it work, in its own words" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            Three excerpts from one 40-minute session. Every line is copied out of the export — the
            user's words, both models' traffic, the client's resolution switch, and one wrong answer
            left in. Camera frames are excluded for privacy; the text pipeline is the point.
          </p>
          <Replay />
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            The three tabs are deliberately different shapes of problem: an open brief that reads
            small print, a rigid one-line detection contract, and a turn where the camera supplied
            nothing usable at all.
          </p>
        </section>

        {/* 02 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="02" title="One coordinator, and tools it can reach for" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            There is no orchestrator and no pipeline of stages. There is{" "}
            <strong className="font-semibold text-ink">one model acting as a coordinator</strong> — it
            holds what the job is, what has already happened, and what is still outstanding, and it
            reaches for a tool when it needs something it does not have. Eyes. A clock. A fact it was
            never trained on.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
            Nothing in it is task-specific. The same loop is meant to cover cooking, ironing a shirt,
            a supermarket aisle, or a wheel change on a verge. Below is one task end to end — what
            happens at each step, and, more usefully,{" "}
            <strong className="font-semibold text-ink">why that step exists at all</strong>.
          </p>

          <ol className="mt-7 flex list-none flex-col gap-5 p-0">
            {WALKTHROUGH.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.2rem_1fr] gap-x-3 gap-y-1.5 sm:gap-x-4">
                <span className="font-hero-mono pt-[0.15rem] text-[13px] tabular-nums text-ink-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display flex-1 text-[1.05rem] font-semibold text-ink sm:text-[1.12rem]">
                    {s.title}
                  </h3>
                  <span
                    className={`font-hero-mono shrink-0 border px-1.5 py-[0.05rem] text-[10px] tracking-[0.1em] uppercase ${ACTOR[s.actor].cls}`}
                  >
                    {ACTOR[s.actor].label}
                  </span>
                </div>
                <p className="col-start-2 text-[14px] leading-relaxed text-ink-mid">{s.what}</p>
                <p className="col-start-2 border-l-2 border-l-i2 pl-3 text-[13px] leading-relaxed text-ink-soft">
                  <span className="font-hero-mono mr-2 text-[10px] tracking-[0.1em] uppercase text-i2">why</span>
                  {s.why}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-7 text-[14px] leading-relaxed text-ink-mid">
            Steps 4 to 7 are the loop that repeats. Everything else happens once. And the two tools
            that look least impressive on a list —{" "}
            <code className="font-hero-mono text-[13px]">web_search</code> and{" "}
            <code className="font-hero-mono text-[13px]">start_timer</code> — are the two doing the
            most work against the paper this is built on: one removes the need for purpose-built
            training data, the other removes the need for the model to track time at all.
          </p>
        </section>

        {/* 04 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="03" title="Why two models, and not one" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            The original design ran one vision-language model for everything. It could not survive
            its own provider's per-minute cap: 8,000 tokens covering input and output together, shared
            across the image, the conversation history, the tool schemas and the task list. The
            completion budget alone exceeded it before a single prompt token was counted.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
            The fix was not a smaller prompt. It was splitting the job so that{" "}
            <strong className="font-semibold text-ink">
              only the small, image-only request has to fit under that ceiling
            </strong>
            . One model looks at the picture and writes about forty words of text. A second model —
            on a provider with no comparable cap — does all the reasoning and every tool call, and
            never sees a pixel in its life.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
            Running the vision model alone for everything was tried first, and it lost on both
            counts: the reasoning was noticeably worse, and it ran out of tokens doing it. The split
            is not only a cost dodge — it lets each side be chosen for what it is good at.{" "}
            <strong className="font-semibold text-ink">
              It also makes a text-only model behave like a multimodal one
            </strong>
            , which is the part I find most reusable: the reasoning provider's caching and thinking
            budget stay available, and vision is bolted on as a text-producing service in front of
            it.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="notch-corner border border-i5/40 bg-i5/[0.06] p-5">
              <div className="font-hero-mono text-[12px] tracking-wide text-i5">STAGE 1 · VISION</div>
              <div className="font-display mt-1 text-lg font-semibold text-ink">Groq · Qwen3.6-27B</div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-mid">
                One frame in, one short paragraph out. No conversation, no tools, no memory of the
                previous call.
              </p>
            </div>
            <div className="notch-corner border border-i2/40 bg-i2/[0.06] p-5">
              <div className="font-hero-mono text-[12px] tracking-wide text-i2">STAGE 2 · REASONING</div>
              <div className="font-display mt-1 text-lg font-semibold text-ink">DeepSeek v4-flash</div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-mid">
                All reasoning, all ten tools, all persistent state. Receives the frame only as text,
                and is never told it saw anything.
              </p>
            </div>
          </div>
        </section>

        {/* 04 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="04" title="The protocol: one model briefs the other" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            This is the part I would defend hardest. The reasoning model holds the entire
            conversation but cannot see. The vision model is looking straight at the answer but has
            no idea what anyone asked. Neither problem is fixable by writing a better prompt for one
            of them.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
            So the reasoning model writes its own brief — a <code className="font-hero-mono text-[13px] text-i2">watch_for</code>{" "}
            field it attaches to a task step — and the vision stage answers only that. An earlier
            version inferred the brief from the task text, which meant the system could only ever
            look for things I had anticipated in advance. Below is what it produced unprompted, when
            the user said their German was bad.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <div>
              <div className="font-hero-mono mb-1.5 text-[12px] tracking-wide text-i2">
                → BRIEF, WRITTEN BY THE REASONING MODEL
              </div>
              <Wire>{`Read every German label clearly. Report the product name and all
ingredients. Flag if you see: Rindfleisch, Rind, Rinder-, Kalb,
Kalbs-, or any other beef-related word. Also check for gelatin
(Gelatine).`}</Wire>
            </div>
            <div>
              <div className="font-hero-mono mb-1.5 text-[12px] tracking-wide text-i5">
                ← ANSWER FROM THE VISION MODEL
              </div>
              <Wire>{`The product is identified as Surimi containing "Fish Meat" as the
primary ingredient. There is no presence of beef, Rind, Gelatine,
or any related terms in the visible ingredients list.`}</Wire>
            </div>
          </div>
          <div className="notch-corner mt-5 border border-rule-hard bg-panel p-4 text-[13px] leading-relaxed text-panel-mid">
            <b className="text-ink">Note what the brief does not ask:</b> whether the food is safe.
            Briefs request observations, never judgement — a vision model asked for a verdict will
            give you one whether or not the frame supports it. The reasoning model owns the
            conclusion, because it is the one that knows the user does not eat beef.
          </div>
        </section>

        {/* 05 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="05" title="Every architectural decision traces back to a number" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            The free tier allows 200,000 vision tokens per day, total. In this architecture the
            vision model does nothing but look at pictures, so image tokens are the entire budget —
            and image cost scales with{" "}
            <strong className="font-semibold text-ink">resolution, not file size</strong>. Compressing
            the JPEG harder buys nothing at all, which took measurement to establish rather than
            assumption.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
            So close-up mode is opt-in per step, and the resolution change has to reach the browser
            before the next capture: resolution thrown away on the client can never be recovered on
            the server.
          </p>
          <div className="mt-6">
            <Wire>{`server →  frame_detail: "fine"
client ←  frame detail → fine (live ticks now 1024px)
groq   ←  Groq vision usage: Requested 3424`}</Wire>
          </div>
          <div className="notch-corner mt-5 border border-i1/30 bg-i1/[0.06] p-5">
            <div className="font-hero-mono mb-1.5 text-[12px] tracking-wide text-i1">
              AND THAT NUMBER IS ALSO HOW A SESSION DIED
            </div>
            <p className="text-[14px] leading-relaxed text-ink">
              The model switched close-up mode on, never switched it back, and hit the daily ceiling
              at <strong className="font-semibold">198,310 of 200,000 tokens</strong>. Its cost was
              bounded by scope — finishing the step ends it — and the step never finished.
            </p>
            <p className="mt-3 font-display text-[15px] italic leading-relaxed text-ink">
              A cost control that depends on the model's judgement does not hold. Instructions are a
              hint; the budget needs arithmetic.
            </p>
          </div>
        </section>

        {/* 06 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="06" title="A paper I couldn't implement, and what I did instead" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            The design started from <strong className="font-semibold text-ink">VideoLLM-online</strong>,
            which I presented for my master's seminar. It solves streaming video dialogue — crucially,{" "}
            <em>when a model should speak and when it should stay quiet</em> — using a cached frame
            history and a trained per-frame decision. Almost none of that survives contact with a
            hosted API, so the interesting work was re-deriving the same behaviours without the
            mechanisms that produce them.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-[13px]">
              <thead>
                <tr>
                  {["The paper does", "Why I can't", "What I do instead"].map((h) => (
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
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            Qwen3-VL is the natural next step — a model built for exactly this — and is a planned
            extension, not a shipped feature.
          </p>
        </section>

        {/* 07 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="07" title="Go deeper" />
          <div className="flex flex-col gap-4">
            <Link
              to="/case-study/chitragupta/architecture"
              className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i2/60 sm:p-6"
            >
              <div>
                <div className="font-display text-lg font-semibold text-ink">How it works &rarr;</div>
                <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">
                  The pipeline diagram, the blind/mute protocol, what one minute of watching costs,
                  and everything that goes into a single reasoning call.
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
                <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">
                  Eight failures, each with the symptom, the root cause, and the engineering rule it
                  produced. Two of them are still open.
                </p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-i2" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* 08 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="08" title="Early, and specific about it" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="notch-corner border border-i3/40 bg-i3/[0.06] p-5">
              <div className="font-hero-mono mb-3 text-[12px] tracking-wide text-i3">
                PROVEN IN LIVE SESSIONS
              </div>
              <ul className="flex flex-col gap-2">
                {PROVEN.map((p) => (
                  <li key={p} className="flex gap-2 text-[13px] leading-relaxed text-ink">
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
                  <li key={p} className="flex gap-2 text-[13px] leading-relaxed text-ink-mid">
                    <span className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-rule-hard" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-ink-mid">
            The second architecture is deliberately not deployed. Running two unproven systems at
            once makes it impossible to tell which one is lying to you — so it waits until the first
            is genuinely trustworthy.
          </p>
        </section>

        {/* 09 ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <SectionHead num="09" title="What this demonstrates" />
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
          <p className="mt-5 text-[14px] leading-relaxed text-ink-mid">
            The one I would point at first: I once spent a session unable to explain why the
            assistant lost its memory — so I shipped instrumentation instead of a fix, because{" "}
            <em>“the model ignored the task list”</em> and{" "}
            <em>“the task list never reached the prompt”</em> look identical from a transcript and
            need opposite repairs.
          </p>

          <h3 className="font-display mt-9 text-[1.05rem] font-semibold text-ink">
            Where the async is actually load-bearing
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            A framework name in a list proves nothing. This one runs a single worker with a camera
            firing every four seconds, so concurrency is a correctness problem, not a résumé line.
          </p>
          <div className="mt-4 flex flex-col gap-[2px]">
            {ASYNC_USES.map((a) => (
              <div
                key={a.k}
                className="grid gap-1 border border-rule border-l-[3px] border-l-i2 bg-panel px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-x-5"
              >
                <span className="font-hero-mono text-[12.5px] text-i2">{a.k}</span>
                <span className="text-[13px] leading-relaxed text-ink-mid">{a.v}</span>
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
