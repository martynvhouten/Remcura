# Phase B Health Checklist - Structural Fixes

**Created:** 2025-10-02  
**Current:** ~500 TS errors  
**Target:** ~315 errors after 3 sessions

---

## Session 1: Schema Alignment (Priority: CRITICAL)

**Estimated Impact:** -75 errors | **Time:** 2 hours

### A1: Fix `supplier_orders` Schema Drift (-30 errors)

- [ ] `automationService.ts`: Update query columns
  - Replace `order_reference` → `id`
  - Replace `tracking_number` → `tracking_info` (JSON)
  - Replace `estimated_delivery_date` → `delivery_expected`
  - Replace `actual_delivery_date` → `delivery_confirmed_at`
- [ ] Create `SupplierOrderDTO` interface with flattened fields
- [ ] Update `automationService.ts` tracking logic to use new DTO
- [ ] Verify `centralOrderService.ts` uses correct columns (partial fix exists)
- [ ] Test: Run query against dev DB to verify columns exist
- [ ] Commit: `B.X: Fix supplier_orders schema drift in automationService`

**Files:**

- `src/services/inventory/automationService.ts` (15 errors → 0)
- `src/services/orderOrchestration/centralOrderService.ts` (10 errors → 0)
- `src/stores/orderLists/orderLists-integration.ts` (5 errors → 0)

---

### A2: Extend `ProductWithStock` Interface (-25 errors)

- [ ] Add missing properties to `src/types/inventory.ts`:
  ```ts
  export interface ProductWithStock {
    // ... existing fields
    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'; // legacy snake_case
    lifecycleStatus?: string | null;
    preferredSupplierId?: string | null;
    minimumStock?: number | null;
    minimum_stock?: number | null; // deprecated alias
    maximum_stock?: number | null; // deprecated alias
  }
  ```
- [ ] Update `mapProductRowToView` in `bridge.ts` to populate new fields
- [ ] Fix `ProductDetailsDialog.vue`: use `product.stock_status`
- [ ] Fix `MobileCountingInterface.vue`: use `minimum_stock`, `maximum_stock`
- [ ] Fix `bridge.ts`: map `lifecycleStatus`, `preferredSupplierId`, `minimumStock`
- [ ] Test: Verify products render correctly in ProductsPage
- [ ] Commit: `B.X: Add missing ProductWithStock properties`

**Files:**

- `src/types/inventory.ts` (interface definition)
- `src/domain/inventory/bridge.ts` (5 errors → 0)
- `src/components/products/ProductDetailsDialog.vue` (8 errors → 2)
- `src/pages/ProductsPage.vue` (7 errors → 2)
- `src/components/inventory/MobileCountingInterface.vue` (5 errors → 0)

---

### A3: Fix Batch DTO Urgency Fields (-20 errors)

- [ ] Update `ProductBatchDTO` in `dto.ts` to always include:
  ```ts
  urgencyLevel: 'normal' | 'low' | 'warning' | 'high' | 'critical' | 'expired';
  daysUntilExpiry: number;
  ```
- [ ] Update `mapProductBatchRowToDetails` to compute `urgencyLevel` + `daysUntilExpiry`
- [ ] Fix `BatchOverview.vue`: remove `urgency_level` (snake_case) access
- [ ] Fix `BatchManagementPage.vue`: use `batch.urgencyLevel` consistently
- [ ] Fix `batch.ts` store: ensure all mapped batches have urgency fields
- [ ] Test: Verify batch urgency badges display correctly
- [ ] Commit: `B.X: Standardize batch urgency fields across DTOs`

**Files:**

- `src/domain/inventory/dto.ts` (add fields)
- `src/types/inventory.ts` (update mapper)
- `src/components/BatchOverview.vue` (6 errors → 0)
- `src/pages/BatchManagementPage.vue` (8 errors → 0)
- `src/stores/batch.ts` (6 errors → 0)

---

## Session 2: Services & Types (Priority: HIGH)

