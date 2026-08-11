import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, ChevronDown } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { SectionHead } from "../components/SectionHead";
import { DataSheet, type DataRow } from "../components/DataSheet";
import { SkillTags, type SkillGroup } from "../components/SkillTags";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

const WHY = [
  {
    tag: "NO HUMAN EDITOR",
    title: "Every relevance call is machine-made",
    desc: "Skip or publish, which entities matter, what still needs researching: all model judgment. Nobody reviews a draft before it goes out at 8 AM.",
  },
  {
    tag: "HARD TOKEN CAP",
    title: "4,096 completion tokens per call, no exceptions",
    desc: "The starter-tier ceiling is fixed. Reasoning and output share the same budget, so a call that reasons too long can return nothing at all.",
  },
];

const RESEARCH_STRATEGY = [
  {
    tag: "STEP 1 · ENTITIES",
    title: "Find the nouns, resolve the ambiguous ones",
    desc: "Stage 1 reads the article and title and produces two things: research questions that would fill real gaps in the story, and a list of named entities, the people, products, and companies worth knowing about.",
    detail:
      "Most entities are unambiguous (“OpenAI,” “Google”) and get a plain, direct definition search, cheap and fast, since there's only one real answer. Some aren't: “Python” (the language or the snake), “Elastic” (the company or the physics concept). For these the model is asked to flag the entity as ambiguous and write its best guess at which sense applies, from context alone, before any search runs. That guess is what disambiguates the search, instead of search having to guess blind. This exists because of two separate failures: first, ambiguous entities weren't being classified at all, so searches came back confidently wrong (a project called “Tom Riddle” resolved to a mobile game, “xovi” resolved to NASCAR); second, even once flagged, a plain keyword search still couldn't reliably resolve the ambiguity on its own. Classifying, then searching with that context attached, is what fixed both, and it's also the cheapest path: most entities are unambiguous and need nothing more than a plain search, no extra API calls.",
  },
  {
    tag: "STEP 2 · COMPLEX QUESTIONS",
    title: "Send what a keyword search can't answer to a real research agent",
    desc: "Some questions a news article raises don't have one searchable fact behind them at all, e.g. “What are the geopolitical implications of the US blocking Fable and Mythos models, and how does Z.ai benefit?”",
    detail:
      "Early versions of the pipeline just skipped questions like this, since there was no tool that could actually investigate one; a keyword search returns a page that mentions the same words, not an answer that weighs several facts together. That's what the self-built research agent is for: routed only the queries that genuinely need reasoning across multiple sources, not the entity lookups from Step 1, which stay on free search since they don't need it.",
  },
];

const STAGES = [
  {
    tag: "COLLECT",
    title: "RSS (8 feeds) + GitHub trending",
    desc: "Deterministic filters strip job listings, listicle spam, and low-traction repos before any model ever sees them.",
    detail:
      "8 RSS feeds (Hacker News, MIT Technology Review, TechCrunch, The Verge, Ars Technica, VentureBeat AI, OpenAI News, DeepMind Blog) plus GitHub trending across the topic queries in config/github.yaml. Two filter layers run before a model ever sees a GitHub item: a denylist for abuse and job-listing terms plus a regex that flags listicle-style spam (a year stamp next to a marketing word like “ultimate” or “guide”), then a batched sarvam-105b call acting as an editor, approving only genuine AI/ML developments. That editorial verdict is known to be batch-context-dependent, the same repo can be approved or rejected depending on what else is in its batch of 15, an accepted limitation rather than a solved one.",
  },
  {
    tag: "NORMALIZE",
    title: "Detect language, translate before Stage 1",
    desc: "A non-English source (title, summary, or scraped body) is translated to English before any model reads it, so the entities extracted later are the real ones, not a mistranslation.",
    detail:
      "langdetect samples up to 500 characters of the scraped body locally, no API call, to guess the source language. Anything not English gets the title, summary, and full scraped text run through Google Translate before Stage 1 ever reads them. This step didn't exist originally: a Chinese-sourced article that Sarvam synthesized from went straight into Hindi generation completely untranslated. Verified end-to-end on a real Chinese article afterward: a person's name was correctly translated and the full pipeline still produced a complete, well-formed Hindi article.",
  },
  {
    tag: "CLUSTER",
    title: "Same-story detection",
    desc: "Sentence embeddings (all-mpnet-base-v2) group outlets covering the same event so it's written once, not once per source.",
    detail:
      "Titles are embedded with all-mpnet-base-v2 (768 dimensions, local, no API) and compared pairwise by cosine similarity at a 0.44 threshold, tuned against a known set of real true and false positive pairs. This replaced two earlier approaches, word-overlap counting and then TF-IDF, both of which missed genuine duplicates worded differently. The accepted tradeoff: two different Anthropic stories (a product launch, a funding round) can occasionally score high enough to fold together. Judged better than the alternative failure mode: the same story published twice.",
  },
  {
    tag: "GATE",
    title: "Scrape, then decide if it's worth writing",
    desc: "A free deterministic length check discards unscrapable pages before any model runs. What follows is a real sarvam-30b call: a skip gate that asks for its own stated reason before its verdict, so it commits to a judgment before any reasoning exists to justify one.",
    model: "sarvam-30b · reasoning off",
    detail:
      "The only free step here is a length check on the scraped text (reject anything too thin to be a real article) before any model is called. Everything after that costs a real, metered API call: a skip gate that writes its stated REASON before its SKIP verdict (with reasoning off, word order is the only lever, reversing it took the gate from 0/5 correct to 10/10 across real articles); an entity and research-gap analysis call reading the first 2,000 characters of the source (raised from 800 after that shorter window cut off real entity names and left only generic nouns to extract); and a JSON-extraction call that transcribes that analysis instead of re-deciding anything. Three sarvam-30b calls per article that reaches this stage, not one.",
  },
  {
    tag: "RESEARCH",
    title: "Entity + gap analysis, cache, tiered search",
    desc: "A cache hit costs nothing. A cache miss means a free DuckDuckGo or Google News fetch, then a real sarvam-30b call to turn that raw material into a direct answer, or a call out to a self-built research agent for anything needing real reasoning.",
    model: "sarvam-30b · 3 calls + research agent",
    detail:
      "Every extracted entity checks a 45-day knowledge cache before anything is searched, a genuine cost saving since a cache hit skips both the search and the model call that would otherwise follow it. On a cache miss, retrieval itself is free (DuckDuckGo or Google News, no API key), but the raw snippets are then distilled into a direct answer by a real sarvam-30b call, that synthesis step is not free, it's what keeps entity_context from being unusable snippet soup. Ambiguous entities and comparison or why-now questions skip DDG entirely and go to a separate research agent, a second project of mine that actually reads multiple sources and reasons about conflicting claims instead of keyword-matching a snippet, called here as a paid API. A code-level filter drops any comparison query that names a competitor never mentioned in the article, since prompt wording alone didn't stop the model from inventing one. Any later query still saying “this” or “it” with no named entity gets the article's own opening question attached as background context before it's dispatched, since the agent answering it has no memory of the sibling query it's implicitly relying on.",
    link: {
      url: "https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool",
      label: "Live demo of the research agent",
    },
  },
  {
    tag: "PLAN",
    title: "Editorial strategy, split into analysis then JSON",
    desc: "A first call reasons through the story in plain text; a second transcribes that thinking into the paragraph plan, so hidden reasoning never eats the plan itself.",
    model: "sarvam-105b · 2 calls",
    detail:
      "The first call writes its editorial thinking out in plain text (core narrative, key facts and quotes, disambiguation targets, paragraph plan) with reasoning explicitly off, so the visible output is the actual thinking, not a summary competing with hidden reasoning tokens for the same completion budget. The second call transcribes that plain text into the strict JSON schema, told not to re-analyze or invent anything not already written. Before this split, one combined call occasionally burned its entire budget on invisible reasoning and returned JSON cut off mid-object, which silently fell through to a bare translated stub.",
  },
  {
    tag: "WRITE",
    title: "Hindi article, six labeled sections out",
    desc: "Executes the plan into flowing Hindi prose against a per-section word-count target, not just a paragraph count; one automatic retry absorbs transient API failures before falling back to plain translation.",
    model: "sarvam-105b",
    detail:
      "Output is plain, labeled Hindi text (headline, a short concept explainer, intro, main body, analysis, conclusion), each section with its own word-count target and an overall target for the piece, not JSON: an earlier version of this stage did output JSON, adopted specifically to stop labels drifting into Hindi or markdown mid-response, but the current prompt reverted to labeled plain text as the primary format, JSON is kept only as a fallback parser in case the model reverts to its old habit. Explicitly told to write comprehensively rather than a short gist, since real completion usage was measured at only ~11% of the token cap. A separate fix stops the model from copying the plan's own instruction wording (“explain the technology behind X”) into the article instead of actually explaining it. One automatic retry absorbs a rare transient API failure, since a real production run once failed twice for a reason that reproduced cleanly 3 out of 3 times when retried in isolation, before falling back to a plain-translated stub.",
  },
];

