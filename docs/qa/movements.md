### Movements Page QA Guide

Scope: `src/pages/inventory/MovementsPage.vue` with server-side filters/pagination and CSV export.

Preconditions
- User authenticated with a valid practice selected.
- There are movement records in `stock_movements` for the practice.

Test Steps
1) Initial load
- Navigate to Movements page.
- Expect loading indicator, then rows render.
- Product and location names must be populated in the table.

2) Filtering (server-side)
- Date range: set a recent range; rows should reflect dates in range.
- Location: pick a location; only movements for that location remain.
- Movement type: choose adjustment/transfer/etc.; table updates.
- Product search: enter a SKU or name substring; matching results appear.

3) Pagination (server-side)
- Set rowsPerPage to 25; navigate to page 2; results should change quickly.
- Sorting: toggle created_at sort; verify order updates.

4) CSV export
- Apply filters; click Export.
- Open the CSV; confirm columns: type, sku, product_name, delta, location, created_at, note.
- Values correspond to visible filters.

5) UI states
- While loading, spinner shows.
- Empty filter combo shows no-data message.
- Simulate network error: error banner appears with Retry; on Retry, data loads.

6) Mobile behavior
- Narrow viewport; table remains usable; tooltips/menus are not clipped.

Definition of Done
- Labels are visible; filters and pagination are server-driven and responsive.
- Export reflects current filters.

