# Codebase Health Review - TypeScript Error Analysis

**Date:** 2025-10-02  
**Current Status:** ~500 TypeScript errors  
**Goal:** Identify top 10 structural blockers and create action plan

---

## Executive Summary

The codebase is at ~500 TS errors after aggressive cleanup. The **root cause** is **schema drift**
between:

1. **Database** (snake_case columns)
2. **Supabase generated types** (snake_case, but missing some tables/columns)
3. **Application DTOs** (camelCase, but inconsistently applied)
4. **Legacy code** (direct snake_case access mixed with camelCase)

**Key Finding:** 70% of remaining errors trace back to **boundary typing gaps** and **schema
mismatches**.

---

## Top 10 Structural Blockers

### 🔴 **#1: Schema Drift in `supplier_orders` Table**

**Impact:** ~30 errors across 3 files  
**Files:**

- `src/services/inventory/automationService.ts` (15 errors)
- `src/services/orderOrchestration/centralOrderService.ts` (10 errors – partially fixed)
- `src/stores/orderLists/orderLists-integration.ts` (5 errors)

**Problem:**

- Code selects `order_reference`, `tracking_number`, `estimated_delivery_date`,
  `actual_delivery_date`
- DB schema has: `tracking_info` (JSON), `delivery_expected`, `delivery_confirmed_at`
- No `order_reference` column exists

**Solution:**

- Update queries to use correct columns
- Create a boundary DTO that maps JSON fields to flat properties
- Fix `automationService.ts` tracking logic

**Estimated Error Drop:** -30

---

### 🔴 **#2: Missing `ProductWithStock` Properties**

**Impact:** ~25 errors across 4 files  
**Files:**

- `src/components/products/ProductDetailsDialog.vue` (8 errors)
- `src/domain/inventory/bridge.ts` (5 errors)
- `src/pages/ProductsPage.vue` (7 errors)
- `src/components/inventory/MobileCountingInterface.vue` (5 errors)

**Problem:** Interface missing:

- `stock_status` (used by legacy components)
- `lifecycleStatus` / `productLifecycleStatus` (GS1 data)
- `preferredSupplierId` / `minimumStock` (from joined `stock_levels`)
- `minimum_stock` / `maximum_stock` (snake_case variants)

**Solution:**

- Extend `ProductWithStock` interface with missing properties
- Update `mapProductRowToView` in `bridge.ts` to populate them
- Add `stock_status` as computed field in legacy object

**Estimated Error Drop:** -25

---

### 🔴 **#3: `ProductBatchDTO` Missing `urgencyLevel` & `daysUntilExpiry`**

**Impact:** ~20 errors across 3 files  
**Files:**

- `src/components/BatchOverview.vue` (6 errors)
- `src/pages/BatchManagementPage.vue` (8 errors)
- `src/stores/batch.ts` (6 errors)

**Problem:**

- ViewModel layer has `urgencyLevel` / `daysUntilExpiry` computed fields
- But base DTO doesn't export them consistently
- Components access both `urgencyLevel` and `urgency_level` (snake_case DB field)

**Solution:**

- Export `urgencyLevel` / `daysUntilExpiry` from `ProductBatchDTO`
- Update `mapProductBatchRowToDetails` to always compute and include them
- Remove direct `urgency_level` access in templates

**Estimated Error Drop:** -20

---

### 🔴 **#4: Missing Store Methods**

**Impact:** ~18 errors across 4 files  
**Files:**

- `src/components/inventory/StockTransferDialog.vue` (5 errors)
- `src/components/UseBatchDialog.vue` (4 errors)
- `src/pages/inventory/MovementsPage.vue` (5 errors)
- `src/pages/OrderListDetailPage.vue` (4 errors)

**Problem:** Components call methods that don't exist on stores:

- `inventoryStore.getProductBatches()` – method removed
- `batchStore.processStockMovement()` – method removed
- `orderListsStore.generateOrderSuggestions()` – signature changed

**Solution:**

- Restore missing methods as thin wrappers around services
- Or refactor components to call services directly
- Update method signatures to match current implementation

**Estimated Error Drop:** -18

---

### 🔴 **#5: Missing Supabase Type Exports**

**Impact:** ~15 errors across 3 files  
**Files:**

