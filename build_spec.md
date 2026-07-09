# Drishtibodh — Website Build Specification

**Version 1.0**
**Audience:** AI coding agents (Claude Code, Codex, Cursor, Gemini CLI) and human developers
**Purpose:** This document answers *how the website should be built*, not how it should be marketed. It is the single source of truth for design decisions on this project. Treat it as a constitution — components, pages, and features should be derived from it, not improvised around it.

> **Note on assets:** SVG assets (seal, wordmark, logo lockups, icons, ornaments, patterns) are being produced separately by the project owner using AI image generation and vector conversion tools. This document does not include SVG markup. Instead, every section that touches a visual asset describes the *design language* — geometry, proportions, color, usage rules — so that a coding agent can correctly place, size, and constrain whatever asset file is dropped in later, without guessing at its properties.

---

## Table of Contents

1. Brand Philosophy
2. Design Tokens
3. Component Specifications
4. Navigation & Information Architecture
5. Responsive Behavior
6. Animation & Motion System
7. Visual Language Rules
8. Instructions for AI Coding Agents

---

## 1. Brand Philosophy

### 1.1 What Drishtibodh Is

Drishtibodh is a modern knowledge institution, not a startup, not an EdTech app, and not a social platform. The website should read like the digital front door of a serious institution — closer in spirit to a university, a research library, or an academic press than to a SaaS product.

Core identity statements:

- **A modern knowledge institution.** The site should feel built to last decades, not to chase a trend cycle. Nothing about the interface should look "seasonal" or tied to a current design fad.
- **Editorial-first experience.** Content is the product. Layouts should resemble a well-typeset journal or academic magazine before they resemble a dashboard or app shell.
- **Reading before interaction.** Most user time on this site is spent reading — articles, lessons, research, explanations. Interactive elements exist to support reading, not to compete with it for attention.
- **Knowledge before branding.** The logo, colors, and ornamentation should recede. The subject matter — mathematics, philosophy, physics, computer science — should be what the user remembers.
- **Indian without becoming ornamental.** The identity draws on Indian intellectual and geometric traditions (yantras, manuscript geometry, classical proportion systems) as a *structural* influence, not a decorative skin. Avoid literal temple/religious imagery, gold gradients, or "ethnic pattern as wallpaper" clichés.
- **Classical but technologically modern.** Typography and layout should feel timeless (serif-driven, generous whitespace, restrained palette), while the underlying interaction patterns (search, AI chat, code blocks, math rendering) should feel current and fast.

### 1.2 Emotional Goals

Every page, at every breakpoint, should feel:

| Feel | Never feel |
|---|---|
| Calm | Startup-like |
| Intelligent | Corporate SaaS |
| Trustworthy | EdTech / gamified |
| Timeless | Trend-chasing |
| Spacious | Cluttered |
| Precise | Loud or noisy |

If a design decision is ambiguous, resolve it in the direction of "calm, precise, spacious" over "exciting, novel, dense."

### 1.3 Design Principles — Instead Of / Prefer

| Instead of | Prefer |
|---|---|
| Large colorful buttons everywhere | Typography hierarchy doing the work of emphasis |
| Fancy illustrations on every section | Generous white space |
| Cards everywhere, for everything | Editorial layouts (text blocks, rules, columns) — reserve cards for genuinely card-like content (a course, a book, a research paper) |
| Bright, saturated accent colors | A restrained palette with one or two deliberate accent moments per page |
| Decorative dividers and flourishes | Structural whitespace and thin rules |
| Animated everything | Motion only where it clarifies state or hierarchy |
| Stock-photo hero imagery | Typographic hero, or a single geometric/ornamental motif at low opacity |
| Dense navigation with many top-level items | A short, confident primary navigation; depth lives in sub-pages |

### 1.4 Practical Application Notes

- A single typeface family, Noto Serif, is used across reading content, headings, and UI chrome (see Section 2.2) — this is a deliberate choice for the "institutional nameplate" feel; it should not be quietly split into a serif-for-reading / sans-for-UI pairing later.
- Default to **light/paper backgrounds** with dark ink text as the primary reading mode. Any dark mode should invert tonally without changing the emotional register (still calm, still precise — not a "hacker" dark mode with neon accents).
- Ornamentation (the seal, geometric motifs, border patterns) is used at **structural boundaries** — section dividers, headers, certificates — never as filler inside content cards or as tiling wallpaper across a whole page.

---

## 2. Design Tokens

Design tokens are not just a palette or a type scale — each token has a defined *purpose* and *exclusion list*. A coding agent should never introduce a new token when an existing one fits the case; if none fits, that's a signal to flag it rather than invent one silently.

### 2.1 Color Tokens

These are the finalized values. A coding agent should define these as CSS custom properties (or an equivalent Tailwind theme extension) and reference them by name everywhere — no component should hardcode a hex value directly.

```css
:root {
  /* Backgrounds */
  --paper: #F8F5EF;
  --paper-dark: #EEE8DD;

  /* Text */
  --ink: #1D1D1B;
  --ink-soft: #4B4B4B;
  --ink-light: #777777;

  /* Primary */
  --sandstone: #B8915E;

  /* Accent */
  --copper: #B56E3C;

  /* Interactive */
  --indigo: #3558A8;

  /* Success */
  --banyan: #4F7C59;

  /* Warning */
  --amber: #C58B2A;

  /* Error */
  --vermilion: #A94438;

  /* Borders */
  --line: #DDD6CA;
  --line-dark: #C7BDAE;
}
```

