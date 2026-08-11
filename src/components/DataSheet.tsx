import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

/** The head-matter datasheet: a case study's whole argument in a dozen rows,
 *  before any prose.
 *
 *  One definition so the case-study pages can't drift apart — the same reason
 *  SectionHead is shared. Every row carries an epistemic status, because the
 *  point of the block is that a scanner can tell a deployment claim from a
 *  measurement from something that was deliberately left out. A datasheet where
 *  every row is flattering is a brochure; the status column is what stops it
 *  becoming one. */

export type DataRow = {
  /** Short label, rendered uppercase. */
  k: string;
  v: React.ReactNode;
  /** Drives the badge colour via the .status-badge classes in index.css. */
  s: "measured" | "shipped" | "pending" | "excluded";
  /** Badge text. Usually the status word, but rows sometimes need their own
   *  ("Off in prod", "Not shipped") — the state is more specific than the class. */
  label: string;
};

export function DataSheet({
  title,
  rows,
  /** Collapse behind a click. Worth it on a long sheet that would otherwise
   *  push the page's figure below the fold; not worth it on a short one, where
   *  hiding the rows costs a scanner more than the vertical space is worth.
   *  Rows stay in the DOM either way, so the prerendered HTML is unchanged. */
  collapsible = false,
}: {
  title: string;
  rows: DataRow[];
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  const body = (
    <dl className="m-0">
      {rows.map((r, i) => (
        <div
          key={r.k}
          className={`grid gap-x-5 px-4 py-3 sm:grid-cols-[9.5rem_1fr_7.5rem] sm:items-baseline ${
            i !== rows.length - 1 ? "border-b border-rule" : ""
          }`}
        >
          <dt className="font-hero-mono text-[11.5px] uppercase tracking-wide text-ink-soft">{r.k}</dt>
          <dd className="m-0 mt-1 text-[14px] leading-relaxed text-ink sm:mt-0">{r.v}</dd>
          <dd className="m-0 mt-2 sm:mt-0 sm:justify-self-end">
            <span className={`status-badge ${r.s}`}>{r.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );

  if (!collapsible) {
    return (
      <div className="notch-corner border border-rule-hard bg-panel">
        <div className="flex items-center justify-between gap-4 bg-ink px-4 py-2.5">
          <span className="font-hero-mono text-[11.5px] tracking-wider text-paper">{title}</span>
          <span className="font-hero-mono text-[11px] tracking-wider text-rule">STATUS</span>
        </div>
        {body}
      </div>
    );
  }

  return (
    <div className="notch-corner border border-rule-hard bg-panel">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full cursor-pointer items-center justify-between gap-4 bg-ink px-4 py-2.5 text-left transition-colors hover:bg-ink-800"
      >
        <span className="font-hero-mono text-[11.5px] tracking-wider text-paper">{title}</span>
        <span className="flex items-center gap-2">
          {/* The right slot always says something useful: it labels the status
              column when open, and tells you what you'd be opening when shut. */}
          <span className="font-hero-mono text-[11px] tracking-wider text-rule">
            {open ? "STATUS" : `${rows.length} ROWS`}
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-rule transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </span>
      </button>
      {/* Same grid-rows technique as the stage and quirk accordions on these
          pages, so every expanding thing on the site animates identically. */}
      <div
        id={bodyId}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">{body}</div>
      </div>
    </div>
  );
}
