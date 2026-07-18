import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import "./index.css";
import App from "./App.tsx";

// Derived from Vite's `base` so a repo rename is a one-line change in
// vite.config.ts rather than a hunt for hardcoded paths. BASE_URL always
// carries a trailing slash; react-router wants it without one.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* reducedMotion="user" makes every framer-motion component in the tree
        honour prefers-reduced-motion, instead of each component having to
        remember to call useReducedMotion() itself. */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
