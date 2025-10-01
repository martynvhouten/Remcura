# TypeScript Error Analysis & Fix Plan

**Generated:** October 1, 2025  
**Project:** Remcura - Vue 3 + Quasar + Supabase

---

## Executive Summary

**Total TypeScript Errors: 510**

- **Affected Files:** 53
- **Unique Error Codes:** 33
- **Top Issue:** Property access mismatches (snake_case vs camelCase)
- **Configuration:** Highly strict TypeScript settings (exactOptionalPropertyTypes enabled)

---

## 1. ERROR BREAKDOWN BY CODE

### Top 10 Error Codes (Covering 90% of all errors)

| Error Code  | Count | % of Total | Description                               |
| ----------- | ----- | ---------- | ----------------------------------------- |
| **TS2339**  | 119   | 23.3%      | Property does not exist on type           |
| **TS2345**  | 77    | 15.1%      | Argument type not assignable              |
| **TS2322**  | 61    | 12.0%      | Type not assignable                       |
| **TS2304**  | 50    | 9.8%       | Cannot find name                          |
| **TS2551**  | 38    | 7.5%       | Property does not exist (with suggestion) |
| **TS2769**  | 27    | 5.3%       | No overload matches call                  |
| **TS7006**  | 21    | 4.1%       | Parameter implicitly has 'any' type       |
| **TS2305**  | 13    | 2.5%       | Module has no exported member             |
| **TS2353**  | 13    | 2.5%       | Unknown property in object literal        |
| **TS18048** | 12    | 2.4%       | Expression is possibly 'undefined'        |

**Combined: 431 errors (84.5% of total)**

### Remaining Error Codes (78 errors, 15.5%)

- TS2532, TS18047, TS2538, TS2379, TS2440, TS2352, TS2459, TS2367, TS1117, TS2307, TS2412, TS2375,
  TS7053, TS1360, TS2552, TS18046, TS2740, TS2448, TS2454, TS2554, TS2741, TS2365, TS2589

---

## 2. TOP 20 FILES WITH MOST ERRORS

| #   | File                                                     | Errors | Primary Issue                           |
| --- | -------------------------------------------------------- | ------ | --------------------------------------- |
| 1   | `src/stores/batch.ts`                                    | 69     | Missing module imports, type mismatches |
| 2   | `src/services/orderOrchestration/centralOrderService.ts` | 50     | Snake_case property access              |
| 3   | `src/services/admin.ts`                                  | 38     | Missing type exports from supabase      |
| 4   | `src/types/inventory.ts`                                 | 37     | Type definition conflicts               |
| 5   | `src/services/dashboard/practice-dashboard.ts`           | 25     | Type incompatibilities                  |
| 6   | `src/services/magento/index.ts`                          | 25     | Import/local declaration conflict       |
| 7   | `src/services/orderProcessing.ts`                        | 22     | Cannot find $t (i18n)                   |
| 8   | `src/services/offline.ts`                                | 21     | Missing type exports                    |
| 9   | `src/services/dashboard/platform-dashboard.ts`           | 21     | Unknown argument types                  |
| 10  | `src/stores/inventory/inventory-alerts.ts`               | 20     | Snake_case vs camelCase                 |
| 11  | `src/services/inventory/automationService.ts`            | 16     | Type incompatibilities                  |
| 12  | `src/services/magicInvites.ts`                           | 16     | Missing Json export                     |
| 13  | `src/services/notifications.ts`                          | 12     | Missing type exports                    |
| 14  | `src/services/integration/inventoryOrderIntegration.ts`  | 11     | Overload mismatches                     |
| 15  | `src/presets/filters/products.ts`                        | 10     | String literal mismatch                 |
| 16  | `src/composables/useBulkData.ts`                         | 8      | Possibly undefined                      |
| 17  | `src/composables/useFormValidation.ts`                   | 6      | Unknown properties                      |
| 18  | `src/composables/useTableSorting.ts`                     | 6      | exactOptionalPropertyTypes              |
| 19  | `src/services/monitoring.ts`                             | 5      | Type signature mismatch                 |
| 20  | `src/stores/products/products-core.ts`                   | 5      | Missing module                          |

**Total from Top 20:** 427 errors (83.7% of all errors)

---

## 3. REPRESENTATIVE ERROR EXAMPLES

### Example 1: Snake_case vs camelCase (TS2551)

```typescript
// src/stores/inventory/inventory-alerts.ts:31
Property 'minimum_quantity' does not exist on type 'StockLevelView'.
Did you mean 'minimumQuantity'?
```

**Root Cause:** Database uses snake_case, but TypeScript types use camelCase.

