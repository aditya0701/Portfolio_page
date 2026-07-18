import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";
import { profile } from "../data/profile";
import { GithubIcon } from "./icons";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Assets live under Vite's base, which changes if the repo is renamed. */
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export function Hero() {
  const reduceMotion = Boolean(useReducedMotion());
  const textDelay = reduceMotion ? 0 : 0.15;

  return (
    <section id="top" className="relative bg-paper">
      <div className="mx-auto max-w-[74rem] px-[var(--gutter,clamp(1.25rem,4vw,3.5rem))]">
        <div className="pt-[clamp(2.5rem,6vw,5rem)] pb-[clamp(2rem,4vw,3rem)]">
          <motion.h1
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="font-display text-balance m-0 font-[800] uppercase leading-[0.88] tracking-[-0.025em]"
            style={{
              fontVariationSettings: '"wdth" 125, "wght" 800',
              fontSize: "clamp(2.6rem, 8.2vw, 6.6rem)",
            }}
          >
            {profile.name}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : textDelay }}
            className="font-hero-mono mt-[1.1rem] flex flex-wrap gap-x-[1rem] gap-y-[0.5rem text-[clamp(0.7rem,1.5vw,0.82rem)] uppercase tracking-[0.16em] text-ink-mid"
          >
            <span>ML systems</span>
            <span className="text-rule-hard">/</span>
            <span>Computer vision</span>
            <span className="text-rule-hard">/</span>
            <span>LLM engineering</span>
            <span className="text-rule-hard">/</span>
            <span>{profile.location}</span>
          </motion.p>

          <motion.p
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : textDelay + 0.08 }}
            className="font-display mt-[2.2rem] max-w-[44ch] text-[clamp(1.15rem,2.4vw,1.6rem)] leading-[1.35] tracking-[-0.011em] text-ink"
            style={{ fontVariationSettings: '"wdth" 100, "wght" 500' }}
          >
            I train segmentation models on data nobody has labelled yet, and build LLM systems that{" "}
            <em className="not-italic" style={{ boxShadow: "inset 0 -0.42em 0 rgba(139,99,0,.24)" }}>
              mark their own uncertainty
            </em>{" "}
            instead of asserting through it.
          </motion.p>

          {/* THE PLATE — segmentation triptych */}
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : textDelay + 0.16 }}
            className="mt-[clamp(2.5rem,5vw,3.5rem)]"
          >
            <div className="grid grid-cols-1 gap-[0.65rem] sm:grid-cols-3">
              {[
                { src: "figures/original.webp", alt: "Raw confocal microscopy volume.", label: "A", caption: "Raw input", desc: "What the microscope gives you." },
                { src: "figures/ground_truth.webp", alt: "Hand-annotated ground truth labels.", label: "B", caption: "Ground truth", desc: "Hand-annotated in napari, one label per bouton." },
                { src: "figures/prediction.webp", alt: "MicroSAM prediction on held-out volume.", label: "C", caption: "Prediction", desc: "Fine-tuned MicroSAM, never saw this volume." },
              ].map((fig) => (
                <figure key={fig.label} className="m-0">
                  <div className="panel-bg relative aspect-square overflow-hidden">
                    <img
                      src={asset(fig.src)}
                      alt={fig.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <span className="font-hero-mono absolute left-0 top-0 bg-ink px-[0.5rem] py-[0.15rem] text-[0.72rem] font-[600] tracking-[0.06em] text-paper">
                      {fig.label}
                    </span>
                  </div>
                  <figcaption className="flex items-baseline gap-[0.5rem] pt-[0.5rem] font-hero-mono text-[0.72rem] leading-[1.45] text-ink-mid">
                    <b className="font-[600] text-ink">{fig.caption}</b>
                    <span>{fig.desc}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

          </motion.div>

          {/* Status legend */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule pt-4">
            {[
              { label: "Measured", cls: "measured", desc: "a real number from a real run" },
              { label: "Shipped", cls: "shipped", desc: "in production, running unattended" },
              { label: "Pending", cls: "pending", desc: "not measured yet, and says so" },
              { label: "Not shipped", cls: "excluded", desc: "built, measured, left out on purpose" },
            ].map((s) => (
              <span key={s.label} className="flex items-center gap-[0.55rem] text-[0.78rem] text-ink-mid">
                <span className={`status-badge ${s.cls}`}>{s.label}</span>
                {s.desc}
              </span>
            ))}
          </div>

          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : textDelay + 0.24 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#projects"
              className="notch-corner-sm group inline-flex items-center gap-2 border border-rule-hard bg-ink px-5 py-2.5 font-hero-mono text-[0.72rem] uppercase tracking-[0.05em] text-paper transition-colors hover:bg-i5 hover:border-i5"
            >
              View projects
              <ArrowDown size={14} />
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="notch-corner-sm inline-flex items-center gap-2 border border-rule-hard px-5 py-2.5 font-hero-mono text-[0.72rem] uppercase tracking-[0.05em] text-ink transition-colors hover:bg-ink hover:text-paper hover:border-ink"
            >
              <GithubIcon size={14} />
              GitHub
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="notch-corner-sm inline-flex items-center gap-2 border border-rule-hard px-5 py-2.5 font-hero-mono text-[0.72rem] uppercase tracking-[0.05em] text-ink transition-colors hover:bg-ink hover:text-paper hover:border-ink"
            >
              <Mail size={14} />
              Contact
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
