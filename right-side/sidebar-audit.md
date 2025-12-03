# Right Sidebar Widget Structure and Styling Audit

## Current DOM (HEAD)
- **Sidebar container:** `<aside class="right-side" aria-label="Companion widgets">` wrapping `<div id="pet-widget-container"></div>` (in `index.html`).
- **Injected widget markup:** `<div class="bm-widget pet-widget"><div class="pet-widget__frame"><iframe src="pet-axolotl/pet.html" ...></iframe></div></div>` loaded via `right-side/pet-widget.js`.
- **Notable class hooks:** Outer `.bm-widget.pet-widget`; no inner element with `.pet-widget` class or `id="pet-widget"` after HTML fetch.

## Current Computed Style Hooks
- `.right-side`: flex column layout with `flex: 0 1 clamp(320px, 30vw, 420px)`, `width: clamp(320px, 30vw, 420px)`, `min-width: 300px`, `max-width: 480px`, and gap `clamp(0.65rem, 1vw, 1rem)`.
- `.right-side #pet-widget-container`: flex column with same gap and full width.
- `.bm-widget`: padding `clamp(0.9rem, 1.2vw, 1.25rem)`, surface background, soft radius (`calc(var(--soft-radius) * 1.05)`), 1px light border, blur backdrop, and card shadow.
- `.bm-widget.pet-widget`: flex column with gap `clamp(0.6rem, 0.9vw, 0.95rem)`.
- `.pet-widget__frame`: flex item with `min-height: clamp(360px, 55vw, 640px)`, 1px border, soft shadow, surface background, and radius `calc(var(--soft-radius) * 0.9)`; iframe fills 100% width/height.

## Original Sidebar Markup and Sizing (pre-flex/min-height changes)
- **DOM hierarchy:** `<div class="bm-widget pet-widget"><section id="pet-widget" class="pet-widget" aria-label="Axolotl companion widget"><div class="pet-widget__frame"><iframe ...></iframe></div></section></div>`.
- **Sidebar sizing:** `.right-side` fixed at `flex/width/min/max-width: 420px`.
- **Widget frame sizing:** `.pet-widget__frame` used `min-height: clamp(680px, 60vw, 960px)`.

## Discrepancies vs Original
- Missing inner `<section id="pet-widget" class="pet-widget">` wrapper removes the `.pet-widget` hook that existing CSS targets under `.bm-widget.pet-widget .pet-widget`, and drops the `aria-label` from the nested element.
- Sidebar width is now fluid (min 300px, max 480px) instead of the fixed 420px block from the original build.
- Pet iframe frame min-height is significantly reduced (`clamp(360px, 55vw, 640px)` vs `clamp(680px, 60vw, 960px)`), altering expected vertical space.
