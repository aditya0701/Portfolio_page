// Writes a real, fully rendered HTML file for every known route.
//
// The problem this solves: GitHub Pages has no server-side routing. A direct
// request for /Portfolio_page/case-study/techdrishti returns HTTP 404, and the
// rafgraph 404.html trick recovers from that only by running JavaScript. A
// browser is fine. curl, an ATS resume parser, a link-preview bot and most
// agent web-fetch tools are not: they see the error status and stop, so the
// case studies may as well not exist for them.
//
// After `vite build`, this walks ROUTE_META, renders each route to a string
// with react-dom/server, and writes dist/<route>/index.html. Pages serves each
// of those with a normal 200 and the case-study text already in the body.
//
// 404.html stays exactly as it was. It is still the fallback for any URL that
// is not in ROUTE_META — a typo, or a route added to App.tsx but not here.
//
// The rendered markup is React's own first-render output, which is what
// `hydrateRoot` in main.tsx expects to find. That is why this uses SSR rather
// than screenshotting a headless browser's post-JS DOM: the DOM a browser ends
// up with has been mutated by effects and animations, and handing that to
// hydrateRoot invites mismatches.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

/** Attribute values are injected into HTML, so they need escaping. */
function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Replace a single tag in the head template, failing loudly if it is missing.
 *
 * A silent no-op here would ship every case study with the site-wide title —
 * the exact bug this script exists to fix, and one nobody would notice until a
 * recruiter's link preview looked wrong. So an edit to index.html's head that
 * breaks a pattern breaks the build instead.
 */
function replaceTag(html, pattern, replacement, label) {
  // Test for the pattern rather than comparing before/after: on the home route
  // the new tag is byte-identical to the template's, and an unchanged string
  // there means "already correct", not "not found".
  if (!pattern.test(html)) {
    throw new Error(
      `prerender: no <${label}> match in dist/index.html.\n` +
        `  The head template changed. Update the pattern in scripts/prerender.mjs.`,
    );
  }
  return html.replace(pattern, () => replacement);
}

/** `[^>]*` spans newlines, which matters: several metas are wrapped over three lines. */
const metaByName = (name) => new RegExp(`<meta\\s+name="${name}"[^>]*>`);
const metaByProperty = (property) => new RegExp(`<meta\\s+property="${property}"[^>]*>`);

/**
 * Structured data describing *this page*, alongside the site-wide Person block
 * already in the template.
 *
 * Without it every route claims to be the same thing — a Person — and a machine
 * reading a case study learns only that Aditya Rawat exists, not that it is
 * looking at an article about TechDrishti. No `datePublished`: there is no
 * honest source for one here, and a guessed date is exactly the kind of
 * plausible-looking figure `check:metrics` exists to keep off this site.
 */
function structuredDataFor(route, { title, description, url, siteRoot }) {
  const author = { "@type": "Person", name: "Aditya Rawat", url: siteRoot };

  // The title carries a " | Aditya Rawat" suffix for the browser tab; a
  // headline should not.
  const headline = title.replace(/\s*\|\s*Aditya Rawat\s*$/, "");

  if (route === "/") return null; // Person schema in the template already covers it.

  const type = route.startsWith("/case-study/") ? "Article" : "CollectionPage";

  return {
    "@context": "https://schema.org",
    "@type": type,
    headline,
    name: headline,
    description,
    url,
    inLanguage: "en",
    author,
    publisher: author,
    isPartOf: { "@type": "WebSite", name: "Aditya Rawat", url: siteRoot },
  };
}

function buildPage(template, { appHtml, title, description, url, route, siteRoot }) {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  let html = template;

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`, "title");
  html = replaceTag(html, metaByName("description"), `<meta name="description" content="${d}" />`, "meta description");
  html = replaceTag(html, /<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`, "link canonical");

  html = replaceTag(html, metaByProperty("og:url"), `<meta property="og:url" content="${url}" />`, "meta og:url");
  html = replaceTag(html, metaByProperty("og:title"), `<meta property="og:title" content="${t}" />`, "meta og:title");
  html = replaceTag(
    html,
    metaByProperty("og:description"),
    `<meta property="og:description" content="${d}" />`,
    "meta og:description",
  );

  html = replaceTag(html, metaByName("twitter:title"), `<meta name="twitter:title" content="${t}" />`, "meta twitter:title");
  html = replaceTag(
    html,
    metaByName("twitter:description"),
    `<meta name="twitter:description" content="${d}" />`,
    "meta twitter:description",
  );

  const schema = structuredDataFor(route, { title, description, url, siteRoot });
  if (schema) {
    // JSON.stringify handles quoting; the `<` escape stops a `</script>` inside
    // any future description from closing the block early.
    const json = JSON.stringify(schema, null, 2).replace(/</g, "\\u003c");
    html = replaceTag(
      html,
      /<\/head>/,
      `  <script type="application/ld+json">\n${json}\n    </script>\n  </head>`,
      "/head",
    );
  }

  // The one non-head substitution: fill the mount point React will hydrate.
  html = replaceTag(html, /<div id="root"><\/div>/, `<div id="root">${appHtml}</div>`, 'div id="root"');

  return html;
}

/**
 * A sitemap only became possible once every route was a real file. It is the
 * canonical list to hand to Google Search Console — which matters more than
 * usual here, because a project page cannot serve its own robots.txt (crawlers
 * only read the one at the user-site root, aditya0701.github.io/robots.txt),
 * so there is nowhere to advertise this file automatically.
 *
 * No <lastmod>: the build date is not the content date, and a wrong one is
 * worse than none.
 */