- `src/services/magicInvites.ts` (5 errors)
- `src/services/notifications.ts` (7 errors)
- `src/services/admin.ts` (3 errors)

**Problem:** Services import types that aren't exported from Supabase generated file:

- `Json` (exists but not exported as standalone type)
- `PushToken` / `PushTokenInsert` (table exists but types not generated)
- `GuestSession` (table exists but types incomplete)

**Solution:**

- Re-export `Json` type from `supabase.generated.ts`
- Verify `push_tokens` table in DB schema
- Regenerate types with `supabase gen types`
- Add manual type aliases if tables missing

**Estimated Error Drop:** -15

---

### 🟡 **#6: `$t()` Calls in Service Files**

**Impact:** ~20 errors across 7 files  
**Files:**

- `src/services/admin.ts` (1 error)
- `src/services/magento/index.ts` (6 errors)
- `src/services/notifications.ts` (2 errors)
- `src/services/magicInvites.ts` (4 errors)
- `src/services/offline/data-sync.ts` (1 error)
- `src/services/offline/index.ts` (4 errors)
- `src/services/offline/action-queue.ts` (2 errors)

**Problem:**

- Services don't have Vue i18n context
- `$t()` is undefined, causing TS2304 errors
- Anti-pattern: services should return error codes, not translated strings

**Solution:**

- Remove all `$t()` calls from services
- Replace with plain English strings or error codes
- Let UI layer handle translation

**Estimated Error Drop:** -20

---

### 🟡 **#7: `any` Casts at Boundaries (37 occurrences)**

**Impact:** Doesn't cause errors but **hides** 20–30 potential errors  
**Files:**

- `src/services/dashboard/practice-dashboard.ts` (15 casts)
- `src/services/orderOrchestration/centralOrderService.ts` (8 casts)
- `src/services/offline.ts` (3 casts)
- `src/services/dashboard/platform-dashboard.ts` (6 casts)
- `src/services/permissions.ts` (4 casts)

**Problem:**

- Casts used to bypass complex Supabase query typing
- Error objects cast to `any` or `Record<string, unknown>`
- Dynamic table queries cast to `any`

**Solution:**

- Create typed boundary DTOs for Supabase responses
- Use type guards for error narrowing
- Replace dynamic queries with strongly-typed helpers

**Estimated Error Drop:** 0 (but prevents future regression)

---

### 🟡 **#8: Logger Type Inconsistencies**

**Impact:** ~10 errors across 4 files  
**Files:**

- `src/services/inventory/automationService.ts` (4 errors)
- `src/services/notifications.ts` (3 errors)
- `src/services/admin.ts` (2 errors)
- `src/services/dashboard/platform-dashboard.ts` (1 error)

**Problem:**

- Loggers expect `LogData` (Record<string, unknown>)
- Code passes `unknown`, `Error`, or `ServiceWorkerRegistration`
- Type mismatch: TS2345 errors

**Solution:**

- Add type guard:
  `const logData = error instanceof Error ? { message: error.message, stack: error.stack } : error as Record<string, unknown>`
- Or widen logger signature to accept `unknown`

**Estimated Error Drop:** -10

---

### 🟡 **#9: Vue Component Prop/Emit Type Gaps**

**Impact:** ~30 errors across 8 files  
**Files:**

- `src/pages/OrdersPage.vue` (16 errors)
- `src/pages/AdminDashboard.vue` (13 errors)
- `src/components/orderLists/AdvancedOrderListCard.vue` (11 errors)
- `src/components/inventory/MobileCountingInterface.vue` (5 errors)
- Others (scattered)

**Problem:**

- Many Vue components missing strict `defineProps` / `defineEmits` types
- Template accesses cause TS2339 errors
- Props passed to child components without type safety

**Solution:**

- Add explicit `interface Props` for all `defineProps`
- Define emit signatures: `const emit = defineEmits<{ submit: [data: FormData] }>()`
- Use `withDefaults` for optional props

**Estimated Error Drop:** -30

---

### 🟡 **#10: Missing Global Type Augmentations**

**Impact:** ~15 errors across 5 files  
**Files:**

- `src/main.ts` (1 error)
- `src/components/cards/AlertCard.vue` (6 errors)
- `src/components/TokenColorPicker.vue` (2 errors)
- `src/composables/useFormValidation.ts` (4 errors)
- `src/composables/useButtons.ts` (2 errors)