// Each pipeline stage is labeled like an instance in the figure plate: a base
// hue from the categorical scale, keyed by stage order. GATE is red (it's the
// reject gate); RESEARCH keeps green, matching the flagship's own links below.
// `v` is the same hue as a raw custom property, for the SVG figure — Tailwind
// classes don't reach into SVG paint attributes, and one array keeps the
// architecture diagram and the stage list below it from ever disagreeing.
const STAGE_ACCENT = [
  { text: "text-i5", dot: "bg-i5", hl: "bg-i5/20", v: "var(--color-i5)" }, // COLLECT
  { text: "text-i4", dot: "bg-i4", hl: "bg-i4/20", v: "var(--color-i4)" }, // NORMALIZE
  { text: "text-i6", dot: "bg-i6", hl: "bg-i6/20", v: "var(--color-i6)" }, // CLUSTER
  { text: "text-i1", dot: "bg-i1", hl: "bg-i1/20", v: "var(--color-i1)" }, // GATE
  { text: "text-i3", dot: "bg-i3", hl: "bg-i3/20", v: "var(--color-i3)" }, // RESEARCH
  { text: "text-i2", dot: "bg-i2", hl: "bg-i2/25", v: "var(--color-i2)" }, // PLAN
  { text: "text-i5", dot: "bg-i5", hl: "bg-i5/20", v: "var(--color-i5)" }, // WRITE
];

// The design ideology in plain English: each pipeline stage is a desk in a
// newsroom, kept separate for the same reason a real newsroom keeps it separate.
// Index-aligned with STAGES / STAGE_ACCENT so the colours match the mechanics below.
const NEWSROOM = [
  {
    role: "The wire desk",
    line: "reads everything, keeps almost nothing",
    why: "A mountain of tech news lands every morning and most of it is noise. The first job is simply to scan all of it and throw the junk back, so the rest of the newsroom only ever looks at things that might be real stories.",
    mark: "throw the junk back",
  }, // COLLECT
  {
    role: "The foreign desk",
    line: "makes sure a foreign story is actually understood first",
    why: "If something breaks in another language, you don't report on your rough guess of what it says. You get it properly understood before anyone writes a word, because every step after this is built on top of it.",
    mark: "properly understood before anyone writes a word",
  }, // NORMALIZE
  {
    role: "The news editor",
    line: "notices when five outlets are telling one story",
    why: "One event covered by five sites is still one event. Someone has to catch that and say “we cover this once, and cover it well,” instead of publishing the same thing five times over.",
    mark: "we cover this once, and cover it well",
  }, // CLUSTER
  {
    role: "The gut check",
    line: "decides whether it's even worth a story",
    why: "Not everything that's true is worth writing. This is the editor's “so what?” — a plain yes or no, made before anyone spends effort on a piece that shouldn't exist.",
    mark: "a plain yes or no",
  }, // GATE
  {
    role: "The reporter",
    line: "does the legwork the original article didn't",
    why: "This is the part that makes it reporting and not rewording: chasing down the facts the source left out or took for granted, so the finished piece knows things the article it started from never said.",
    mark: "reporting and not rewording",
  }, // RESEARCH
  {
    role: "The editorial meeting",
    line: "agrees what the story is actually about",
    why: "Before a word is written, the desk settles the angle — what the story is really about, what to lead with, what to cut. Skip this and you get a pile of facts instead of a story.",
    mark: "a pile of facts instead of a story",
  }, // PLAN
  {
    role: "The writer",
    line: "writes it fresh, in the paper's own voice",
    why: "Only now does anyone write — an original Hindi article built from the plan, not a translation of the English source. A brand-new piece, not a reworded one.",
    mark: "not a translation of the English source",
  }, // WRITE
];

