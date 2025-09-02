Batch Management QA Checklist

Scenarios
- Overview loads with practice scoping
  - Precondition: user has `clinicId` set.
  - Expect: base list queries include `eq('practice_id', clinicId)`; no cross-practice data.
  - KPI skeletons render while loading; values appear after load.

- Expiring soon tab and KPI
  - When RPC `get_expiring_batches` exists: list populated via RPC; errors surface banner with Retry.
  - If RPC unavailable: fallback uses server filters `lte('expiry_date', today+X)` and `gte('expiry_date', today)` scoped by practice.
  - Critical/expired chips visible; expired included in alerts, not counted toward “soon”.

- FIFO tab
  - When RPC `get_fifo_batches` exists: results from RPC are used.
  - If RPC unavailable: fallback sorts `product_batches` by `expiry_date ASC`, suggests quantities until requested is met.

- Translations
  - No `[MISSING:*]` in UI.
  - Verify keys: `batch.viewMode.lite/full`, `batch.batchTitle`, `batch.batchNotFound` in both NL and EN.

Regression checks
- Error state shows banner with Retry, not a generic string.
- Mobile: filters wrap; long product names show tooltips.
- Chips for status use theme tokens, not raw hex.

Smoke steps
1) Open `Batch Management` page.
2) Toggle view mode Lite/Full; state persists; labels translated.
3) Click Refresh; no errors; KPIs update; toast uses i18n.
4) Open Expiring tab; list shows items by urgency; fallback works if RPC disabled.
5) Open FIFO tab; suggestion generated either via RPC or fallback.
6) Scan unknown batch; notification includes batch number in translated message.


