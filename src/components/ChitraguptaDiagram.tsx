/**
 * Chitragupta's architecture figure, shared by the homepage bridge band and
 * the case study's own section 01. One definition so the two cannot drift.
 *
 * The document is the widest object on purpose: everything below it reads it,
 * and the two things that read it are doing completely different jobs. Stage 1
 * writes, and its prose is thrown away. The trigger engine only reads, costs
 * nothing, and is the only thing that can start a sentence. Reading those two
 * arrows against each other is the whole argument.
 *
 * Vertical because it has to survive a phone — a wide figure is a figure
 * nobody scrolls. Every number is from server/live/config.py.
 */

/* SVG text has no cascade of its own worth relying on, so type is set per
   element from these. Casing is literal: text-transform is an SVG 2
   presentation attribute and not reliably honoured. */
const T_TITLE = { fontFamily: "var(--font-data)", fontSize: 11.5, letterSpacing: ".09em" };
const T_SUB = { fontFamily: "var(--font-data)", fontSize: 10.5 };
const T_LABEL = { fontFamily: "var(--font-sans)", fontSize: 11, fontStyle: "italic" as const };
const T_BIG = { fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600 };

export function ChitraguptaDiagram() {
  return (
    <svg
      viewBox="0 0 720 706"
      className="block h-auto w-full min-w-[31rem]"
      role="img"
      aria-label="A vertical diagram. A phone camera sends a frame, which the browser's diff and flat-frame gates may drop before it leaves. The vision model turns the frame into about forty words of plain text, and a dashed line marks where the pixels stop. Below it, a full-width world document holds all state. Two things read that document: a reasoning stage that does bookkeeping and writes back, and a zero-token arithmetic trigger engine that emits an event or nothing. Only a trigger can start the separate speech decision, which passes a politeness gate before anything is spoken aloud."
    >
      <defs>
        <marker id="ch2-arrow" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-rule-hard)" />
        </marker>
      </defs>

      {/* Camera */}
      <rect x="230" y="10" width="260" height="48" fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TITLE} x="360" y="32" textAnchor="middle" fill="var(--color-ink)">PHONE CAMERA</text>
      <text {...T_SUB} x="360" y="48" textAnchor="middle" fill="var(--color-ink-soft)">a frame, on an interval</text>

      <line x1="360" y1="58" x2="360" y2="96" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch2-arrow)" />

      {/* What never leaves the browser */}
      <line x1="228" y1="78" x2="124" y2="78" stroke="var(--color-rule-hard)" strokeWidth="1.4" strokeDasharray="3 3" markerEnd="url(#ch2-arrow)" />
      <text {...T_LABEL} x="118" y="74" textAnchor="end" fill="var(--color-ink-soft)">unchanged, or flat —</text>
      <text {...T_LABEL} x="118" y="89" textAnchor="end" fill="var(--color-ink-soft)">never leaves the browser</text>

      {/* Vision */}
      <rect x="190" y="98" width="340" height="80" fill="color-mix(in oklch, var(--color-i5) 8%, transparent)" stroke="var(--color-i5)" strokeWidth="1.4" />
      <text {...T_SUB} x="360" y="120" textAnchor="middle" fill="var(--color-i5)">DEEPINFRA</text>
      <text {...T_BIG} x="360" y="144" textAnchor="middle" fill="var(--color-ink)">Qwen3-VL-30B-A3B</text>
      <text {...T_SUB} x="360" y="164" textAnchor="middle" fill="var(--color-ink-soft)">never reasons · never decides</text>

      <line x1="360" y1="178" x2="360" y2="214" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch2-arrow)" />
      <text {...T_SUB} x="370" y="200" fill="var(--color-i5)">a plain-text caption</text>

      <line x1="8" y1="228" x2="712" y2="228" stroke="var(--color-i1)" strokeWidth="1" strokeDasharray="5 4" />
      <text {...T_LABEL} x="8" y="222" fill="var(--color-i1)">
        the pixels stop here — nothing below this line has ever seen an image
      </text>

      {/* The document */}
      <rect x="40" y="242" width="640" height="98" fill="var(--color-paper-hi)" stroke="var(--color-ink)" strokeWidth="2" />
      <text {...T_TITLE} x="360" y="266" textAnchor="middle" fill="var(--color-ink)">THE WORLD DOCUMENT</text>
      <text {...T_LABEL} x="360" y="284" textAnchor="middle" fill="var(--color-ink-mid)">
        primary state — it survives restarts, and it is what every prompt is built from
      </text>
      <text {...T_SUB} x="360" y="306" textAnchor="middle" fill="var(--color-ink)">
        goal · tasks · proposed plan · expectations · find list
      </text>
      <text {...T_SUB} x="360" y="324" textAnchor="middle" fill="var(--color-ink)">
        narrative · environment facts · recent captions
      </text>

      {/* Down into the two readers */}
      <line x1="200" y1="340" x2="200" y2="380" stroke="var(--color-i2)" strokeWidth="1.5" markerStart="url(#ch2-arrow)" markerEnd="url(#ch2-arrow)" />
      <text {...T_SUB} fontSize={9.5} x="192" y="364" textAnchor="end" fill="var(--color-ink-soft)">reads · writes</text>

      <line x1="540" y1="340" x2="540" y2="380" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch2-arrow)" />
      <text {...T_SUB} fontSize={9.5} x="548" y="364" fill="var(--color-ink-soft)">reads only</text>

      {/* Stage 1 */}
      <rect x="40" y="382" width="320" height="96" fill="color-mix(in oklch, var(--color-i2) 10%, transparent)" stroke="var(--color-i2)" strokeWidth="1.4" />
      <text {...T_SUB} x="200" y="404" textAnchor="middle" fill="var(--color-i2)">STAGE 1 · BOOKKEEPING</text>
      <text {...T_BIG} x="200" y="428" textAnchor="middle" fill="var(--color-ink)">DeepSeek v4-flash</text>
      <text {...T_SUB} x="200" y="448" textAnchor="middle" fill="var(--color-ink-soft)">15 tools · text only, never a pixel</text>
      <text {...T_SUB} x="200" y="466" textAnchor="middle" fill="var(--color-ink-soft)">its prose is discarded</text>

      {/* Triggers */}
      <rect x="400" y="382" width="280" height="96" fill="color-mix(in oklch, var(--color-i3) 9%, transparent)" stroke="var(--color-i3)" strokeWidth="1.4" />
      <text {...T_SUB} x="540" y="404" textAnchor="middle" fill="var(--color-i3)">TRIGGERS</text>
      <text {...T_BIG} x="540" y="428" textAnchor="middle" fill="var(--color-ink)">0 tokens</text>
      <text {...T_SUB} x="540" y="448" textAnchor="middle" fill="var(--color-ink-soft)">pure arithmetic over the document</text>
      <text {...T_SUB} x="540" y="466" textAnchor="middle" fill="var(--color-ink-soft)">the only thing that starts a sentence</text>

      <text {...T_LABEL} fontSize={10.5} x="40" y="500" fill="var(--color-ink-mid)">
        Scored on one thing: is the document
      </text>
      <text {...T_LABEL} fontSize={10.5} x="40" y="515" fill="var(--color-ink-mid)">
        now accurate? It is never asked to weigh
      </text>
      <text {...T_LABEL} fontSize={10.5} x="40" y="530" fill="var(--color-ink-mid)">
        that against whether to speak.
      </text>

      <line x1="540" y1="478" x2="540" y2="516" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch2-arrow)" />
      <text {...T_SUB} fontSize={9.5} x="548" y="502" fill="var(--color-ink-soft)">an event — or nothing</text>

      {/* Stage 2 */}
      <rect x="400" y="518" width="280" height="78" fill="color-mix(in oklch, var(--color-i2) 10%, transparent)" stroke="var(--color-i2)" strokeWidth="1.4" />
      <text {...T_SUB} x="540" y="540" textAnchor="middle" fill="var(--color-i2)">STAGE 2 · THE SPEECH DECISION</text>
      <text {...T_SUB} fontSize={11} x="540" y="562" textAnchor="middle" fill="var(--color-ink)">
        “does the user need to hear
      </text>
      <text {...T_SUB} fontSize={11} x="540" y="574" textAnchor="middle" fill="var(--color-ink)">something?”</text>
      <text {...T_SUB} fontSize={9.5} x="540" y="588" textAnchor="middle" fill="var(--color-ink-soft)">
        no tools · no document · one question
      </text>

      <line x1="540" y1="596" x2="540" y2="634" stroke="var(--color-rule-hard)" strokeWidth="1.5" markerEnd="url(#ch2-arrow)" />
      <text {...T_SUB} fontSize={9.5} x="548" y="612" fill="var(--color-ink-soft)">politeness gate · 90 s</text>
      <text {...T_SUB} fontSize={9.5} x="548" y="625" fill="var(--color-i1)">[URGENT] bypasses it</text>

      <rect x="400" y="636" width="280" height="48" fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TITLE} x="540" y="658" textAnchor="middle" fill="var(--color-ink)">SPOKEN ALOUD</text>
      <text {...T_SUB} x="540" y="674" textAnchor="middle" fill="var(--color-ink-soft)">on-device speech synthesis</text>

      <text {...T_LABEL} fontSize={10.5} x="40" y="662" fill="var(--color-ink-soft)">An idle tick costs one vision call</text>
      <text {...T_LABEL} fontSize={10.5} x="40" y="677" fill="var(--color-ink-soft)">and one reasoning call. Stage 2 is</text>
      <text {...T_LABEL} fontSize={10.5} x="40" y="692" fill="var(--color-ink-soft)">skipped entirely when nothing happened.</text>
    </svg>
  );
}