// Wrap the key phrase of a sentence in a coloured highlighter mark so a skimmer
// catches the point without reading the whole line. Falls back to plain text if
// the phrase isn't found, so copy edits can never break the render.
function markPhrase(text: string, phrase: string, hl: string) {
  const idx = text.indexOf(phrase);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={`box-decoration-clone px-0.5 text-ink ${hl}`}>{phrase}</mark>
      {text.slice(idx + phrase.length)}
    </>
  );
}

// The head-matter datasheet: the whole system in eight rows, before any prose.
// Every row carries the site's epistemic status so a scanner can tell a
// measurement from a deployment claim — including the two rows that are not
// flattering, which is the point of having the status system at all.
const DATASHEET: DataRow[] = [
  {
    k: "Status",
    v: "Live. Publishes daily at 08:00 IST, unattended, building since June 2026.",
    s: "shipped",
    label: "Shipped",
  },
  {
    k: "Autonomy",
    v: "No human editor. Every skip-or-publish call, every relevance judgment, is machine-made.",
    s: "shipped",
    label: "Shipped",
  },
  {
    k: "Infrastructure",
    v: "One GitHub Actions job. No server, no database, no hosting bill.",
    s: "shipped",
    label: "Shipped",
  },
  {
    k: "Cost per run",
    v: (
      <>
        <span className="font-mono tabular-nums">~$0.008</span> USD, across a seven-stage pipeline.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "Intake",
    v: (
      <>
        <span className="font-mono tabular-nums">61</span> usable candidates per run, up from ~15, across 8 RSS
        feeds plus GitHub trending.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "Triage accuracy",
    v: (
      <>
        <span className="font-mono tabular-nums">81.9%</span>, up from{" "}
        <span className="font-mono tabular-nums">73.8%</span> after one prompt fix — scored against 1,505
        hand-labeled rows in three golden sets.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "Known weakness",
    v: (
      <>
        <span className="font-mono tabular-nums">26.3%</span> of generated claims are unsupported by the source
        on the faithfulness baseline. Reported as-is, not tuned away.
      </>
    ),
    s: "measured",
    label: "Measured",
  },
  {
    k: "Tiered research routing",
    v: "Built, verified, and kept in the codebase — switched off for production runs on cost and build time.",
    s: "pending",
    label: "Off in prod",
  },
];

// Production volume, read out of the GitHub Actions run logs and the traces the
// pipeline commits about itself. These answer a different question from the
// datasheet's evaluation rows: not "is its judgment sound" but "does it actually
// run, every day, without anyone holding it up" — so they get their own table
// rather than being mixed into the same list.
//
// `trace: true` marks a figure that covers only the 28 runs which committed
// machine-readable traces. Trace committing landed on 2026-07-07, so eight
// earlier runs left nothing behind and those totals are floors, not totals. The
// dagger is not decoration: an unqualified number here would be a lie by
// omission, and this page's whole argument is that its numbers are honest.
//
// Deliberately absent: per-call LLM volume (recorded nowhere — inferring it from
// the architecture would be an estimate wearing a measurement's clothes) and any
// readership figure (the pipeline publishes; nobody has been told to read it).
const SCALE: { k: string; n: string; v: string; trace?: boolean }[] = [
  { k: "Operating window", n: "39", v: "scheduled runs across 31 days, unattended." },
  // 848 ÷ 36 = 23.6, so the average is per completed run, not per scheduled one.
  // Worth the extra word: the two divisors differ and the page shows both.
  { k: "Compute", n: "848 min", v: "(14.1 hours) of Actions runtime, averaging 23.6 minutes a completed run." },
  {
    k: "Published, to date",
    n: "860",
    v: "articles in the store — 588 from RSS, 192 from GitHub trending, 80 synthesized.",
  },
  {
    k: "Hindi prose written",
    n: "2,262,387",
    v: "characters, averaging 2,980 per full three-stage article.",
  },
  { k: "Source text read", n: "2,027,544", v: "characters scraped and processed, roughly 338,000 words.", trace: true },
  {
    k: "Pipeline throughput",
    n: "731",
    v: "articles reached the pipeline after clustering — 635 published, 63 rejected by the relevance gate, 8 too thin to be worth writing.",
    trace: true,
  },
  {
    k: "Research dispatched",
    n: "2,774",
    v: "search queries — 1,812 identity lookups, 962 gap and context questions.",
    trace: true,
  },
  { k: "Entity knowledge base", n: "2,272", v: "entities cached to date." },
  {
    k: "Cache effectiveness",
    n: "30%",
    v: "of 2,584 extractions answered from cache: no search, no model call, no cost.",
    trace: true,
  },
  {
    k: "Under failure",
    n: "3.4%",
    v: "of Stage 2 calls failed; each degraded to a fallback rather than dropping the article.",
    trace: true,
  },
];

// Grouped rather than a flat chip cloud: the grouping is the claim. A recruiter
// reading for one track can find their row without reading the other three.
const SKILL_GROUPS: SkillGroup[] = [
  [
    "LLM systems",
    ["Multi-stage prompt pipelines", "Plan-execute decomposition", "Cost-tiered model routing", "Agent-to-agent calls", "Structured JSON extraction"],
  ],
  ["Evaluation", ["Hand-labeled golden sets", "LLM-as-judge calibration", "Before/after prompt A/B", "Failure taxonomies"]],
  // Named "Local models" rather than "ML": this project is an LLM-systems
  // project, and an ML row padded out with a checkpoint name and a similarity
  // metric undersells it to anyone scanning for real ML — which lives on the
  // segmentation case study, not here. What is genuinely worth showing is the
  // judgment behind these three: deduplication and language detection were kept
  // off the metered path on purpose, which is the same argument the figure's
  // cost rail makes.
  ["Local models", ["sentence-transformers", "Embedding-based dedup", "Language detection"]],
  ["Engineering", ["Python", "GitHub Actions CI/CD", "TTL caching", "BeautifulSoup", "pytest"]],
];

/* ── Architecture figure ───────────────────────────────────────────────────
 * One vertical spine, read downward, because a wide figure on a phone is a
 * figure nobody scrolls. Three columns carry three different questions:
 *
 *   left   — what this stage costs. A filled square is a metered model call;
 *            a hollow one runs locally and costs nothing. The two hollow
 *            squares in the middle of the column are the whole cost argument:
 *            deduplication and language detection were deliberately kept off
 *            the meter, so the budget is spent on judgment, not bookkeeping.
 *   centre — the stage itself, in the same hue it carries in the stage list
 *            further down the page.
 *   right  — what falls out here (red, with a branch arrow) or what this stage
 *            adds that the source article never had.
 *
 * Every number in it is stated elsewhere on this page; the figure introduces
 * none of its own. */

const T_TAG = { fontFamily: "var(--font-data)", fontSize: 10.5, letterSpacing: ".09em" };
const T_RAIL = { fontFamily: "var(--font-data)", fontSize: 9 };
const T_HEAD = { fontFamily: "var(--font-display)", fontSize: 12.5, fontWeight: 600 };
const T_NOTE = { fontFamily: "var(--font-sans)", fontSize: 10, fontStyle: "italic" as const };

type ArchStage = {
  title: string;
  /** Left rail: up to two short lines. */
  cost: [string, string];
  /** Filled marker = a real, metered API call happens here. */
  metered: boolean;
  /** Right column: two lines. `reject` draws the branch arrow and colours it. */
  note: [string, string];
  reject?: boolean;
  /** Extra lines inside the box — only RESEARCH earns them (the cache). */
  inset?: [string, string];
};

const ARCH: ArchStage[] = [
  {
    title: "8 RSS feeds + GitHub trending",
    cost: ["sarvam-105b", "batched editor"],
    metered: true,
    note: ["job ads, listicle spam, low-traction repos", "— dropped by regex before any model runs"],
    reject: true,
  },
  {
    title: "detect language, translate to English",
    cost: ["langdetect", "local · free"],
    metered: false,
    note: ["non-English sources are translated first,", "so the entities extracted are the real ones"],
  },
  {
    title: "same-story detection by embedding",
    cost: ["mpnet-768d", "local · free"],
    metered: false,
    note: ["five outlets, one event — cosine ≥ 0.44", "folds them into one story, written once"],
    reject: true,
  },
  {
    title: "scrape, then decide if it's worth writing",
    cost: ["sarvam-30b", "× 3 calls"],
    metered: true,
    note: ["not worth writing — the gate states its", "REASON before its VERDICT (0/5 → 10/10)"],
    reject: true,
  },
  {
    title: "entity + gap analysis, tiered search",
    cost: ["sarvam-30b × 3", "45-day cache 1st"],
    metered: true,
    note: ["", ""],
    inset: ["a 45-day entity cache is checked first —", "a hit costs nothing at all: no search, no call"],
  },
  {
    title: "editorial strategy, then a paragraph plan",
    cost: ["sarvam-105b", "× 2 calls"],
    metered: true,
    note: ["the thinking is written out as plain text", "first, then transcribed into strict JSON"],
  },
  {
    title: "original Hindi prose, six sections",
    cost: ["sarvam-105b", "× 1 + one retry"],
    metered: true,
    note: ["six labeled Hindi sections — 2.3× longer", "once the plan was fixed, not the token cap"],
  },
];

const BOX_X = 124;
const BOX_W = 292;
const CX = BOX_X + BOX_W / 2;
const BOX_R = BOX_X + BOX_W;
/** A real gutter between the stage column and the notes, so the branch arrows
 *  and the two-way call to the research agent read as connectors, not ticks. */
const NOTE_X = 458;
const VB_W = 720;

const TRIG_Y = 28;
const CAP_H = 46;
const GAP = 24;
const ROW_H = 56;
const RESEARCH_H = 76;

/** Walk the rows once so the boxes, the rail and the arrows can't drift. */
function archLayout() {
  let y = TRIG_Y + CAP_H + GAP;
  const rows = ARCH.map((s, i) => {
    const h = i === 4 ? RESEARCH_H : ROW_H;
    const top = y;
    y += h + GAP;
    return { s, i, top, h };
  });
  return { rows, outY: y, total: y + CAP_H + 32 };
}

function ArchitectureDiagram() {
  const { rows, outY, total } = archLayout();

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${total}`}
      className="block h-auto w-full min-w-[32rem]"
      role="img"
      aria-label="The pipeline read downward as seven stages, from a daily GitHub Actions cron to a Hindi edition committed back to the repository. A left-hand rail marks what each stage costs: collect, gate, research, plan and write each make metered model calls, while language detection and same-story clustering run locally and cost nothing. A right-hand column marks the three stages that reject material — collect drops job ads and listicle spam by regex, cluster folds five outlets covering one event into a single story at a cosine similarity of 0.44, and the gate skips articles not worth writing. The research stage checks a 45-day entity cache before any search and calls out to a separately built research agent for ambiguous entities and comparison questions."
    >
      <defs>
        <marker id="td-arw" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-rule-hard)" />
        </marker>
        <marker id="td-arw-x" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-i1)" />
        </marker>
        <marker id="td-arw-g" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-i3)" />
        </marker>
      </defs>

      {/* Column headers — three columns, three different questions */}
      <text {...T_RAIL} x={6} y={14} letterSpacing=".08em" fill="var(--color-ink-soft)">
        WHAT IT COSTS
      </text>
      <text {...T_RAIL} x={NOTE_X} y={14} letterSpacing=".08em" fill="var(--color-ink-soft)">
        WHAT IT DROPS, OR ADDS
      </text>

      {/* Trigger */}
      <rect x={BOX_X} y={TRIG_Y} width={BOX_W} height={CAP_H} fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TAG} x={CX} y={TRIG_Y + 20} textAnchor="middle" fill="var(--color-ink)">
        GITHUB ACTIONS · DAILY CRON
      </text>
      <text {...T_NOTE} x={CX} y={TRIG_Y + 36} textAnchor="middle" fill="var(--color-ink-soft)">
        one job, 08:00 IST, nobody watching
      </text>
      <line
        x1={CX}
        y1={TRIG_Y + CAP_H}
        x2={CX}
        y2={TRIG_Y + CAP_H + GAP - 2}
        stroke="var(--color-rule-hard)"
        strokeWidth="1.5"
        markerEnd="url(#td-arw)"
      />

      {rows.map(({ s, i, top, h }) => {
        const hue = STAGE_ACCENT[i].v;
        const mid = top + h / 2;
        const railY = i === 4 ? top + 26 : mid - 3;

        return (
          <g key={s.title}>
            {/* Cost rail */}
            {s.metered ? (
              <rect x={6} y={railY - 11} width={8} height={8} fill="var(--color-ink)" />
            ) : (
              <rect x={6} y={railY - 11} width={8} height={8} fill="none" stroke="var(--color-ink-soft)" />
            )}
            <text {...T_RAIL} x={22} y={railY - 4} fill={s.metered ? "var(--color-ink)" : "var(--color-ink-soft)"}>
              {s.cost[0]}
            </text>
            <text {...T_RAIL} x={22} y={railY + 8} fill="var(--color-ink-soft)">
              {s.cost[1]}
            </text>

            {/* Stage */}
            <rect
              x={BOX_X}
              y={top}
              width={BOX_W}
              height={h}
              fill={`color-mix(in oklch, ${hue} 8%, transparent)`}
              stroke={hue}
              strokeWidth="1.3"
            />
            <text {...T_TAG} x={BOX_X + 14} y={top + 21} fill={hue}>
              {STAGES[i].tag}
            </text>
            <text {...T_HEAD} x={BOX_X + 14} y={top + 40} fill="var(--color-ink)">
              {s.title}
            </text>
            {s.inset && (
              <>
                <text {...T_NOTE} x={BOX_X + 14} y={top + 57} fill="var(--color-i3)">
                  {s.inset[0]}
                </text>
                <text {...T_NOTE} x={BOX_X + 14} y={top + 69} fill="var(--color-i3)">
                  {s.inset[1]}
                </text>
              </>
            )}

            {/* Right column: a branch that drops material, or a note on what it adds */}
            {s.reject && (
              <line
                x1={BOX_R + 3}
                y1={mid}
                x2={NOTE_X - 8}
                y2={mid}
                stroke="var(--color-i1)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                markerEnd="url(#td-arw-x)"
              />
            )}
            {s.note[0] && (
              <>
                <text
                  {...T_NOTE}
                  x={NOTE_X}
                  y={mid - 3}
                  fill={s.reject ? "var(--color-i1)" : "var(--color-ink-soft)"}
                >
                  {s.reject ? `✕ ${s.note[0]}` : s.note[0]}
                </text>
                <text
                  {...T_NOTE}
                  x={NOTE_X}
                  y={mid + 10}
                  fill={s.reject ? "var(--color-i1)" : "var(--color-ink-soft)"}
                >
                  {s.note[1]}
                </text>
              </>
            )}

            {/* Spine to the next box */}
            <line
              x1={CX}
              y1={top + h}
              x2={CX}
              y2={top + h + GAP - 2}
              stroke="var(--color-rule-hard)"
              strokeWidth="1.5"
              markerEnd="url(#td-arw)"
            />
          </g>
        );
      })}

      {/* The research agent: a separate project, called across the boundary */}
      <rect
        x={NOTE_X - 6}
        y={rows[4].top + 8}
        width={VB_W - NOTE_X - 2}
        height={RESEARCH_H - 16}
        fill="color-mix(in oklch, var(--color-i3) 7%, transparent)"
        stroke="var(--color-i3)"
        strokeDasharray="4 3"
      />
      <line
        x1={BOX_R + 3}
        y1={rows[4].top + RESEARCH_H / 2}
        x2={NOTE_X - 12}
        y2={rows[4].top + RESEARCH_H / 2}
        stroke="var(--color-i3)"
        strokeWidth="1.3"
        markerStart="url(#td-arw-g)"
        markerEnd="url(#td-arw-g)"
      />
      <text {...T_TAG} x={NOTE_X + 6} y={rows[4].top + 26} fill="var(--color-i3)">
        RESEARCH AGENT
      </text>
      <text {...T_NOTE} x={NOTE_X + 6} y={rows[4].top + 42} fill="var(--color-ink)">
        a second project of mine, called
      </text>
      <text {...T_NOTE} x={NOTE_X + 6} y={rows[4].top + 54} fill="var(--color-ink)">
        as a paid API from this one
      </text>

      {/* Output */}
      <rect x={BOX_X} y={outY} width={BOX_W} height={CAP_H} fill="var(--color-paper-hi)" stroke="var(--color-rule-hard)" />
      <text {...T_TAG} x={CX} y={outY + 20} textAnchor="middle" fill="var(--color-ink)">
        COMMITTED BACK TO THE REPO
      </text>
      <text {...T_NOTE} x={CX} y={outY + 36} textAnchor="middle" fill="var(--color-ink-soft)">
        a static Hindi edition · ~$0.008 per run
      </text>

      {/* Legend: the same marks, drawn the same way, so the key can't drift
          from the rail it explains. */}
      <g transform={`translate(6 ${total - 18})`}>
        <rect x={0} y={0} width={8} height={8} fill="var(--color-ink)" />
        <text {...T_RAIL} x={14} y={7} fill="var(--color-ink-soft)">
          a metered model call
        </text>
        <rect x={144} y={0} width={8} height={8} fill="none" stroke="var(--color-ink-soft)" />
        <text {...T_RAIL} x={158} y={7} fill="var(--color-ink-soft)">
          runs locally, costs nothing
        </text>
        <line x1={318} y1={4} x2={346} y2={4} stroke="var(--color-i1)" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#td-arw-x)" />
        <text {...T_RAIL} x={354} y={7} fill="var(--color-i1)">
          rejected here, and why
        </text>
      </g>
    </svg>
  );
}

const PRICES = [
  { model: "sarvam-30b", input: "$0.029", cached: "$0.017", discount: "40%", output: "$0.115" },
  { model: "sarvam-105b", input: "$0.046", cached: "$0.029", discount: "37.5%", output: "$0.184" },
  { model: "deepseek-v4-flash", input: "$0.140", cached: "$0.0028", discount: "98%", output: "$0.280" },
  { model: "deepseek-v4-pro", input: "$0.435", cached: "$0.0036", discount: "~99%", output: "$0.870" },
];

export function CaseStudyTechDrishti() {
  const [openStage, setOpenStage] = useState<number | null>(null);

  usePageTitle(ROUTE_META["/case-study/techdrishti"].title);

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
          href="https://github.com/aditya0701/Local_news_aggregator"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          Source <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <div className="notch-corner relative overflow-hidden border border-rule-hard bg-panel px-6 py-12 text-center">
          <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i3">AGENTIC AI ENGINEERING CASE STUDY</p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">TechDrishti</h1>
          <p className="font-display mt-2 text-lg italic text-panel-text">An autonomous AI news agent</p>
          <div className="signal-bar mx-auto mt-5 w-24" />
          <p className="font-hero-mono mt-4 text-[12px] tracking-wide text-panel-mid">
            PUBLISHES DAILY AT 8:00 AM IST &middot; BUILDING SINCE JUNE 2026
          </p>
        </div>

        <p className="font-display mt-10 text-lg leading-relaxed text-ink sm:text-xl">
          Every morning, before most of India is awake, an agentic AI workflow running unattended on GitHub Actions
          reads the day's English tech news, decides for itself which stories are worth covering, calls out to its
          own research agent when a fact needs real investigation, and writes each one from scratch,{" "}
          <mark className="box-decoration-clone bg-i3/20 px-1 text-ink">
            in original Hindi prose rather than machine translation
          </mark>
          . No server, no database, no human editor.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="https://aditya0701.github.io/Local_news_aggregator/"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 bg-i3 px-5 py-2.5 text-[13px] font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Read today's edition <ExternalLink size={14} />
          </a>
          <a
            href="https://github.com/aditya0701/Local_news_aggregator"
            target="_blank"
            rel="noreferrer"
            className="notch-corner-sm inline-flex items-center gap-2 border border-panel-border bg-panel px-5 py-2.5 text-[13px] font-medium text-panel-text transition-colors hover:border-panel-text">
            View source <ExternalLink size={14} />
          </a>
        </div>

        {/* Head-matter datasheet. Deliberately before any argument: a reader who
            gives this page thirty seconds should leave with the numbers, and a
            reader who gives it thirty minutes should find the same numbers
            defended below. Two rows are unflattering on purpose. */}
        <div className="mt-10">
          <DataSheet title="SYSTEM DATASHEET" rows={DATASHEET} />
        </div>

        <p className="mt-10 text-[14px] leading-relaxed text-ink-mid">
          A pipeline that works once is a demo.{" "}
          <mark className="box-decoration-clone bg-i3/20 px-1 text-ink">
            These are the totals from a month of it running on a schedule, unattended
          </mark>{" "}
          — same code every morning, whether or not anyone is watching it. Read straight out of the GitHub Actions
          run logs and the traces the pipeline commits about itself, not from a benchmark harness.
        </p>

        <div className="notch-corner mt-5 border border-rule-hard bg-panel">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-ink px-4 py-2.5">
            <span className="font-hero-mono text-[11.5px] tracking-wider text-paper">
              AT SCALE &middot; 2 JUL &rarr; 2 AUG 2026
            </span>
            <span className="font-hero-mono text-[11px] tracking-wider text-rule">FROM RUN LOGS</span>
          </div>
          <dl className="m-0">
            {SCALE.map((r, i) => (
              <div
                key={r.k}
                className={`grid gap-x-5 px-4 py-3 sm:grid-cols-[11.5rem_1fr] sm:items-baseline ${
                  i !== SCALE.length - 1 ? "border-b border-rule" : ""
                }`}
              >
                <dt className="font-hero-mono text-[11.5px] tracking-wide text-ink-soft uppercase">
                  {r.k}
                  {r.trace && (
                    <>
                      <span className="text-i2" aria-hidden="true">
                        {" "}
                        &dagger;
                      </span>
                      {/* The dagger is the whole qualification on this number, so it
                          cannot be a glyph a screen reader skips. */}
                      <span className="sr-only"> (traced subset only — a floor, not a total)</span>
                    </>
                  )}
                </dt>
                <dd className="m-0 mt-1 sm:mt-0">
                  <span className="font-mono text-[15px] font-semibold tabular-nums text-ink">{r.n}</span>{" "}
                  <span className="text-[13.5px] leading-relaxed text-ink-mid">{r.v}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
          <span className="text-i2">&dagger;</span> Covers the 28 runs that committed machine-readable traces.
          Trace committing was added on 7 July 2026, so the eight runs before it left none behind:{" "}
          <strong className="font-semibold text-ink-mid">those rows are floors, not totals</strong>. The
          860-article store is the only figure spanning the full lifetime. Per-call LLM volume is recorded
          nowhere, so it is not estimated here.
        </p>

        <div className="mt-8">
          <SkillTags groups={SKILL_GROUPS} />
        </div>

        <p className="mt-8 text-[14px] leading-relaxed text-ink-soft">
          Everything below is the log of that build: the architecture in one figure, why the workflow exists, what
          each stage does, and nine real bugs, each with what was claimed, what broke, what fixed it, and how it was
          verified. Nothing below is hypothetical.
        </p>

        <section className="mt-20">
          <SectionHead num="01" title="The whole system, in one figure" />
          <p className="text-[14px] leading-relaxed text-ink-mid">
            Seven stages, read downward. The left rail is the part that matters most to how this was engineered:{" "}
            <strong className="font-semibold text-ink">a filled square is a metered model call, a hollow one is free</strong>
            . Deduplication and language detection were pushed onto local models specifically so the paid budget is
            spent on judgment — deciding what's worth writing, and what the source article left out — rather than on
            bookkeeping a library could do.
          </p>
          <figure className="m-0 mt-6 flex flex-col gap-3">
            <div className="notch-corner overflow-x-auto border border-rule-hard bg-panel px-3 py-4 sm:px-4">
              <ArchitectureDiagram />
            </div>
            <figcaption className="text-[13px] leading-relaxed text-ink-mid">
              <b className="text-ink">Three stages exist to throw things away.</b> Collect, cluster and gate all
              reject — by regex, by embedding distance, and by model judgment respectively, in that order, because
              each one is more expensive than the last and there's no reason to pay for a verdict on something a
              regex can drop for free. What survives all three is the only thing the writing stages ever see.
            </figcaption>
          </figure>
        </section>

        <section className="mt-20">
          <SectionHead num="02" title="Why this exists" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            There's no shortage of Hindi tech coverage, but almost all of it is either wire-service translation or a
            human editor's fast rewrite. The bet here was different:{" "}
            <mark className="box-decoration-clone bg-i3/20 px-1 text-ink">
              could an agentic AI workflow make its own editorial calls, autonomously research what it doesn't know
              by calling out to a second AI agent, and write original Hindi prose, at a running cost of fractions of
              a cent per article
            </mark>
            , with no server or hosting bill beyond a GitHub Actions runner? That framing is what makes the field
            reports below worth
            reading: each one is the AI agent being asked to make a judgment call a human editor makes without
            thinking twice, getting it wrong the first time, in a way specific to how it was asked.
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
          <SectionHead num="03" title="Research, not translation" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            The differentiator isn't the writing, it's what feeds it. The pipeline doesn't rephrase the source
            article: it researches the topic the way a reporter would, and hands the writer real, grounded facts the
            source article never mentioned. That's also{" "}
            <mark className="box-decoration-clone bg-i3/20 px-1 text-ink">
              a deliberate copyright and originality choice
            </mark>
            , not just a quality one: a published piece is meaningfully distinct from what it started from because it{" "}
            <strong className="font-semibold text-ink">adds real reporting on top, not because it's reworded</strong>.
          </p>
          <div className="flex flex-col gap-3">
            {RESEARCH_STRATEGY.map((r) => (
              <div key={r.tag} className="notch-corner border border-rule-hard bg-panel p-4 pl-5 sm:p-5 sm:pl-6">
                <span className="font-hero-mono text-[12px] tracking-wide text-i3">{r.tag}</span>
                <div className="mt-1 font-display text-base font-semibold text-ink">{r.title}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">{r.desc}</p>
                <p className="mt-3 border-t border-panel-border pt-3 text-[14px] leading-relaxed text-panel-text">
                  {r.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="04" title="Built like a newsroom, not a translation" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            The whole thing starts from one decision:{" "}
            <strong className="font-semibold text-ink">this is a newsroom, not a translate button</strong>. A
            translator takes one article and rewords it. A newsroom is slower and does something different — it
            reads everything coming in, argues about what actually matters, sends a reporter to fill the gaps,
            agrees on the angle, and only then writes. Each of those is a separate job, done by a separate desk, and
            keeping them apart is exactly how a real newsroom avoids mistakes. This system copies that structure on
            purpose: every stage is <strong className="font-semibold text-ink">one desk with one job</strong>, here
            for one reason.
          </p>
          <ol className="flex flex-col gap-5">
            {NEWSROOM.map((n, i) => (
              <li key={n.role} className="flex gap-3">
                <span
                  className={`mt-[0.4rem] h-2 w-2 shrink-0 ${STAGE_ACCENT[i].dot}`}
                  aria-hidden="true"
                />
                <div>
                  <div className="font-display text-base text-ink">
                    <span className="font-semibold">{n.role}</span>
                    <span className="text-ink-mid"> — {n.line}</span>
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-mid">
                    {markPhrase(n.why, n.mark, STAGE_ACCENT[i].hl)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[14px] leading-relaxed text-ink-mid">
            None of these desks is doing anything magic on its own. The whole idea is{" "}
            <strong className="font-semibold text-ink">the order and the separation</strong> — the same reason
            newsrooms have desks in the first place. What each one actually does under the hood is next.
          </p>
        </section>

        <section className="mt-20">
          <SectionHead num="05" title="How the agentic workflow thinks today" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            No server, no database, no standing infrastructure: the entire agentic AI workflow runs inside a daily
            GitHub Actions job, chains through collection, an LLM editorial gate, a self-built research agent, and a
            two-stage writing pipeline, then pushes its own output back to the repo, unattended, end to end.
          </p>
          <p className="mb-4 text-[13px] text-ink-soft">Click a step for how it actually works.</p>
          <div className="flex flex-col gap-3">
            {STAGES.map((s, i) => {
              const isOpen = openStage === i;
              return (
                <div key={s.tag} className="notch-corner border border-rule-hard bg-panel">
                  <button
                    type="button"
                    onClick={() => setOpenStage(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 p-4 pl-5 text-left sm:p-5 sm:pl-6"
                  >
                    <div className="flex-1">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`h-2 w-2 shrink-0 ${STAGE_ACCENT[i].dot}`}
                          aria-hidden="true"
                        />
                        <span
                          className={`font-hero-mono text-[12px] tracking-wide ${STAGE_ACCENT[i].text}`}
                        >
                          {s.tag}
                        </span>
                      </span>
                      <div className="mt-1 font-display text-base font-semibold text-ink">{s.title}</div>
                      <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">{s.desc}</p>
                      {s.model && (
                        <span className={`font-mono mt-2 inline-block text-[12px] ${STAGE_ACCENT[i].text}`}>
                          {s.model}
                        </span>
                      )}
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
                        <p className="text-[14px] leading-relaxed text-panel-text">{s.detail}</p>
                        {s.tag === "RESEARCH" && (
                          <div className="mt-3 notch-corner-sm border border-i3/30 bg-i3/[0.06] p-3 pl-4">
                            <span className="font-hero-mono text-[12px] tracking-wide text-i3">
                              CUSTOM BUILD &middot; 45-DAY ENTITY CACHE
                            </span>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-panel-text">
                              A self-built local cache keyed by resolved entity, not raw string, so "Python (language)"
                              and "Python (snake)" never collide. Every entity checks the cache before a single search
                              or model call fires: a hit costs nothing at all, no DDG fetch, no sarvam-30b synthesis
                              call. Only a miss pays for search + model. Because most entities recur across runs
                              (the same companies, people, and products keep showing up in tech news), this alone is
                              what keeps the RESEARCH stage's real per-article API spend a fraction of what it would
                              be if every entity were re-researched from scratch, on every run, forever.
                            </p>
                          </div>
                        )}
                        {s.link && (
                          <a
                            href={s.link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-i3 transition-colors hover:text-i3"
                          >
                            {s.link.label} <ExternalLink size={12} />
                          </a>
                        )}
                        {s.tag === "RESEARCH" && (
                          <Link
                            to="/case-study/techdrishti/sarvam-vs-deepseek"
                            className="mt-3 block text-[13px] text-i3 transition-colors hover:text-i3"
                          >
                            Why Sarvam over DeepSeek for this stage: a 74-call side-by-side &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <div className="notch-corner border border-rule-hard bg-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="status-badge pending">Pending</span>
              <span className="font-hero-mono text-[12px] tracking-wide text-ink-soft">
                RESEARCH-MODE FLOW &middot; DIALED BACK FOR PRODUCTION
              </span>
            </div>
            <code className="mt-3 block font-mono text-[13px] text-ink">
              ./deploy_pipeline.sh --research-mode
            </code>
            <p className="mt-3 text-[14px] leading-relaxed text-panel-text">
              Reverted the RESEARCH stage to DuckDuckGo-only search. Tiered research-agent routing
              stays in the codebase, just switched off for production runs.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="notch-corner-sm border border-panel-border bg-i3/[0.06] p-3">
                <div className="font-hero-mono text-[11px] uppercase tracking-wide text-i3">
                  Current build &middot; DDG-only
                </div>
                <div className="mt-1.5 font-mono text-[14px] text-ink">
                  ~$0.008 <span className="text-ink-soft">USD/run</span>
                </div>
                <div className="font-mono text-[13px] text-ink-soft">9&ndash;20 min</div>
              </div>
              <div className="notch-corner-sm border border-panel-border bg-panel p-3">
                <div className="font-hero-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  Retained &middot; search-agent build
                </div>
                <div className="mt-1.5 font-mono text-[14px] text-ink">
                  ~$0.17&ndash;0.20 <span className="text-ink-soft">USD/run</span>
                </div>
                <div className="font-mono text-[13px] text-ink-soft">1 hr 20+ min</div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
              Reason: build time and cost cut took priority over the marginal research-quality
              gain. Tiered routing kept in the codebase for future use, not deleted.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <SectionHead num="06" title="Nine bugs that shaped the evolution" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            Every fix was reproduced against real articles, not synthetic test cases, the honest failure rate
            included alongside the fix. Real before/after artifacts where they survive: an empty API response, a
            wrong query the model actually sent, a Hindi sentence it actually wrote.
          </p>
          <Link
            to="/case-study/techdrishti/evolution"
            className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i3/60 sm:p-6"
          >
            <div>
              <div className="font-display text-lg font-semibold text-ink">Read all nine field reports &rarr;</div>
              <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">
                Claim, what broke, the fix, and how it was verified, each with the real captured evidence.
              </p>
            </div>
            <ExternalLink size={18} className="shrink-0 text-i3" aria-hidden="true" />
          </Link>
        </section>

        <section className="mt-20">
          <SectionHead num="07" title="Measuring what it gets wrong" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            The field reports above are qualitative: one bug, one fix, verified once. On top of that sits a
            quantitative evaluation layer, three hand-labeled golden sets (1,505 rows) with judge-validated
            harnesses, that puts real numbers on how often the pipeline's own judgment is wrong, and measures two
            prompt fixes as direct before/after. Held to the same honesty standard: the one metric that regressed is
            reported as-is, not tuned away.
          </p>
          <div className="mb-6 grid grid-cols-3 gap-px border border-rule-hard bg-rule-hard">
            {[
              { num: "81.9%", label: "triage accuracy, up from 73.8% after a prompt fix", tone: "text-i3" },
              { num: "74.7%", label: "judge-vs-human agreement on entity extraction", tone: "text-ink" },
              { num: "26.3%", label: "faithfulness baseline: claims unsupported by the source", tone: "text-i1" },
            ].map((s) => (
              <div key={s.label} className="bg-panel p-4">
                <div className={`font-display text-2xl font-semibold tabular-nums ${s.tone}`}>{s.num}</div>
                <div className="mt-1.5 text-[12px] leading-relaxed text-panel-mid">{s.label}</div>
              </div>
            ))}
          </div>
          <Link
            to="/case-study/techdrishti/evaluation"
            className="notch-corner flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i3/60 sm:p-6"
          >
            <div>
              <div className="font-display text-lg font-semibold text-ink">Read the full evaluation report &rarr;</div>
              <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">
                Golden sets, judge calibration, the two verified prompt iterations, and real misclassifications
                before and after each fix.
              </p>
            </div>
            <ExternalLink size={18} className="shrink-0 text-i3" aria-hidden="true" />
          </Link>
        </section>

        <section className="mt-20">
          <SectionHead num="08" title="Why Sarvam, and what it costs" />
          <p className="mb-4 text-[14px] leading-relaxed text-ink-mid">
            Model choice was a cost decision, checked against the obvious alternative rather than assumed:
          </p>
          <div className="overflow-x-auto border border-rule-hard">
            <table className="w-full min-w-[480px] border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-rule-hard bg-panel">
                  <th className="font-hero-mono px-4 py-3 text-left text-[12px] tracking-wide text-panel-mid">Per 1M tokens</th>
                  <th className="font-hero-mono px-4 py-3 text-right text-[12px] tracking-wide text-panel-mid">Input</th>
                  <th className="font-hero-mono px-4 py-3 text-right text-[12px] tracking-wide text-panel-mid">Cached</th>
                  <th className="font-hero-mono px-4 py-3 text-right text-[12px] tracking-wide text-panel-mid">Discount</th>
                  <th className="font-hero-mono px-4 py-3 text-right text-[12px] tracking-wide text-panel-mid">Output</th>
                </tr>
              </thead>
              <tbody>
                {PRICES.map((p, i) => (
                  <tr key={p.model} className={i !== PRICES.length - 1 ? "border-b border-panel-border" : ""}>
                    <td className="px-4 py-2.5 text-ink">{p.model}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">{p.input}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">{p.cached}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-i3 tabular-nums">{p.discount}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-panel-text tabular-nums">{p.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-ink-soft">
            Sarvam runs 5–9× cheaper per raw token than the closest DeepSeek equivalent: the reason it was kept
            even though its own cache discount is far shallower than DeepSeek's.
          </p>
          <Link
            to="/case-study/techdrishti/sarvam-vs-deepseek"
            className="notch-corner mt-4 flex items-center justify-between gap-4 border border-rule-hard bg-panel p-5 transition-colors hover:border-i3/60 sm:p-6"
          >
            <div>
              <div className="font-display text-lg font-semibold text-ink">
                Full quality comparison: Sarvam vs DeepSeek &rarr;
              </div>
              <p className="mt-1 text-[14px] leading-relaxed text-panel-mid">74 live calls, judged head to head.</p>
            </div>
            <ExternalLink size={18} className="shrink-0 text-i3" aria-hidden="true" />
          </Link>
        </section>

        <footer className="mt-20 border-t border-rule-hard pt-8">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Built solo, end to end: an agentic AI workflow covering collection, deduplication, a multi-stage LLM
            writing pipeline, an entity knowledge cache, and the reading frontend, running on GitHub Actions with no
            server and no hosting cost. The autonomous research agent it calls out to for ambiguous entities and
            comparison questions (RESEARCH, above) is a second AI agent project of mine, built and hosted separately.
          </p>
          <a
            href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
            target="_blank"
            rel="noreferrer"
            className="font-hero-mono mt-5 inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
          >
            The research agent, live <ExternalLink size={12} />
          </a>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/case-study/deep-research-agent"
              className="notch-corner flex-1 border border-rule-hard bg-panel p-4 transition-colors hover:border-i3/60"
            >
              <span className="font-hero-mono text-[12px] tracking-wide text-i3">LLM SYSTEMS</span>
              <div className="mt-1 font-display text-[15px] font-semibold text-ink">
                Deep Research Agent &rarr;
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-panel-mid">
                The autonomous agent this pipeline calls out to, as its own case study.
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
