### Remcura System Overview (Read-Only Audit)

This document maps routes, pages, data usage, UI states, dialogs, styling tokens/smells, and actionable issues across the app. Read-only discovery; no code changes proposed here.

### 1) Routes & Pages Map

All routes are defined in `src/router/routes.ts`.

- Dashboard & Core
  - `/dashboard` → `pages/DashboardPage.vue`
  - `/products` → `pages/ProductsPage.vue`
  - `/orders` → `pages/OrdersPage.vue`
  - `/order-lists` → `pages/OrderListsPage.vue`
  - `/order-lists/:id` → `pages/OrderListDetailPage.vue`
  - `/suppliers` → `pages/SuppliersPage.vue`
  - `/notifications` → `pages/NotificationsPage.vue`
  - `/settings` → `pages/SettingsPage.vue`
  - `/style-guide` → `pages/StyleGuidePage.vue`
  - `/style-sandbox` → `pages/StyleSandbox.vue`
  - `/:catchAll` → `pages/ErrorNotFound.vue`

- Inventory
  - `/inventory/levels` → `pages/inventory/InventoryLevelsPage.vue`
  - `/inventory/counting` → `pages/inventory/CountingPage.vue`
  - `/inventory/counting/:sessionId` → `pages/inventory/CountingSessionPage.vue`
  - `/inventory/mobile-counting-test` → `pages/inventory/MobileCountingTestPage.vue`
  - `/inventory/movements` → `pages/inventory/MovementsPage.vue`
  - `/inventory/locations` → `pages/inventory/LocationsPage.vue`
  - `/batch-management` → `pages/BatchManagementPage.vue`

- Platform
  - `/platform` → `pages/platform/PlatformDashboard.vue`
  - `/platform/practices` → `pages/platform/PracticesPage.vue`
  - `/platform/practices/create` → `pages/platform/CreatePracticePage.vue`
  - `/platform/logs` → `pages/platform/SystemLogsPage.vue`
  - `/platform/database` → `pages/platform/DatabaseAdminPage.vue`
  - `/platform/api-docs` → `pages/platform/ApiDocsPage.vue`
  - `/platform/monitoring` → `pages/platform/MonitoringPage.vue`
  - `/platform/backup` → `pages/platform/BackupPage.vue`

- Auth
  - `/auth/login` → `pages/auth/LoginPage.vue`
  - `/auth/magic-join` → `pages/auth/MagicJoinPage.vue`

Key child components/dialogs used per major page:
- Inventory Levels: `BaseCard`, `FilterPanel`, `q-table`, `FormDialog` (adjust stock)
- Counting: `BaseCard`, `CountingSessionDialog`, `q-table`
- Counting Session: `MobileCountingInterface`, `q-table`
- Movements: `FilterPanel`, `BaseDialog` (details), `q-table`
- Locations: `FilterPanel`, `q-table`
- Batch Management: `BatchOverview`, `ExpiringBatchesList`, `FifoBatchManager`, `BatchReports`, `BarcodeScanner`, `BaseDialog`

### 2) Data & State per Page

Notes: practice scoping derived from `useAuthStore()` (`clinicId` or `userProfile.clinic_id`). RLS assumed via `.eq('practice_id', ...)` or RPC parameters.

- Inventory Levels (`pages/inventory/InventoryLevelsPage.vue`)
  - Supabase
    - Select: `stock_levels` with joins to `products`, `practice_locations` (around 522–533)
    - Update: `stock_levels.update({ current_quantity, available_quantity }).eq('id', ...)` (around 629–636)
  - Filters/sorts: client-side via `FilterPanel` and computed filters; `q-table` sort on columns; pagination rowsPerPage only.
  - Practice ID: `authStore.clinicId`
  - Stores/composables: `useInventoryStore` (modular), `useClinicStore`, `useI18n`, `useQuasar`

- Counting (`pages/inventory/CountingPage.vue`)
  - Supabase via store `useCountingStore`
    - Select: `counting_sessions.eq('practice_id', ...)` (store: `src/stores/counting.ts` ~385–396)
    - Update: session status via `updateSession` (store ~355–379)
  - Filters/sorts: status filter, client-side sorting (`useTableSorting`), `q-table` pagination
  - Practice ID: `authStore.userProfile?.clinic_id`
  - Stores/composables: `useCountingStore`, `useClinicStore`, `useTableSorting`