**Estimated Impact:** -50 errors | **Time:** 2 hours

### B1: Remove `$t()` from Service Files (-20 errors)

- [ ] `src/services/admin.ts`: Replace 1 `$t()` call with plain string
- [ ] `src/services/magento/index.ts`: Replace 6 `$t()` calls
- [ ] `src/services/notifications.ts`: Replace 2 `$t()` calls
- [ ] `src/services/magicInvites.ts`: Replace 4 `$t()` calls
- [ ] `src/services/offline/data-sync.ts`: Replace 1 `$t()` call
- [ ] `src/services/offline/index.ts`: Replace 4 `$t()` calls
- [ ] `src/services/offline/action-queue.ts`: Replace 2 `$t()` calls
- [ ] Document pattern: Services return error codes, UI translates
- [ ] Commit: `B.X: Remove $t() calls from service layer`

**Files:** 7 service files (20 errors → 0)

---

### B2: Fix Supabase Type Exports (-15 errors)

- [ ] Regenerate types: `npx supabase gen types typescript --project-id qdvatwfakrtoggjjofuy`
- [ ] Add manual exports to `src/types/supabase.ts`:

  ```ts
  import type { Database } from './supabase.generated';

  // Re-export Json type
  export type Json = Database['public']['Tables']['products']['Row']['integration_config'];

  // Export missing table types
  export type PushToken = Database['public']['Tables']['push_tokens']['Row'];
  export type PushTokenInsert = Database['public']['Tables']['push_tokens']['Insert'];
  export type GuestSession = Database['public']['Tables']['guest_sessions']['Row'];
  ```

- [ ] Fix `magicInvites.ts` imports
- [ ] Fix `notifications.ts` imports
- [ ] Fix `admin.ts` imports
- [ ] Test: Verify types compile
- [ ] Commit: `B.X: Fix missing Supabase type exports`

**Files:**

- `src/types/supabase.ts` (add exports)
- `src/services/magicInvites.ts` (5 errors → 0)
- `src/services/notifications.ts` (7 errors → 2)
- `src/services/admin.ts` (3 errors → 0)

---

### B3: Fix Logger Type Issues (-10 errors)

- [ ] Create helper in `src/utils/logger.ts`:
  ```ts
  export const toLogData = (val: unknown): Record<string, unknown> => {
    if (val instanceof Error) {
      return { message: val.message, stack: val.stack, name: val.name };
    }
    if (typeof val === 'object' && val !== null) {
      return val as Record<string, unknown>;
    }
    return { value: String(val) };
  };
  ```
- [ ] Apply to `automationService.ts`: `logger.error('msg', toLogData(error))`
- [ ] Apply to `notifications.ts`: `logger.error('msg', toLogData(error))`
- [ ] Apply to `admin.ts`: `logger.error('msg', toLogData(error))`
- [ ] Apply to `platform-dashboard.ts`: `logger.error('msg', toLogData(error))`
- [ ] Test: Verify logs still output correctly
- [ ] Commit: `B.X: Add type-safe logger helper for error data`

**Files:**

- `src/utils/logger.ts` (add helper)
- `src/services/inventory/automationService.ts` (4 errors → 0)
- `src/services/notifications.ts` (3 errors → 0)
- Others (3 errors → 0)

---

### B4: Clean Up Excessive `any` Casts (OPTIONAL)

- [ ] Audit `practice-dashboard.ts` (15 casts)
- [ ] Create boundary DTOs for Supabase query responses
- [ ] Replace dynamic table queries with typed helpers
- [ ] Document pattern in `docs/guides/boundary-typing.md`

**Impact:** 0 errors (preventive measure)

---

## Session 3: Vue Components (Priority: MEDIUM)

**Estimated Impact:** -60 errors | **Time:** 2–3 hours

### C1: Restore Missing Store Methods (-18 errors)

