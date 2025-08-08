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

Safety and linting

- No !important in primitives.
- Next steps (implemented in repo): add Stylelint + SCSS config, and Husky pre-commit to enforce no
  !important.

Verification

- Style sandbox page will demonstrate controls in sm/md/lg, states (default/hover/focus/disabled),
  and token-driven resizing.

How to adjust sizes

- Change --control-height-md in src/css/\_tokens.scss → all md controls update globally.
- Apply .control-sm/.control-md/.control-lg on fields to switch sizes per-instance.