- Counting Session (`pages/inventory/CountingSessionPage.vue`)
  - Supabase via store `useCountingStore`
    - Fetch sessions by practice (store ~385–396)
    - Fetch entries: `counting_entries` with joins (store ~402–420)
    - Update: `counting_sessions` for complete/approve (store ~355–379)
  - Filters/sorts: `q-table` pagination for results
  - Practice ID: `authStore.userProfile?.clinic_id`
  - Stores/composables: `useCountingStore`

- Movements (`pages/inventory/MovementsPage.vue`)
  - Supabase via inventory store movements module
    - Select: `stock_movements.eq('practice_id', ...)` ordered by `created_at` (store `inventory-movements.ts` ~178–187)
    - Insert: movements created elsewhere (e.g., updates/transfer)
  - Filters/sorts: `FilterPanel` (movement type, location, date range, product search); client-side filter; `q-table` pagination
  - Practice ID: `authStore.userProfile?.clinic_id`
  - Stores/composables: `useInventoryStore`, `useClinicStore`

- Locations (`pages/inventory/LocationsPage.vue`)
  - Page uses sample data; real data in `useClinicStore().fetchLocations()`
    - Select: `practice_locations.eq('practice_id', ...).eq('is_active', true)` (store `src/stores/clinic.ts` ~63–83)
  - Filters/sorts: client-side via `FilterPanel` + `useTableSorting`
  - Practice ID: `authStore`
  - Stores/composables: `useClinicStore`, `useTableSorting`

- Batch Management (`pages/BatchManagementPage.vue`)
  - Supabase via batch store `src/stores/batch.ts`
    - Select: `product_batches` with inner joins; filtered by `practice_id` when provided (store ~115–142)
    - RPC: `get_expiring_batches` (store ~190–201), `get_fifo_batches` (store ~223–235), `process_batch_stock_movement` (store ~343–352)
    - Insert/Update/Delete: `product_batches` (store ~281–286, ~307–316, ~370–374)
  - Filters/sorts: done in store or UI components
  - Practice ID: `authStore.clinicId`
  - Stores/composables: `useBatchStore`, `useInventoryStore`

### 3) UI/UX States & Issues

- Inventory Levels
  - Loading/Empty/Error: present (`q-inner-loading`, `no-data`, `$q.notify negative`) around 126–135, 555–563
  - Table behavior: standard `q-table`; no sticky headers; chips for status; likely fine on mobile
  - i18n: uses `inventory.*` keys; no explicit missing markers detected
  - Visual bugs: none obvious

- Counting
  - Loading/Error: notifications on refresh failure; spinner states tied to store
  - Table: fixed widths on columns (200px/120px) may overflow on small screens (around 349, 359)
  - i18n: `counting.*` keys used; no missing markers observed
  - Visual: icon-only action buttons; ensure tooltips present (yes)

- Counting Session
  - Loading/Empty/Error: explicit loading; not-found card; errors surfaced via notify
  - Table: results columns include fixed width 200px; progress mini bar width 100px (around 342, 569–571)
  - i18n: uses `counting.*`; no missing markers observed
  - Visual: generally consistent

- Movements
  - Loading/Error: loading container; negative notify on error
  - Table: no sticky header; `.movements-table-card { overflow: hidden }` could clip overlays (around 572–575)
  - i18n: `inventory.*` keys
  - Visual: quantity colorization OK

- Locations
  - Loading/Error: sample-only; banner; will need real states when wired
  - Table: basic; fine

- Batch Management
  - Loading/Error: notifications on refresh; dialogs for add/detail/scanner
  - Table/cards: responsive; some fixed heights on cards

### 4) Dialogs Inventory

Common shell: `src/components/base/BaseDialog.vue` used widely.

- Inventory-related
  - `src/pages/inventory/InventoryLevelsPage.vue` → `FormDialog` (adjust stock)
  - `src/components/inventory/CountingSessionDialog.vue` → start session dialog
  - `src/pages/inventory/MovementsPage.vue` → `BaseDialog` (movement details)
  - `src/pages/BatchManagementPage.vue` → `BaseDialog` (Add Batch, Batch Detail, Scanner)

