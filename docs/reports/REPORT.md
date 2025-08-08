Remcura CSS Audit – Form Control Predictability

Sources scanned

- src/css/app.scss
- All \*.vue with <style> blocks under src
- Quasar CSS: quasar/src/css/index.sass (imported in src/main.ts)

Selector map (inputs/selects/textareas/dropdowns/Quasar)

- Quasar: .q-field, .q-input, .q-select, .q-field**control, .q-field**native, .q-field**label,
  .q-menu (dropdown), .q-dialog.q-select**dialog
- Custom: .form-control, .dropdown-control (introduced), .control-sm/.control-md/.control-lg,
  .w-full/.inline/.block
- High-specificity overrides present previously: html body .q-field..., body .q-btn..., .q-layout
  .q-btn ...

Findings

- Specificity hotspots (examples):
  - html body .q-layout .q-btn.app-btn-\* (0,4,1)
  - html body .q-field ... (0,2,1)
  - .q-layout .q-btn ... (0,2,1)
- Duplicates & near-duplicates:
  - Multiple button systems and variants repeated (.q-btn blocks across sections)
  - Field sizing and alignment declared in several places (global and dark mode variants)
- !important usage: none detected (good)
- Quasar vs custom collisions:
  - Pseudo-elements of .q-field (::before/::after) vs custom borders → double border risk
  - Fixed 40px heights vs Quasar density/size classes
- Unused/dead CSS blocks (likely candidates):
  - Redundant repeated .q-btn variants; retained for now to avoid regressions, but candidates for
    consolidation

Decision – Quasar strategy

- Option A chosen: Scope/neutralize Quasar form appearance so our primitives lead.
  - Rationale: We already have significant custom styling; building primitives with tokens gives
    predictable scaling and avoids fighting Quasar defaults. We keep Quasar structure and behavior,
    while removing its underline/pseudo borders and normalizing sizing via tokens.

Architecture changes

- Introduced partials with layers:
  - src/css/\_tokens.scss (control sizes, padding, radii, focus ring)
  - src/css/\_reset.scss (non-opinionated reset)
  - src/css/\_primitives.forms.scss (single source for input/select/textarea/dropdown and .q-field
    mapping)
  - src/css/\_components.scss
  - src/css/\_utilities.scss
- Wrapped app.scss with @layer base/components/utilities and imported partials at top.

Form primitives

- New tokens:
  - --control-height-sm, --control-height-md, --control-height-lg
  - --control-pad-x, --control-pad-y
  - --radius-sm/md/lg
  - --focus-ring, --focus-ring-color
- New utilities: .control-sm/.control-md/.control-lg, .w-full/.inline/.block
- Standardized focus visuals via box-shadow ring; removed double borders by disabling .q-field
  pseudo elements.

De-duplication

- Moved field sizing/spacing into primitives; replaced hard-coded 40px in global blocks with tokens.
- Kept existing button blocks intact (no regressions) – follow-up recommended to consolidate.

Focus strategy

- Single ring via tokens on :focus-visible for inputs/selects/textareas and Quasar fields;
  border-color set to transparent to prevent double edges. Hover styles do not override focused
  state.

Typography normalization

- Introduced `src/css/_typography.scss` with `--font-sans: "Poppins", system-ui, ...` and applied to
  `html, body`. Loaded Google Font once in `index.html`. Removed duplicate SCSS @import.

Token wiring and sizing

- Replaced hard-coded heights/paddings in form contexts with tokens/utilities. Mapped
  `.q-field/.q-input/.q-select` to tokens so visuals align 1:1 with native controls.
  `--control-height-md` now drives sandbox and real pages.

Removed CSS

- `src/components/filters/FilterField.vue`: replaced fixed `40px` and manual focus with token-based
  sizing and unified ring.
- Replaced hard-coded menu item sizes with tokens in `src/css/app.scss` (`.q-menu .q-item` and
  `.q-dialog.q-select__dialog .q-item` now use `var(--control-height-sm)` and token paddings).
- Normalized Quasar selected/native paddings in `src/css/app.scss` to use `var(--control-pad-x/y)`.
- Removed direct `'Roboto Mono'` font-family overrides in:
  - `src/components/platform/widgets/SystemWidget.vue` (now `var(--font-mono)`).
  - `src/components/inventory/QuickAdjustmentDialog.vue` (preview content uses `var(--font-mono)`).
  - `src/pages/NewStyleGuidePage.vue` code blocks use `var(--font-mono)` stack.
- Converted component-local fixed paddings/heights to tokens:
  - `src/components/inventory/CountingEntryWithBatch.vue` (new batch input paddings).

Comments normalization

- Replaced subjective terms like “beautiful”, “premium”, “modern” in comments where encountered with
  neutral, functional descriptions (e.g., “button styles”, “filter panel styles”). Further passes
  can continue as we touch files.

Safety and linting

- No !important in primitives.
- Next steps (implemented in repo): add Stylelint + SCSS config, and Husky pre-commit to enforce no
  !important. Added warn-only guard `scripts/find-hardcoded-controls.mjs` and wired to pre-commit.

Verification

- Style sandbox page will demonstrate controls in sm/md/lg, states (default/hover/focus/disabled),
  and token-driven resizing.

How to adjust sizes

- Change --control-height-md in src/css/\_tokens.scss → all md controls update globally.
- Apply .control-sm/.control-md/.control-lg on fields to switch sizes per-instance.
