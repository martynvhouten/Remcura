# Remediation Roadmap

## Phase 0 - Audit Prerequisites

- **Goal:** Complete outstanding discovery before remediation begins.
- **Scope:** Finish i18n usage scan (docs/audit/i18n-usage.md), Supabase schema export/diff
  (docs/schema/\*), optional/null mismatch analysis (docs/audit/optional-null-mismatches.md),
  realtime usage inventory (docs/audit/realtime-usage.md), dependency tree (docs/audit/deps.md),
  case usage map (docs/audit/case-usage.md).
- **Acceptance Criteria:** All six artifacts exist, reference current codebase, and are linked from
  docs/audit/00_system_overview.md.
- **Risks:** Tooling quoting issues; stale findings if repo changes mid-audit.
- **Stop Conditions:** Missing Supabase MCP access or inability to enumerate repo files.

## Phase 1 - TypeScript Canonicalisation

- **Goal:** Reduce vue-tsc errors to under 100 clusters focusing on schema sync and camelCase
  alignment.
- **Scope:** src/stores/_, src/services/_, src/types/inventory.ts, src/components/products/_,
  src/components/inventory/_.
- **Acceptance Criteria:** npx vue-tsc --noEmit reports fewer than 100 errors and
  docs/audit/ts-summary.md no longer lists snake_case access in top clusters.
- **Risks:** Divergent Supabase schema; runtime regressions while renaming fields.
- **Stop Conditions:** New database schema released without regenerated types.

## Phase 2 - ESLint Compliance Wave 1

- **Goal:** Cut dominant lint rules (vue/attributes-order, @typescript-eslint/no-explicit-any).
- **Scope:** Phase 1 files plus src/pages/_ and src/composables/_ highlighted in
  docs/audit/lint-summary.md.
- **Acceptance Criteria:** Regenerated lint summary shows fewer than 300 attribute-order hits and
  fewer than 200 no-explicit-any issues.
- **Risks:** Template churn; need for shared lint autofix workflow.
- **Stop Conditions:** No attribute ordering automation available.

## Phase 3 - ESLint Compliance Wave 2

- **Goal:** Drive lint warnings below 100 focusing on slot syntax, unused vars, and console usage.
- **Scope:** All files still failing rules in docs/audit/lint-summary.md (dashboard pages, services,
  utilities).
- **Acceptance Criteria:** ESLint run outputs fewer than 100 warnings with zero vue/v-slot-style,
  no-console, and @typescript-eslint/no-unused-vars hits.
- **Risks:** Need to preserve diagnostic logging; slot changes impacting layout.
- **Stop Conditions:** Stakeholder requirement to keep legacy console statements.

## Phase 4 - Build Reliability

- **Goal:** Restore successful npm run build by resolving missing modules.
- **Scope:** Investigate src/utils/array import from src/stores/batch.ts and audit shared util
  imports.
- **Acceptance Criteria:** npm run build completes and docs/audit/build-log.md updated with success
  entry.
- **Risks:** Additional build blockers uncovered after lint/type fixes.
- **Stop Conditions:** External dependency outage (npm or Supabase).

## Phase 5 - Secondary Hardening

- **Goal:** Align runtime integrations (Supabase realtime typing, optional/null contracts,
  dependency risks).
- **Scope:** src/stores/inventory/_realtime_, mutation services using TablesInsert/Update,
  dependency docs (docs/audit/deps.md).
- **Acceptance Criteria:** Optional/null report empty or justified, realtime usage doc confirms
  typed channels, dependency doc annotated with risk owners.
- **Risks:** Rapid schema evolution; limited automated tests.
- **Stop Conditions:** Priority shift to feature delivery.

## Phase 6 - Verification and Metrics Lock

- **Goal:** Embed tracking and CI safeguards.
- **Scope:** Update docs/plan/metrics.md, ensure CI runs typecheck/lint/build, record baselines in
  docs/audit/00_system_overview.md.
- **Acceptance Criteria:** Metrics doc contains latest counts, CI checklist updated, sign-off
  recorded.
- **Risks:** Metrics drift; CI resource constraints.
- **Stop Conditions:** CI platform migration or freeze.