- Other notable dialogs
  - `src/components/base/FormDialog.vue` (generic form wrapper)
  - `src/components/base/ConfirmDialog.vue` (confirmation wrapper)
  - Products: `ProductFormDialog.vue`, `OrderListDialog.vue`, `AdvancedSearchDialog.vue`, `ProductDetailsDialog.vue`

Props/slots/events (samples)
- BaseDialog: model/value, title, icon, size, actions slot; confirm-close behavior in BaseDialog logic
- FormDialog: v-model, submit/cancel events, title, loading
- CountingSessionDialog: `v-model`, `locations` prop, emits `session-created`

Inconsistencies observed
- Header/footer spacing appears consistent; ESC/overlay handled by BaseDialog
- Some dialogs set explicit sizes (e.g., `size="lg"`, inline min-widths in other pages)
- No obvious `!important` in dialog styles; some inline sizes exist (e.g., scanner dialog min/max widths)

### 5) Styling & Tokens Snapshot

- Tokens
  - Control tokens in `src/css/_tokens.scss` (heights, radii, focus ring, typography)
  - Additional primitives in `src/css/_primitives.forms.scss`; global styles in `src/css/app.scss`

- Smell counts (approximate)

| Smell | Matches | Files (examples) |
| --- | ---: | --- |
| Hard-coded hex colors | 457 | `layouts/MainLayout.vue`, `css/app.scss`, various components |
| !important | 8 | `components/charts/ChartCanvas.vue`, `css/app.scss`, `_primitives.forms.scss` |
| Fixed width/height in .vue | 457 | Many pages/components including Inventory, Auth, Products |
| Global z-index values | 23 | `css/app.scss`, `layouts/MainLayout.vue`, tables/dialogs |

### 6) Errors & TODOs

- Negative notifications and console errors (samples)
  - `pages/inventory/InventoryLevelsPage.vue` ~555–563, ~648–654: console.error + `$q.notify({ type: 'negative' })` on load/adjust
  - `pages/inventory/MovementsPage.vue` ~415–421: same on refresh
  - Many pages across app follow same pattern (see grep summary)

- TODO/FIXME and throws (samples)
  - `pages/inventory/InventoryLevelsPage.vue` ~639: TODO record stock movement after adjustment
  - `stores/counting.ts` ~114, ~183, ~278, ~319, ~429: `throw new Error($t(...))` for session/active checks
  - `pages/ProductsPage.vue` ~360: TODO connect permission system
  - i18n `nl/index.ts` contains placeholder values like `'LoadError'` for multiple keys (e.g., `inventory.loadError`) indicating untranslated/default strings

### 7) Quick Wins / Medium / Larger

- Inventory Levels
  - Quick: Implement movement recording or call `update_stock_level`; tighten select columns
  - Medium: Centralize fetch via inventory store
  - Larger: Use RPC for atomic adjust + movement

- Counting
  - Quick: Wire `CountingSessionDialog` to `startCountingSession`; remove fixed column widths
  - Medium: Server-side pagination/filtering on sessions
  - Larger: Real-time progress; approval workflow polish

- Counting Session
  - Quick: Ensure route provides `sessionId` via props or read from route; remove fixed widths
  - Medium: `fetchSessionById(sessionId)` in store; fetch entries by session only
  - Larger: Real-time entry updates and reconciliation

- Movements
  - Quick: Join/hydrate product/location labels in store; review `overflow: hidden`
  - Medium: Server-side filters, pagination
  - Larger: Export support; indexing

- Locations
  - Quick: Bind to `clinicStore.practiceLocations` with proper states
  - Medium: CRUD dialogs with RLS
  - Larger: Import/export, audit trails

- Batch Management
  - Quick: Ensure `practiceId` always present; error messaging consistency
  - Medium: Batch history viewer
  - Larger: Deep FIFO integration with orders

### 8) Gaps Blocking MVP

- Counting session start dialog currently simulates creation instead of persisting via store; blocks real counting flow.
- Counting session detail route does not pass props; component expects `sessionId` prop. Risk: wrong session context.
- Movements page expects product/location labels, but store fetch returns plain rows without joins; UI shows blanks.
- Widespread fixed column widths on counting pages can harm mobile usability.
- i18n placeholders like `'LoadError'` indicate missing translations in `nl` (and `es`) bundles; user-facing copy quality risk.


