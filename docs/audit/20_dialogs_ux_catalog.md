### Dialogs & UX Catalog (Read-Only)

This catalog lists dialogs and common UI patterns observed in the codebase, with props/events and UX traits. Links point to implementation or invocation sites.

### 1) Dialogs Table

| Dialog component file | Invoked from (files) | Props (key) | Emits | Sticky footer? | ESC/overlay close? | Focus trap? | Mobile fullscreen? | Notable inline styles |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/components/base/BaseDialog.vue` | Used across app (wrapping others) | `modelValue`, `title`, `subtitle`, `icon`, `size`, `variant`, `headerVariant`, `persistent`, `preventMobileFullscreen`, `primaryAction`, `secondaryAction`, `loading` | `update:modelValue`, `close`, `primary-action`, `secondary-action`, `show`, `hide`, `escape` | Footer present via `footer` slot/standard actions; not sticky (scroll in content) | `persistent` true by default; ESC handled via `onEscapeKey` (lines ~404–409) | Uses Quasar `q-dialog` default focus mgmt; manual `autoFocus` first input (lines ~372–379, ~423–430) | Yes when mobile and not prevented (lines ~6, ~360–363) | Size classes; card `max-height: 90vh; overflow-y: auto` (lines ~473–475) |
| `src/components/base/FormDialog.vue` | Inventory Levels adjust dialog (`pages/inventory/InventoryLevelsPage.vue` around 236–285), Suppliers, Orders, etc. | Wraps BaseDialog; `modelValue`, `title`, `subtitle`, `icon`, `size`, `persistent`, `loading`, `loadingText`, button labels, `canSubmit`, `formErrors`, `showErrorSummary`, confirmation props | `update:modelValue`, `submit`, `cancel`, `reset`, `close` | Actions in `#actions` slot (lines ~46–88); footer is sticky visually (card actions area), content scrolls | `persistent` false by default; when `loading`, persistent and close disabled; no ESC handler override | Focus via BaseDialog autoFocus; Quasar form focus | Mobile fullscreen via BaseDialog rules | Error banner uses gradient red; form actions buttons with fixed heights (lines ~315–321) |
| `src/components/base/ConfirmDialog.vue` | Products delete confirm (`pages/ProductsPage.vue` ~294–319) and examples | `modelValue`, `title`, `message`, `type`, `loading`, button labels/colors, text verification options | `update:modelValue`, `confirm`, `cancel` | Actions via `#actions` slot (lines ~52–75); acts like sticky actions area | `persistent` on BaseDialog (lines ~11) | Focus via BaseDialog | Mobile fullscreen via BaseDialog | Gradient backgrounds for warning/negative banners; button sizes fixed (lines ~332–339) |
| `src/components/inventory/CountingSessionDialog.vue` | `pages/inventory/CountingPage.vue` (~248–253) | `modelValue`, `locations` | `update:modelValue`, `session-created` | Actions provided via BaseDialog `#actions` (lines ~105–114) | Inherits BaseDialog defaults | Inherits | Inherits | None notable; standard BaseDialog usage |
| `src/components/inventory/StockTransferDialog.vue` | Invoked where stock transfers are used (standalone dialog component) | `modelValue`, `selectedProduct`, `currentLocation` | `update:modelValue`, `transfer-completed`, `product-selected` | Actions in `q-card-actions` at bottom (lines ~313–327); behaves sticky | `persistent` true (line ~5) | Quasar default | `maximized-on-mobile` (line ~6) | Inline card style `min-width: 600px; max-width: 800px` (line ~8) |
| `src/components/inventory/QuickAdjustmentDialog.vue` | Standalone quick adjust dialog | `modelValue`, `selectedProduct?`, `selectedLocation?` | `update:modelValue`, `stock-updated`, `product-selected` | Actions in `q-card-actions` at bottom (lines ~490–521) | `persistent` true (line ~5) | Quasar default | `maximized-on-mobile` (line ~6) | Inline `q-img` dimensions and button mins in scoped CSS |

Form field patterns and inconsistencies
- Labels: consistent use of Quasar `label` or explicit `<label>` above fields (e.g., `StockTransferDialog.vue` lines ~105–147).
- Help/error: error banners in `FormDialog` (lines ~239–281). Inline errors for inputs (e.g., `QuickAdjustmentDialog.vue` lines ~322–335; reason errors ~380–382).
- Inconsistencies: 
  - Mixed button sizing: BaseDialog uses custom `.app-btn` heights (44px) vs dialogs using `q-btn` with 48–56px heights.
  - Some dialogs use inline styles for min/max widths; others rely on BaseDialog sizes.
  - Confirm close behavior: BaseDialog uses Quasar confirm; FormDialog uses `confirm()` (TODO) (lines ~205–211) — inconsistent UX.

### 2) Reusable UI Patterns Inventory

- Buttons
  - Primary/secondary in BaseDialog footer (`.app-btn-*`), gradient backgrounds; elsewhere `q-btn` unelevated with icon/text.
  - Variants differ across pages: fixed min-height 44–56px; some icon-only with tooltips.

- Chips
  - Status chips in tables and dialogs (`q-chip` colors: positive/warning/negative); used in Inventory Levels, Counting, QuickAdjustment.

- Filters/Drawers
  - `FilterPanel` used on Inventory Levels and Movements with consistent slots; collapsible.

- Tables
  - `q-table` across pages; client-side filtering/sorting; column fixed widths sometimes present (Counting pages) causing potential overflow.

- KPI Cards
  - Inventory Levels top `BaseCard` KPIs; consistent typography using tokens.

### 3) Concrete Inconsistencies

- Spacing/typography
  - Different action button sizes between BaseDialog (44px) and `FormDialog`/page dialogs (48–56px). See `FormDialog.vue` ~315–321; `QuickAdjustmentDialog.vue` `.save-button` and `.scan-button` (lines ~1271–1287, ~1304–1320).

- Icon sizes
  - BaseDialog header icon 24px (line ~308) but various dialogs use 28–40px (`QuickAdjustmentDialog.vue` lines ~12–16, ~156–157).

- Aria-label gaps
  - Icon-only action buttons sometimes rely on `title` or tooltip; ensure `aria-label` set (e.g., `QuickAdjustmentDialog.vue` edit button line ~216 uses `:title`, not `aria-label`).

- Contrast in dark mode
  - Custom gradient banners/buttons may not fully align with dark token contrasts; `FormDialog` error banner uses raw reds (lines ~246–277).

- Inputs sizing
  - Inline width constraints exist in some dialogs/components (e.g., `StockTransferDialog.vue` card min/max widths) which may cause cramped layouts on small viewports.

### 4) Minimal Standardization Checklist

- Adopt BaseDialog footer sizing for consistency
  - Standardize action button min-height to 44px or tokenized `--control-height-md` across all dialogs.

- Confirm-close behavior
  - Use the same confirmation mechanism (prefer BaseDialog’s Quasar dialog) instead of `window.confirm()` in `FormDialog` (lines ~205–211).

- Accessibility
  - Ensure icon-only `q-btn` have `aria-label` (not only `title`) where applicable.

- Mobile sizing
  - Prefer BaseDialog `size` props over inline `min-width/max-width` in dialog cards; rely on responsive classes to avoid cramped layouts.

- Error/help patterns
  - Use consistent error summary banners and inline field error messages; avoid raw hex gradients; map to design tokens for contrast in dark mode.


