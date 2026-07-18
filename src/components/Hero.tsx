import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";
import { profile } from "../data/profile";
import { GithubIcon } from "./icons";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const RAIN_CHARS = "01アイウエオカキクケコサシスセソ<>{}[]/\\;:_=+*";

// Ambient Matrix-style character rain, contained to the hero. Runs on a
// throttled rAF loop (~18fps) — plenty for the effect, cheap on the CPU.
// Under prefers-reduced-motion it renders a single static frame and stops.
function DigitalRain({ reduceMotion }: { reduceMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 16;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      columns = Math.floor(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor((Math.random() * height) / fontSize));
    };
    resize();
    window.addEventListener("resize", resize);

    const drawFrame = (fade: boolean) => {
      const { width, height } = canvas;
      ctx.fillStyle = fade ? "rgba(6, 8, 5, 0.12)" : "rgba(6, 8, 5, 1)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      for (let i = 0; i < columns; i++) {
        const char = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
        ctx.fillStyle = "rgba(120, 230, 150, 0.55)";
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    if (reduceMotion) {
      drawFrame(false);
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    let lastTime = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - lastTime < 55) return;
      lastTime = time;
      drawFrame(true);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-25"
      aria-hidden="true"
    />
  );
}

export function Hero() {
  const reduceMotion = Boolean(useReducedMotion());
  const textDelay = reduceMotion ? 0 : 0.15;

  return (
    <section id="top" className="relative overflow-hidden bg-ink-950">
      <DigitalRain reduceMotion={reduceMotion} />

      <div className="relative mx-auto flex min-h-[88svh] w-full max-w-4xl flex-col justify-center px-6 py-24">
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="notch-corner border border-neon-700 bg-ink-950/90 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-sm"
        >
          {/* terminal title bar */}
          <div className="flex items-center gap-2 border-b border-neon-700 bg-ink-900/80 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rust-500" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e0c02e]" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" aria-hidden="true" />
            <span className="font-hero-mono ml-2 text-[13px] tracking-wide text-ink-300">
              ~/portfolio/aditya-rawat — zsh
            </span>
          </div>

          {/* terminal body */}
          <div className="px-6 py-10 sm:px-10 sm:py-12">
            <p className="font-hero-mono text-[14px] text-neon-400">
              <span className="text-ink-400">guest@aditya-rawat</span>
              <span className="text-ink-400">:~$</span> whoami
            </p>

            <motion.h1
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: textDelay, ease: EASE_OUT_EXPO }}
              className="text-glow font-display text-balance mt-3 text-5xl leading-none text-neon-400 sm:text-7xl md:text-8xl"
            >
              {profile.name}
            </motion.h1>

            <motion.p
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : textDelay + 0.08 }}
              className="font-hero-mono mt-3 flex flex-wrap items-center gap-2 text-[14px] uppercase tracking-[0.15em] text-magenta-500"
            >
              &gt; {profile.role}
              <span className="inline-block h-4 w-2 bg-neon-500 motion-safe:animate-pulse" aria-hidden="true" />
            </motion.p>

            <motion.p
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : textDelay + 0.16 }}
              className="mt-6 max-w-2xl text-[14px] leading-relaxed text-ink-200"
            >
              <span className="text-ink-400"># </span>
              {profile.summary}
            </motion.p>

            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : textDelay + 0.24 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="#projects"
                className="notch-corner-sm group inline-flex items-center gap-2 bg-neon-500 px-5 py-2.5 font-hero-mono text-xs uppercase tracking-wider text-ink-950 transition-[background-color,box-shadow] hover:bg-neon-400 hover:shadow-[0_0_24px_color-mix(in_oklch,var(--color-neon-500)_55%,transparent)]"
              >
                ./view-projects
                <ArrowDown size={14} className="transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="notch-corner-sm inline-flex items-center gap-2 border border-neon-700 bg-ink-900 px-5 py-2.5 font-hero-mono text-xs uppercase tracking-wider text-ink-100 transition-colors hover:border-neon-400 hover:text-neon-300"
              >
                <GithubIcon size={14} />
                github
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="notch-corner-sm inline-flex items-center gap-2 border border-neon-700 bg-ink-900 px-5 py-2.5 font-hero-mono text-xs uppercase tracking-wider text-ink-100 transition-colors hover:border-neon-400 hover:text-neon-300"
              >
                <Mail size={14} />
                mail --contact
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