- [ ] `inventoryStore`: Add `getProductBatches(productId: string)`
  ```ts
  async getProductBatches(productId: string) {
    const { data } = await supabase
      .from('product_batches')
      .select('*')
      .eq('product_id', productId);
    return data ?? [];
  }
  ```
- [ ] `batchStore`: Add `processStockMovement(data: StockMovementData)`
- [ ] OR: Refactor components to call services directly
- [ ] Fix `StockTransferDialog.vue`
- [ ] Fix `UseBatchDialog.vue`
- [ ] Fix `MovementsPage.vue`
- [ ] Fix `OrderListDetailPage.vue`
- [ ] Test: Verify stock operations still work
- [ ] Commit: `B.X: Restore missing store methods for component compatibility`

**Files:**

- `src/stores/inventory/inventory.ts` (add method)
- `src/stores/batch.ts` (add method)
- 4 component files (18 errors → 0)

---

### C2: Add Strict Vue Prop/Emit Types (-30 errors)

- [ ] `OrdersPage.vue`: Add `interface Props` + `defineEmits<{ ... }>`
- [ ] `AdminDashboard.vue`: Add prop types
- [ ] `AdvancedOrderListCard.vue`: Add prop types
- [ ] `MobileCountingInterface.vue`: Add emit types
- [ ] Template: Use `withDefaults` for optional props
- [ ] Test: Verify components render and emit correctly
- [ ] Commit: `B.X: Add strict prop/emit types to high-error Vue components`

**Files:**

- `src/pages/OrdersPage.vue` (16 errors → 3)
- `src/pages/AdminDashboard.vue` (13 errors → 2)
- `src/components/orderLists/AdvancedOrderListCard.vue` (11 errors → 2)
- Others (scattered)

---

### C3: Fix Global Type Issues (-12 errors)

- [ ] `main.ts`: Remove or stub `ServiceErrorHandler.setupGlobalHandlers()`
- [ ] `AlertCard.vue`: Add missing `id`, `paddingClass` to props
- [ ] `TokenColorPicker.vue`: Add type guard:
  ```ts
  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    // ...
  };
  ```
- [ ] `useFormValidation.ts`: Complete `FieldValidation` interface
- [ ] `useButtons.ts`: Add `class` to `ButtonConfig` interface
- [ ] Commit: `B.X: Fix global type augmentations and component types`

**Files:**

- `src/main.ts` (1 error → 0)
- `src/components/cards/AlertCard.vue` (6 errors → 0)
- `src/components/TokenColorPicker.vue` (2 errors → 0)
- `src/composables/useFormValidation.ts` (4 errors → 1)
- `src/composables/useButtons.ts` (2 errors → 0)

---

## Verification Steps

### After Each Session

- [ ] Run: `npx vue-tsc --noEmit`
- [ ] Record: `[Before] → [After]` error count
- [ ] Verify: Error delta matches estimate (±10%)
- [ ] Commit: One commit per logical change
- [ ] Test: Manual smoke test for affected features

### Final Health Check (After Session 3)

- [ ] Total errors: ~315 (target)
- [ ] No regressions in previously fixed files
- [ ] All service `$t()` calls removed
- [ ] Schema drift issues resolved
- [ ] Top 10 Vue files under 5 errors each

---

## Rollback Plan

If any fix increases error count:

1. Revert the commit: `git revert HEAD`
2. Document why it failed in this checklist
3. Skip to next item or adjust approach
4. Revisit later with refined strategy

---

## Post-Session 3 Goals

### Session 4: Template Type Checking

- [ ] Remove `--skipTemplateCodegen` flag
- [ ] Fix remaining template errors in top 10 files
- [ ] Target: <200 errors

### Session 5: Full Strictness

- [ ] Enable `noUncheckedIndexedAccess` audit
- [ ] Remove all `any` casts with proper DTOs
- [ ] Target: <100 errors

### Session 6: Zero Errors

- [ ] Fix remaining edge cases
- [ ] Add strict mode to CI/CD
- [ ] Target: 0 errors ✨

---

**END OF CHECKLIST**