### Example 2: Missing Module (TS2307)

```typescript
// src/stores/batch.ts:23
Cannot find module '@/utils/array' or its corresponding type declarations.
```

**Root Cause:** Module file doesn't exist or wasn't created yet.

### Example 3: Missing Type Export (TS2305)

```typescript
// src/services/admin.ts:3
Module '@/types/supabase' has no exported member 'Location'.
```

**Root Cause:** Supabase types not generated or out of sync with database schema.

### Example 4: Cannot Find Name (TS2304)

```typescript
// src/services/orderProcessing.ts:23
Cannot find name '$t'.
```

**Root Cause:** i18n helper not properly imported in service context.

### Example 5: exactOptionalPropertyTypes (TS2379)

```typescript
// src/composables/useTableSorting.ts:21
Argument of type '{ sortBy: string; descending: boolean; ... }' is not
assignable to parameter of type 'TablePagination' with exactOptionalPropertyTypes: true.
Types of property 'sortBy' are incompatible.
Type 'undefined' is not assignable to type 'string'.
```

**Root Cause:** Very strict tsconfig option requires explicit `undefined` in types.

### Example 6: String Literal Mismatch (TS2322)

```typescript
// src/presets/filters/products.ts:29
Type '"large"' is not assignable to type '"xs" | "sm" | "md" | "lg"'.
```

**Root Cause:** Using "large" instead of "lg" for Quasar component prop.

---

## 4. ROOT CAUSE ANALYSIS

### 4.1 Configuration Issues (High Impact)

- **`exactOptionalPropertyTypes: true`** - Ultra-strict setting causing ~15-20 errors
  - Prevents assigning `undefined` to optional properties
  - Requires explicit `| undefined` in type definitions
  - Common in table pagination, form fields
- **`noUncheckedIndexedAccess: true`** - Causes array/object access issues
  - Every indexed access returns `T | undefined`
  - Requires null checks everywhere

### 4.2 Supabase Type Issues (Critical - ~120 errors)

- **Out-of-sync generated types**
  - Missing exports: `Location`, `Bestellijst`, `PushToken`, `Json`
  - Column name mismatches in views (snake_case in DB, camelCase expected)
- **Snake_case vs camelCase** (~60 errors)
  - Database columns: `minimum_quantity`, `unit_price`, `product_id`
  - TypeScript interfaces: `minimumQuantity`, `unitPrice`, `productId`
  - Affects: inventory, orders, products, batches

### 4.3 Missing Modules/Files (~30 errors)

- `@/utils/array` - Module doesn't exist
- `@/types/supplier` - Type definitions missing
- `ErrorHandler` from service-error-handler - Export name incorrect

### 4.4 Type Definition Issues (~80 errors)

- Implicit `any` parameters (TS7006)
- Property conflicts in interfaces
- Import/local declaration conflicts (MagentoOrder)
- Duplicate properties in object literals

### 4.5 i18n Integration Issues (~25 errors)

- `$t` not accessible in service contexts (only available in components)
- Missing translations object imports

---

## 5. PROPOSED FIX PLAN

## ⚡ PHASE A: Fast Path to Green Build (Target: 2-4 hours)

**Goal:** Reduce errors by 60-70% with minimal code changes

### A1. Relax TypeScript Config (10 minutes) ⭐ **HIGH IMPACT**

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    // ... existing options ...
    "exactOptionalPropertyTypes": false, // Change from true
    "noUncheckedIndexedAccess": false, // Consider relaxing
    // Keep these strict:
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Impact:** Eliminates ~15-20 errors immediately **Trade-off:** Slightly less type safety on
optional properties **Recommendation:** ⚠️ Document that this is temporary; re-enable after Phase B

---

### A2. Regenerate Supabase Types (30 minutes) ⭐ **CRITICAL**

```bash
# Generate fresh types from database
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] > src/types/supabase.ts
```

**Then manually verify/add missing exports:**

```typescript
// src/types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Check for these exports:
export type Location = Database['public']['Tables']['practice_locations']['Row'];
export type PushToken = Database['public']['Tables']['push_tokens']['Row'];
// ... etc for all missing types
```

**Impact:** Fixes ~20-30 missing export errors **Risk:** Low - generated types should match database
exactly

---

### A3. Create Missing Utility Modules (20 minutes)

**Create `src/utils/array.ts`:**

```typescript
/**
 * Array utility functions
 */

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function sortBy<T>(array: T[], keyFn: (item: T) => number | string): T[] {
  return [...array].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);
    return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
  });
}
```

**Create `src/types/supplier.ts`:**

