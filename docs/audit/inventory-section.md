### Inventory Section Audit & Fix Plan

Scope: Vue 3 + Quasar app (Remcura). Audited existing Inventory pages and related stores/components. RLS by `practice_id` assumed active.

### Routes and Pages Covered
- `src/router/routes.ts` → inventory routes: `inventory-levels`, `inventory-counting`, `counting-session`, `mobile-counting-test`, `inventory-movements`, `inventory-locations`, `batch-management`.

### Page-by-Page Analysis

#### Inventory Levels (Voorraadniveaus)
- **File**: `src/pages/inventory/InventoryLevelsPage.vue`
- **Route name**: `inventory-levels`
- **Main components**: `PageLayout`, `PageTitle`, `BaseCard`, `FilterPanel`, `q-table`
- **Key dialogs**: `FormDialog` (Adjust Stock)
- **Stores/composables**: `useAuthStore`, `useClinicStore`, `useInventoryStore`, `useI18n`, `useQuasar`, `date`
- **Supabase usage**:
  - Query: `stock_levels` with joins
    - Code: `supabase.from('stock_levels').select('* , product:products(name, sku, category, unit), location:practice_locations(name)').eq('practice_id', authStore.clinicId).order('created_at', { ascending: false })`
    - Ref: `src/pages/inventory/InventoryLevelsPage.vue` (around loadStockLevels)
  - Mutation: `stock_levels.update({ current_quantity, available_quantity })` on row `id`
    - Ref: `src/pages/inventory/InventoryLevelsPage.vue` (performAdjustment)
- **TODO/FIXME and error paths**:
  - TODO: Record stock movement after adjustment → `src/pages/inventory/InventoryLevelsPage.vue` line ~639
  - Errors/negative notifications on load/adjust failure (console.error + `$q.notify({ type: 'negative' })`)
- **Hard-coded layout-breaking styles**: none obvious in this file; SCSS uses tokens.
- **Issues**:
  - Selects `*` from `stock_levels`; may fetch unused columns.
  - Local data fetching duplicates `useInventoryStore().fetchStockLevels`; consider centralizing.
  - Adjustment updates `available_quantity` = `current_quantity` without considering reservations.
  - Missing movement/audit record (TODO).
  - History/count actions show info toasts only.
- **Quick wins (≤1h)**:
  - Replace `select('*')` with explicit columns actually used.
  - Create movement record on adjust (insert into `stock_movements`) or call RPC `update_stock_level`.
  - Remove/avoid updating `available_quantity` if not authoritative.
  - Surface `inventoryStore.loading` and reuse store fetch method.
- **Medium (≤4h)**:
  - Extract a small stock adjustment service that both records movement and updates level transactionally (via RPC).
  - Add simple history dialog showing last N `stock_movements` for product/location.
- **Larger (>4h)**:
  - Migrate adjustments to a single RPC (`update_stock_level`) that handles movement + level with RLS.
- **Definition of Done**:
  - Uses centralized fetch; adjustment creates movement; error, loading, empty states shown; no duplicate queries; client shows history dialog.

#### Locations (Locaties)
- **File**: `src/pages/inventory/LocationsPage.vue`
- **Route name**: `inventory-locations`
- **Main components**: `PageLayout`, `PageTitle`, `FilterPanel`, `q-table`
- **Key dialogs**: none (actions show info only)
- **Stores/composables**: `useTableSorting`, `useAuthStore`, `useI18n`, `useQuasar`
- **Supabase usage**: none in-page; should use `useClinicStore().fetchLocations()` which queries `practice_locations` (see store)
  - `src/stores/clinic.ts` → `supabase.from('practice_locations').select('*').eq('practice_id', practiceId).eq('is_active', true)`
- **TODO/FIXME and error paths**: none specific to this page.
- **Hard-coded styles**: `.coming-soon-container { min-height: 300px; }` acceptable.
- **Issues**:
  - Placeholder/sample data; not wired to Supabase.
  - No create/edit/delete flows.
- **Quick wins (≤1h)**:
  - Bind table to `clinicStore.practiceLocations`; show loading/empty states.
  - Remove "coming soon" banner once data wiring done.
