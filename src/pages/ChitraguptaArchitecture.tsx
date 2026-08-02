import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

/* Diagram type styles. Kept as constants so both figures stay identical —
   SVG text has no cascade of its own worth relying on here. Labels are written
   uppercase in the markup rather than transformed: text-transform is an SVG 2
   presentation attribute and not reliably honoured, so the casing is literal. */
const T_TITLE = { fontFamily: "var(--font-data)", fontSize: 11.5, letterSpacing: ".09em" };
const T_SUB = { fontFamily: "var(--font-data)", fontSize: 10.5 };
const T_LABEL = { fontFamily: "var(--font-sans)", fontSize: 11, fontStyle: "italic" as const };
const T_BIG = { fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600 };

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
      <figcaption className="text-[13px] leading-relaxed text-ink-mid">{caption}</figcaption>
    </figure>
  );
}

/* ── The session loop ──────────────────────────────────────────────────────
 * Three bands, time running downward. The reasoning model is the centre band
 * because every turn routes through it and it holds all state — not because
 * it is listening. The user is on its left, the vision model on its right,
 * present only while the camera is open.
 *
 * The two arrows across the right gutter are the protocol: a brief going out
 * (amber — the reasoning model wrote it) and an observation coming back
 * (blue). Vertical rather than horizontal because this has to survive a
 * phone, where a wide figure is a figure nobody scrolls.
 *
 * Every number is from the code: 4 s sample interval (2–15 s slider), mean
 * grayscale delta threshold 12, 640 px coarse / 1024 px fine. Both sequences
 * are from the 2026-07-28 session — the toor-dal search and the German-label
 * check — including the correction that the system could not act on. */

type DsKind = "speak" | "silent" | "none";
type QwKind = "brief" | "caption" | "drop";

type Tick = {
  kind: "tick";
  t?: string;
  user?: string;
  ds: string;
  dsKind: DsKind;
  qw?: { kind: QwKind; lines: string[] };
};
type Divider = { kind: "divider"; label: string };
type Row = Tick | Divider;

const ROWS: Row[] = [
  {
    kind: "tick",
    t: "0s",
    user: "“help me find the dal”",
    ds: "answers · opens camera",
    dsKind: "speak",
    qw: { kind: "brief", lines: ["OBJECT DETECTION · toor dal", "one line: FOUND / NOT FOUND"] },
  },
  {
    kind: "tick",
    t: "4s",
    ds: "∅  [SILENT]",
    dsKind: "silent",
    qw: { kind: "caption", lines: ["“NOT FOUND: a counter, jars”"] },
  },
  { kind: "tick", t: "8s", ds: "never called", dsKind: "none", qw: { kind: "drop", lines: ["dropped · Δ < 12"] } },
  {
    kind: "tick",
    t: "12s",
    ds: "SPEAKS · found · camera off",
    dsKind: "speak",
    qw: { kind: "caption", lines: ["“FOUND: in a plastic bag”"] },
  },
  {
    kind: "tick",
    t: "16s",
    user: "“that's black eyed beans”",
    ds: "answers · text only",
    dsKind: "speak",
  },

  // Shortened to fit the user band's 150 units at 9px mono — the long form ran
  // past the band and into the reasoning column.
  { kind: "divider", label: "later — a new question" },

  {
    kind: "tick",
    user: "“I don't eat beef”",
    ds: "opens camera · detail: fine",
    dsKind: "speak",
    qw: { kind: "brief", lines: ["Read every German label.", "Flag Rindfleisch, Rind, Kalb"] },
  },
  {
    kind: "tick",
    ds: "∅  [SILENT]",
    dsKind: "silent",
    qw: { kind: "caption", lines: ["“too blurred — cannot verify”"] },
  },
  {
    kind: "tick",
    ds: "SPEAKS · “no beef in sight”",
    dsKind: "speak",
    qw: { kind: "caption", lines: ["“Surimi · Fish Meat · no beef”"] },
  },
];

const TIME_X = 34;
const USER_X = 42;
const USER_W = 150;
const DS_X = 214;
const DS_W = 198;
const QW_X = 438;
const QW_W = 182;
const VB_W = 628;

/** Column headings sit clear above the bands rather than on their top edge. */
const LABEL_Y = 17;
const BAND_TOP = 28;
const HEAD = 46;
const ROW_H = 52;
const DIV_H = 38;

