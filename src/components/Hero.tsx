import { motion } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";
import { profile } from "../data/profile";
import { GithubIcon } from "./icons";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="jali-bg pointer-events-none absolute inset-0 opacity-70"
        style={{
          maskImage: "radial-gradient(ellipse 65% 55% at 50% 0%, black 40%, transparent 85%)",
        }}
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--color-saffron-500), transparent)" }}
      />

      <div className="relative mx-auto flex min-h-[88svh] w-full max-w-5xl flex-col justify-center px-6 py-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-pixel mb-5 text-[11px] leading-relaxed text-saffron-400"
        >
          {profile.role}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display text-balance text-4xl font-semibold text-ink-50 sm:text-6xl"
        >
          {profile.name}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="tricolor-bar mt-5 w-24 origin-left"
        />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-balance text-[13px] leading-loose text-ink-300"
        >
          {profile.summary}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#projects"
            className="pixel-corners-sm inline-flex items-center gap-2 bg-saffron-500 px-5 py-2.5 text-xs font-medium text-ink-950 shadow-[4px_4px_0_var(--color-ink-700)] transition-transform hover:-translate-y-0.5"
          >
            View projects
            <ArrowDown size={15} />
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="pixel-corners-sm inline-flex items-center gap-2 border border-ink-700 bg-ink-900 px-5 py-2.5 text-xs font-medium text-ink-100 transition-colors hover:border-ink-500"
          >
            <GithubIcon size={15} />
            GitHub
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="pixel-corners-sm inline-flex items-center gap-2 border border-ink-700 bg-ink-900 px-5 py-2.5 text-xs font-medium text-ink-100 transition-colors hover:border-ink-500"
          >
            <Mail size={15} />
            Get in touch
          </a>
        </motion.div>
      </div>
    </section>
  );
}
