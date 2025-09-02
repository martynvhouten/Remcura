### Inventory Levels QA Guide

Scope: `src/pages/inventory/InventoryLevelsPage.vue` with atomic stock adjustment via RPC `update_stock_level` or store fallback.

Preconditions
- User is authenticated and has a valid `practice_id`.
- Stock levels exist for at least one product/location.

Test Steps
1) Load page and skeletons
   - Navigate to `/inventory/levels`.
   - Ensure KPI cards show skeletons while loading, then render values.
   - Verify last sync time shows a recent timestamp (pulled from latest `stock_movements.created_at`).

2) Adjust +1
   - Click edit action on a row; set Adjustment Type = Add; Quantity = 1; Reason = any.
   - Submit.
   - Expect success toast; dialog closes; row current quantity increases by 1 after refresh.
   - In DB, verify a new `stock_movements` row with:
     - `movement_type = 'adjustment'`, correct `practice_id`, `product_id`, `location_id`.
     - `quantity_before` old value; `quantity_after` new value; `quantity_change = +1`.

3) Adjust -1
   - Repeat with Adjustment Type = Remove; Quantity = 1.
   - Verify quantity decreases by 1; movement written with `quantity_change = -1` and correct before/after.

4) Set absolute quantity
   - Adjustment Type = Set; Quantity = X.
   - Verify delta computed correctly and movement reflects before/after accurately.

5) Network error path
   - Temporarily break network (or mock RPC rejection).
   - Trigger adjustment; expect an error banner at top with Retry.
   - Click Retry; if network restored, operation completes; otherwise banner remains.
   - Table remains usable; filters still work.

6) Mobile table behavior
   - Resize viewport to mobile width.
   - Ensure table columns wrap, no fixed column widths cause horizontal overflow.

7) Low stock chips
   - After adjustments, verify low/out-of-stock chips still render with correct colors.

Acceptance Criteria
- Every adjustment writes a corresponding `stock_movements` row (RPC path preferred; fallback path via store still writes one).
- Loading/empty/error states are consistent; no placeholder strings like `LoadError` are shown.
- Practice filtering enforced in queries and movement RPC/fallback.
- Table is mobile-friendly without horizontal scroll due to fixed widths.

