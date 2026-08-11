import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Section } from "./Section";
import { ChitraguptaDiagram } from "./ChitraguptaDiagram";
import { StatusBadge } from "./ProjectCard";
import { projects, TRACK_LABEL } from "../data/projects";

/**
 * The bridge band. Chitragupta is the one project where the computer-vision
 * track and the LLM-systems track are the same piece of work, which is why it
 * gets a section of its own rather than a fourth card in a list.
 *
 * It leads with the thesis and the figure, because the argument here is
 * architectural — a reader who only sees bullet points about a camera
 * assistant learns nothing that distinguishes it from a product demo.
 */

const STATS = [
  { n: "0.01 s", k: "a question's time-to-wire, mid-tick — it was 2.00 s" },
  { n: "0 tokens", k: "to decide the user is owed something" },
  { n: "1 + 1", k: "model calls on an idle tick, and no more" },
  { n: "18 min", k: "of real traffic, read line by line" },
];

/** Title, period, track, status and links come from the project record, so the
 *  band and the (absent) card cannot describe the same project differently. */
const PROJECT = projects.find((p) => p.slug === "chitragupta")!;

/** The case-study link is the primary call to action, so it is relabelled and
 *  pulled to the front; the rest keep their order from the project record. */
const LINKS = [...PROJECT.links].sort(
  (a, b) => Number(b.label === "Case Study") - Number(a.label === "Case Study"),
);

export function ChitraguptaBridge() {
  return (
    <Section
      id="chitragupta"
      title="Where the two tracks meet"
      sub="Vision + LLM · case study"
      intro="A live camera assistant that watches while your hands are busy, grown out of the paper I presented for my master's seminar. In the literature this is a training problem. Built without GPUs, a dataset, or anything to fine-tune, it has to become an architecture problem instead — which is the whole of what follows."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        /* Two columns only from xl. At lg the figure column lands narrower than
           the diagram's min-width, which trades a clean layout for a scrollbar
           inside the panel. */
        className="grid items-start gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
      >
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className={`track-badge ${PROJECT.track}`}>{TRACK_LABEL[PROJECT.track]}</span>
            {/* From the project record, not a literal — the band and the status
                legend must not be able to disagree about the same project. */}
            <StatusBadge project={PROJECT} />
            <span className="font-hero-mono text-[0.7rem] tracking-[0.04em] text-ink-soft">
              {PROJECT.period} · v2
            </span>
          </div>

          <h3
            className="font-display m-0 mt-[0.7rem] text-[clamp(1.3rem,2.6vw,1.75rem)] font-[700] tracking-[-0.015em] text-ink"
            style={{ fontVariationSettings: '"wdth" 112, "wght" 700' }}
          >
            {PROJECT.title}
          </h3>

          <p className="font-display mt-[0.6rem] text-[clamp(1.05rem,2vw,1.3rem)] leading-[1.35] text-ink">
            <mark className="box-decoration-clone bg-i2/20 px-1 text-ink">
              If you cannot train the decision to speak, stop asking a model to make it on every
              frame.
            </mark>
          </p>

          <p className="mt-[1.1rem] max-w-[62ch] text-[0.92rem] leading-[1.68] text-ink-mid">
            VideoLLM-online asks the harder of the two questions — not what is in this frame, but{" "}
            <em>when a model watching a live stream should speak at all</em> — and it answers it with a
            trained streaming head, a cached frame history, and purpose-built instruction data. Modern
            open-weights VLMs solve the other half outright: they read small print off a phone frame in
            a way a pooled CLIP vector never could.
          </p>
          <p className="mt-3 max-w-[62ch] text-[0.92rem] leading-[1.68] text-ink-mid">
            The two halves do not compose. Without a GPU you reach those weights through a hosted
            endpoint, one independent call at a time — so you inherit the better eyes and lose every
            mechanism the paper used to earn its silence. Each of those jobs had to move somewhere
            cheaper, and the speak-or-stay-quiet decision moved furthest:{" "}
            <strong className="font-[600] text-ink">
              out of the model entirely, into arithmetic over a document that costs nothing to check.
            </strong>
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-[2px] border border-rule-hard bg-rule-hard sm:grid-cols-4 xl:grid-cols-2">
            {STATS.map((s) => (
              <div key={s.n} className="bg-panel px-3 py-2.5">
                <dt className="font-hero-mono text-[0.95rem] tabular-nums text-i2">{s.n}</dt>
                <dd className="m-0 mt-0.5 text-[0.72rem] leading-[1.45] text-ink-mid">{s.k}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap gap-[0.45rem]">
            {LINKS.map((l) => {
              const primary = l.label === "Case Study";
              return l.href.startsWith("/") ? (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`inline-flex items-center gap-1.5 border px-[0.7rem] py-[0.4rem] font-hero-mono text-[0.72rem] tracking-[0.05em] no-underline transition-colors ${
                    primary
                      ? "border-ink bg-ink text-paper hover:border-i5 hover:bg-i5"
                      : "border-rule-hard text-ink hover:border-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  {primary ? "Read the case study" : l.label}
                  {primary && <ArrowRight size={13} />}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 border border-rule-hard px-[0.7rem] py-[0.4rem] font-hero-mono text-[0.72rem] tracking-[0.05em] text-ink no-underline transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {l.label}
                  <ExternalLink size={12} />
                </a>
              );
            })}
          </div>
        </div>

        <figure className="m-0">
          <div className="notch-corner overflow-x-auto border border-rule-hard bg-panel px-3 py-4 sm:px-4">
            <ChitraguptaDiagram />
          </div>
          <figcaption className="mt-3 text-[0.8rem] leading-[1.6] text-ink-mid">
            <b className="font-[600] text-ink">Read the two arrows out of the document.</b> One goes to
            a model, which reads and writes and costs a call. The other goes to arithmetic, which only
            reads and costs nothing — and it is the arithmetic, not the model, that decides a sentence
            is owed. Inverting those two is the whole difference between this and the version before
            it.
          </figcaption>
        </figure>
      </motion.div>
    </Section>
  );
}
