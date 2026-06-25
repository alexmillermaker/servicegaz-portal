# UI guide and layout contract

This document fixes the approved visual and interaction rules for the ServiceGaz portal. It is a working contract: do not change these rules unless the user explicitly asks for a UI/UX change.

## Product format

- The portal is mobile-first and is optimized for the existing app shell with `AppPageHeader` at the top and `MobileNavigation` at the bottom.
- Keep employee-facing pages visually calm: light background, white cards, rounded corners, readable typography, clear touch targets.
- Preserve existing colors, spacing tokens, shadows, radii, and component behavior unless the user requests a redesign.
- Do not introduce a new visual language for one page if an existing portal pattern already covers the scenario.
- Do not force global `height: 100dvh` or global `overflow: hidden` across the whole app. This caused page clipping before. Use viewport locking only inside a specifically scoped page that requires it.

## Page structure

Default employee page pattern:

1. `AppPageHeader`.
2. Page title or compact page intro when needed.
3. Main content as cards or lists.
4. Bottom spacer for `MobileNavigation`.
5. `MobileNavigation`.

Rules:

- Content pages may scroll when content is longer than one screen.
- Avoid hidden overflow on ordinary content pages.
- Keep one primary action per visible block.
- Avoid duplicated controls that perform the same task in two nearby places.
- Buttons that look clickable must either perform the action or show a clear placeholder state.

## Cards and lists

- Cards use the current rounded white surface style.
- Lists must have enough bottom padding so the last item is not hidden by bottom navigation.
- Item rows must remain readable: icon or status on the left, title and metadata in the center, action/chevron/status on the right.
- Do not compress cards so aggressively that labels or progress text are clipped.

## Search and selection

- Search should be the primary entry point when a page contains many destinations, documents, employees, or items.
- Search fields should not duplicate another visible control unless both are clearly serving different scopes.
- Search results must use the same source of truth as the visible lists.

## Navigation section UI

The navigation page has a special layout because the map is the product, not a supporting card.

Approved navigation layout:

- The map is always the main visual area.
- Top overlay: destination search and object/building switch only.
- Left overlay: floor selector with numbers only.
- Right overlay: zoom controls and reset view.
- Bottom overlay: route card, start/destination summary, and segmented route steps.
- Do not duplicate bottom route information in the top overlay.
- Do not show room-number subtitles directly on the map; room numbers can remain in search/list metadata.
- Keep rooms clickable through SVG room boundaries.
- Do not add visual POI dots inside rooms unless the user explicitly requests them.

## Responsive and viewport behavior

- Employee content pages should prioritize not clipping content over fitting everything into one screen.
- The navigation page may use a viewport-constrained map layout, but controls must not cover the route target or make the map feel secondary.
- If a compact-height rule is added, it must be scoped to the page/component and tested against the visible mobile shell.

## Change discipline

Before any UI change:

1. Identify the affected page and its contract in `docs/PAGE_CONTRACTS.md`.
2. Check whether navigation-specific rules in `docs/NAVIGATION_SPEC.md` apply.
3. Make the smallest scoped change.
4. Run the relevant check, usually `npm run build`.
5. Do not include unrelated files or local scratch files in the commit.