/** Row tops, walked once so the two band rects and the rows agree. */
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

  // The camera opens twice and closes twice. Each blue block is one window —
  // the gap between them is the part that costs nothing.
  const camWindows = [
    { from: 0, to: 3 },
    { from: 6, to: 8 },
  ].map(({ from, to }) => ({
    y: rows[from].top,
    h: rows[to].top + rows[to].h - rows[from].top,
  }));

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${total + 20}`}
      className="block h-auto w-full min-w-[34rem]"
      role="img"
      aria-label="A session read downward in three bands. The user is on the left, the reasoning model is the centre band running the full height, and the vision model is on the right, present only across the two windows where the camera is open. Arrows across the right gutter show a written brief going out to the vision model and an observation coming back."
    >
      <defs>
        <marker id="ch-a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-rule-hard)" />
        </marker>
        <marker id="ch-a3b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-i5)" />
        </marker>
        <marker id="ch-a3a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-i2)" />
        </marker>
      </defs>

      {/* ── Band: the user ── */}
      <rect x={USER_X} y={BAND_TOP} width={USER_W} height={total - BAND_TOP} fill="var(--color-paper-hi)" stroke="var(--color-rule)" />
      <text {...T_SUB} x={USER_X + 8} y={LABEL_Y} fill="var(--color-ink-soft)">USER</text>

      {/* ── Band: reasoning. Full height because every turn goes through it and
           it owns all state — NOT because it is listening. Nothing here runs
           without a trigger: a user turn, a camera tick, or a timer. ── */}
      <rect
        x={DS_X}
        y={BAND_TOP}
        width={DS_W}
        height={total - BAND_TOP}
        fill="color-mix(in oklch, var(--color-i2) 11%, transparent)"
        stroke="var(--color-i2)"
        strokeWidth="1.4"
      />
      <text {...T_TITLE} x={DS_X + DS_W / 2} y={LABEL_Y} textAnchor="middle" fill="var(--color-i2)">
        DEEPSEEK v4-FLASH
      </text>

      {/* ── Band: vision. Two windows, because the camera opens and closes. ── */}
      {camWindows.map((w) => (
        <rect
          key={w.y}
          x={QW_X}
          y={w.y}
          width={QW_W}
          height={w.h}
          fill="color-mix(in oklch, var(--color-i5) 9%, transparent)"
          stroke="var(--color-i5)"
          strokeWidth="1.2"
        />
      ))}
      <text {...T_SUB} x={QW_X} y={LABEL_Y} fill="var(--color-i5)">QWEN · ONLY WHEN ASKED</text>

      {rows.map(({ r, top, h }, i) => {
        const mid = top + h / 2;

        if (r.kind === "divider") {
          // The label sits inside the neutral user band and the rules run either
          // side of the reasoning band — which is never broken, because the
          // reasoning model did not stop. Centring the label would have run it
          // straight through that band's two borders.
          return (
            <g key={`d${i}`}>
              <text {...T_SUB} fontSize={9} x={USER_X + 8} y={mid - 1} fill="var(--color-ink-soft)" fontStyle="italic">
                {r.label}
              </text>
              <line x1={USER_X} y1={mid + 9} x2={DS_X - 4} y2={mid + 9} stroke="var(--color-rule)" strokeDasharray="3 3" />
              <line x1={DS_X + DS_W + 4} y1={mid + 9} x2={VB_W - 8} y2={mid + 9} stroke="var(--color-rule)" strokeDasharray="3 3" />
            </g>
          );
        }

        return (
          <g key={`t${i}`}>
            {r.t && (
              <text {...T_SUB} fontSize={9.5} x={TIME_X} y={mid + 3} textAnchor="end" fill="var(--color-ink-soft)">
                {r.t}
              </text>
            )}

            {/* User */}
            {r.user && (
              <>
                <text {...T_SUB} fontSize={9.5} x={USER_X + 8} y={mid + 3} fill="var(--color-ink)">
                  {r.user}
                </text>
                <line x1={USER_X + USER_W + 4} y1={mid} x2={DS_X - 3} y2={mid} stroke="var(--color-rule-hard)" strokeWidth="1.1" markerEnd="url(#ch-a3)" />
              </>
            )}

            {/* Reasoning */}
            {r.dsKind === "speak" && <circle cx={DS_X + 16} cy={mid} r="4.5" fill="var(--color-i2)" />}
            {r.dsKind === "silent" && <circle cx={DS_X + 16} cy={mid} r="4" fill="none" stroke="var(--color-ink-soft)" />}
            <text
              {...T_SUB}
              fontSize={10}
              x={DS_X + (r.dsKind === "none" ? 12 : 28)}
              y={mid + 3}
              fill={r.dsKind === "speak" ? "var(--color-ink)" : r.dsKind === "none" ? "var(--color-ink-soft)" : "var(--color-ink-mid)"}
              fontStyle={r.dsKind === "none" ? "italic" : undefined}
            >
              {r.ds}
            </text>

            {/* Vision cell + the arrow that carries it */}
            {r.qw?.kind === "brief" && (
              <>
                <line x1={DS_X + DS_W + 3} y1={mid} x2={QW_X - 4} y2={mid} stroke="var(--color-i2)" strokeWidth="1.3" markerEnd="url(#ch-a3a)" />
                <rect
                  x={QW_X + 5}
                  y={mid - 17}
                  width={QW_W - 10}
                  height="34"
                  rx="2"
                  fill="color-mix(in oklch, var(--color-i2) 16%, var(--color-paper-hi))"
                  stroke="var(--color-i2)"
                  strokeDasharray="3 2"
                />
                {r.qw.lines.map((l, n) => (
                  <text key={l} {...T_SUB} fontSize={9} x={QW_X + 12} y={mid - 3 + n * 12} fill="var(--color-ink)">
                    {l}
                  </text>
                ))}
              </>
            )}
            {r.qw?.kind === "caption" && (
              <>
                <line x1={QW_X - 4} y1={mid} x2={DS_X + DS_W + 3} y2={mid} stroke="var(--color-i5)" strokeWidth="1.3" markerEnd="url(#ch-a3b)" />
                <rect x={QW_X + 5} y={mid - 12} width={QW_W - 10} height="24" rx="2" fill="var(--color-paper-hi)" stroke="var(--color-i5)" />
                <text {...T_SUB} fontSize={9} x={QW_X + 12} y={mid + 3} fill="var(--color-ink)">
                  {r.qw.lines[0]}
                </text>
              </>
            )}
            {r.qw?.kind === "drop" && (
              <text {...T_SUB} fontSize={9} x={QW_X + 12} y={mid + 3} fill="var(--color-i1)">
                ✕ {r.qw.lines[0]}
              </text>
            )}
          </g>
        );
      })}

      <text {...T_LABEL} fontSize={10} x={8} y={total + 14} fill="var(--color-ink-soft)">
        amber arrow = a brief the reasoning model wrote · blue arrow = what came back · Δ = frame change vs the last one sent
      </text>
    </svg>
  );
}

function PipelineDiagram() {
  return (
    <svg
      viewBox="0 0 720 580"
      className="block h-auto w-full min-w-[30rem]"
      role="img"
      aria-label="Vertical pipeline: phone capture, browser diff gate, vision model, a boundary where pixels stop, then the reasoning model with tools and disk state attached, ending in speech."
    >
      <defs>
        <marker id="ch-arrow" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-rule-hard)" />
        </marker>
      </defs>

      <rect x="210" y="14" width="300" height="54" fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TITLE} x="360" y="38" textAnchor="middle" fill="var(--color-ink)">PHONE CAMERA</text>
      <text {...T_SUB} x="360" y="55" textAnchor="middle" fill="var(--color-ink-soft)">a frame every 4 seconds</text>

      <line x1="360" y1="68" x2="360" y2="100" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch-arrow)" />

      <rect x="210" y="102" width="300" height="66" fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TITLE} x="360" y="126" textAnchor="middle" fill="var(--color-ink)">DIFF GATE</text>
      <text {...T_SUB} x="360" y="143" textAnchor="middle" fill="var(--color-ink-soft)">still in the browser</text>
      <text {...T_SUB} x="360" y="159" textAnchor="middle" fill="var(--color-ink-soft)">mean grayscale delta</text>

      <line x1="510" y1="135" x2="596" y2="135" stroke="var(--color-rule-hard)" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#ch-arrow)" />
      <text {...T_LABEL} x="602" y="131" fill="var(--color-ink-soft)">scene unchanged</text>
      <text {...T_LABEL} x="602" y="146" fill="var(--color-ink-soft)">— dropped</text>

      <line x1="360" y1="168" x2="360" y2="204" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch-arrow)" />
      <text {...T_SUB} x="370" y="191" fill="var(--color-i5)">640 px JPEG</text>

      <rect x="210" y="206" width="300" height="80" fill="color-mix(in oklch, var(--color-i5) 8%, transparent)" stroke="var(--color-i5)" strokeWidth="1.4" />
      <text {...T_SUB} x="360" y="228" textAnchor="middle" fill="var(--color-i5)">GROQ</text>
      <text {...T_BIG} x="360" y="252" textAnchor="middle" fill="var(--color-ink)">Qwen3.6-27B</text>
      <text {...T_SUB} x="360" y="272" textAnchor="middle" fill="var(--color-ink-soft)">vision only · no conversation · no tools</text>

      <line x1="360" y1="286" x2="360" y2="330" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch-arrow)" />
      <text {...T_SUB} x="370" y="312" fill="var(--color-i5)">≈40 words of plain text</text>

      <line x1="8" y1="344" x2="712" y2="344" stroke="var(--color-i1)" strokeWidth="1" strokeDasharray="5 4" />
      <text {...T_LABEL} x="8" y="338" fill="var(--color-i1)">
        the pixels stop here — nothing below this line has ever seen an image
      </text>

      <rect x="210" y="360" width="300" height="80" fill="color-mix(in oklch, var(--color-i2) 10%, transparent)" stroke="var(--color-i2)" strokeWidth="1.4" />
      <text {...T_SUB} x="360" y="382" textAnchor="middle" fill="var(--color-i2)">DEEPSEEK</text>
      <text {...T_BIG} x="360" y="406" textAnchor="middle" fill="var(--color-ink)">v4-flash</text>
      <text {...T_SUB} x="360" y="426" textAnchor="middle" fill="var(--color-ink-soft)">all reasoning · all tool calls</text>

      <rect x="8" y="366" width="168" height="68" fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TITLE} x="92" y="390" textAnchor="middle" fill="var(--color-ink)">10 TOOLS</text>
      <text {...T_SUB} x="92" y="407" textAnchor="middle" fill="var(--color-ink-soft)">timers · search</text>
      <text {...T_SUB} x="92" y="422" textAnchor="middle" fill="var(--color-ink-soft)">tasks · camera</text>
      <line x1="176" y1="400" x2="208" y2="400" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerStart="url(#ch-arrow)" markerEnd="url(#ch-arrow)" />

      <rect x="544" y="366" width="168" height="68" fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TITLE} x="628" y="390" textAnchor="middle" fill="var(--color-ink)">STATE ON DISK</text>
      <text {...T_SUB} x="628" y="407" textAnchor="middle" fill="var(--color-ink-soft)">document.json</text>
      <text {...T_SUB} x="628" y="422" textAnchor="middle" fill="var(--color-ink-soft)">timers.json</text>
      <line x1="512" y1="400" x2="542" y2="400" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerStart="url(#ch-arrow)" markerEnd="url(#ch-arrow)" />

      <line x1="360" y1="440" x2="360" y2="486" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch-arrow)" />
      <text {...T_SUB} x="370" y="468" fill="var(--color-i2)">a reply — or exactly [SILENT]</text>

      <rect x="210" y="488" width="300" height="54" fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TITLE} x="360" y="512" textAnchor="middle" fill="var(--color-ink)">SPOKEN ALOUD</text>
      <text {...T_SUB} x="360" y="529" textAnchor="middle" fill="var(--color-ink-soft)">on-device speech synthesis · free</text>

      <line x1="196" y1="515" x2="120" y2="515" stroke="var(--color-rule-hard)" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#ch-arrow)" />
      <text {...T_LABEL} x="114" y="511" textAnchor="end" fill="var(--color-ink-soft)">[SILENT]</text>
      <text {...T_LABEL} x="114" y="526" textAnchor="end" fill="var(--color-ink-soft)">→ nothing happens</text>
    </svg>
  );
}

function BriefDiagram() {
  return (
    <svg
      viewBox="0 0 720 290"
      className="block h-auto w-full min-w-[30rem]"
      role="img"
      aria-label="The reasoning model sends a written brief to the vision model, which returns an observation."
    >
      <defs>
        <marker id="ch-arrow2" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-rule-hard)" />
        </marker>
      </defs>

      <rect x="6" y="56" width="252" height="184" fill="color-mix(in oklch, var(--color-i2) 10%, transparent)" stroke="var(--color-i2)" strokeWidth="1.4" />
      <text {...T_TITLE} x="132" y="84" textAnchor="middle" fill="var(--color-i2)">REASONING</text>
      <text {...T_SUB} x="132" y="112" textAnchor="middle" fill="var(--color-ink)">has the conversation</text>
      <text {...T_SUB} x="132" y="132" textAnchor="middle" fill="var(--color-ink)">has the task list</text>
      <text {...T_SUB} x="132" y="152" textAnchor="middle" fill="var(--color-ink)">has the user's words</text>
      <line x1="46" y1="170" x2="218" y2="170" stroke="var(--color-i2)" opacity=".35" />
      <text {...T_BIG} x="132" y="200" textAnchor="middle" fill="var(--color-i1)">cannot see</text>

      <rect x="462" y="56" width="252" height="184" fill="color-mix(in oklch, var(--color-i5) 8%, transparent)" stroke="var(--color-i5)" strokeWidth="1.4" />
      <text {...T_TITLE} x="588" y="84" textAnchor="middle" fill="var(--color-i5)">VISION</text>
      <text {...T_SUB} x="588" y="112" textAnchor="middle" fill="var(--color-ink)">has the pixels</text>
      <text {...T_SUB} x="588" y="132" textAnchor="middle" fill="var(--color-ink)">has one frame</text>
      <text {...T_SUB} x="588" y="152" textAnchor="middle" fill="var(--color-ink)">has no history</text>
      <line x1="502" y1="170" x2="674" y2="170" stroke="var(--color-i5)" opacity=".35" />
      <text {...T_BIG} x="588" y="200" textAnchor="middle" fill="var(--color-i1)">knows nothing else</text>

      <path d="M258 104 C 316 52, 404 52, 460 104" fill="none" stroke="var(--color-i2)" strokeWidth="1.5" markerEnd="url(#ch-arrow2)" />
      <text {...T_SUB} x="360" y="42" textAnchor="middle" fill="var(--color-i2)">watch_for — a brief it writes itself</text>

      <path d="M460 192 C 404 248, 316 248, 258 192" fill="none" stroke="var(--color-i5)" strokeWidth="1.5" markerEnd="url(#ch-arrow2)" />
      <text {...T_SUB} x="360" y="274" textAnchor="middle" fill="var(--color-i5)">observations only — never a verdict</text>
    </svg>
  );
}

const LEDGER = [
  { k: "ticks fired", w: 100, n: "15", fine: false },
  { k: "gate dropped", w: 53, n: "− 8", fine: false },
  { k: "frames sent", w: 47, n: "7", fine: false },
];

const PROMPT_BLOCKS = [
  {
    k: "[Camera feed]",
    free: false,
    v: "The vision model's caption for this frame, as text. The only trace a picture leaves.",
  },
  {
    k: "[Timers]",
    free: true,
    v: "Each running timer and its remaining time. Computed by subtracting two wall-clock numbers — no model is involved, so this block is free.",
  },
  {
    k: "[Task list]",
    free: false,
    v: "Every item with its status, its note, up to five observations, and its standing watch_for brief. Persisted to disk, so it survives a server restart.",
  },
  {
    k: "[Silence rule]",
    free: false,
    v: "Added only on a camera tick with an active goal: if nothing is new, reply with exactly [SILENT]. Never applied to something the user actually said.",
  },
  {
    k: "history",
    free: false,
    v: "The last ten turns. Camera ticks are excluded — 42 machine observations would otherwise crowd out the conversation.",
  },
];

const TOOLS = [
  ["update_task_list", "Replaces the whole document — items, statuses, notes, briefs, detail tier"],
  ["log_observation", "Appends a fact to an item. Two separate flags decide whether it interrupts the user and whether it ends a goal"],
  ["request_camera", "Asks for a frame when none is attached"],
  ["request_live_search", "Registers a “find X” goal and starts watching for it"],
  ["start_timer · cancel_timer", "Wall-clock, persisted; cancelling deletes rather than marking fired, so it does not announce the timer you just cancelled"],
  ["web_search · fetch_page", "A provider chain, because a single scraped endpoint fails in ways that look like success"],
  ["calculate · get_time", "The cheap deterministic things a language model should not be doing in its head"],
];

const REJECTED = [
  [
    "An orchestrator",
    "A controller routing between specialists has to anticipate every situation in advance. Letting the model reason and call tools in one chain means the thinking is the routing",
  ],
  [
    "Multiple agents",
    "Every check-in would pay for a coordination call to achieve what one model reading a shared document already does",
  ],
  [
    "A cheap relevance pre-filter",
    "A yes/no call before the real one, to skip irrelevant frames. Its “no” was indistinguishable from legitimate silence, so a frame showing the thing you asked for could vanish leaving no trace. Removed with no replacement",
  ],
];

function Wire({ children }: { children: React.ReactNode }) {
  return (
    <div className="notch-corner-sm overflow-x-auto border border-rule-hard bg-paper-hi px-4 py-3">
      <pre className="font-hero-mono m-0 text-[12.5px] leading-relaxed whitespace-pre text-ink">{children}</pre>
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
        <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i2">CHITRAGUPTA &middot; HOW IT WORKS</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Two models, one wall, and a written brief across it
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Every diagram on this page exists because of a number. The shape of the system is not a
          preference — it is what fits inside 200,000 vision tokens a day.
        </p>

        {/* 01 */}
        <section className="mt-16">
          <SectionHead num="01" title="What actually happens over a session" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            The reasoning model is the centre band: every turn routes through it, and it holds every
            piece of state. The camera is a{" "}
            <strong className="font-semibold text-ink">peripheral it switches on</strong> when a
            question needs eyes — nobody presses a button for that — and switches off again once the
            question is answered.
          </p>
          <div className="notch-corner mt-5 border border-i1/30 bg-i1/[0.06] p-5">
            <div className="font-hero-mono mb-2 text-[12px] tracking-wide text-i1">
              WHAT IS NOT TRUE OF THIS DIAGRAM
            </div>
            <p className="text-[14px] leading-relaxed text-ink">
              The centre band runs the full height because everything routes through it — not because
              it is listening. <strong className="font-semibold">There is no open microphone.</strong>{" "}
              Voice input is push-to-talk (<code className="font-hero-mono text-[13px]">continuous = false</code>),
              so a turn only begins when one of exactly three things happens:
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["You ask", "typed, or one press of the mic button"],
                ["A camera tick", "the only part that runs on its own"],
                ["A timer fires", "checked by arithmetic on a 15 s poll"],
              ].map(([k, v]) => (
                <div key={k} className="notch-corner-sm border border-rule-hard bg-panel px-3 py-2.5">
                  <div className="font-hero-mono text-[11.5px] text-ink">{k}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-ink-mid">{v}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-mid">
              So the live part is the camera loop, and only the camera loop. Getting that right with
              the model is the current work. A tick-driven conversation — the assistant holding a
              thread on its own between your questions — is the thing after it, and is not built.
            </p>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
            The figure keeps VideoLLM-online's band grammar — one model everything feeds into, a sequence
            interleaved into it in temporal order — but runs the clock downward, so it survives a
            phone. Read against that paper, the substitutions <em>are</em> the argument.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-mid">
            The two arrows crossing the right gutter are the whole protocol.{" "}
            <strong className="font-semibold text-ink">Amber going out</strong> is a brief the
            reasoning model wrote for eyes it does not have;{" "}
            <strong className="font-semibold text-ink">blue coming back</strong> is what those eyes
            reported. Note that the two briefs are shaped completely differently — a rigid one-line
            detection contract for a search that runs on every frame, and an open reading instruction
            when the answer has to be right once.
          </p>
          <Figure
            caption={
              <>
                <b className="text-ink">Two questions, one session.</b> The camera opens and closes
                twice — the gap between the blue blocks is the part that costs nothing at all. Inside
                the first window, one frame never left the browser, two produced{" "}
                <code className="font-hero-mono">[SILENT]</code>, and one was worth interrupting for.
                The row after it is the user's correction, which this system still has no way to act
                on: case 07 in the failure log. The second question then opens the camera again at a
                higher resolution, because reading a label is not the same job as spotting a bag.
              </>
            }
          >
            <SessionDiagram />
          </Figure>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                k: "The paper's frozen encoder runs on every frame",
                v: "Here the vision band exists only while the camera is open, and closes itself the moment the question is answered.",
              },
              {
                k: "The paper trains an EOS head to decide when to speak",
                v: "Here that decision is split between a browser-side diff gate and a prompt-level silence protocol. No training budget, so it moved somewhere cheaper.",
              },
              {
                k: "The paper caches frame history in the model",
                v: "Here each frame becomes one caption, in text. Hosted APIs cannot reuse image tokens across calls, so continuity has to arrive in words.",
              },
            ].map((c) => (
              <div key={c.k} className="notch-corner-sm border border-rule-hard bg-panel p-4">
                <div className="font-hero-mono text-[11px] leading-snug tracking-wide text-i5">{c.k}</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-mid">{c.v}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">
            The sample interval is user-set from 2 to 15 seconds and defaults to 4. It is a cost dial
            as much as a responsiveness one: at the coarse frame rate, halving the interval halves how
            long a day's token budget lasts.
          </p>
        </section>

        {/* 02 */}
        <section className="mt-16">
          <SectionHead num="02" title="Inside one tick: pixels travel one hop, then become words" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            A camera frame never reaches the model that answers you. It is converted to a short
            paragraph of text by a separate model, and the pixels are discarded at that line.
            Everything downstream — the reasoning, the tools, the memory — is text.
          </p>
          <Figure
            caption={
              <>
                <b className="text-ink">Two decisions are made before any money is spent.</b> The diff
                gate runs in the browser, so an unchanged scene never becomes a network request at
                all — it is the single largest cost control in the system. And a tick with nothing to
                say returns the literal string <code className="font-hero-mono">[SILENT]</code>, which
                is stripped server-side, so a watching assistant is quiet by default rather than
                narrating.
              </>
            }
          >
            <PipelineDiagram />
          </Figure>
        </section>

        {/* 03 */}
        <section className="mt-16">
          <SectionHead num="03" title="One model is blind; the other knows nothing" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            The reasoning model holds the entire conversation but cannot see. The vision model is
            looking straight at the answer but has no idea what anyone asked. Neither can be fixed by
            a better prompt to one of them — so they write to each other.
          </p>
          <Figure
            caption={
              <>
                <b className="text-ink">The brief is written by the model, not by me.</b> An earlier
                version inferred what to look for from the task text, which meant the system could
                only ever look for things I had anticipated. Now the reasoning model states its own
                question, and the vision stage answers only that.
              </>
            }
          >
            <BriefDiagram />
          </Figure>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            Briefs request observations, never judgement. A vision model asked for a verdict will
            give you one whether or not the frame supports it.
          </p>
        </section>

        {/* 04 */}
        <section className="mt-16">
          <SectionHead num="04" title="What one minute of watching costs" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            The free tier allows 200,000 vision tokens per day, total. In this architecture the
            vision model does nothing but look at pictures, so image tokens are the entire budget —
            and image cost scales with resolution, not with file size. Compressing the JPEG harder
            buys nothing at all.
          </p>

          <div className="notch-corner mt-6 border border-rule-hard bg-panel">
            {LEDGER.map((r) => (
              <div
                key={r.k}
                className="grid grid-cols-[7rem_1fr_4.5rem] items-center gap-3 border-b border-rule px-4 py-2.5 sm:grid-cols-[10rem_1fr_5.5rem]"
              >
                <span className="font-hero-mono text-[12px] text-ink-mid">{r.k}</span>
                <span className="h-[9px] bg-i5/15">
                  <span className="block h-full bg-i5" style={{ width: `${r.w}%` }} />
                </span>
                <span className="font-hero-mono text-right text-[12px] tabular-nums text-ink">{r.n}</span>
              </div>
            ))}
            <div className="grid grid-cols-[7rem_1fr_4.5rem] items-center gap-3 border-b border-rule bg-i5/[0.06] px-4 py-2.5 sm:grid-cols-[10rem_1fr_5.5rem]">
              <span className="font-hero-mono text-[12px] text-ink-mid">at 640 px</span>
              <span className="h-[9px] bg-i5/15">
                <span className="block h-full bg-i5" style={{ width: "29%" }} />
              </span>
              <span className="font-hero-mono text-right text-[12px] font-semibold tabular-nums text-i5">9,800</span>
            </div>
            <div className="grid grid-cols-[7rem_1fr_4.5rem] items-center gap-3 bg-i2/[0.07] px-4 py-2.5 sm:grid-cols-[10rem_1fr_5.5rem]">
              <span className="font-hero-mono text-[12px] text-ink-mid">at 1,024 px</span>
              <span className="h-[9px] bg-i2/15">
                <span className="block h-full bg-i2" style={{ width: "70%" }} />
              </span>
              <span className="font-hero-mono text-right text-[12px] font-semibold tabular-nums text-i2">23,968</span>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Extrapolated from the session's own measured numbers: a 4-second tick, ~1,400 tokens per
            coarse frame and 3,424 per fine one, and a gate that skipped roughly half the ticks. At
            the coarse rate a day's budget is about two and a half hours of continuous watching. At
            the fine rate it is under one.
          </p>

          <p className="mt-6 text-[14px] leading-relaxed text-ink-mid">
            So close-up mode is <strong className="font-semibold text-ink">opt-in, per step</strong>.
            The reasoning model turns it on when it needs to read something small, and the resolution
            change has to reach the browser before the next capture — resolution thrown away on the
            client can never be recovered on the server.
          </p>
          <div className="mt-4">
            <Wire>{`server →  frame_detail: "fine"
