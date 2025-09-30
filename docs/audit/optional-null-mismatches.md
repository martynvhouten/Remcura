# Optional vs. Null Usage Check

Scan looks for `undefined` assignments inside objects typed as `TablesInsert<T>` or
`TablesUpdate<T>`, which may violate Supabase optional/null expectations.

- Insert payloads checked: 14
- Update payloads checked: 10
- Insert issues flagged: 5
- Update issues flagged: 0

## TablesInsert Findings

- `src/services/stockMovements.ts`
  - L76 · table `stock_movements` · reference_id: request.reference_id ?? undefined,
  - L77 · table `stock_movements` · reason: request.reason ?? undefined,
  - L78 · table `stock_movements` · notes: request.notes ?? undefined,
  - L79 · table `stock_movements` · batch_number: request.batch_number ?? undefined,
  - L80 · table `stock_movements` · expiry_date: request.expiry_date ?? undefined,

## TablesUpdate Findings

_No `undefined` assignments detected._

## Notes

- Review each flagged line to ensure nullability matches Supabase schema. If the column allows
  nulls, prefer explicit `null` over `undefined`.
