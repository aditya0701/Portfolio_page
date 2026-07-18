// Blocks the build if any TODO(metric) placeholder is still in the source.
//
// The rule this enforces: a number on this site is either measured and real,
// or it is visibly absent. There is no third state where a plausible-looking
// figure sits in the markup waiting to be noticed. A recruiter cannot tell an
// estimate from a measurement, so the build refuses to ship the ambiguity.
//
// Run automatically as part of `npm run build`, which is what CI runs before
// deploying to Pages. `npm run dev` does not run it, so placeholders stay
// visible and workable locally.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "..", "src");
// Matches TODO(metric) and TODO(metric: label). A backtick-escaped form,
// `TODO\u200b(metric)`, is treated as documentation and ignored, so the format
// can be shown in comments without tripping the guard.
const PATTERN = /TODO\(metric(?::\s*([^)]*))?\)/g;
const EXTS = [".ts", ".tsx"];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return EXTS.some((e) => full.endsWith(e)) ? [full] : [];
  });
}

const hits = [];
for (const file of walk(SRC)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(PATTERN)) {
      hits.push({
        file: relative(ROOT, file),
        line: i + 1,
        label: (m[1] || "unlabelled").trim(),
      });
    }
  });
}

if (hits.length === 0) {
  console.log("check:metrics — no unresolved metric placeholders.");
  process.exit(0);
}

console.error(
  `\n  BUILD BLOCKED — ${hits.length} unresolved metric placeholder${hits.length === 1 ? "" : "s"}.\n`,
);
console.error("  Each of these needs a real, measured number before this site can deploy.");
console.error("  Do not estimate them. Do not fill them with something plausible.\n");
for (const h of hits) {
  console.error(`    ${h.file}:${h.line}`);
    console.error(`      needs: ${h.label}\n`);
}
console.error("  Once you have the real values, replace the placeholder with the number");
console.error("  and the build will pass.\n");
process.exit(1);