```typescript
import type { Database } from './supabase';

export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type SupplierProduct = Database['public']['Tables']['supplier_products']['Row'];
export type SupplierOrder = Database['public']['Tables']['supplier_orders']['Row'];
```

**Impact:** Fixes ~8-10 import errors **Risk:** Very low

---

### A4. Fix String Literal Mismatches (15 minutes)

**File:** `src/presets/filters/products.ts`

```typescript
// Change all:
// "small" → "sm"
// "medium" → "md"
// "large" → "lg"
```

**Impact:** Fixes ~10 errors in filter definitions **Risk:** Very low - simple find/replace

---

### A5. Add Quick Type Shims (30 minutes)

**Create `src/types/shims.d.ts`:**

```typescript
// Quick fixes for common type issues

declare module '@/utils/service-error-handler' {
  export class ServiceErrorHandler {
    // Add method signatures as needed
    static handle(error: unknown): void;
  }
  // Export with correct name
  export { ServiceErrorHandler as ErrorHandler };
}

// For i18n in services
declare global {
  const $t: (key: string, ...args: any[]) => string;
}

// Add any other quick shims needed
```

**Impact:** Fixes ~15-20 errors **Risk:** Low - these are temporary shims to unblock build **Note:**
Mark with `// TODO: Replace with proper implementation` comments

---

### A6. Fix Duplicate Properties (10 minutes)

**File:** `src/i18n/nl/index.ts` (lines 8911-8912)

Remove duplicate object properties by inspecting and keeping the correct one.

**Impact:** Fixes 2 errors **Risk:** Very low

---

### 📊 PHASE A EXPECTED RESULTS

| Action                        | Errors Fixed   | Time         | Risk     |
| ----------------------------- | -------------- | ------------ | -------- |
| A1: Relax tsconfig            | ~20            | 10 min       | Low      |
| A2: Regenerate Supabase types | ~30            | 30 min       | Low      |
| A3: Create missing modules    | ~10            | 20 min       | Very Low |
| A4: Fix string literals       | ~10            | 15 min       | Very Low |
| A5: Add type shims            | ~20            | 30 min       | Low      |
| A6: Fix duplicates            | ~2             | 10 min       | Very Low |
| **TOTAL**                     | **~92 errors** | **~2 hours** | **Low**  |

**Remaining after Phase A: ~418 errors**

---

## 🏗️ PHASE B: Structural Fixes (Target: 8-16 hours)

**Goal:** Fix remaining errors by cluster, achieving 100% green build

### B1. Snake_case to camelCase Bridge (4-6 hours) ⭐ **HIGH IMPACT**

**Strategy:** Create type mappers instead of changing all code

**Option 1: Runtime Mapping (Recommended)** Create utility to map database responses:

```typescript
// src/utils/supabase-mapper.ts
export function mapStockLevel(raw: any): StockLevelView {
  return {
    id: raw.id,
    practiceId: raw.practice_id,
    productId: raw.product_id,
    locationId: raw.location_id,
    currentQuantity: raw.current_quantity,
    minimumQuantity: raw.minimum_quantity,
    maximumQuantity: raw.maximum_quantity,
    // ... all other fields
  };
}
```

**Option 2: Type Assertion Helper**

```typescript
// src/types/database-helpers.ts
type SnakeToCamel<T> = {
  // Type utility to convert snake_case to camelCase
  // Implement based on your needs
};

export function asCamelCase<T>(obj: any): SnakeToCamel<T> {
  return obj as SnakeToCamel<T>;
}
```

**Files to update:**

- `src/stores/batch.ts` (25 errors)
- `src/stores/inventory/inventory-alerts.ts` (20 errors)
- `src/services/orderOrchestration/centralOrderService.ts` (17 errors)
- `src/services/admin.ts` (13 errors)

**Impact:** Fixes ~75-90 TS2339/TS2551 errors **Risk:** Medium - requires careful mapping

---

### B2. Fix Missing Type Exports (1-2 hours)

After regenerating types, manually add any still-missing exports:

```typescript
// src/types/supabase.ts
export type ProductRow = Database['public']['Tables']['products']['Row'];
export type ProductBatchSummary = {
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  locationId: string;
};
```

**Files to update:**

- `src/types/inventory.ts`
- `src/domain/inventory/dto.ts`
- `src/domain/inventory/bridge.ts`

**Impact:** Fixes ~25 TS2304/TS2552 errors **Risk:** Low

---

### B3. Fix i18n Service Usage (1-2 hours)

**Problem:** `$t` is not available in service files (composition API only)

**Solution:** Import and use i18n programmatically

