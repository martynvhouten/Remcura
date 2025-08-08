## Dashboard Feature Audit

Date: 2025-08-08

Scope includes practice dashboard (`/dashboard`), platform dashboard (`/platform`), analytics
(`/analytics`), and admin dashboard (`/admin`), plus all reusable dashboard widgets and base
components.

### Routes and entry points

- `/dashboard` → `src/pages/DashboardPage.vue`
- `/platform` → `src/pages/platform/PlatformDashboard.vue`
- `/analytics` → `src/pages/AnalyticsPage.vue`
- `/admin` → `src/pages/AdminDashboard.vue`
- Router source: `src/router/routes.ts`

### Key services and configs

- Practice dashboard: `src/services/dashboard/practice-dashboard.ts` + role config
  `src/services/dashboard/role-config.ts`
- Platform dashboard: `src/services/dashboard/platform-dashboard.ts`
- Legacy/unused: `src/services/dashboard.ts` and `src/types/dashboard.ts` (not referenced by pages)
- Analytics: `src/services/analytics.ts`

### Widget renderers and bases

- Practice widgets: `src/components/dashboard/DynamicWidget.vue`
- Platform widgets: `src/components/platform/DynamicPlatformWidget.vue`
- Base wrapper: `src/components/cards/BaseDashboardWidget.vue`
- Practice widget set:
  `src/components/dashboard/widgets/{MetricWidget,ChartWidget,ListWidget,AlertWidget,QuickActionWidget}.vue`
- Platform widget set:
  `src/components/platform/widgets/{MetricWidget,ChartWidget,ListWidget,TableWidget,SystemWidget}.vue`

### Audit table

