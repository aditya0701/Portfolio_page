import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

/* Diagram type styles. Kept as constants so every figure stays identical —
   SVG text has no cascade of its own worth relying on here. Labels are written
   uppercase in the markup rather than transformed: text-transform is an SVG 2
   presentation attribute and not reliably honoured, so the casing is literal. */
const T_TITLE = { fontFamily: "var(--font-data)", fontSize: 11.5, letterSpacing: ".09em" };
const T_SUB = { fontFamily: "var(--font-data)", fontSize: 10.5 };
const T_LABEL = { fontFamily: "var(--font-sans)", fontSize: 11, fontStyle: "italic" as const };

function Figure({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption: React.ReactNode;
}) {
  return (
    <figure className="m-0 mt-6 flex flex-col gap-3">
      <div className="notch-corner overflow-x-auto border border-rule-hard bg-panel px-3 py-4 sm:px-4">
        {children}
      </div>
      <figcaption className="text-[14px] leading-relaxed text-ink-mid">{caption}</figcaption>
    </figure>
  );
}

/* ── The session, read downward ────────────────────────────────────────────
 * Four columns, and the point is the contrast between two of them: the
 * document is written on nearly every row, and speech happens on very few.
 * That gap IS the architecture — v1 had no such gap, because deciding what to
 * say was the job of every frame.
 *
 * Sequence and quotes are from the 2026-08-10 chicken-curry session. Lines in
 * quotation marks are verbatim; everything else describes what the turn did.
 * The user column is deliberately sparse: nobody was operating a phone. */

type Speech =
  | { kind: "silent" }
  | { kind: "speak"; text: string }
  | { kind: "urgent"; text: string }
  | { kind: "error"; text: string }
  | { kind: "none" };

type Vision = { kind: "caption" | "reuse" | "drop"; text: string } | undefined;

type Tick = {
  kind: "tick";
  t?: string;
  user?: string;
  doc: string;
  /** Second line, when one tool call's worth of text will not fit the band. */
  doc2?: string;
  trigger?: string;
  speech: Speech;
  vision: Vision;
};
type Divider = { kind: "divider"; label: string };
type Row = Tick | Divider;

const ROWS: Row[] = [
  {
    kind: "tick",
    t: "0:00",
    user: "asks about dinner",
    doc: "propose_plan · 6 steps",
    speech: { kind: "speak", text: "reads the plan aloud" },
    vision: { kind: "caption", text: "caption" },
  },
  {
    kind: "tick",
    t: "0:20",
    doc: "caption folded in",
    speech: { kind: "silent" },
    vision: { kind: "caption", text: "caption" },
  },
  {
    kind: "tick",
    t: "0:40",
    doc: "—",
    speech: { kind: "none" },
    vision: { kind: "drop", text: "dropped · scene unchanged" },
  },
  {
    kind: "tick",
    t: "2:30",
    doc: "proposal re-raised",
    trigger: "proposal_pending",
    speech: { kind: "speak", text: "“still waiting…”" },
    vision: { kind: "caption", text: "caption" },
  },
  {
    kind: "tick",
    t: "3:10",
    user: "“yes this style…”",
    doc: "commit_plan · update_tasks",
    doc2: "set_vision_focus",
    speech: { kind: "speak", text: "commits, names step 1" },
    vision: { kind: "reuse", text: "reused · unchanged" },
  },

  { kind: "divider", label: "later — walking to the fridge" },

  {
    kind: "tick",
    doc: "caption folded in",
    speech: { kind: "urgent", text: "“Slow down…”" },
    vision: { kind: "caption", text: "caption · motion blur" },
  },
  {
    kind: "tick",
    doc: "log_environment × 2",
    speech: { kind: "silent" },
    vision: { kind: "caption", text: "caption" },
  },

  { kind: "divider", label: "later — the lens cap" },

  {
    kind: "tick",
    doc: "caption folded in",
    speech: { kind: "speak", text: "reports the black view" },
    vision: { kind: "drop", text: "flat frame · still billed" },
  },
  {
    kind: "tick",
    doc: "compaction · 13:24:56–13:36:58",
    speech: { kind: "silent" },
    vision: { kind: "caption", text: "caption" },
  },
  {
    kind: "tick",
    t: "18:00",
    doc: "—",
    speech: { kind: "error", text: "429 · daily cap hit" },
    vision: { kind: "drop", text: "—" },
  },
];