**Paper `#F8F5EF` / Paper Dark `#EEE8DD`**
- Purpose: primary background for reading surfaces; `paper-dark` is a slightly deeper tone for nested/secondary surfaces (e.g., a footer, a code block background, a secondary section) without leaving the warm off-white family.
- Use: `paper` — page body, article body, lesson body, long-form content areas. `paper-dark` — footer background, subtle section separation, code block surface.
- Never use for: buttons, ink/text color, borders (use `line`/`line-dark` for borders instead).

**Ink `#1D1D1B` / Ink Soft `#4B4B4B` / Ink Light `#777777`**
- Purpose: the primary typography scale, from full-emphasis to de-emphasized text, and the "structural dark" used across the brand (also the primary seal color).
- Use: `ink` — headings, primary body text, primary icons, the institutional seal's default form. `ink-soft` — secondary body text, the Muted typography token. `ink-light` — Caption-level metadata, placeholder text, least-emphasized labels.
- Never use `ink` as a large background fill — it's a foreground/ink color, not a surface color. Never use `ink-light` for anything a user needs to read comfortably at length — it's for short, secondary text only.

**Sandstone `#B8915E`**
- Purpose: the primary institutional accent — secondary seal color, warm and earthen, evoking manuscript and stone.
- Use: secondary/muted UI surfaces (tinted section backgrounds, hover states on neutral elements), secondary button treatments, tags/labels.
- Never use for: primary body text (insufficient contrast for long reading against `paper`).

