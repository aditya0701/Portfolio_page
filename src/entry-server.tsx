/**
 * Server entry, used only by `scripts/prerender.mjs` at build time. Never
 * shipped to the browser.
 *
 * This mirrors `main.tsx` exactly, with two deliberate differences:
 *   - `StaticRouter` instead of `BrowserRouter`, because there is no history
 *     API in Node. It takes the location as a prop instead of reading one.
 *   - No `import "./index.css"`. The client build already emits the stylesheet
 *     link into `dist/index.html`, and pulling Tailwind through the SSR module
 *     graph would only produce a string nobody reads.
 *
 * The tree is otherwise identical on purpose: `hydrateRoot` compares this
 * markup against React's first client render, and any divergence here shows up
 * as a hydration mismatch in a real browser.
 */
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App.tsx";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * @param path Router-relative route, e.g. `/case-study/techdrishti`.
 * @returns The inner HTML for `<div id="root">`.
 */
export function render(path: string): string {
  return renderToString(
    <StrictMode>
      <MotionConfig reducedMotion="user">
        {/* StaticRouter strips `basename` off `location` itself, so the
            location has to arrive with the prefix still attached. */}
        <StaticRouter basename={basename} location={`${basename}${path}`}>
          <App />
        </StaticRouter>
      </MotionConfig>
    </StrictMode>,
  );
}
