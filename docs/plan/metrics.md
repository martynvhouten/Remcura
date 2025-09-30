# Metrics Tracking

## TypeScript

- Baseline: 327 clusters / 989 errors (docs/audit/ts-summary.md).
- Target: <100 clusters post Phase 1.
- Tracking: Re-run npx vue-tsc --noEmit and refresh docs/audit/ts-summary.md each phase.

## ESLint

- Baseline: 1485 issues (docs/audit/lint-summary.md).
- Phase 2 target: <300 vue/attributes-order, <200 @typescript-eslint/no-explicit-any.
- Phase 3 target: <100 total warnings.
- Tracking: Regenerate docs/audit/lint-raw.json and lint-summary.md after each phase.

## Build

- Baseline: npm run build fails (missing src/utils/array), see docs/audit/build-log.md.
- Target: Successful build logged with timestamp after Phase 4.
- Tracking: Append build outcomes to docs/audit/build-log.md.

## Reporting

- Update this metrics file and docs/audit/00_system_overview.md after each phase.
- Ensure CI pipeline records typecheck/lint/build status following Phase 6.