| Page/Component                                     | Status                                    | Data Source                                                                                                                                                                                                | Styling                                                                            | Notes/Next Actions                                                                                                                                                       |
| -------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pages/DashboardPage.vue` (/dashboard)             | Partially functional                      | Loads from `practiceDashboardService` (Supabase: stock_levels, product_batches, order_lists, supplier_orders, suppliers, stock_movements, counting_sessions, activity_log; RPCs: get_supplier_performance) | Mostly consistent with tokens and `BaseDashboardWidget`; dashboard grid responsive | Some role widgets return static/mocks (see list). Implement Customize dialog (currently "coming soon"). Consider per-widget date/practice filters and persistent layout. |
| `pages/platform/PlatformDashboard.vue` (/platform) | Functional with fallbacks                 | `platformDashboardService` (Supabase: practices, practice_members, usage_analytics, activity_log, suppliers; RPC: get_table_stats; package.json for version)                                               | Uses `BaseCard` + platform widgets; consistent tokens; responsive                  | `database-status` depends on `get_table_stats` RPC; handle absence (already falls back). Consider adding filters and live updates via Supabase real-time.                |
| `pages/AnalyticsPage.vue` (/analytics)             | Fully functional                          | `AnalyticsService` (Supabase: usage_analytics, orders, stock_entries)                                                                                                                                      | Uses `BaseCard`; modern styles; responsive                                         | Add chart interactivity (Chart.js/ECharts) and CSV export (JSON export exists). Add error/empty state standardization.                                                   |
| `pages/AdminDashboard.vue` (/admin)                | Partially functional                      | `adminService`, `offlineService`, `analyticsService` (some KPIs mocked in-page)                                                                                                                            | Uses `BaseCard`; consistent tokens                                                 | Several analytics values are simplified/mocked (e.g., averageSessionTime). Consider wiring full analytics and admin APIs.                                                |
| `components/cards/BaseDashboardWidget.vue`         | Ready                                     | N/A                                                                                                                                                                                                        | Matches design tokens, dark mode, loading overlay; good a11y                       | Centralize widget header actions/empty/error slots for consistency.                                                                                                      |
| `components/dashboard/DynamicWidget.vue`           | Ready                                     | N/A (renderer)                                                                                                                                                                                             | Consistent                                                                         | `table` type re-uses `ListWidget`; consider dedicated table widget for practice dashboard.                                                                               |
| `components/platform/DynamicPlatformWidget.vue`    | Ready                                     | N/A (renderer)                                                                                                                                                                                             | Consistent                                                                         | Good actions; aligns with base.                                                                                                                                          |
| Practice: `MetricWidget.vue`                       | Ready                                     | Prop-driven                                                                                                                                                                                                | Consistent tokens; responsive                                                      | OK.                                                                                                                                                                      |
| Practice: `ChartWidget.vue`                        | Partially functional                      | Prop-driven (simplified CSS charts)                                                                                                                                                                        | Basic visuals; limited interactivity                                               | Replace with shared Chart.js component (like platform) for parity and interactivity.                                                                                     |
| Practice: `ListWidget.vue`                         | Ready                                     | Prop-driven                                                                                                                                                                                                | Consistent                                                                         | OK.                                                                                                                                                                      |
| Practice: `AlertWidget.vue`                        | Ready                                     | Prop-driven                                                                                                                                                                                                | Consistent; severity styles                                                        | OK.                                                                                                                                                                      |
| Practice: `QuickActionWidget.vue`                  | Partially functional                      | Routes only; scan animation simulated                                                                                                                                                                      | Consistent                                                                         | Hook into actual scanner flow; review i18n keys (some hardcoded).                                                                                                        |
| Platform: `MetricWidget.vue`                       | Ready                                     | Prop-driven                                                                                                                                                                                                | Consistent                                                                         | OK.                                                                                                                                                                      |
| Platform: `ChartWidget.vue`                        | Fully functional (with graceful fallback) | Chart.js dynamic import, fallback bars                                                                                                                                                                     | Consistent                                                                         | Add tooltip/zoom legends; ensure tree-shake friendliness.                                                                                                                |
| Platform: `ListWidget.vue`                         | Ready                                     | Prop-driven                                                                                                                                                                                                | Consistent                                                                         | OK.                                                                                                                                                                      |
| Platform: `TableWidget.vue`                        | Ready                                     | Prop-driven                                                                                                                                                                                                | Consistent                                                                         | OK.                                                                                                                                                                      |
| Platform: `SystemWidget.vue`                       | Fully functional                          | Version/health/database/system info                                                                                                                                                                        | Consistent                                                                         | Ensure env vars present; extend with uptime source if available.                                                                                                         |
| `services/dashboard/practice-dashboard.ts`         | Functional                                | Multiple Supabase tables/queries; some simulated widgets for certain roles                                                                                                                                 | N/A                                                                                | Real data for most widgets; see widget-by-widget statuses below.                                                                                                         |
| `services/dashboard/platform-dashboard.ts`         | Functional with fallbacks                 | Multiple Supabase tables/queries + RPC                                                                                                                                                                     | N/A                                                                                | Works; ensure RPCs exist or keep fallback messaging.                                                                                                                     |
| Legacy `services/dashboard.ts`                     | Unused                                    | Mixed Supabase + mock fallbacks                                                                                                                                                                            | N/A                                                                                | Not imported by any page. Mark for deprecation/removal to avoid confusion.                                                                                               |
| Legacy `types/dashboard.ts`                        | Likely unused                             | N/A                                                                                                                                                                                                        | N/A                                                                                | Only referenced by legacy service. Mark for removal/merge into live types if still needed.                                                                               |

### Practice dashboard widgets (by ID in `role-config.ts`)

| Widget ID                                                  | Status               | Data Source                                                | Styling                          | Notes/Next Actions                                                     |
| ---------------------------------------------------------- | -------------------- | ---------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| low-stock-alerts                                           | Fully functional     | Supabase: stock_levels (+ products, practice_locations)    | Consistent                       | Add click-through to filtered Inventory Levels.                        |
| expiring-products                                          | Fully functional     | Supabase: product_batches (+ products, practice_locations) | Consistent                       | Consider batch tooltip and quick actions.                              |
| order-suggestions                                          | Fully functional     | Supabase: order_suggestions (+ products)                   | Consistent                       | Add create-order CTA (present) integration confirmation.               |
| active-order-lists                                         | Fully functional     | Supabase: order_lists (+ suppliers)                        | Consistent                       | Add status chips and navigation.                                       |
| pending-deliveries                                         | Fully functional     | Supabase: supplier_orders (+ suppliers, order_lists)       | Consistent                       | Add delivery tracking link if available.                               |
| stock-trends                                               | Fully functional     | Supabase: stock_movements                                  | Partially styled (custom charts) | Migrate to shared Chart.js; add tooltips/zoom.                         |
| supplier-performance                                       | Partially functional | Supabase RPC: get_supplier_performance                     | Consistent                       | Ensure RPC exists in all envs; add error state.                        |
| cost-analysis                                              | Fully functional     | Supabase: product_batches (+ products.category)            | Partially styled (custom charts) | Use doughnut with Chart.js; add legend.                                |
| error-alerts                                               | Fully functional     | Supabase: activity_log                                     | Consistent                       | Standardize severity labels via i18n.                                  |
| pending-orders                                             | Fully functional     | Supabase: order_lists (count/value)                        | Consistent                       | Add trend arrow from historical data.                                  |
| inventory-value                                            | Fully functional     | Supabase: stock_levels (+ products.price)                  | Consistent                       | Verify currency formatting via `useFormatting`.                        |
| batch-compliance                                           | Fully functional     | Supabase: product_batches                                  | Consistent                       | Add drill-down to batches view.                                        |
| supplier-contracts                                         | Fully functional     | Supabase: suppliers (+ supplier_products)                  | Consistent                       | Add navigation to suppliers detail.                                    |
| stock-rotation                                             | Fully functional     | Supabase: product_batches                                  | Partially styled (custom charts) | Switch to Chart.js bar.                                                |
| audit-notifications                                        | Fully functional     | Supabase: counting_sessions                                | Consistent                       | Link to counting session detail.                                       |
| stock-movements                                            | Fully functional     | Supabase: stock_movements (+ products, locations)          | Consistent                       | Add pagination.                                                        |
| location-overview                                          | Fully functional     | Supabase: stock_levels (+ locations)                       | Partially styled (custom charts) | Switch to Chart.js doughnut.                                           |
| transport-status                                           | Fully functional     | Supabase: supplier_orders                                  | Consistent                       | Add filters (date/status).                                             |
| stock-overview (member)                                    | Fully functional     | Supabase: stock_levels                                     | Consistent                       | OK.                                                                    |
| my-tasks (member)                                          | Placeholder          | Static array in service                                    | Consistent                       | Implement real task source or hide until available.                    |
| public-info (guest)                                        | Placeholder          | Static object in service                                   | Consistent                       | Decide to remove or replace with real public info.                     |
| system-overview (platform_owner in practice dashboard)     | Placeholder          | Static numbers                                             | Consistent                       | Platform owners should be redirected to `/platform`; keep hidden here. |
| user-analytics (platform_owner in practice dashboard)      | Placeholder          | Static dataset                                             | Consistent                       | Prefer `/platform` analytics widgets; consider removing duplicate.     |
| platform-health (platform_owner in practice dashboard)     | Placeholder          | Static alerts                                              | Consistent                       | Prefer `/platform`.                                                    |
| subscription-status (platform_owner in practice dashboard) | Placeholder          | Static rows                                                | Consistent                       | Prefer `/platform`.                                                    |

### Platform dashboard widgets (by ID in `platform-dashboard.ts`)

| Widget ID              | Status               | Data Source                                                 | Styling    | Notes/Next Actions                                     |
| ---------------------- | -------------------- | ----------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| system-health          | Fully functional     | Supabase: activity_log, usage_analytics, practices          | Consistent | Add threshold config and tooltips.                     |
| version-info           | Fully functional     | package.json + env vars                                     | Consistent | Display commit hash/build from CI if available.        |
| platform-audit-logs    | Fully functional     | Supabase: activity_log (+ practices)                        | Consistent | Add filters (type/date/practice).                      |
| customer-management    | Fully functional     | Supabase: practices (+ members, locations, usage_analytics) | Consistent | Add row click to practice detail.                      |
| api-integration-status | Fully functional     | Supabase: suppliers                                         | Consistent | Compute health more robustly; drill-down.              |
| performance-metrics    | Fully functional     | Supabase: usage_analytics                                   | Consistent | Add range selector; multiple datasets.                 |
| database-status        | Partially functional | Supabase: practices (ping) + RPC get_table_stats            | Consistent | Ensure RPC deployed; show permission doc when missing. |
| error-monitoring       | Fully functional     | Supabase: activity_log                                      | Consistent | Link to logs page.                                     |

### Unused/duplicate components and code

- `src/services/dashboard.ts` and `src/types/dashboard.ts` appear legacy and unused by current
  pages. Candidates for removal to reduce confusion.
- Duplicate widget implementations between practice (`src/components/dashboard/widgets`) and
  platform (`src/components/platform/widgets`). Consider a single shared widget library with
  variants/props.

### Modernization opportunities

- UI/UX
  - Unify charting: adopt Chart.js (already used on platform) or ECharts for both dashboards;
    replace CSS-only charts in practice widgets.
  - Add per-widget filters (date ranges, locations, suppliers) and a global period selector for
    `/dashboard`.
  - Implement widget customization (add/remove/reorder/resize) in `/dashboard`; persist per-user
    config.
  - Standardize empty, loading, and error states via `BaseDashboardWidget` slots; add retry where
    applicable.
  - Improve interactivity (tooltips, legends, drill-down navigation) for charts and KPI cards.
  - Accessibility: keyboard focus order, focus outlines, and ARIA for widget headers/actions.

- Technical
  - Real-time updates: subscribe to Supabase changes (stock_levels, order_lists, activity_log) to
    live-refresh key widgets.
  - Extract a shared `ChartWidget` with Chart.js adapter; de-duplicate platform/practice chart code.
  - Centralize data mappers and i18n labels for severity/status/type to avoid string drift (some
    Dutch literals present in practice widgets).
  - Type safety: ensure all widget `data` shapes are typed and consistent across services and
    components.
  - Remove legacy `src/services/dashboard.ts` and `src/types/dashboard.ts` after confirming no
    external references.
  - Guard optional RPCs (`get_supplier_performance`, `get_table_stats`) with capability checks and
    surfaced hints for setup.

### Missing/placeholder widgets to build out

- Practice dashboard
  - `my-tasks`: connect to a real task system or hide for now.
  - `supplier-performance`: ensure `get_supplier_performance` RPC exists; otherwise provide a SQL
    fallback or remove from default config.
  - Chart-based widgets (`stock-trends`, `cost-analysis`, `stock-rotation`, `location-overview`):
    migrate to Chart.js and add interactivity.

- Practice dashboard (platform_owner role)
  - `system-overview`, `user-analytics`, `platform-health`, `subscription-status`: duplicates of
    platform concerns; recommend removing from practice role config and keeping only on `/platform`.

### Notes on styling consistency

- Most widgets and pages use the new design tokens and `BaseDashboardWidget`/`BaseCard` patterns;
  dark mode coverage exists and looks consistent.
- Some older patterns remain (e.g., basic CSS charts, a few hardcoded labels). Address during chart
  unification and i18n sweep.

---

Owner: Dashboard/Platform team

Proposed commit: "docs(dashboard): add dashboard feature audit report"