**Problem:**

- `ServiceErrorHandler.setupGlobalHandlers()` doesn't exist
- Vue component types incomplete (missing `id`, `paddingClass`)
- Event target types need narrowing (`value` property)
- Partial types for composable return values

**Solution:**

- Remove call to `setupGlobalHandlers` or add method stub
- Augment component types in `_shims.d.ts`
- Add type guards for DOM events: `(e.target as HTMLInputElement).value`
- Complete composable return types

**Estimated Error Drop:** -15

---

## Schema Drift Summary

### Missing Columns Referenced in Code

| Table             | Missing Column            | Actual Column             | Files Affected                         |
| ----------------- | ------------------------- | ------------------------- | -------------------------------------- |
| `supplier_orders` | `order_reference`         | _(none – use `id`)_       | automationService, centralOrderService |
| `supplier_orders` | `tracking_number`         | `tracking_info` (JSON)    | automationService, centralOrderService |
| `supplier_orders` | `estimated_delivery_date` | `delivery_expected`       | automationService, centralOrderService |
| `supplier_orders` | `actual_delivery_date`    | `delivery_confirmed_at`   | automationService                      |
| `products`        | `currency`                | _(not on products table)_ | ProductFormDialog, UseBatchDialog      |
| `stock_levels`    | `minimum_stock`           | `minimum_quantity`        | MobileCountingInterface                |
| `stock_levels`    | `maximum_stock`           | `maximum_quantity`        | MobileCountingInterface                |

### Inconsistent Naming Conventions

| Concept      | Database                 | DTO                     | ViewModel                        | Usage                         |
| ------------ | ------------------------ | ----------------------- | -------------------------------- | ----------------------------- |
| Urgency      | `urgency_level` (string) | `urgencyLevel` (string) | `urgencyLevel` (enum-like)       | BatchOverview, OrderListsPage |
| Stock Status | _(computed)_             | `status` (enum)         | `stockStatus` (string)           | ProductDetailsDialog          |
| Batch Expiry | `expiry_date`            | `expiryDate`            | `expiryDate` + `daysUntilExpiry` | BatchOverview                 |
| Supplier ID  | `supplier_id`            | `supplierId`            | `supplierId`                     | All inventory components      |

---

## Risky Patterns

### 1. **Commented-Out Logic**

**Count:** 0 (clean!)  
**Verdict:** ✅ No dead code issues

### 2. **Translation Calls in Services**

**Count:** 20 occurrences  
**Risk:** Services can't access i18n context → runtime errors  
**Fix:** Remove `$t()` calls, use error codes

### 3. **Type Casts to `any`**

**Count:** 37 occurrences  
**Risk:** Bypasses type safety, hides bugs  
**Fix:** Create boundary DTOs

### 4. **Missing RLS Policies**

**Count:** 0 security stubs found  
**Verdict:** ✅ No obvious security gaps in code (RLS is DB-level)

### 5. **Error Handling Inconsistency**

**Pattern:** Mix of:

- `ServiceErrorHandler.handle(error as Error)`
- `logger.error(error as Record<string, unknown>)`
- `console.error(error)`

**Fix:** Standardize on `ServiceErrorHandler` with typed error context

---

## Configuration Issues

### TypeScript Config

**File:** `tsconfig.json`

✅ **Good:**

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `exactOptionalPropertyTypes: false` (relaxed to reduce noise)

⚠️ **Potential Issues:**

- `noUncheckedIndexedAccess: true` – causes noise for dynamic object access
- Could relax to reduce array/object indexing errors

**Recommendation:** Keep current settings for now. They enforce good practices.

### Vite/Quasar Alias

**Checked:** `@/*` alias configured in tsconfig  
**Status:** ✅ No alias issues detected

---

## Prioritized Action Plan

### 🎯 Session 1: Schema Alignment (Est. -75 errors, 2 hours)

**Priority A: Fix `supplier_orders` Schema Drift**

1. Update `automationService.ts` queries:
   - Replace `order_reference` with `id`
   - Replace `tracking_number` with `tracking_info`
   - Replace date fields with correct columns
2. Create `SupplierOrderDTO` with flattened JSON fields
3. Update `centralOrderService.ts` (already partially done)