const TIME_X = 30;
const USER_X = 38;
const USER_W = 118;
const DOC_X = 164;
const DOC_W = 200;
const SP_X = 374;
const SP_W = 152;
const VIS_X = 536;
const VIS_W = 168;
const VB_W = 712;

const LABEL_Y = 17;
const BAND_TOP = 28;
const HEAD = 44;
const ROW_H = 48;
const DIV_H = 34;

function layout() {
  let y = HEAD;
  return ROWS.map((r) => {
    const top = y;
    y += r.kind === "divider" ? DIV_H : ROW_H;
    return { r, top, h: r.kind === "divider" ? DIV_H : ROW_H };
  });
}

function SessionDiagram() {
  const rows = layout();
  const total = rows[rows.length - 1].top + rows[rows.length - 1].h;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${total + 22}`}
      className="block h-auto w-full min-w-[36rem]"
      role="img"
      aria-label="A session read downward in four columns: the user, the world document, speech, and the vision model. The document column has an entry on almost every row; the speech column is mostly empty. The user speaks three times in eighteen minutes."
    >
      {/* Bands. The document band is the emphasised one — it is the state. */}
      <rect x={USER_X} y={BAND_TOP} width={USER_W} height={total - BAND_TOP} fill="var(--color-paper-hi)" stroke="var(--color-rule)" />
      <text {...T_SUB} x={USER_X + 8} y={LABEL_Y} fill="var(--color-ink-soft)">USER</text>

      <rect
        x={DOC_X}
        y={BAND_TOP}
        width={DOC_W}
        height={total - BAND_TOP}
        fill="var(--color-paper-hi)"
        stroke="var(--color-ink)"
        strokeWidth="1.8"
      />
      <text {...T_TITLE} x={DOC_X + DOC_W / 2} y={LABEL_Y} textAnchor="middle" fill="var(--color-ink)">
        THE DOCUMENT
      </text>

      <rect
        x={SP_X}
        y={BAND_TOP}
        width={SP_W}
        height={total - BAND_TOP}
        fill="color-mix(in oklch, var(--color-i2) 7%, transparent)"
        stroke="var(--color-i2)"
        strokeWidth="1.3"
      />
      <text {...T_TITLE} x={SP_X + SP_W / 2} y={LABEL_Y} textAnchor="middle" fill="var(--color-i2)">
        SPEECH
      </text>

      <rect
        x={VIS_X}
        y={BAND_TOP}
        width={VIS_W}
        height={total - BAND_TOP}
        fill="color-mix(in oklch, var(--color-i5) 7%, transparent)"
        stroke="var(--color-i5)"
        strokeWidth="1.2"
      />
      <text {...T_SUB} x={VIS_X + 8} y={LABEL_Y} fill="var(--color-i5)">VISION</text>

      {rows.map(({ r, top, h }, i) => {
        const mid = top + h / 2;

        if (r.kind === "divider") {
          return (
            <g key={`d${i}`}>
              <text {...T_SUB} fontSize={9} x={USER_X + 8} y={mid - 1} fill="var(--color-ink-soft)" fontStyle="italic">
                {r.label}
              </text>
              <line x1={USER_X} y1={mid + 8} x2={DOC_X - 3} y2={mid + 8} stroke="var(--color-rule)" strokeDasharray="3 3" />
              <line x1={DOC_X + DOC_W + 3} y1={mid + 8} x2={VB_W - 8} y2={mid + 8} stroke="var(--color-rule)" strokeDasharray="3 3" />
            </g>
          );
        }

        const sp = r.speech;
        return (
          <g key={`t${i}`}>
            {r.t && (
              <text {...T_SUB} fontSize={9.5} x={TIME_X} y={mid + 3} textAnchor="end" fill="var(--color-ink-soft)">
                {r.t}
              </text>
            )}

            {r.user && (
              <text {...T_SUB} fontSize={9} x={USER_X + 7} y={mid + 3} fill="var(--color-ink)">
                {r.user}
              </text>
            )}

            <text
              {...T_SUB}
              fontSize={9}
              x={DOC_X + 9}
              y={r.trigger || r.doc2 ? mid : mid + 3}
              fill={r.doc === "—" ? "var(--color-ink-soft)" : "var(--color-ink)"}
            >
              {r.doc}
            </text>
            {r.doc2 && (
              <text {...T_SUB} fontSize={9} x={DOC_X + 9} y={mid + 13} fill="var(--color-ink)">
                {r.doc2}
              </text>
            )}
            {r.trigger && (
              <text {...T_SUB} fontSize={8.5} x={DOC_X + 9} y={mid + 13} fill="var(--color-i3)">
                ▸ trigger: {r.trigger}
              </text>
            )}

            {/* Speech. An open ring is a tick that decided silence; nothing at
                all is a tick where the question was never even asked. */}
            {sp.kind === "silent" && (
              <>
                <circle cx={SP_X + 14} cy={mid} r="3.5" fill="none" stroke="var(--color-ink-soft)" />
                <text {...T_SUB} fontSize={9} x={SP_X + 24} y={mid + 3} fill="var(--color-ink-soft)" fontStyle="italic">
                  nothing said
                </text>
              </>
            )}
            {sp.kind === "none" && (
              <text {...T_SUB} fontSize={9} x={SP_X + 10} y={mid + 3} fill="var(--color-ink-soft)" fontStyle="italic">
                never asked
              </text>
            )}
            {(sp.kind === "speak" || sp.kind === "urgent" || sp.kind === "error") && (
              <>
                <circle
                  cx={SP_X + 14}
                  cy={mid}
                  r="4.5"
                  fill={sp.kind === "speak" ? "var(--color-i2)" : "var(--color-i1)"}
                />
                <text
                  {...T_SUB}
                  fontSize={9}
                  x={SP_X + 24}
                  y={sp.kind === "urgent" ? mid : mid + 3}
                  fill={sp.kind === "error" ? "var(--color-i1)" : "var(--color-ink)"}
                >
                  {sp.text}
                </text>
                {sp.kind === "urgent" && (
                  <text {...T_SUB} fontSize={8.5} x={SP_X + 24} y={mid + 13} fill="var(--color-i1)">
                    [URGENT] · gate bypassed
                  </text>
                )}
              </>
            )}

            {r.vision && (
              <text
                {...T_SUB}
                fontSize={9}
                x={VIS_X + 8}
                y={mid + 3}
                fill={r.vision.kind === "drop" ? "var(--color-i1)" : "var(--color-ink)"}
                fontStyle={r.vision.kind === "reuse" ? "italic" : undefined}
              >
                {r.vision.kind === "drop" ? "✕ " : ""}
                {r.vision.text}
              </text>
            )}
          </g>
        );
      })}

      <text {...T_LABEL} fontSize={10} x={8} y={total + 16} fill="var(--color-ink-soft)">
        filled dot = spoken aloud · open ring = the speech question was asked and answered “no” · blank = it was never asked
      </text>
    </svg>
  );
}

/* ── Where the lock is, and where it isn't ─────────────────────────────────
 * Deliberately not to scale: the locked phases are milliseconds and the
 * unlocked ones are seconds, so a true scale would render the whole argument
 * as three invisible slivers. The cost row carries the real numbers. */
const PHASE_BARS = [
  { n: "1+2", label: "caption", w: 150, locked: false, cost: "~1.5 s", tone: "i5" },
  { n: "3a", label: "fold in", w: 74, locked: true, cost: "~1 ms", tone: "ink" },
  { n: "3b", label: "Stage 1 — bookkeeping", w: 168, locked: false, cost: "~2 s", tone: "i2" },
  { n: "3c", label: "worth asking", w: 74, locked: true, cost: "~1 ms", tone: "ink" },
  { n: "3d", label: "Stage 2 — speech", w: 100, locked: false, cost: "~1 s", tone: "i2" },
  { n: "3e", label: "gate", w: 74, locked: true, cost: "~1 ms", tone: "ink" },
];

function LockDiagram() {
  const X0 = 40;
  let x = X0;
  const bars = PHASE_BARS.map((p) => {
    const bar = { ...p, x };
    x += p.w + 4;
    return bar;
  });
  const end = x - 4;

  const fill = (tone: string) =>
    tone === "ink"
      ? "var(--color-paper-hi)"
      : `color-mix(in oklch, var(--color-${tone}) 12%, transparent)`;
  const stroke = (tone: string) => (tone === "ink" ? "var(--color-ink)" : `var(--color-${tone})`);

  return (
    <svg
      viewBox="0 0 712 208"
      className="block h-auto w-full min-w-[34rem]"
      role="img"
      aria-label="A horizontal timeline of one tick in six phases. A lock track below is filled only under the three short phases that write to the document; the three long phases, which contain every model call, run with the lock released."
    >
      <text {...T_SUB} x={8} y={22} fill="var(--color-ink-soft)">ONE TICK</text>

      {bars.map((b) => (
        <g key={b.n}>
          <rect x={b.x} y={32} width={b.w} height={44} fill={fill(b.tone)} stroke={stroke(b.tone)} strokeWidth="1.3" />
          <text {...T_SUB} fontSize={9.5} x={b.x + b.w / 2} y={51} textAnchor="middle" fill="var(--color-ink-soft)">
            {b.n}
          </text>
          <text {...T_SUB} fontSize={9.5} x={b.x + b.w / 2} y={66} textAnchor="middle" fill="var(--color-ink)">
            {b.label}
          </text>
          <text {...T_SUB} fontSize={9} x={b.x + b.w / 2} y={96} textAnchor="middle" fill="var(--color-ink-soft)">
            {b.cost}
          </text>
        </g>
      ))}

      <text {...T_SUB} x={8} y={130} fill="var(--color-ink-soft)">LOCK</text>
      <rect x={X0} y={116} width={end - X0} height={18} fill="var(--color-paper-hi)" stroke="var(--color-rule)" />
      {bars
        .filter((b) => b.locked)
        .map((b) => (
          <rect key={b.n} x={b.x} y={116} width={b.w} height={18} fill="var(--color-ink)" />
        ))}

      {bars
        .filter((b) => !b.locked)
        .map((b) => (
          <text key={b.n} {...T_SUB} fontSize={9} x={b.x + b.w / 2} y={129} textAnchor="middle" fill="var(--color-ink-soft)">
            released
          </text>
        ))}

      <text {...T_LABEL} fontSize={10.5} x={X0} y={158} fill="var(--color-ink)">
        Every model call in the system happens in a released phase.
      </text>
      <text {...T_LABEL} fontSize={10.5} x={X0} y={174} fill="var(--color-ink-mid)">
        The three locked phases are reload → mutate → save, and the document is one JSON file.
      </text>
      <text {...T_LABEL} fontSize={10.5} x={X0} y={196} fill="var(--color-ink-soft)">
        Not to scale — a true scale would render the three locked phases as invisible slivers.
      </text>
    </svg>
  );
}

/* Render order, and the reason for it. `recent` is last because it changes on
   every single tick and everything above it rarely does. */
const DOC_SECTIONS = [
  ["[Current time]", "Stamped in the user's timezone, not the server's. A naive conversion once stamped the whole document two hours off — including the header every piece of temporal arithmetic is done against"],
  ["[Goal] · [Tasks]", "The committed plan, with per-step status: pending, in progress, completed, skipped"],
  ["[PROPOSED PLAN — NOT COMMITTED]", "Present only while waiting on the user, and hard-labelled. A proposal that reads like a task list is worse than no proposal at all"],
  ["[Camera focus]", "The standing lens, plus a running count of close-up frames used — so the drift is visible to the thing causing it"],
  ["[Open expectations]", "Time-anchored ones show a countdown; event-anchored ones show the question the camera is being asked"],
  ["[Looking for]", "The find list — still open, or found and where"],
  ["[Earlier this session]", "Compacted narrative, with time spans preserved rather than only facts"],
  ["[Known environment facts]", "Durable spatial memory. Eight of them by the end of the live session"],
  ["[Recent observations]", "Raw captions, newest last, bounded at 24"],
];

const TRIGGERS = [
  ["expectation_due", "a time-anchored expectation passed its deadline unresolved"],
  ["stale_task", "an in-progress task has gone unmentioned for eight minutes"],
  ["proposal_pending", "a plan was proposed and unanswered for 150 seconds"],
  ["wanted_found", "a find-list item was seen and the user has not been told — coalesced into one event for all of them"],
  ["wanted_stuck", "a search hit its miss or unclear budget. Ask the user rather than failing silently"],
];

const TOOLS: [string, string][] = [
  ["propose_plan · commit_plan · discard_plan", "The approval cycle. A proposal is spoken, never written to tasks, and nothing tracks it until the user agrees"],
  ["add_wanted · drop_wanted", "Opens and cancels a search. Neither one can mark an item found — only the camera can do that"],
  ["update_tasks · mark_task", "For a plan the user is already working through, rather than one being proposed"],
  ["set_expectation · resolve_expectation", "A deadline, or a condition put to the camera verbatim on every frame until it resolves"],
  ["set_vision_focus", "The standing lens. Replaced, never appended, so duplicates are impossible by construction"],
  ["log_environment · retract_environment_fact", "Durable spatial memory, and undoing it. The retraction takes a correction, not just a deletion"],
  ["web_search · fetch_page · calculate", "Inherited from v1 unchanged, and flagged blocking so they never run on the event loop"],
];

const ABSENT = [
  [
    "start_timer",
    "Subsumed by a time-anchored expectation, which also has a resolution path a timer never had — an expectation can be met early, or turn out not to apply",
  ],
  [
    "request_camera · request_live_search",
    "v1 tools. The live UI owns the camera now, and chat turns attach the current frame client-side, so there is nothing left for the model to ask for",
  ],
];

const REJECTED = [
  [
    "A VideoLLM-online streaming architecture",
    "Examined seriously as a route to real-time. Its pooled per-frame vector is an unconditional compression that cannot preserve a label or a torque figure, and its cache grows without bound so latency degrades over a session. The lesson taken instead: speech latency is not a real ceiling, because synthesis can start before the next frame is processed",
  ],
  [
    "A duplicate-watch check",
    "Built, measured, removed. The duplicates that actually occurred shared about 19% of their words — “car is safe to work under” versus “the car should be settled firmly on both ramps” — while a threshold low enough to catch those merged genuinely distinct watches differing only in the object. Silently dropping a watch the user is relying on is far worse than carrying a duplicate",
  ],
  [
    "A hard cutoff on stale searches",
    "A search past its budget now stays open but stops buying full resolution, and the prompt gets a nudge to close it. Dropping it outright would silently abandon something the user may still be waiting on",
  ],
  [
    "A multi-agent orchestrator",
    "Rejected for v1 and the reasoning holds. The reasoning model orchestrates itself — it reads the document, decides mid-thought whether to call a tool, and routes to the right response. The thinking chain is the orchestration",
  ],
];

function Wire({ children }: { children: React.ReactNode }) {
  return (
    <div className="notch-corner-sm overflow-x-auto border border-rule-hard bg-paper-hi px-4 py-3">
      <pre className="font-hero-mono m-0 text-[13px] leading-relaxed whitespace-pre text-ink">{children}</pre>
    </div>
  );
}

export function ChitraguptaArchitecture() {
  usePageTitle(ROUTE_META["/case-study/chitragupta/architecture"].title);

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
        <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i2">CHITRAGUPTA v2 &middot; HOW IT WORKS</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          One document, two models, and arithmetic in between
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The world document is primary state; speech is a side-effect. Everything on this page is a
          consequence of taking that literally — including the parts that made the system harder to
          build.
        </p>

        {/* 01 */}
        <section className="mt-16">
          <SectionHead num="01" title="What actually happens over a session" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            Read the two middle columns against each other. The document is written on almost every
            row; speech happens on very few. That gap is the architecture — and the version before this
            one had no such gap, because deciding what to say <em>was</em> the job of every frame.
          </p>
          <Figure
            caption={
              <>
                <b className="text-ink">Eighteen minutes, and the user speaks three times.</b> Note the
                three different reasons nothing was said: a tick that asked the speech question and
                answered no, a tick where the question was never asked because nothing had happened,
                and a frame the browser dropped before it became a request at all. Only one of those
                three costs anything. The last row is the session ending on a provider it should never
                have been able to reach.
              </>
            }
          >
            <SessionDiagram />
          </Figure>

          <div className="notch-corner mt-6 border border-i1/30 bg-i1/[0.06] p-5">
            <div className="font-hero-mono mb-2 text-[12px] tracking-wide text-i1">
              WHAT IS NOT TRUE OF THIS DIAGRAM
            </div>
            <p className="text-[15px] leading-relaxed text-ink">
              <strong className="font-semibold">There is no open microphone.</strong> Voice input is
              push-to-talk. A turn only ever begins from one of three things — and two of them run
              without anyone touching the phone, which is the entire point.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["You ask", "typed, or one press of the mic button"],
                ["A camera tick", "a frame, on an interval, gated in the browser"],
                ["A poll", "every 20 s — arithmetic only, and usually free"],
              ].map(([k, v]) => (
                <div key={k} className="notch-corner-sm border border-rule-hard bg-panel px-3 py-2.5">
                  <div className="font-hero-mono text-[11.5px] text-ink">{k}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-ink-mid">{v}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
              The poll exists for two reasons at once. It is what lets a find announce itself even if
              the camera has gone dark since — the trigger tests the document, not this tick's caption
              — and on a free host it is also what keeps the server from falling asleep mid-task.
            </p>
          </div>
        </section>

        {/* 02 */}
        <section className="mt-16">
          <SectionHead num="02" title="Where the lock is, and where it is not" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            The document is one JSON file, so <code className="font-hero-mono text-[14px]">load → mutate → save</code>{" "}
            must be atomic and there is exactly one lock. Originally it was held across the whole tick,
            which meant a tick owned the document for two model round trips plus any web search they
            made. Measured at the point where a question arrives mid-reasoning, that cost the user two
            full seconds of nothing.
          </p>
          <Figure
            caption={
              <>
                <b className="text-ink">The rule the whole restructure exists to enforce:</b> never
                await a model call inside a write window. A network call inside one re-serializes ticks
                and chat and silently undoes the split — the code still looks correct, it is just slow
                again. There is exactly one deliberate exception, compaction, because it rewrites two
                sections together and cannot be replayed against a document that moved underneath it.
              </>
            }
          >
            <LockDiagram />
          </Figure>

          <div className="notch-corner mt-6 border border-rule-hard bg-panel">
            <div className="grid grid-cols-[1fr_6rem] items-center gap-3 border-b border-rule px-4 py-2.5 sm:grid-cols-[1fr_8rem]">
              <span className="font-hero-mono text-[12px] text-ink-mid">
                a question reaching the wire — lock across the whole tick
              </span>
              <span className="font-hero-mono text-right text-[12px] tabular-nums text-ink-soft">2.00 s</span>
            </div>
            <div className="grid grid-cols-[1fr_6rem] items-center gap-3 bg-i3/[0.07] px-4 py-2.5 sm:grid-cols-[1fr_8rem]">
              <span className="font-hero-mono text-[12px] text-ink-mid">
                the same question — lock across writes only
              </span>
              <span className="font-hero-mono text-right text-[12px] font-semibold tabular-nums text-i3">0.01 s</span>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            Two consequences follow, and both are load-bearing.{" "}
            <strong className="font-semibold text-ink">Every window reloads from disk on entry</strong> —
            a window that reuses a document read before a model call silently rolls back whoever wrote
            in the meantime, a lost update that leaves no trace because both writes reported success.
            And the document's revision number is bumped on window <em>entry</em>, not on save: windows
            are serialized by the lock, so entry order is write order, and the browser can drop any
            render older than one it has already painted.
          </p>
          <div className="notch-corner mt-5 border border-i2/40 bg-i2/[0.07] p-5">
            <p className="font-display text-lg italic text-ink">
              A server-side concurrency fix is not done until the client can exercise it.
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-mid">
              None of the above reached a user for some time, because the browser held a single{" "}
              <code className="font-hero-mono text-[14px]">busy</code> flag covering both ticks and
              chat. A typed question was queued client-side with a status line apologising for a
              constraint that no longer existed anywhere in the system. The message never left the
              browser. Two flags now protect genuinely different things: frames must not stack, and
              replies must not interleave.
            </p>
          </div>
        </section>

        {/* 03 */}
        <section className="mt-16">
          <SectionHead num="03" title="The document itself" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            There is no retrieval step and no memory tool. Every prompt is built by rendering the
            document, because a model that has to <em>ask</em> for its state will reliably forget to
            ask. The section order below is not cosmetic.
          </p>
          <div className="mt-6 flex flex-col gap-[2px]">
            {DOC_SECTIONS.map(([k, v]) => (
              <div
                key={k}
                className="grid gap-1 border border-rule border-l-[3px] border-l-ink bg-panel px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-x-5"
              >
                <span className="font-hero-mono text-[12px] leading-snug text-ink">{k}</span>
                <span className="text-[14px] leading-relaxed text-ink-mid">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            <strong className="font-semibold text-ink">The order is stability-first.</strong> Title,
            tasks, narrative and environment facts change rarely; raw captions change on every tick. So
            the things that move least go at the top, and consecutive ticks share the longest possible
            unchanged prefix — which is what the reasoning provider's prefix cache is able to charge
            less for. Ordering the document by what a reader would find natural would have cost real
            money on every frame.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The caption buffer is bounded at 24. On overflow the oldest sixteen are summarised into the
            narrative by one cheap model call, with{" "}
            <strong className="font-semibold text-ink">time spans preserved rather than only facts</strong>,
            plus any durable environment facts worth promoting. Raw captions are never silently
            dropped, and the freshest window is never compacted.
          </p>
        </section>

        {/* 04 */}
        <section className="mt-16">
          <SectionHead num="04" title="The trigger engine costs nothing, and it is the only thing that starts a sentence" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            Wall-clock arithmetic is free; tokens are not. The trigger check runs on every tick and
            every 20-second poll, costs nothing at all, and the reasoning model is only woken when it
            returns something — or when a frame arrived, or the user spoke.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-[14px]">
              <thead>
                <tr>
                  {["Trigger", "Fires when"].map((h) => (
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
                {TRIGGERS.map(([t, d]) => (
                  <tr key={t}>
                    <td className="font-hero-mono border-b border-rule px-3 py-3 align-top whitespace-nowrap text-i3">{t}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            Each one <strong className="font-semibold text-ink">claims its own state on firing</strong>,
            before anything downstream awaits. An unclaimed trigger fires again on the next tick while
            the first one is still thinking — the same double-fire lesson the timer system taught in
            v1.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            Unprompted speech is then gated by a 90-second politeness budget, and exactly two things
            bypass it. <code className="font-hero-mono text-[14px]">[URGENT]</code> — physical risk, or
            work about to be ruined — and the follow-up window that a user's own question opens.
          </p>
          <div className="notch-corner mt-5 border border-i1/30 bg-i1/[0.06] p-5">
            <div className="font-hero-mono mb-1.5 text-[12px] tracking-wide text-i1">
              WHY ANSWERING SOMEONE MUST NOT RESET THE GAP
            </div>
            <p className="text-[15px] leading-relaxed text-ink">
              Speaking used to reset the politeness budget. Asked to find the onions, the assistant
              replied <em>“I'll point them out as soon as they're in view”</em> — and that reply gagged
              it for the entire 90-second search. It found them at +27 seconds, logged them silently,
              and said nothing until it was asked again.
            </p>
            <p className="mt-3 font-display text-[15px] italic leading-relaxed text-ink">
              Speaking should make the assistant quieter. Being asked should make it more forthcoming.
              Those pull in opposite directions, so they are tracked as two separate timestamps.
            </p>
          </div>
        </section>

        {/* 05 */}
        <section className="mt-16">
          <SectionHead num="05" title="The find list, and the door that was closed" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            “Find the chicken and the onions” opens a search. Every open item is put to the camera by
            name, in one block, on every frame — one block rather than one question per item, so the
            list never competes with the four-watch cap and a fourth search cannot silently stop
            reaching the camera.
          </p>
          <div className="mt-6">
            <Wire>{`chicken packet: FOUND — middle shelf, behind the milk
onions: NOT VISIBLE — this part of the frame is the door rack`}</Wire>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">
            <strong className="font-semibold text-ink">There is no tool that marks an item found.</strong>{" "}
            The model can open a search and cancel one; only plain string matching over the caption —
            zero tokens — sets the found state. That is what stops an inference standing in for an
            observation. The caption said <em>“several bags of lentils”</em> and the model once
            upgraded it to <em>“I can see the beans”</em>. The found state now has no model-facing
            door.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            Two smaller decisions here both came from thinking about what happens when something goes
            wrong. <strong className="font-semibold text-ink">Found and announced are separate flags</strong>
            — one is about the world, the other about speech — so a failed utterance simply re-fires
            next tick instead of leaving an item found and unspoken forever. And matching is{" "}
            <strong className="font-semibold text-ink">by name, never by question index</strong>: the
            index is positional over a list rebuilt each tick while the vision call runs with the lock
            released, so eventually it would announce one item's location under another item's name.
          </p>
        </section>

        {/* 06 */}
        <section className="mt-16">
          <SectionHead num="06" title="What one minute of watching costs" />
          <p className="text-[15px] leading-relaxed text-ink-mid">
            In this split the vision call is the only image cost, so its prompt tokens{" "}
            <em>are</em> the per-frame bill — which is what makes the number knowable at all. A tick is
            roughly 1,350 input and 90 output tokens at the coarse tier; the close-up tier caps the
            longest side at 1,024 px, which is about a thousand image tokens on its own.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-[14px]">
              <thead>
                <tr>
                  {["", "Free tier, 8k/min · 200k/day", "DeepInfra, metered"].map((h) => (
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
                <tr>
                  <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">fastest sustainable tick</td>
                  <td className="border-b border-rule px-3 py-3 align-top text-i1">one every ~11 s</td>
                  <td className="border-b border-rule px-3 py-3 align-top text-ink">no per-minute ceiling</td>
                </tr>
                <tr>
                  <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">a whole day's allowance</td>
                  <td className="border-b border-rule px-3 py-3 align-top text-i1">~139 ticks, total</td>
                  <td className="border-b border-rule px-3 py-3 align-top text-ink">about four cents</td>
                </tr>
                <tr>
                  <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">1,000 ticks</td>
                  <td className="border-b border-rule px-3 py-3 align-top text-i1">not reachable</td>
                  <td className="border-b border-rule px-3 py-3 align-top text-ink">~$0.26</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            v1 survives on a free tier because its cadence is slower and most of its turns are
            text-only. v2 ticks continuously <em>by design</em> — it is a fundamentally heavier vision
            consumer, and the honest conclusion was that the free tier is not a constraint it can be
            engineered inside. That is now enforced rather than documented: the wrong provider refuses
            to start.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The close-up tier gets a nudge, then a backstop. The count of close-up frames is rendered
            into the document, so the drift is visible to the thing causing it, and a hard cap forces
            coarse at 120. v1 proved that a fine mode set once is never voluntarily reverted; v2's own
            live session proved the opposite failure, and the tier was never chosen at all.
          </p>
        </section>

        {/* 07 */}
        <section className="mt-16">
          <SectionHead num="07" title="Fifteen tools, and two that are deliberately missing" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-[14px]">
              <thead>
                <tr>
                  {["Tool", "What it does"].map((h) => (
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
                {TOOLS.map(([t, d]) => (
                  <tr key={t}>
                    <td className="font-hero-mono border-b border-rule px-3 py-3 align-top text-ink">{t}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-mid">
            The document-mutating tools close over the agent's current in-memory document, so a turn's
            tool calls and the agent's own writes can never interleave on disk. And{" "}
            <code className="font-hero-mono text-[14px]">retract_environment_fact</code> takes a{" "}
            <em>correction</em>, not just a deletion — the raw captions that produced the wrong
            inference are still in the buffer and will suggest it again on the very next tick. A hole
            in the fact list does not block that; a durable “the bag on the pantry shelf is NOT toor
            dal” does.
          </p>
          <div className="mt-6 flex flex-col gap-[2px]">
            {ABSENT.map(([k, v]) => (
              <div
                key={k}
                className="grid gap-1 border border-rule border-l-[3px] border-l-i1 bg-panel px-4 py-3 sm:grid-cols-[13rem_1fr] sm:gap-x-5"
              >
                <span className="font-hero-mono text-[12px] leading-snug text-i1">{k}</span>
                <span className="text-[14px] leading-relaxed text-ink-mid">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 08 */}
        <section className="mt-16">
          <SectionHead num="08" title="Four designs I rejected" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-[14px]">
              <thead>
                <tr>
                  {["Considered", "Rejected because"].map((h) => (
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
                {REJECTED.map(([t, d]) => (
                  <tr key={t}>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink">{t}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
            The duplicate check is the one I would highlight. It was a reasonable idea, it was built,
            and measuring it is what killed it — in both directions at once. Removing it also removed
            the pressure it existed for, because form and safety moved into a tool that replaces rather
            than appends, which makes duplicates impossible by construction instead of by threshold.
          </p>
        </section>

        <div className="mt-16">
          <Link
            to="/case-study/chitragupta/failure-log"
            className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i2/60 sm:p-6"
          >
            <div>
              <div className="font-display text-lg font-semibold text-ink">What broke &rarr;</div>
              <p className="mt-1 text-[15px] leading-relaxed text-panel-mid">
                Ten failures, each with the symptom, the root cause, and the rule it produced.
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