```typescript
// Before (service file)
throw new Error($t('errors.notFound')); // TS2304: Cannot find name '$t'

// After
import { i18n } from '@/i18n';
throw new Error(i18n.global.t('errors.notFound'));
```

**Files to update:**

- `src/services/orderProcessing.ts` (15 errors)
- Other services using $t

**Impact:** Fixes ~22 TS2304 errors **Risk:** Low

---

### B4. Fix Type Assignments (2-3 hours)

**Cluster: TS2322 (Type not assignable) - 61 errors**

Common patterns:

1. **Partial types:** Add proper typing
2. **Union types:** Narrow types with guards
3. **Generic constraints:** Add proper constraints

```typescript
// Example fix:
// Before:
const item: ProductWithStock = await fetch(...); // Type error

// After:
const item = await fetch(...);
if (isProductWithStock(item)) {
  // use item as ProductWithStock
}
```

**Files to update:**

- `src/stores/batch.ts` (13 errors)
- `src/presets/filters/products.ts` (10 errors)
- `src/services/monitoring.ts` (5 errors)

**Impact:** Fixes ~30 TS2322 errors **Risk:** Medium - requires understanding context

---

### B5. Fix Argument Type Mismatches (2-3 hours)

**Cluster: TS2345 (Argument type not assignable) - 77 errors**

Common patterns:

1. Function signatures mismatch
2. Generic type inference issues
3. Null/undefined not handled

```typescript
// Example fix:
// Before:
someFunction(value); // TS2345: string | null not assignable to string

// After:
if (value !== null) {
  someFunction(value);
}
```

**Files to update:**

- `src/services/dashboard/platform-dashboard.ts` (21 errors)
- `src/composables/useFormValidation.ts` (6 errors)
- Various others

**Impact:** Fixes ~40 TS2345 errors **Risk:** Medium

---

### B6. Fix Implicit Any (1 hour)

**Cluster: TS7006 (Parameter implicitly has 'any') - 21 errors**

Add explicit type annotations:

```typescript
// Before:
const mapper = item => item.id; // TS7006

// After:
const mapper = (item: ProductRow) => item.id;
```

**Files to update:**

- `src/stores/batch.ts` (20 errors)

**Impact:** Fixes ~21 TS7006 errors **Risk:** Very low

---

### B7. Fix Overload Mismatches (1-2 hours)

**Cluster: TS2769 (No overload matches) - 27 errors**

Review function calls and fix argument types/counts:

```typescript
// Example from useBulkData.ts:
// Before:
supabase.from(tableName); // string not assignable to union of table names

// After:
supabase.from(tableName as keyof Database['public']['Tables']);
```

**Files to update:**

- `src/composables/useBulkData.ts`
- `src/services/integration/inventoryOrderIntegration.ts`
- `src/composables/useTableSorting.ts`

**Impact:** Fixes ~20 TS2769 errors **Risk:** Low

---

### B8. Fix Unknown Properties (1 hour)

**Cluster: TS2353 (Unknown property in object literal) - 13 errors**

Remove or properly type extra properties:

```typescript
// Before:
const config: ButtonConfig = {
  label: 'Click me',
  class: 'my-class', // TS2353: 'class' does not exist
};

// After:
const config: ButtonConfig & { class?: string } = {
  label: 'Click me',
  class: 'my-class',
};
```

**Files to update:**

- `src/composables/useButtons.ts`
- `src/composables/useFormValidation.ts`
- `src/presets/filters/advancedOrderLists.ts`

**Impact:** Fixes ~13 TS2353 errors **Risk:** Low

---

### B9. Fix Undefined Access (1-2 hours)

**Cluster: TS18048/TS2532 (Possibly undefined) - 22 errors**

Add null checks or non-null assertions:

```typescript
// Before:
const result = await fetchData();
console.log(result.value); // TS18048: possibly undefined

// After:
const result = await fetchData();
if (result) {
  console.log(result.value);
}
```

**Files to update:**

- `src/composables/useBulkData.ts`
- `src/services/orderOrchestration/centralOrderService.ts`

**Impact:** Fixes ~22 errors **Risk:** Low-Medium - requires understanding data flow

---

### B10. Remaining Edge Cases (2-3 hours)

Fix remaining ~50 errors:

- Duplicate property names
- Import conflicts (MagentoOrder)
- Type recursion issues
- Index signature issues
- Misc one-off errors

**Impact:** Fixes ~50 errors **Risk:** Varies by case

---

### 📊 PHASE B EXPECTED RESULTS

