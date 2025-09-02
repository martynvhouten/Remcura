### Supabase Usage Map (Read-Only)

This document maps actual Supabase usage found in the code, with tables, columns, joins, RLS assumptions, query quality, and type-safety notes.

### A) Tables Referenced (columns/joins/filters)

Note: Line numbers approximate; see referenced files.

- stock_levels
  - Columns used: `id`, `practice_id`, `location_id`, `product_id`, `current_quantity`, `reserved_quantity`, `available_quantity`, `minimum_stock`/`minimum_quantity`, `last_counted_at`, timestamps
  - Queries (examples):
    - Select with joins (Inventory Levels): `supabase.from('stock_levels').select('* , product:products(name, sku, category, unit), location:practice_locations(name)').eq('practice_id', authStore.clinicId).order('created_at', { ascending: false })` (pages/inventory/InventoryLevelsPage.vue ~522–533)
    - Update quantities (manual adjust): `supabase.from('stock_levels').update({ current_quantity, available_quantity }).eq('id', ...)` (InventoryLevelsPage.vue ~629–636)
    - Movements module upsert after transfer (store): upsert of two rows (stores/inventory/inventory-movements.ts ~275–295)
  - PK/FK: see legacy schema (legacy/database_migrations.sql) → PK `id`, unique `(practice_id, location_id, product_id)`; FKs to `practices`, `locations`, `products`.
  - Indexes referenced: practice/location/product indexes (`idx_stock_levels_practice`, `idx_stock_levels_location`, `idx_stock_levels_product`) and partial low-stock index (legacy file ~382–386).
  - Filters: `.eq('practice_id', ...)` consistently present in Inventory pages/stores.

- stock_movements
  - Columns used: `id`, `practice_id`, `location_id`, `product_id`, `movement_type`, `quantity_change`, `quantity_before`, `quantity_after`, `notes`, `reference_type`, `created_by`, `created_at`
  - Queries:
    - List: `from('stock_movements').select('*').eq('practice_id', practiceId).order('created_at', { descending: false }).limit(limit)` (stores/inventory/inventory-movements.ts ~178–187)
    - Insert (transfers): two inserts for out/in movements (stores/inventory/inventory-movements.ts ~247–272)
  - PK/FK: per legacy schema; FKs to `practices`, `locations`, `products`, `auth.users`.
  - Indexes: practice/location/product/type/reference/created_at indexes (legacy ~389–395).
  - Filters: practice filter present in list; inserts set `practice_id` explicitly.

- counting_sessions
  - Columns used in store: `id`, `practice_id`, status fields (`status`, timestamps), `products_counted`, `discrepancies_found`, etc. (in code: fetch via `select('*')` and update partials)
  - Queries:
    - Select sessions by practice: `from('counting_sessions').select('*').eq('practice_id', practiceId).order('created_at', { ascending: false })` (stores/counting.ts ~385–396)
    - Update status: `from('counting_sessions').update(updates).eq('id', sessionId).select().single()` (stores/counting.ts ~360–366)
    - Insert start: `from('counting_sessions').insert([...]).select().single()` (stores/counting.ts ~82–91)
  - Indexes: practice, location, status, created_by (legacy ~397–401)
  - Filters: practice filter present for list; updates by `id` only.

- counting_entries
  - Columns used: `session_id`, `practice_id` (from logic), `location_id`, `product_id`, `system_quantity`, `counted_quantity`, `variance`, `status`, `counted_by`
  - Queries:
    - Insert entry (count): `from('counting_entries').insert([{ ... }]).select().single()` (stores/counting.ts ~201–223)
    - List by session: `from('counting_entries').select('*, location:practice_locations(name), product:products(name, sku), counted_by_user:auth.users(email)').eq('session_id', sessionId)` (stores/counting.ts ~402–415)
  - Indexes: session, product, variance (legacy ~403–406).

- product_batches
  - Columns used: many fields including `practice_id`, `product_id`, `location_id`, quantities, status, costs
  - Queries:
    - Select with inner joins: `from('product_batches').select('* , product:products!inner(...), location:practice_locations!inner(...), supplier:suppliers(...)').eq('practice_id', filters.practiceId?)` (stores/batch.ts ~115–142)
    - Insert, update, delete (stores/batch.ts ~281–286, ~307–316, ~370–374)
    - RPC: `get_expiring_batches`, `get_fifo_batches` (stores/batch.ts ~190–201, ~223–235)
  - Indexes: multiple on practice/product/location/expiry/status and composite FIFO (legacy ~418–427)

- practice_locations (called `practice_locations` in code; `locations` in legacy file)
  - Columns used: `id`, `practice_id`, `name`, `code`, `location_type`, flags
  - Queries: `from('practice_locations').select('*').eq('practice_id', practiceId).eq('is_active', true)` (stores/clinic.ts ~63–83)