client ←  frame detail → fine (live ticks now 1024px)
groq   ←  Groq vision usage: Requested 3424`}</Wire>
          </div>
          <div className="notch-corner mt-5 border border-i1/30 bg-i1/[0.06] p-5">
            <p className="text-[14px] leading-relaxed text-ink">
              That number is also how a session died: the model switched close-up mode on, never
              switched it back, and hit the ceiling at{" "}
              <strong className="font-semibold">198,310 of 200,000 tokens</strong>.
            </p>
            <p className="mt-3 font-display text-[15px] italic leading-relaxed text-ink">
              A cost control that depends on the model's judgement does not hold.
            </p>
          </div>
        </section>

        {/* 05 */}
        <section className="mt-16">
          <SectionHead num="05" title="Everything the model needs is already in front of it" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            There is no retrieval step and no memory tool. Each reasoning call is assembled from
            blocks that are always present, because a model that has to <em>ask</em> for its state
            will reliably forget to ask.
          </p>
          <div className="mt-6 flex flex-col gap-[2px]">
            {PROMPT_BLOCKS.map((b) => (
              <div
                key={b.k}
                className={`grid gap-1 border border-rule border-l-[3px] bg-panel px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-x-5 ${
                  b.free ? "border-l-i5" : "border-l-i2"
                }`}
              >
                <span className={`font-hero-mono text-[12.5px] ${b.free ? "text-i5" : "text-i2"}`}>{b.k}</span>
                <span className="text-[13px] leading-relaxed text-ink-mid">{b.v}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-ink-mid">
            Timers store a start time and a duration rather than sleeping, so a restart loses nothing
            and checking them costs no inference. The task list is written by the model as a
            full-list replace — it rewrites the whole document each time, which removes an entire
            class of partial-update bugs at the price of a slightly larger payload.
          </p>
        </section>

        {/* 06 */}
        <section className="mt-16">
          <SectionHead num="06" title="Ten tools, and one rule learned the hard way" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-[13px]">
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
                    <td className="font-hero-mono border-b border-rule px-3 py-3 align-top whitespace-nowrap text-ink">{t}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="notch-corner mt-5 border border-i2/40 bg-i2/[0.07] p-5">
            <p className="font-display text-lg italic text-ink">One flag, one consequence.</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-mid">
              A single boolean on <code className="font-hero-mono text-[13px]">log_observation</code>{" "}
              once did three unrelated jobs at once: it guaranteed the user was told, it marked the
              step complete, and it switched the camera off. The model set it on ordinary progress
              notes — correctly, by the description it had been given — and the camera kept shutting
              off mid-task for reasons nobody could see. Splitting it into two flags with one effect
              each fixed it permanently.
            </p>
          </div>
        </section>

        {/* 07 */}
        <section className="mt-16">
          <SectionHead num="07" title="Three designs I rejected" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-[13px]">
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
                    <td className="border-b border-rule px-3 py-3 align-top whitespace-nowrap text-ink">{t}</td>
                    <td className="border-b border-rule px-3 py-3 align-top text-ink-mid">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            That last one is the rule I reach for most often outside this project: never add a filter
            whose rejection is indistinguishable from a normal quiet outcome. Failures have to be
            visible or they are not failures, they are behaviour.
          </p>
        </section>

        <div className="mt-16">
          <Link
            to="/case-study/chitragupta/failure-log"
            className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i2/60 sm:p-6"
          >
            <div>
              <div className="font-display text-lg font-semibold text-ink">What broke &rarr;</div>
              <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">
                Eight failures, each with the symptom, the root cause, and the rule it produced.
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
