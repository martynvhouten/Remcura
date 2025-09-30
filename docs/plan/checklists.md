# Phase Checklists

## Phase 0 - Audit Prerequisites

- Complete docs/audit/i18n-usage.md listing ( usage.
- Export Supabase schema via MCP to docs/schema and diff against supabase.generated.ts.
- Document optional vs null findings in docs/audit/optional-null-mismatches.md.
- Prepare realtime usage inventory docs/audit/realtime-usage.md.
- Capture dependency tree in docs/audit/deps.md.
- Publish snake_case vs camelCase map docs/audit/case-usage.md.

## Phase 1 - TypeScript Canonicalisation

- Regenerate Supabase types to match current schema.
- Replace snake_case property access in stores/services/components noted in ts-summary.
- Update converters in src/types/inventory.ts to expose camelCase DTOs.
- Restore missing helper modules (like @/types/supplier and src/utils/array) or adjust imports.
- Re-run npx vue-tsc --noEmit and update docs/audit/ts-summary.md.

## Phase 2 - ESLint Compliance Wave 1

- Auto-fix attribute ordering across pages/components targeting fewer than 300 hits.
- Replace any hotspots with typed interfaces targeting fewer than 200 occurrences.
- Regenerate docs/audit/lint-raw.json and lint-summary.md with new counts.
- Log before/after metrics in roadmap/metrics docs.

## Phase 3 - ESLint Compliance Wave 2

- Remove or gate console usage via logger wrappers.
- Convert remaining v-slot syntax to shorthand #.
- Resolve unused vars and ban-ts-comment warnings.
- Confirm eslint warnings under 100 and document in summary.

## Phase 4 - Build Reliability

- Provide or replace src/utils/array referenced by src/stores/batch.ts.
- Audit build-time imports for similar missing modules.
- Run npm run build and update docs/audit/build-log.md with status.

## Phase 5 - Secondary Hardening

- Apply optional/null adjustments identified in audit doc.
- Align realtime channel creation with typed API per realtime usage doc.
- Annotate dependency risks in docs/audit/deps.md.

## Phase 6 - Verification and Metrics Lock

- Record final TS error count in docs/plan/metrics.md.
- Record final lint warning count in docs/plan/metrics.md.
- Record build status/date in docs/plan/metrics.md.
- Update docs/audit/00_system_overview.md with remediation links.
- Ensure CI runs lint/typecheck/build and document steps in metrics file.