- products
  - Columns used: `id`, `name`, `sku`, `category`, `brand`, `unit`, `image_url`, etc.
  - Queries: many joins; plus RPC `get_products_with_stock` (stores/products/products-core.ts ~240–247)

- order_lists, order_list_items, suppliers, notifications, usage_analytics, supplier_orders (non-inventory areas but referenced via `supabase.from(...)`)

RPCs referenced in code base:
- `update_stock_level` (stores/counting.ts ~332–345)
- `get_expiring_batches` (stores/batch.ts ~190–201)
- `get_fifo_batches` (stores/batch.ts ~223–235)
- `process_batch_stock_movement` (stores/batch.ts ~343–352)
- `get_order_advice` (stores/inventory/inventory-alerts.ts ~62–70)
- `get_products_with_stock` (stores/products/products-core.ts ~240–247)
  - Plus unrelated: `is_platform_owner`, `check_user_permission_v2`, `generate_order_number`, etc.

### B) RLS & practice_id Assumptions

- Practice resolution:
  - `useAuthStore().clinicId` (e.g., Inventory Levels page) and `useAuthStore().userProfile?.clinic_id` (counting/movements).
  - Passed into queries via `.eq('practice_id', practiceId)` or RPC args (`p_practice_id`, variations like `practice_id_param`/`practice_uuid`).

- Presence of `practice_id` filters by table:
  - stock_levels: yes (Inventory Levels, movements module upsert uses direct key tuple; transfer paths read/write specific practice)
  - stock_movements: yes in listing; inserts include explicit `practice_id`
  - counting_sessions: listing by practice; updates by id (no practice filter)
  - counting_entries: listing by `session_id`; inserts derive practice from current session (code sets `practice_id` in entry insert)
  - product_batches: filtered by practice in store when `filters.practiceId` provided; ensure callers pass practice
  - practice_locations: filtered by practice

- Policies visible in repo migrations (legacy/database_migrations.sql)
  - RLS enabled on: `stock_levels`, `stock_movements`, `counting_sessions`, `counting_entries`, `order_lists`, `order_list_items`, `product_batches`, `practice_inventory_settings`, `supplier_products` (lines ~433–443)
  - Policy names (examples):
    - "Practice members can manage stock levels"
    - "Practice members can view/insert stock movements"
    - "Practice members can manage counting sessions/entries"
    - "Practice members can manage product batches"
    - "Practice members can manage order lists/items"

### C) Query Quality

- Server-side vs client-only
  - Inventory Levels: client filtering and `q-table` pagination; server order by `created_at` in page; store core `fetchStockLevels` orders by `updated_at`.
  - Counting/Movements: client filters; server order; no server-side pagination.
  - Batch lists: server filters (status/expiry) and ordering; no pagination limits on base fetch.

- N+1 hotspots
  - Counting flow: `countProduct` reads a single stock level, then inserts entry, then updates session; within a session, this is per action, not classic N+1 loop. No obvious loops over `.select()` in code paths scanned.
  - Movements hydration for product/location names missing in store; current page attempts to read related names not provided by query.

- Missing pagination where tables can grow
  - Inventory Levels: no server-side limit; `q-table` paginates client-side.
  - Movements: limit parameter exists (default 50) — OK for list but may need paging for history.
  - Counting Sessions: full fetch `.order(... )` without limit.
  - Product Batches: no limit in base fetch; may need range/pagination.

### D) Type Safety

- Generated Supabase TS types: not found imported explicitly (no `Database` types import path visible). Most code uses untyped results or local interfaces.
- Notable casts:
  - `as any` instances:
    - `stores/inventory/inventory-movements.ts` uses `(stockLevel as any)?.current_quantity` (~57–58) and in stock reads (~242–245)
    - Inventory Levels mapping uses `(data || []).map((level: any) => ...)` (pages/inventory/InventoryLevelsPage.vue ~536–552)
    - Counting product mapping uses `as` on complex generic in store (~142–154)

### E) Blocking Issues for Inventory Flows

- Atomicity & audit trail
  - Manual adjustments on Inventory Levels page update `stock_levels` directly without writing `stock_movements` (TODO present). This risks missing audit entries and bypassing triggers. Recommended path (documenting current gap): adjustment should go through movement insert or RPC.

- Counting session lifecycle
  - Start dialog currently simulates creation instead of calling `startCountingSession`; blocks real session flow.
  - Counting session detail relies on fetching all sessions then inferring current; without route prop and direct fetch by ID, can misassociate.

- Movements data completeness
  - Movements store returns plain rows; page expects related `product`/`location`; currently undefined labels.

- RLS/Practice consistency
  - Some updates/selects operate by `id` only (e.g., counting_sessions update) — rely on RLS to enforce access; practice filter absent in that call.