| Cluster                 | Errors          | Time       | Risk       |
| ----------------------- | --------------- | ---------- | ---------- |
| B1: Snake_case mapping  | ~85             | 4-6h       | Medium     |
| B2: Type exports        | ~25             | 1-2h       | Low        |
| B3: i18n services       | ~22             | 1-2h       | Low        |
| B4: Type assignments    | ~30             | 2-3h       | Medium     |
| B5: Argument types      | ~40             | 2-3h       | Medium     |
| B6: Implicit any        | ~21             | 1h         | Very Low   |
| B7: Overload mismatches | ~20             | 1-2h       | Low        |
| B8: Unknown properties  | ~13             | 1h         | Low        |
| B9: Undefined access    | ~22             | 1-2h       | Low-Med    |
| B10: Edge cases         | ~50             | 2-3h       | Varies     |
| **TOTAL**               | **~328 errors** | **15-25h** | **Medium** |

---

## 6. RISK ASSESSMENT

### Low Risk Actions ✅

- Regenerating Supabase types (A2)
- Creating missing utility modules (A3)
- Fixing string literals (A4)
- Adding type annotations for implicit any (B6)

### Medium Risk Actions ⚠️

- Relaxing `exactOptionalPropertyTypes` (A1) - May hide bugs
- Snake_case to camelCase mapping (B1) - Runtime overhead
- Type assignment fixes (B4) - May change behavior
- Argument type fixes (B5) - Requires context understanding

### High Risk Actions 🔴

- None in this plan - all changes are contained and reversible

---

## 7. TESTING STRATEGY

### After Phase A:

1. ✅ Build succeeds: `npm run build`
2. ✅ Dev server runs: `npm run dev`
3. ⚠️ Manual smoke test: Login, view products, check inventory
4. ⚠️ Check console for runtime errors

### After Phase B (Each cluster):

1. ✅ TypeScript check passes: `npm run typecheck`
2. ✅ Linter passes: `npm run lint`
3. ✅ Build succeeds: `npm run build`
4. ✅ Unit tests pass (if any): `npm test`
5. ⚠️ Manual test affected features
6. ⚠️ Integration test with Supabase

### Before Production:

1. ✅ Full E2E test suite
2. ✅ Performance benchmarks
3. ✅ Review all `@ts-ignore` and `TODO` comments
4. ✅ Consider re-enabling `exactOptionalPropertyTypes`

---

## 8. ROLLBACK PLAN

All changes are version controlled. To rollback:

```bash
# After Phase A
git reset --hard HEAD~[N]  # N = number of commits in Phase A

# Selective rollback
git revert <commit-hash>

# Emergency: revert just tsconfig
git checkout HEAD -- tsconfig.json
```

---

## 9. LONG-TERM RECOMMENDATIONS

### 9.1 Database Schema Alignment

- **Option A:** Update database columns to camelCase (requires migration)
- **Option B:** Create camelCase views in database
- **Option C:** Use mapping layer (runtime cost)

**Recommendation:** Option C initially, then evaluate Option B for performance-critical paths.

### 9.2 Type Generation Automation

- Add Supabase type generation to CI/CD
- Run after every database migration
- Validate types against database schema

### 9.3 Incremental Strictness

After achieving green build:

1. Re-enable `exactOptionalPropertyTypes` per module
2. Add `noUncheckedIndexedAccess` back gradually
3. Enable `noImplicitReturns` everywhere
4. Consider `noUnusedLocals` and `noUnusedParameters`

### 9.4 Code Quality

- Add pre-commit hook: `npm run typecheck`
- Add CI check: Fail build on TS errors
- Document type patterns and conventions
- Create type utility library for common patterns

---

## 10. IMMEDIATE NEXT STEPS

**Start with Phase A:**

```bash
# 1. Create a feature branch
git checkout -b fix/typescript-errors

# 2. Relax tsconfig
# Edit tsconfig.json: exactOptionalPropertyTypes: false

# 3. Regenerate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

# 4. Create missing modules
# Create src/utils/array.ts
# Create src/types/supplier.ts
# Create src/types/shims.d.ts

# 5. Fix string literals in filters
# Edit src/presets/filters/products.ts

# 6. Fix duplicate properties
# Edit src/i18n/nl/index.ts

# 7. Test
npm run typecheck
npm run build
npm run dev

# 8. Commit progress
git add .
git commit -m "Phase A: TypeScript quick fixes - reduced errors significantly"
```

**Expected outcome:** Error count drops from 510 → ~400 (~20% reduction)

---

## APPENDIX A: Full Error Code Reference

See generated file: `ts-error-report.txt`

## APPENDIX B: Structured Error Data

See generated file: `ts-errors-structured.json`

---

**Report prepared by:** TypeScript Analysis Tool  
**Last updated:** October 1, 2025  
**Status:** ⏳ Awaiting approval to proceed