- **Medium (≤4h)**:
  - Add simple add/edit dialog writing to `practice_locations` with RLS.
- **Larger (>4h)**:
  - Import/export, type filters, and soft-delete with audit.
- **Definition of Done**:
  - Lists live data from `practice_locations`; supports basic CRUD; filters work; loading/empty/error states implemented.

#### Inventory Counting (Voorraadtelling)
- **File**: `src/pages/inventory/CountingPage.vue`
- **Route name**: `inventory-counting`
- **Main components**: `PageLayout`, `PageTitle`, `BaseCard`, `q-table`, `CountingSessionDialog`
- **Key dialogs**: `CountingSessionDialog` (start session)
- **Stores/composables**: `useCountingStore`, `useClinicStore`, `useTableSorting`, `useAuthStore`, `useI18n`, `useQuasar`
- **Supabase usage (via stores)**:
  - `countingStore.fetchSessions(practiceId)` → `counting_sessions` select by `practice_id`
  - Completing a session calls `countingStore.updateSession` → update `counting_sessions`
  - Page also calls `clinicStore.fetchLocations` → `practice_locations`
- **Dialog implementation gap**:
  - `CountingSessionDialog` currently simulates creation; should call `countingStore.startCountingSession()`
    - Ref: `src/components/inventory/CountingSessionDialog.vue` lines ~230–260
- **TODO/FIXME and error paths**:
  - Negative notifications on refresh/complete errors; console.error present.
- **Hard-coded styles**:
  - Column styles include fixed widths: 200px/120px → may overflow on small screens.
    - Ref: `src/pages/inventory/CountingPage.vue` lines ~349, ~359
- **Issues**:
  - Start session not persisted; users cannot actually start tracked sessions.
  - Client-side filtering and sorting only; can be heavy for many sessions.
- **Quick wins (≤1h)**:
  - Wire `CountingSessionDialog` to `countingStore.startCountingSession`.
  - Remove fixed `style: 'width: ...px'` from columns or make responsive via CSS classes.
- **Medium (≤4h)**:
  - Add server-side pagination/filter (use Supabase range and filters).
- **Larger (>4h)**:
  - Real-time subscription to counting sessions; approval workflow screens.
- **Definition of Done**:
  - Sessions can be created; list loads from DB; no fixed widths that break layout; error/loading states present.

#### Counting Session Detail
- **File**: `src/pages/inventory/CountingSessionPage.vue`
- **Route name**: `counting-session` (`/inventory/counting/:sessionId`)
- **Main components**: `PageLayout`, `PageTitle`, `MobileCountingInterface`, `q-table`
- **Stores/composables**: `useCountingStore`, `useAuthStore`, `useI18n`, `useQuasar`, `useRoute`
- **Supabase usage (via stores)**:
  - `countingStore.fetchSessions(practiceId)` → `counting_sessions`
  - `countingStore.fetchCountingEntries(sessionId)` → `counting_entries` with `location`, `product` joins
  - `countingStore.updateSession(...)` for complete/approve
- **Critical bug**:
  - Route does not pass `props` to component; component expects `props.sessionId` but route is not `props: true` and code doesn't read from `route.params.sessionId` to set current session. Result: wrong/missing session context.
    - Route ref: `src/router/routes.ts` lines 108–121 (no `props: true`)
    - Component ref: `src/pages/inventory/CountingSessionPage.vue` lines ~262–271 (expects `props.sessionId`)
- **TODO/FIXME and error paths**: Negative notifications + console.error for load/approve/complete.
- **Hard-coded styles**: Result column width 200px; progress bar width 100px.
  - Ref: `src/pages/inventory/CountingSessionPage.vue` lines ~342, ~569–571
- **Issues**:
  - Loads all sessions then tries to infer current; should fetch specific session by ID.
- **Quick wins (≤1h)**:
  - Enable `props: true` on the route and/or read `route.params.sessionId`; set `currentSession` accordingly.
  - Remove fixed column widths.
- **Medium (≤4h)**:
  - Add store method `fetchSessionById(sessionId)` and use that.
- **Larger (>4h)**:
  - Real-time updates for entries; batch-aware counting UI.