function buildSitemap(routes, siteRoot) {
  // Static pages that are not React routes. The CVs are the most directly
  // useful page on the site to a recruiter, and they are invisible to the
  // router, so nothing else would list them. The PDFs are deliberately left
  // out: same content at a second URL is a duplicate-content signal, not extra
  // reach.
  const staticPages = ["resume/Aditya_Rawat_Resume.html", "resume/Aditya_Rawat_Resume_German.html"];

  const urls = [
    ...routes.map((route) => (route === "/" ? siteRoot : `${siteRoot}${route.slice(1)}/`)),
    ...staticPages.map((p) => `${siteRoot}${p}`),
  ]
    .map((loc) => `  <url><loc>${escapeAttr(loc)}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** `/` -> dist/index.html; `/case-study/x` -> dist/case-study/x/index.html. */
function outputPathFor(route) {
  return route === "/" ? join(DIST, "index.html") : join(DIST, ...route.slice(1).split("/"), "index.html");
}

// Vite is used here purely as a module loader: middlewareMode means no port is
// bound and nothing is served. It resolves TSX, `import.meta.env.BASE_URL` and
// the project's aliases exactly as the client build does, which is what keeps
// the server render byte-identical to the client's first render.
const vite = await createServer({
  root: ROOT,
  logLevel: "warn",
  appType: "custom",
  server: { middlewareMode: true },

  // Nothing here is served to a browser, so the client dep optimizer has no
  // work to do. Left on, it crawls every .html file under the project root —
  // resume/, update/, public/ — looking for entries it will never use, and
  // turns any failure in this script into a wall of unrelated esbuild noise.
  optimizeDeps: { noDiscovery: true, include: [] },

  ssr: {
    // react-router-dom is the one dependency here that hands Node a CommonJS
    // file. Its export map puts `module-sync` (ESM) and a CJS `default` side by
    // side under the `node` condition, so a resolver that does not ask for
    // `module-sync` gets the CJS build — and then `import { StaticRouter } from
    // "react-router-dom"` works only if Node's cjs-module-lexer manages to
    // infer the named exports off it. It does on Node 20.14, and does not on
    // the Node 20.20 GitHub Actions runs, where the build fails with "Named
    // export 'StaticRouter' not found". The same trap sits under every `Link`
    // a page imports, so pinning just this entry's import would not hold.
    //
    // Two settings, because externalized and inlined imports resolve through
    // different lists and only fixing one leaves the real path untouched:
    //
    //   noExternal  — Vite loads the package in its own module runner instead
    //                 of delegating to Node's importer, which is what takes
    //                 cjs-module-lexer (and the runner's Node version) out of
    //                 the picture entirely.
    //   conditions  — asks for `module-sync` first, so what Vite then inlines
    //                 is the .mjs build rather than a CJS file it cannot
    //                 evaluate as ESM.
    //
    // Neither works alone: noExternal on the CJS build dies with "module is not
    // defined", and conditions alone leaves the externalized path on Node.
    noExternal: ["react-router-dom"],
    resolve: {
      conditions: ["module-sync", "module", "node", "development|production"],
    },
  },
});

try {
  const [{ render }, { ROUTE_META, PRERENDER_ROUTES }] = await Promise.all([
    vite.ssrLoadModule("/src/entry-server.tsx"),
    vite.ssrLoadModule("/src/data/routeMeta.ts"),
  ]);

  // Read once, up front: the home route overwrites this same file.
  const template = await readFile(join(DIST, "index.html"), "utf8");

  // Guard the standalone `npm run prerender` case. After a successful run the
  // home page has already been written over dist/index.html, so re-running
  // without an intervening `vite build` would try to use a prerendered page as
  // the template. Caught here so the failure names the actual cause.
  if (!template.includes('<div id="root"></div>')) {
    throw new Error(
      "prerender: dist/index.html has already been prerendered — its #root is not empty.\n" +
        "  This step needs the untouched `vite build` output as its template.\n" +
        "  Run `npm run build`, which does both in order.",
    );
  }

  // The deployed origin is already stated once, in index.html's canonical link.
  // Deriving it from there beats a second hardcoded copy that can go stale.
  const siteRoot = template.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
  if (!siteRoot?.endsWith("/")) {
    throw new Error("prerender: index.html needs a <link rel=\"canonical\"> with a trailing-slash URL.");
  }

  for (const route of PRERENDER_ROUTES) {
    const { title, description } = ROUTE_META[route];
    const appHtml = render(route);

    if (!appHtml.trim()) {
      throw new Error(`prerender: ${route} rendered empty. Is it missing from the <Routes> in src/App.tsx?`);
    }

    const url = route === "/" ? siteRoot : `${siteRoot}${route.slice(1)}/`;
    const outPath = outputPathFor(route);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(
      outPath,
      buildPage(template, { appHtml, title, description, url, route, siteRoot }),
      "utf8",
    );

    console.log(`  prerendered ${route.padEnd(48)} ${(appHtml.length / 1024).toFixed(1)} kB`);
  }

  await writeFile(join(DIST, "sitemap.xml"), buildSitemap(PRERENDER_ROUTES, siteRoot), "utf8");

  console.log(`prerender — ${PRERENDER_ROUTES.length} routes written to dist/, plus sitemap.xml.`);
} finally {
  await vite.close();
}