**Priority B: Extend `ProductWithStock` Interface** 4. Add missing properties to `ProductWithStock`:

- `stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'`
- `lifecycleStatus: string | null`
- `preferredSupplierId: string | null`
- `minimumStock: number | null`
- `minimum_stock` (as deprecated alias)

5. Update `mapProductRowToView` in `bridge.ts`
6. Fix `ProductDetailsDialog.vue`, `MobileCountingInterface.vue`

**Priority C: Fix Batch DTO Urgency Fields** 7. Update `ProductBatchDTO` to always include
`urgencyLevel`, `daysUntilExpiry` 8. Remove snake_case `urgency_level` access in
`BatchOverview.vue` 9. Update `batch.ts` store to compute urgency consistently

**Expected Drop:** -75 errors

---

### 🎯 Session 2: Services & Types (Est. -50 errors, 2 hours)

**Priority D: Remove `$t()` from Services** 10. Sweep all service files: - `admin.ts`,
`magento/index.ts`, `notifications.ts`, `magicInvites.ts` - `offline/*.ts` 11. Replace with plain
strings or error codes

**Priority E: Fix Supabase Type Exports** 12. Regenerate types:
`npx supabase gen types typescript` 13. Add manual exports to `supabase.ts`:
`ts     export type Json = Database['public']['Tables']['products']['Row']['integration_config']     export type PushToken = Database['public']['Tables']['push_tokens']['Row']     ` 14.
Fix `magicInvites.ts`, `notifications.ts`

**Priority F: Fix Logger Type Issues** 15. Add type guard helper:
`ts     const toLogData = (val: unknown): Record<string, unknown> =>        val instanceof Error ? { message: val.message, stack: val.stack } :        typeof val === 'object' && val ? val as Record<string, unknown> :        { value: String(val) }     ` 16.
Apply to `automationService.ts`, `notifications.ts`

**Expected Drop:** -50 errors

---

### 🎯 Session 3: Vue Components (Est. -60 errors, 2–3 hours)

**Priority G: Restore Missing Store Methods** 17. Add thin wrapper methods to stores: -
`inventoryStore.getProductBatches(productId)` - `batchStore.processStockMovement(data)` 18. Or
refactor components to call services directly

**Priority H: Add Strict Vue Prop/Emit Types** 19. Fix high-error Vue files: - `OrdersPage.vue` (16
errors) - `AdminDashboard.vue` (13 errors) - `AdvancedOrderListCard.vue` (11 errors) 20. Add
`interface Props` and `defineEmits<{ ... }>`

**Priority I: Fix Remaining Global Types** 21. Remove `setupGlobalHandlers` call in `main.ts` 22.
Add type guards for DOM events in components 23. Complete composable return types

**Expected Drop:** -60 errors

---

## Summary & Next Steps

### Current Breakdown (500 errors)

- **TS2339** (113): Property does not exist → Schema drift + missing DTO fields
- **TS2322** (82): Type not assignable → Prop types, DTO mismatches
- **TS2345** (75): Argument type mismatch → Logger types, null safety
- **TS2722** (35): Cannot invoke undefined → `$t()` in services, optional methods
- **TS2551** (26): Property typo suggestions → Snake_case vs camelCase

### Expected Results After 3 Sessions

- **Session 1:** 500 → 425 errors (-75)
- **Session 2:** 425 → 375 errors (-50)
- **Session 3:** 375 → 315 errors (-60)

**Target:** ~315 errors remaining (mostly template/prop types)

### Follow-Up Work (Session 4+)

- Clean up `any` casts with boundary DTOs
- Complete template type checking (remove `--skipTemplateCodegen`)
- Add missing unit tests for critical services
- Document schema → DTO → ViewModel flow

---

## Risks & Considerations

### ⚠️ Schema Changes

**Risk:** Changing queries may break runtime behavior  
**Mitigation:** Test against dev DB, verify queries return expected data

### ⚠️ Removing `$t()` from Services

**Risk:** Error messages become English-only  
**Mitigation:** Use error codes, translate in UI layer (already planned pattern)

### ⚠️ Store Method Changes

**Risk:** Components depend on removed methods  
**Mitigation:** Restore as thin wrappers (no logic duplication)

---

**END OF REPORT**