- **Definition of Done**:
  - Correct session loaded by ID; entries load; complete/approve work; responsive table without fixed widths.

#### Stock Transactions (Voorraadmutaties)
- **File**: `src/pages/inventory/MovementsPage.vue`
- **Route name**: `inventory-movements`
- **Main components**: `PageLayout`, `PageTitle`, `FilterPanel`, `BaseDialog`, `q-table`
- **Stores/composables**: `useInventoryStore` (modular), `useClinicStore`, `useI18n`, `useQuasar`
- **Supabase usage (via inventory store)**:
  - `inventoryStore.fetchStockMovements(practiceId, limit)` → `supabase.from('stock_movements').select('*').eq('practice_id', practiceId).order('created_at', { descending: true })`
    - Ref: `src/stores/inventory/inventory-movements.ts` lines ~178–187
- **TODO/FIXME and error paths**: Negative notifications on refresh; console.error on failure.
- **Hard-coded styles**:
  - `.movements-table-card { overflow: hidden; }` (may clip content; check actual use)
    - Ref: `src/pages/inventory/MovementsPage.vue` lines ~572–575
- **Issues**:
  - Store returns movements without joining product/location names; page accesses `row.product?.name` and `row.location?.name` which will be undefined.
  - Client-side filters on large result sets; needs server-side filters and pagination.
  - Export action is placeholder.
- **Quick wins (≤1h)**:
  - Update store query to join names needed for UI (or hydrate after fetch).
  - Remove/avoid overflow hidden if it causes clipped menus/tooltips.
- **Medium (≤4h)**:
  - Add server-side filtering and pagination (range queries + filters).
- **Larger (>4h)**:
  - Add CSV export using a server-side function or client-side stream for large sets; add indexes on `(practice_id, created_at)`.
- **Definition of Done**:
  - Movement list shows product and location labels correctly; filters are server-side; export works; no layout clipping.

#### Batch Management (Batchbeheer)
- **File**: `src/pages/BatchManagementPage.vue`
- **Route name**: `batch-management`
- **Main components**: `PageLayout`, `PageTitle`, `BatchOverview`, `ExpiringBatchesList`, `FifoBatchManager`, `BatchReports`, `BarcodeScanner`, `BaseDialog`
- **Stores/composables**: `useBatchStore`, `useInventoryStore`, `useAuthStore`, `useClinicStore`, `useFormatting`, `useI18n`, `useQuasar`
- **Supabase usage (via batch store)**:
  - `product_batches` select with inner joins to `products`, `practice_locations`, `suppliers`
  - RPC: `get_expiring_batches`, `get_fifo_batches`, `process_batch_stock_movement`
  - Mutations: insert/update/delete `product_batches`
- **TODO/FIXME and error paths**: Negative notifications on refresh errors; console.error in components that create sample data.
- **Hard-coded styles**: various `height`/`min-width` for cards and buttons; generally responsive via media queries.
- **Issues**:
  - None critical in the page itself; ensure store queries are filtered by `practice_id` (they are when provided).
- **Quick wins (≤1h)**:
  - Confirm all store calls receive `practiceId`; handle absence gracefully.
- **Medium (≤4h)**:
  - Add batch history drawer (store already queries `batch_movements`).
- **Larger (>4h)**:
  - Advanced FIFO suggestions integrated with orders.
- **Definition of Done**:
  - Batches, expiring, FIFO load quickly; actions notify success/failure; history accessible.

### Supabase Tables and RPCs Mapped
- **Tables** used across inventory section:
  - `stock_levels` (levels per `product_id`/`location_id`, columns used: `id`, `practice_id`, `product_id`, `location_id`, `current_quantity`, `minimum_stock`, `available_quantity`, `last_counted_at`, timestamps)
  - `products` (joined for `name`, `sku`, `category`, `unit`, `brand`, `image_url`)
  - `practice_locations` (joined for `name`, `code`, `location_type`)
  - `stock_movements` (transactions; columns used: `movement_type`, `quantity_change`, `quantity_before`, `quantity_after`, `notes`, `created_at`, `created_by`)
  - `product_batches` (+ joins to `products`, `practice_locations`, `suppliers`)
  - `counting_sessions` (status, counters, timestamps, settings)
  - `counting_entries` (system vs counted quantities, status, joins to `products`/`practice_locations`)
  - `batch_movements` (for batch history)