**Copper `#B56E3C`**
- Purpose: reserved, ceremonial accent — used sparingly for moments of distinction.
- Use: certificates, achievement/completion states, a single deliberate accent per page (e.g., one primary CTA, one highlighted stat, the Timeline's "you are here" marker).
- Never use for: routine UI (regular buttons, links, navigation) — overuse cheapens its ceremonial weight.

**Indigo `#3558A8`** — Interactive
- Purpose: the functional color for standard interactive elements that need a clear, non-ceremonial "this is clickable / this is active" signal — distinct from Copper's reserved, special-occasion use.
- Use: links within body text, active/selected states in navigation and tabs, focus rings, input focus borders, primary interactive icons (e.g., an active filter, a selected menu item).
- Never use for: ceremonial/achievement moments — that's Copper's role. Keeping this distinction is what keeps Copper meaningful.

**Banyan `#4F7C59`** — Success
- Purpose: semantic success state.
- Use: success toasts, form validation success, completed-state indicators (e.g., a finished lesson checkmark).

**Amber `#C58B2A`** — Warning
- Purpose: semantic warning state.
- Use: warning toasts/banners, cautionary form validation, "in progress / needs attention" indicators.

**Vermilion `#A94438`** — Error
- Purpose: semantic error state.
- Use: error toasts/banners, form validation errors, destructive-action confirmation accents (e.g., a delete button's text/icon, not necessarily its whole fill).

**Line `#DDD6CA` / Line Dark `#C7BDAE`**
- Purpose: border and rule colors, tuned to sit quietly against the warm paper tones rather than using a generic cool gray.
- Use: `line` — default borders (cards, inputs, dividers). `line-dark` — slightly more emphasized borders/rules (e.g., a rule that needs to read clearly against `paper-dark`, or an input's focus-adjacent resting border).

**Monochrome Black `#000000` / White `#FFFFFF`**
- Purpose: absolute extremes for high-contrast contexts (print, favicon, monochrome logo lockups, accessibility-forced contexts).
- Use: print assets, favicon, logo variants on colored/photographic backgrounds.
- Never use in place of Ink/Paper for normal UI — Ink and Paper are the "working" neutrals; true black/white are reserved for asset variants.

### 2.2 Typography Hierarchy

**Font family:** Noto Serif is used across the entire site — body, headings, UI chrome, and the wordmark. There is a single typographic voice; no secondary sans-serif is introduced for UI elements. This reinforces the "institutional nameplate" feel described in Section 1 and avoids the common EdTech pattern of pairing a serif "brand" font with a generic sans "app" font.

```css
:root {
  --font-serif: "Noto Serif", "Noto Serif Devanagari", serif;
}
```

> Note: if the site supports Devanagari or other Indic scripts anywhere (subject names, quotations, etc.), pair Noto Serif with the matching Noto Serif script family (e.g., Noto Serif Devanagari) rather than falling back to a mismatched system serif — Noto's serif family is designed to pair consistently across scripts.

Each level below has a defined role and a weight/size assignment. A coding agent should map every piece of text on the site to one of these — never invent an ad hoc font size or pull in a second family for "just this one component."

| Token | Weight | Size (desktop) | Size (mobile) | Line height |
|---|---|---|---|---|
| Display | 700 (Bold) | 64–72px | 40–44px | 1.1–1.15 |
| Hero | 700 (Bold) | 40–48px | 30–34px | 1.15–1.2 |
| Heading | 600 (SemiBold) | 24–28px | 20–22px | 1.25–1.3 |
| Body | 400 (Regular) | 17–18px | 16–17px | 1.6–1.75 |
| Caption | 400 (Regular) | 13–14px | 13px | 1.4 |
| Muted | 400 (Regular), reduced contrast via `ink-soft`/`ink-light` | matches Body or Caption depending on context | same | matches host context |
| Disabled | 400 (Regular), fixed low-contrast color, never inherits Muted's color | matches host context | same | matches host context |
| Code | Monospace (not Noto Serif — see below) | 14–15px | 14px | 1.5 |
| Math | Scales with host context (Body/Heading) via the math renderer's own sizing | — | — | aligns to host baseline |

- **Weight discipline:** only three weights are used system-wide — 400 (Regular) for Body/Caption/Muted, 600 (SemiBold) for Heading, 700 (Bold) for Display/Hero. Do not introduce 300/500/800 weights; if Noto Serif's variable font is used, clamp usage to these three steps for consistency.
- **Italic:** Noto Serif's italic is used sparingly — Quote Block attribution-adjacent text and genuine emphasis within body copy — not as a general-purpose de-emphasis technique (use `ink-soft`/`ink-light` color for that instead).
- **Code exception:** Code blocks and inline code use a monospace family (e.g., a system monospace stack or a paired mono font), not Noto Serif — code needs fixed-width alignment that a serif text face cannot provide. This is the one intentional break from the single-family rule, and it's a functional necessity rather than a stylistic one.

**Reading ergonomics (apply to Body and article contexts specifically):**
- Line height: generous enough for sustained reading (roughly 1.6–1.75x font size for Body, per the table above).
- Maximum reading width: constrain long-form text columns (roughly 65–75 characters per line) — never let article text stretch full-width on large screens.
- Paragraph spacing: consistent vertical rhythm between paragraphs, distinct from (larger than) line-height within a paragraph.
- Letter spacing: default tracking for Body/Heading; the Wordmark and nameplate-style lockups may use deliberately widened tracking (an institutional-nameplate feel, e.g., +2–4% letter-spacing on the wordmark specifically), but this is an identity-asset decision, not a general typography rule — Body and Heading keep normal/default tracking for legibility.

### 2.3 Spacing Scale

A single spacing scale should be used everywhere — no arbitrary pixel values in components.

| Token | Value | Typical use |
|---|---|---|
| space-1 | 4px | Icon-to-label gaps, tight inline spacing |
| space-2 | 8px | Compact component padding, small gaps between related elements |
| space-3 | 16px | Default component padding, gaps between grouped elements |
| space-4 | 24px | Spacing between distinct UI elements within a section |
| space-5 | 32px | Section-internal spacing, card padding on larger components |
| space-6 | 48px | Spacing between major sub-sections |
| space-7 | 64px | Spacing between major page sections |

Rule: components should only ever consume values from this scale. If a layout seems to need something in between, that's a signal the layout needs rethinking, not a signal to add a token.

### 2.4 Border Radius

Radius communicates a component's "weight" and should be applied consistently by component *type*, not per instance:

- **Cards**: a small-to-moderate radius — enough to soften edges without feeling app-like or bubbly.
- **Inputs**: matches or is slightly smaller than card radius, for visual consistency between form elements and containers.
- **Buttons**: consistent across all button variants (primary, secondary, ghost) — never mix radius values across button types.
- **Images**: typically matches card radius when images sit inside cards; full-bleed editorial images may be square-cornered to feel more "printed page" than "app."

### 2.5 Elevation (Shadow) System

Shadows are used sparingly — this is an editorial, print-influenced identity, not a heavily skeuomorphic app UI.

- **No shadow** — default state for most content (text blocks, editorial layout, inline elements). This should be the most common state on the site.
- **Small shadow** — subtle lift for resting cards (research cards, book cards, subject cards) to separate them from the page background without looking "floaty."
- **Medium shadow** — modals, dropdowns, command palette, popovers — elements that are genuinely above the page in the interaction stack.
- **Hover shadow** — a slightly increased shadow (from none or small, to small or medium) on hover for interactive cards, signaling interactivity without a jarring jump.

Rule: never stack more than one elevation step change per interaction; never use heavy/dark drop shadows — keep them soft and low-opacity, consistent with the calm/precise emotional goal.

---

## 3. Component Specifications

Every component below follows the same structure: **Purpose, Structure, Spacing, Typography, Colors, Interaction (Hover/Focus), Mobile, Accessibility.** A coding agent implementing a component not listed here should follow this same structure for consistency, and should default to composing existing components rather than inventing new patterns.

### 3.1 Navbar

- **Purpose:** Top-level navigation and global wayfinding.
- **Structure:** Logo (seal + wordmark lockup) on the left, primary navigation links centered or left-aligned next to the logo, utility cluster on the right (search, theme toggle, language selector, primary CTA).
- **Spacing:** Horizontal padding of space-5 (32px) on desktop; internal gaps between nav items use space-3–space-4.
- **Height:** 80px desktop, 64px tablet, 56px mobile.
- **Typography:** Nav links use a compact UI-weight text style (not Body serif) — clear, neutral, slightly smaller than Body.
- **Colors:** Paper or a very subtle tinted surface background; Ink for text and icons; Copper reserved only if the CTA button uses it (see Buttons).
- **Behavior:** Sticky after scrolling past the hero; on scroll-down, may slide away (see Animation) to preserve reading space, reappearing on scroll-up.
- **Interaction:** Links get a visible hover state (underline or subtle color shift, not a background pill); active/current route is visually distinguished.
- **Mobile:** Collapses into a hamburger/menu affordance; search and secondary utilities may move into an expanded menu or a dedicated search view.
- **Accessibility:** Fully keyboard-navigable; visible focus ring on every interactive element; skip-to-content link available before the navbar for screen reader users.

### 3.2 Hero

- **Purpose:** Establish page identity immediately — this is the first editorial statement on any major page (Home, Subject, Research).
- **Structure:** Typographic-led; may include a single restrained geometric/ornamental motif (e.g., a faint seal-derived pattern) as a background element, never as the focal point.
- **Spacing:** Generous vertical padding (space-6–space-7) above and below.
- **Typography:** Display or Hero token for the headline; Body or Muted for a short supporting line beneath it.
- **Colors:** Paper background; Ink text; at most one Copper accent (e.g., a single CTA button).
- **Interaction:** If a CTA is present, it follows the Buttons spec.
- **Mobile:** Headline scales down via the responsive type scale (see Section 5); ornamental background motifs should reduce in size or opacity, or be omitted, rather than being cropped awkwardly.
- **Accessibility:** Headline is a real semantic heading (h1 for the page's primary hero); decorative background motifs are marked `aria-hidden`.

### 3.3 Buttons

- **Variants:** Primary, Secondary, Ghost/Text.
- **Purpose:** Primary = the one deliberate action on a view; Secondary = supporting actions; Ghost = low-emphasis actions (e.g., "Learn more").
- **Structure:** Label text, optional leading/trailing icon.
- **Spacing:** Consistent horizontal/vertical padding scaled from the spacing tokens (e.g., space-3 vertical, space-4 horizontal) — identical across variants so only color/weight differs.
- **Typography:** UI-weight text, consistent size across variants (size communicates hierarchy via placement/frequency, not by making primary buttons bigger than secondary ones).
- **Colors:** Primary uses `ink` or `indigo` as its fill for standard actions (e.g., "Search," "Sign in," "Continue"); reserve `copper` only for genuinely special/ceremonial actions, e.g. "Enroll," "Get Certificate" — not for routine navigation-style actions. Secondary uses an outlined or `sandstone`-tinted treatment. Ghost uses text-only with a hover underline or subtle `indigo` tint (matching in-body link color for consistency).
- **Interaction — Hover:** Subtle darkening/lightening of fill or a soft shadow lift; no large scale/transform changes.
- **Interaction — Focus:** A clearly visible focus ring, distinct from hover, for keyboard users.
- **Mobile:** Full-width buttons permitted in narrow contexts (e.g., forms, mobile CTAs in a sticky footer bar); tap target minimum height is respected.
- **Accessibility:** Buttons are real `<button>` or `<a>` elements as appropriate (never a `<div>` with a click handler); disabled state uses the Disabled token and `aria-disabled`.

### 3.4 Cards (general pattern)

Applies to Research Cards, Subject Cards, Course Cards, Book Card, and similar "unit of content" components.

- **Purpose:** Represent a single discrete unit of content that can be scanned in a grid or list.
- **Structure:** Optional media/thumbnail area, title (Heading), short description (Body or Muted), metadata row (Caption — author, date, duration, tags).
- **Spacing:** Internal padding of space-4–space-5; consistent gap between cards in a grid (space-4).
- **Typography:** Title uses Heading token; description uses Body or Muted depending on emphasis needed; metadata uses Caption.
- **Colors:** Paper or a very subtle Sandstone-tinted surface; Ink text; borders (if used instead of shadow) are thin and low-contrast.
- **Elevation:** No shadow at rest, or Small shadow — Hover shadow on interaction (see Section 2.5).
- **Interaction:** Entire card is clickable where it represents navigation; hover raises elevation slightly and may shift title color subtly; no large scale transforms.
- **Mobile:** Grid collapses to a single column or a horizontally-scrollable row depending on content type (define per page, but default to single column stacking).
- **Accessibility:** The whole card should be reachable as a single focusable link where possible (avoid nested interactive elements inside a card-as-link); alt text required on thumbnails.

### 3.5 Quote Block

- **Purpose:** Set apart a quotation within long-form content.
- **Structure:** Quotation text, optional attribution line.
- **Spacing:** Indented from body text or set with a left rule; generous vertical spacing above/below (space-5).
- **Typography:** Slightly larger than Body, often italic; attribution uses Caption.
- **Colors:** Ink text; a thin left border rule in Sandstone or Ink at reduced opacity — never a heavy colored background block.
- **Mobile:** Reduces indentation but retains the distinguishing rule/typography treatment.

### 3.6 Code Block

- **Purpose:** Display source code within lessons/articles.
- **Structure:** Optional language label, optional copy-to-clipboard action, line-numbered or plain body.
- **Typography:** Code token (monospace), consistent size with surrounding Body text's rhythm.
- **Colors:** A subtle, low-contrast surface tint distinct from Paper (so it reads as "a block" without looking like a dark-mode intrusion in a light page); syntax highlighting should stay within the brand's desaturated palette rather than importing a generic bright syntax theme.
- **Interaction:** Copy button appears on hover (desktop) or is always visible (mobile).
- **Accessibility:** Proper semantic `<pre><code>` markup; copy action has an accessible label and confirms success (e.g., brief "Copied" state) without relying on color alone.

### 3.7 Math Block

- **Purpose:** Display block-level mathematical notation.
- **Structure:** Centered equation, optional equation number.
- **Typography:** Math token, scaled to align with surrounding Body/Heading context.
- **Colors:** Ink on Paper — no special background treatment needed unless distinguishing from surrounding code/quote blocks.
- **Mobile:** Long equations should scroll horizontally within their own container rather than shrinking to illegibility or breaking the page layout.

### 3.8 Search

- **Purpose:** Global and section-scoped content discovery.
- **Structure:** Trigger (icon/field in navbar) opening a command-palette-style overlay with an input, recent/suggested queries, and categorized results (e.g., Subjects, Research, Library, Lessons).
- **Spacing/Typography:** Input uses Body-scale text for legibility; result groups use Caption-level category labels above Heading/Body-level result titles.
- **Colors:** Overlay uses Paper or a very slightly elevated surface with Medium shadow; active/selected result row uses a Sandstone-tinted background.
- **Interaction:** Keyboard-first — arrow keys move selection, Enter navigates, Escape closes; mouse hover also selects.
- **Mobile:** Expands to a full-screen search view rather than a small overlay.
- **Accessibility:** Proper `role="dialog"` / combobox semantics; focus is trapped within the overlay while open and returned to the trigger on close.

### 3.9 Footer

- **Purpose:** Secondary navigation, institutional information, legal links.
- **Structure:** Grouped link columns (e.g., Learn, Institution, Resources, Legal), a compact seal/wordmark lockup, and a copyright/credits line.
- **Spacing:** Generous top padding (space-7) separating it from page content; internal column gaps at space-5.
- **Typography:** Column headers use Caption or a small Heading variant; links use Body or a slightly smaller UI text.
- **Colors:** May use a Sandstone-tinted background to visually close the page, distinct from the Paper body above it.
- **Accessibility:** Uses a real `<footer>` landmark; link groups are properly labeled for screen readers.

### 3.10 Sidebar

- **Purpose:** Secondary/contextual navigation within a section (e.g., lesson table of contents, library filters).
- **Structure:** Sticky within its scroll container, with a clear current-position indicator.
- **Colors/Typography:** Uses the same Caption/Body hierarchy as other nav elements; current item is distinguished by weight or a subtle rule, not a loud color fill.
- **Mobile:** Collapses into a toggle-revealed drawer or a top-of-content dropdown rather than disappearing entirely.

### 3.11 Breadcrumbs

- **Purpose:** Show hierarchical position (e.g., Subjects / Mathematics / Calculus / Lesson 3).
- **Typography:** Caption-level, with the current page in Ink and ancestors in Muted.
- **Interaction:** Ancestor items are links with a subtle hover underline.
- **Mobile:** Truncate intermediate levels (e.g., show first and last with an ellipsis) rather than wrapping to multiple lines.

### 3.12 Tabs

- **Purpose:** Switch between related views without navigating away (e.g., "Overview / Syllabus / Reviews" on a course page).
- **Structure:** Horizontal row of labels with an active-state indicator (underline, not a filled pill, to stay consistent with the editorial/restrained aesthetic).
- **Interaction:** Keyboard arrow-key navigation between tabs per standard ARIA tabs pattern.
- **Mobile:** Horizontally scrollable if tabs exceed viewport width, rather than wrapping.

### 3.13 Accordion

- **Purpose:** Progressive disclosure of grouped content (e.g., FAQ, syllabus modules).
- **Structure:** Header row (title + expand/collapse indicator) and a content panel.
- **Interaction:** Smooth height transition on expand/collapse (see Animation); only the clicked header toggles its own panel unless explicitly designed as single-open-at-a-time.
- **Accessibility:** Header uses `aria-expanded`; content panel is properly associated via `aria-controls`.

### 3.14 Pagination

- **Purpose:** Navigate multi-page result sets or content lists.
- **Structure:** Numbered pages with previous/next controls; consider a "load more" pattern for content feeds where appropriate instead of numbered pagination.
- **Typography/Colors:** Current page distinguished by weight/underline, not a heavy filled background.
- **Accessibility:** Proper `aria-current="page"` on the active page control.

### 3.15 Forms — Input

- **Purpose:** Text entry for search, contact, auth, etc.
- **Structure:** Label above field (never placeholder-as-label), input, optional helper/error text below.
- **Spacing:** Consistent vertical rhythm between label, field, and helper text (space-2).
- **Colors:** Paper/white fill, thin Ink or Sandstone border at rest, a clearly distinct border/ring color on focus, and a semantic error color on validation failure.
- **Accessibility:** Label properly associated via `for`/`id`; error messages are programmatically linked via `aria-describedby`.

### 3.16 Forms — Dropdown / Select

- **Purpose:** Choose one option from a constrained list.
- **Structure:** Matches Input styling for the closed state; open state presents a list styled consistently with the Search results list.
- **Accessibility:** Full keyboard operability (open with Enter/Space, navigate with arrows, select with Enter, close with Escape).

### 3.17 Modal

- **Purpose:** Focused, blocking interaction (confirmations, forms, media viewers).
- **Structure:** Overlay/scrim behind, centered panel with a clear close affordance.
- **Colors:** Panel uses Paper with Medium shadow; scrim is Ink at low opacity.
- **Interaction:** Focus is trapped within the modal; Escape closes it; clicking the scrim closes it (unless the action is destructive/requires explicit confirmation).
- **Mobile:** May become a full-screen sheet rather than a centered floating panel.
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, labelled by its heading.

### 3.18 Toast

- **Purpose:** Brief, non-blocking system feedback (e.g., "Saved," "Copied," "Error submitting form").
- **Structure:** Icon, short message, optional dismiss/action.
- **Colors:** Neutral by default; semantic color only for the icon/accent to indicate success/error/info, not the entire background.
- **Interaction:** Auto-dismisses after a short duration; also dismissible manually.
- **Accessibility:** Announced via an `aria-live` region so screen reader users are notified without focus being stolen.

### 3.19 Profile Menu

- **Purpose:** Access to account-related actions.
- **Structure:** Avatar/initials trigger opening a small dropdown with account links and sign-out.
- **Colors/Elevation:** Matches the Search/Dropdown surface treatment (Paper, Medium shadow).
- **Accessibility:** Standard menu-button ARIA pattern; keyboard operable.

### 3.20 Command Palette

- **Purpose:** Power-user quick actions and navigation (may share infrastructure with Search).
- **Structure:** Input field with fuzzy-matched action/navigation list, grouped by category.
- **Interaction:** Opens via keyboard shortcut; fully keyboard-driven.
- **Accessibility:** Same combobox/dialog pattern as Search.

### 3.21 Library Grid

- **Purpose:** Browse the book/resource library.
- **Structure:** Grid of Book Cards with filter/sort controls above (by subject, format, difficulty).
- **Spacing:** Consistent grid gap (space-4); filter bar uses space-3 between controls.
- **Mobile:** Filters collapse into a single "Filters" button opening a drawer/sheet; grid reduces to fewer columns, then a single column.

### 3.22 Research Grid

- **Purpose:** Browse research papers/articles.
- **Structure:** Similar to Library Grid but using Research Cards, which surface authorship, publication date, and abstract snippet more prominently than Book Cards.

### 3.23 AI Chat

- **Purpose:** Conversational interface for the AI assistant feature.
- **Structure:** Message list (Chat Bubbles) with a persistent input at the bottom; may include suggested prompts when empty.
- **Colors:** User messages and assistant messages are visually distinguished by alignment and a subtle surface-tint difference — avoid loud, high-contrast "chat bubble" colors; keep it consistent with the calm editorial palette.
- **Interaction:** Streaming/typing indicator for in-progress responses (see Animation — Loading states).
- **Accessibility:** New messages are announced via `aria-live="polite"`; input remains reachable and usable while a response streams in.

### 3.24 Chat Bubble

- **Purpose:** A single message unit within AI Chat.
- **Structure:** Message content, optional citation references, timestamp (Caption).
- **Colors:** Assistant bubble may use a very subtle Sandstone tint; user bubble may use Paper with a border — both remain low-saturation and text-forward.

### 3.25 Citation Card

- **Purpose:** Reference a source used in an AI response or article.
- **Structure:** Compact card with source title, origin (e.g., "Research," "Library"), and a link.
- **Typography/Colors:** Caption-level metadata, Body-level title; treated as a miniature version of the general Card pattern (Section 3.4).

### 3.26 Book Card

- **Purpose:** Represent a single book/resource in the Library.
- **Structure:** Cover thumbnail, title (Heading), author (Caption), tags/subject (Caption).
- **Follows:** General Card pattern (3.4), with the thumbnail proportioned as a book cover (portrait aspect ratio) rather than a landscape media area.

### 3.27 Timeline

- **Purpose:** Represent chronological content (e.g., a subject's historical development, a learning path's progression).
- **Structure:** A vertical (or horizontal, on wide desktop views) rule connecting discrete milestone markers, each with a Heading/Body/Caption grouping.
- **Colors:** The connecting rule uses a thin, low-contrast Ink or Sandstone line; milestone markers use a small filled dot, with the current/active milestone optionally distinguished (e.g., via the Copper accent, used sparingly here as a single "you are here" moment).
- **Mobile:** Vertical orientation only; ensure adequate spacing so markers and their text don't crowd on narrow screens.

---

## 4. Navigation & Information Architecture

### 4.1 Site Map

```
/
├── Learn
├── Subjects
│   ├── Mathematics
│   ├── Physics
│   ├── Computer Science
│   └── Philosophy
├── Research
├── Library
├── AI
├── About
└── Search
```

This structure should remain extensible — new Subjects should be addable without restructuring the top-level navigation, and new top-level sections (if ever needed) should be rare and deliberate.

### 4.2 Navigation Priorities

- Primary navigation should expose no more than 5–7 top-level items — depth belongs inside sections (e.g., individual Subjects), not in an ever-growing top nav.
- "Learn" acts as a general entry point/overview; "Subjects" is where structured, hierarchical content lives.
- "AI" is treated as a first-class top-level feature, not buried inside another section, since it's a distinct mode of interacting with the content (conversational vs. browsing/reading).
- "Search" is always reachable (icon in navbar / keyboard shortcut) rather than requiring navigation to a dedicated page.

### 4.3 Breadcrumb Rules

- Breadcrumbs appear on any page nested more than one level deep (e.g., Subjects → Mathematics → Calculus → Lesson 3).
- The current page is never a link within its own breadcrumb trail.
- On mobile, truncate to first + ellipsis + immediate parent + current, to avoid wrapping.

### 4.4 Search Behavior

- **Global search** queries across all content types (Subjects, Research, Library, Lessons) and groups results by category with clear category headers.
- **Section search** (e.g., searching within Library) scopes results to that section only and should be reachable from a persistent search affordance within the section, distinct from the global search trigger.
- **Keyboard shortcuts:** a standard "open command palette / search" shortcut should be supported (e.g., a `/`-style or `Cmd/Ctrl+K`-style trigger) — pick one convention and apply it consistently across the whole site.

### 4.5 Future Scalability

- New Subjects, Research categories, and Library formats should be addable via content/config changes, not structural navigation changes.
- The AI section's information architecture (chat history, saved conversations, citations) should be designed so it can grow (e.g., multiple chat threads) without altering the top-level site map.

---

## 5. Responsive Behavior

### 5.1 Breakpoints

| Breakpoint | Width |
|---|---|
| Desktop | 1440px+ |
| Laptop | 1280px |
| Tablet | 768px |
| Mobile | 390px |

### 5.2 Grid

- Desktop/Laptop: multi-column grids (e.g., 3–4 columns for card grids) with consistent gutters from the spacing scale.
- Tablet: reduce to 2 columns for most grids.
- Mobile: single column for nearly all grids; horizontal scroll is acceptable for certain content rows (e.g., a "featured" carousel) but not for primary content grids.

### 5.3 Typography Scaling

- Display and Hero tokens scale down noticeably from Desktop to Mobile (roughly proportional reduction, not a flat pixel subtraction) to preserve visual balance.
- Body text size should change minimally across breakpoints — legibility on mobile should not be sacrificed for "matching" the desktop hero's dramatic scale-down.
- Maximum reading width rules (Section 2.2) still apply on tablet/desktop; on mobile, text naturally fills the available width with standard side padding.

### 5.4 Padding

- Page-level horizontal padding shrinks progressively: generous on Desktop, moderate on Tablet, minimal-but-comfortable on Mobile — always using values from the spacing scale, never arbitrary values.

### 5.5 Navigation Changes

- Desktop/Laptop: full horizontal navbar with all utilities visible.
- Tablet: may begin collapsing secondary utilities (e.g., language selector) into an overflow/menu.
- Mobile: hamburger-triggered menu; search becomes a full-screen view; sticky CTA (if any) may move to a bottom bar.

### 5.6 Cards

- Card internal padding may reduce slightly on mobile, but never below a comfortable tap-friendly minimum; card grids collapse to single column as noted in 5.2.

### 5.7 Tables

- Wide data tables should scroll horizontally within their own container on tablet/mobile rather than shrinking columns to illegibility; consider a "stacked" card-per-row alternative for simple tables on mobile where appropriate.

### 5.8 Research Pages / Mathematics / Code Blocks

- Math blocks and code blocks that exceed viewport width scroll horizontally within their own bounded container (see 3.6, 3.7) — the surrounding article layout should never stretch or break to accommodate them.

### 5.9 Images

- Images scale fluidly within their containers and respect the same border-radius rules as their containing component (e.g., an image inside a Card follows Card radius).
- Full-bleed editorial images may extend beyond the reading-width column on desktop but should reduce to the standard content width on mobile.

---

## 6. Animation & Motion System

### 6.1 Motion Philosophy

Motion exists to clarify state changes and spatial relationships — never as decoration. If removing an animation wouldn't reduce the user's understanding of what just happened, the animation is a candidate for removal. This is consistent with the "calm, precise" emotional goals in Section 1.2.

### 6.2 Durations

- Micro-interactions (hover, focus, small state toggles): fast, roughly 150–200ms.
- Component-level transitions (dropdown open, accordion expand, modal appear): moderate, roughly 200–300ms.
- Page-level transitions (route changes, if any): kept brief and subtle — avoid long, showy transitions that delay content.

Use an easing curve that decelerates into its resting state (ease-out style) for elements appearing, and a slightly faster acceleration for elements leaving — this should be applied consistently as a single easing token across the system rather than picked ad hoc per component.

### 6.3 Per-Component Motion Rules

- **Hover:** Subtle color/elevation shift only; no scale/transform "pop" effects that feel gamified.
- **Navbar:** Slide/fade on the sticky show/hide behavior; should feel smooth, not abrupt.
- **Cards:** Elevation change (shadow) on hover, per Section 2.5; no rotation or scale transforms.
- **Dropdown / Select / Profile Menu:** Fade + slight vertical offset on open/close.
- **Modal:** Scrim fades in; panel fades and slightly scales/translates into position (subtle, not bouncy).
- **Search / Command Palette:** Fast fade-in on open, immediate focus on the input; results may fade in as they resolve, but shouldn't visibly "jump" as counts change if avoidable.
- **Loading — Skeletons:** Used for content that takes a moment to load (cards, lists); a gentle shimmer or pulse, never a spinning element as the default pattern for content placeholders.
- **Loading — Progress bars:** Used for determinate processes (e.g., an upload or a multi-step form); smooth, continuous fill.
- **AI Typing:** A restrained typing/streaming indicator (e.g., a soft pulsing dot sequence or incrementally-rendering text) — should feel calm and readable, not like a flashy "AI is thinking" gimmick.

### 6.4 Things That Should Never Animate

- Body text reflow/appearance (text should be immediately readable, not fading/typing in character-by-character outside of the specific AI-streaming context).
- Navigation link hover states should not use scale/bounce effects.
- Background ornamental patterns should be static — never auto-animating or parallaxing in a way that competes with reading.
- Page load should never involve a decorative intro/splash animation that delays access to content.

---

## 7. Visual Language Rules

These are cross-cutting consistency rules that apply regardless of which page or component is being built.

- **Maximum content width:** Long-form reading content (articles, lessons) is constrained to a comfortable reading-width column (see Section 2.2); wider layouts (grids, dashboards) may use the full container width up to a sensible maximum page width, beyond which content should not stretch indefinitely on ultra-wide monitors.
- **Minimum white space around major sections:** Every major page section (hero, a content grid, a footer) is separated from its neighbors by at least the space-6/space-7 tokens — sections should never feel like they're touching.
- **Ornament placement:** Decorative ornaments (seal-derived geometric motifs, border patterns) are used only at section boundaries (e.g., a subtle divider between the hero and the next section, or framing a certificate) — never placed inside content cards or between paragraphs of body text.
- **Background pattern opacity:** Any background geometric/ornamental pattern remains at roughly 3–6% opacity relative to its base surface — present enough to add texture and identity, never competing with foreground text for contrast.
- **One ornamental element per viewport:** At any given scroll position, at most one ornamental/decorative element should be visible on screen — stacking multiple decorative motifs in the same view reads as cluttered and undermines the calm/precise goal.
- **Icon style:** All icons use a consistent 2px stroke weight with rounded caps and joins — no mixing of filled and outlined icon styles, and no mixing stroke weights across the icon set.
- **Illustration restraint:** Where illustration is used at all (rare), it should be subdued in color and detail so that typography remains the primary focus of any given view — illustration supports content, it doesn't headline it.
- **Institutional asset usage (seal/wordmark/logo):** The seal and wordmark should always be reproduced at their defined proportions (no stretching or uneven scaling); the seal's primary Ink version is the default across the site, with Sandstone/Copper/monochrome variants reserved for the specific contexts described wherever those assets are introduced (e.g., Copper for certificates, monochrome for print/favicon contexts). The seal should remain legible even at the smallest sizes it's used at (e.g., a favicon-scale instance) — if an asset stops being legible at a given size, use a simplified variant rather than shrinking the full-detail version.

---

## 8. Instructions for AI Coding Agents

These rules govern how any coding agent (Claude Code, Codex, Cursor, Gemini CLI, or a human developer) should implement this specification.

1. **Treat Sections 2–7 of this document as the single source of truth.** When in doubt about a color, spacing value, or component behavior, refer back here rather than inventing a new value.
2. **Never invent new colors** — use only the defined design tokens (Section 2.1). If a needed color truly doesn't exist yet, flag it explicitly rather than picking an arbitrary hex value.
3. **Never introduce arbitrary spacing values** — use only the spacing scale (Section 2.3). If a layout seems to need an in-between value, reconsider the layout rather than the scale.
4. **Prefer composition over creation** — before building a new component, check whether an existing component (Section 3) can be composed or lightly extended to meet the need.
5. **Keep components stateless by default** — introduce local state only when the interaction genuinely requires it (e.g., an open/closed toggle), and lift state up rather than duplicating it across components.
6. **Use semantic HTML** — `header`, `nav`, `main`, `article`, `section`, `footer`, and appropriate heading levels throughout; do not build interactive elements out of non-semantic `div`/`span` when a native element (`button`, `a`, `input`, `select`) applies.
7. **Ensure keyboard accessibility and visible focus states on every interactive element** — this is non-negotiable across all components in Section 3, not just the ones where it's explicitly called out.
8. **Avoid unnecessary animation** — motion should support understanding of a state change (Section 6.1), never decoration. When unsure whether an animation belongs, default to omitting it.
9. **Use SVG assets for logos, ornaments, icons, and patterns; never rasterize them.** SVG files for these assets will be supplied separately — implement components to accept and correctly size/constrain an SVG asset (respecting the proportions and legibility rules in Section 7), rather than generating placeholder logo/icon artwork.
10. **Do not introduce external UI libraries unless explicitly requested.** Build components from the specifications in Section 3 using the project's own styling system (e.g., a Tailwind theme configured from these tokens), rather than pulling in a third-party component kit that brings its own default visual language.
11. **Maintain consistent typography hierarchy across all pages** — every text element should map to one of the tokens in Section 2.2; do not create one-off font sizes for a specific page.
12. **Respect the responsive rules in Section 5 as defined, not as "roughly similar."** Breakpoint behavior (grid columns, navigation collapse, padding reduction) should match what's specified per breakpoint.
13. **When a requirement in a future prompt conflicts with this document, flag the conflict explicitly** rather than silently deviating from the specification or silently overriding the new instruction — let the project owner make the call.

---

*End of specification.*