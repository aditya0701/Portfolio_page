import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import "./index.css";
import App from "./App.tsx";

// Derived from Vite's `base` so a repo rename is a one-line change in
// vite.config.ts rather than a hunt for hardcoded paths. BASE_URL always
// carries a trailing slash; react-router wants it without one.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

const app = (
  <StrictMode>
    {/* reducedMotion="user" makes every framer-motion component in the tree
        honour prefers-reduced-motion, instead of each component having to
        remember to call useReducedMotion() itself. */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>
);

const container = document.getElementById("root")!;

// Two ways this container arrives. In a production build `scripts/prerender.mjs`
// has already filled it with server-rendered markup, so hydrating attaches to
// what is on screen instead of throwing it away and painting the page twice.
// Under `npm run dev` the div is empty and there is nothing to hydrate, so we
// mount normally — same check covers `firstElementChild` being null if a
// prerendered file is ever served without its markup.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