- **RPCs** referenced:
  - `update_stock_level` (apply count adjustments)
  - `get_expiring_batches`, `get_fifo_batches`, `process_batch_stock_movement`
  - `get_order_advice` (order suggestions)

### Cross-Cutting Findings
- **Missing loading/empty/error states**: generally present; ensure Locations (once wired) has these.
- **Console errors/negative notifications**: present on all error paths; OK, but consider centralized error handling for consistent UX.
- **Hard-coded widths/heights**: found in Counting list/detail column styles and some progress bars; replace with responsive classes to avoid table overflow on small screens.
- **Data consistency**: prefer RPCs that atomically record movements and update levels to preserve audit trail under RLS.

### Actionable Task Checklist
- [ ] Wire start session dialog to store
  - File: [src/components/inventory/CountingSessionDialog.vue](../../src/components/inventory/CountingSessionDialog.vue) (around lines 230–260: replace simulated ID with `countingStore.startCountingSession(request)` and emit real ID)
- [ ] Fix counting session routing/props
  - File: [src/router/routes.ts](../../src/router/routes.ts) (around lines 108–121: add `props: true` to `counting/:sessionId` route)
  - File: [src/pages/inventory/CountingSessionPage.vue](../../src/pages/inventory/CountingSessionPage.vue) (around lines 262–271: read `route.params.sessionId` or use props and set `currentSession`)
- [ ] Remove fixed column widths in counting pages
  - File: [src/pages/inventory/CountingPage.vue](../../src/pages/inventory/CountingPage.vue) (around lines 349, 359: drop `style: 'width: ...px'` on columns)
  - File: [src/pages/inventory/CountingSessionPage.vue](../../src/pages/inventory/CountingSessionPage.vue) (around line 342: drop `style: 'width: 200px'`; around 569–571: avoid fixed 100px progress width)
- [ ] Implement stock movement on manual adjustment
  - File: [src/pages/inventory/InventoryLevelsPage.vue](../../src/pages/inventory/InventoryLevelsPage.vue) (around line 639: replace TODO by inserting into `stock_movements` or calling RPC `update_stock_level`)
- [ ] Tighten `stock_levels` select and centralize fetch
  - File: [src/pages/inventory/InventoryLevelsPage.vue](../../src/pages/inventory/InventoryLevelsPage.vue) (around lines 522–533: request only used columns; consider using `useInventoryStore().fetchStockLevels`)
- [ ] Wire Locations page to live data
  - File: [src/pages/inventory/LocationsPage.vue](../../src/pages/inventory/LocationsPage.vue) (replace sample data with `clinicStore.practiceLocations`; show loading/empty states)
- [ ] Hydrate movement rows with product/location labels
  - File: [src/stores/inventory/inventory-movements.ts](../../src/stores/inventory/inventory-movements.ts) (around lines 181–208: join/hydrate product/location so UI fields aren’t undefined)
- [ ] Add server-side pagination/filters for heavy lists
  - Files: [src/pages/inventory/CountingPage.vue](../../src/pages/inventory/CountingPage.vue), [src/pages/inventory/MovementsPage.vue](../../src/pages/inventory/MovementsPage.vue) (use Supabase range + filters)
- [ ] Review overflow clipping
  - File: [src/pages/inventory/MovementsPage.vue](../../src/pages/inventory/MovementsPage.vue) (around lines 572–575: `overflow: hidden`; ensure it doesn’t clip menus/tooltips)

### Quick Wins Summary (≤1h)
- Wire counting session creation to store; fix session route/prop; remove fixed column widths; implement movement recording on adjust; limit selected columns in queries; bind Locations to store data.

### Medium Tasks (≤4h)
- Server-side pagination/filters for sessions and movements; simple history dialogs; extract stock adjust service; store method `fetchSessionById`.

### Larger Tasks (>4h)
- Migrate adjustments to RPC; real-time updates for counting entries; batch history and advanced FIFO integration; Locations CRUD.


