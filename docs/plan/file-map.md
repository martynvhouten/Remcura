# Phase File Map

## Phase 0 - Audit Prerequisites

- docs/audit/i18n-usage.md
- docs/schema/supabase.\*
- docs/audit/optional-null-mismatches.md
- docs/audit/realtime-usage.md
- docs/audit/deps.md
- docs/audit/case-usage.md

## Phase 1 - TypeScript Canonicalisation

- src/stores/\*\*
- src/services/\*\*
- src/types/inventory.ts
- src/components/products/\*\*
- src/components/inventory/\*\*
- docs/audit/ts-summary.md
- docs/audit/ts-errors.json

## Phase 2 - ESLint Compliance Wave 1

- src/pages/\*\*
- src/composables/\*\*
- docs/audit/lint-raw.json
- docs/audit/lint-summary.md

## Phase 3 - ESLint Compliance Wave 2

- src/\*\*
- docs/audit/lint-summary.md

## Phase 4 - Build Reliability

- src/stores/batch.ts
- src/utils/\*\*
- docs/audit/build-log.md

## Phase 5 - Secondary Hardening

- src/stores/inventory/**realtime**
- src/services/\*\*
- docs/audit/deps.md
- docs/audit/optional-null-mismatches.md

## Phase 6 - Verification and Metrics Lock

- docs/plan/metrics.md
- docs/audit/00_system_overview.md
- CI configuration
