# TypeScript Error Summary

- Generated: 2025-09-30T14:50:13.878Z
- Total errors: 989
- Unique module/error clusters: 327

## Top Clusters

- src/components/products/ProductDetailsDialog.vue Â· TS2339 Â· 42 occurrences
  - Sample: L15 C25 - Property 'image_url' does not exist on type 'ProductWithStock'.
  - Variants: Property 'image_url' does not exist on type 'ProductWithStock'.; Property
    'description' does not exist on type 'ProductWithStock'.; Property 'gtin' does not exist on type
    'ProductWithStock'. ...
- src/stores/batch.ts Â· TS2339 Â· 25 occurrences
  - Sample: L319 C27 - Property 'practice_id' does not exist on type '{ available_quantity: number;
    batch_id: string; batch_number: string; expiry_date: string; use_quantity: numbe...
  - Variants: Property 'practice_id' does not exist on type '{ available_quantity: number; batch_id:
    string; batch_number: string; expiry_date: string; use_quantity: number; }'.; Property
    'product_id' does not exist on type '{ available_quantity: number; batch_id: string;
    batch_number: string; expiry_date: string; use_quantity: number; }'.; Property 'location_id'
    does not exist on type '{ available_quantity: number; batch_id: string; batch_number: string;
    expiry_date: string; use_quantity: number; }'. ...
- src/stores/batch.ts Â· TS7006 Â· 20 occurrences
  - Sample: L46 C26 - Parameter 'batch' implicitly has an 'any' type.
  - Variants: Parameter 'batch' implicitly has an 'any' type.; Parameter 'total' implicitly has an
    'any' type.; Parameter 'batchRow' implicitly has an 'any' type. ...
- src/stores/inventory/inventory-alerts.ts Â· TS2551 Â· 20 occurrences
  - Sample: L31 C39 - Property 'minimum_quantity' does not exist on type 'StockLevelView'. Did you
    mean 'minimumQuantity'?
  - Variants: Property 'minimum_quantity' does not exist on type 'StockLevelView'. Did you mean
    'minimumQuantity'?; Property 'current_quantity' does not exist on type 'StockLevelView'. Did you
    mean 'currentQuantity'?; Property 'product_id' does not exist on type 'StockLevelView'. Did you
    mean 'productId'? ...
- src/types/inventory.ts Â· TS2339 Â· 19 occurrences
  - Sample: L157 C20 - Property 'minimum_quantity' does not exist on type '{ available_quantity:
    number | null; batch_number: string; created_at: string | null; created_by: string ...
  - Variants: Property 'minimum_quantity' does not exist on type '{ available_quantity: number |
    null; batch_number: string; created_at: string | null; created_by: string | null; currency:
    string | null; current_quantity: number; expiry_date: string; ... 17 more ...; updated_at:
    string | null; } | ProductBatchRowWithRelations'.; Property 'maximum_quantity' does not exist on
    type '{ available_quantity: number | null; batch_number: string; created_at: string | null;
    created_by: string | null; currency: string | null; current_quantity: number; expiry_date:
    string; ... 17 more ...; updated_at: string | null; } | ProductBatchRowWithRelations'.; Property
    'reorder_point' does not exist on type '{ available_quantity: number | null; batch_number:
    string; created_at: string | null; created_by: string | null; currency: string | null;
    current_quantity: number; expiry_date: string; ... 17 more ...; updated_at: string | null; } |
    ProductBatchRowWithRelations'. ...
- src/components/inventory/CountingEntryWithBatch.vue Â· TS2339 Â· 18 occurrences
  - Sample: L7 C37 - Property 'product' does not exist on type
    'CreateComponentPublicInstanceWithMixins<ToResolvedProps<Props, TypeEmitsToOptions<Emits>>, {
    BaseCard: DefineCompo...
  - Variants: Property 'product' does not exist on type
    'CreateComponentPublicInstanceWithMixins<ToResolvedProps<Props, TypeEmitsToOptions<Emits>>, {
    BaseCard: DefineComponent<{}, {}, any>; BatchInput: DefineComponent<Props, {}, {}, {}, ... 15
    more ..., any>; ... 24 more ...; saveEntry: () => Promise<...>; }, ... 23 more ..., { ...; }>'.;
    Property 'locationId' does not exist on type
    'CreateComponentPublicInstanceWithMixins<ToResolvedProps<Props, TypeEmitsToOptions<Emits>>, {
    BaseCard: DefineComponent<{}, {}, any>; BatchInput: DefineComponent<Props, {}, {}, {}, ... 15
    more ..., any>; ... 24 more ...; saveEntry: () => Promise<...>; }, ... 23 more ..., { ...; }>'.;
    Property 'product' does not exist on type 'Readonly<MappedOmit<LooseRequired<Props>,
    "viewMode">> & { readonly viewMode: "full" | "lite"; } & {}'. ...
- src/components/inventory/QuickAdjustmentDialog.vue Â· TS2339 Â· 17 occurrences
  - Sample: L860 C24 - Property 'barcode' does not exist on type '{ id: string; practiceId: string;
    sku: string; name: string; category: string | null; brand: string | null; unit: ...
  - Variants: Property 'barcode' does not exist on type '{ id: string; practiceId: string; sku:
    string; name: string; category: string | null; brand: string | null; unit: string | null;
    totalStock: number; availableStock: number; reservedStock: number; ... 9 more ...; raw?: { ...;
    }; }'.; Property 'image_url' does not exist on type '{ id: string; practiceId: string; sku:
    string; name: string; category: string | null; brand: string | null; unit: string | null;
    totalStock: number; availableStock: number; reservedStock: number; ... 9 more ...; raw?: { ...;
    }; }'.; Property 'current_quantity' does not exist on type '{ id: string; practiceId: string;
    sku: string; name: string; category: string | null; brand: string | null; unit: string | null;
    totalStock: number; availableStock: number; reservedStock: number; ... 9 more ...; raw?: { ...;
    }; }'. ...
- src/pages/OrderListsPage.vue Â· TS2304 Â· 17 occurrences
  - Sample: L682 C20 - Cannot find name '$t'.
- src/services/orderOrchestration/centralOrderService.ts Â· TS2339 Â· 17 occurrences
  - Sample: L101 C68 - Property 'unit_price' does not exist on type 'ReorderSuggestion'.
  - Variants: Property 'unit_price' does not exist on type 'ReorderSuggestion'.; Property
    'total_value' does not exist on type 'SupplierOrder'.; Property 'id' does not exist on type
    'SelectQueryError<"column 'order_reference' does not exist on 'supplier_orders'.">'. ...
- src/services/orderProcessing.ts Â· TS2304 Â· 15 occurrences
  - Sample: L23 C23 - Cannot find name '$t'.
  - Variants: Cannot find name '$t'.; Cannot find name 'MagentoOrder'.
- src/pages/auth/LoginPage.vue Â· TS2339 Â· 14 occurrences
  - Sample: L10 C30 - Property 'value' does not exist on type 'FieldValidation'.
  - Variants: Property 'value' does not exist on type 'FieldValidation'.; Property 'error' does not
    exist on type 'FieldValidation'.
- src/pages/OrdersPage.vue Â· TS2339 Â· 14 occurrences
  - Sample: L277 C42 - Property 'from' does not exist on type 'string | number | true | Date |
    (string | number)[] | { min?: number; max?: number; } | { from?: Date; to?: Date; }'.
  - Variants: Property 'from' does not exist on type 'string | number | true | Date | (string |
    number)[] | { min?: number; max?: number; } | { from?: Date; to?: Date; }'.; Property 'to' does
    not exist on type 'string | number | true | Date | (string | number)[] | { min?: number; max?:
    number; } | { from?: Date; to?: Date; }'.; Property 'min' does not exist on type 'string |
    number | true | Date | (string | number)[] | { min?: number; max?: number; } | { from?: Date;
    to?: Date; }'. ...
- src/services/admin.ts Â· TS2551 Â· 13 occurrences
  - Sample: L562 C38 - Property 'event_data' does not exist on type 'UsageAnalytics'. Did you mean
    'eventData'?
  - Variants: Property 'event_data' does not exist on type 'UsageAnalytics'. Did you mean
    'eventData'?; Property 'practice_id' does not exist on type 'UsageAnalytics'. Did you mean
    'practiceId'?; Property 'user_id' does not exist on type 'UsageAnalytics'. Did you mean
    'userId'? ...
- src/stores/batch.ts Â· TS2322 Â· 13 occurrences
  - Sample: L178 C11 - Type '{ id: string; name: string | null; sku: string | null; } | null' is not
    assignable to type 'Pick<{ active: boolean | null; barcode: string | null; base...
  - Variants: Type '{ id: string; name: string | null; sku: string | null; } | null' is not
    assignable to type 'Pick<{ active: boolean | null; barcode: string | null; base_unit_indicator:
    boolean | null; brand: string | null; category: string | null; country_of_origin: string | null;
    created_at: string | null; ... 24 more ...; updated_at: string | null; }, "name" | "sku"> | null
    | undefined'.; Type '{ id: string; name: string | null; } | null' is not assignable to type
    'Pick<{ access_code: string | null; address: string | null; allows_negative_stock: boolean |
    null; code: string; created_at: string | null; created_by: string | null; description: string |
    null; ... 12 more ...; updated_by: string | null; }, "name"> | null | undefined'.; Type '{ id:
    string; name: string | null; } | null' is not assignable to type 'Pick<{ address: string | null;
    api_endpoint: string | null; api_key_encrypted: string | null; api_type: string | null;
    auto_sync_enabled: boolean | null; business_registration: string | null; ... 27 more ...;
    website: string | null; }, "name"> | null | undefined'. ...
- src/services/admin.ts Â· TS2345 Â· 12 occurrences
  - Sample: L84 C45 - Argument of type '"practice"' is not assignable to parameter of type
    'ResourceType'.
  - Variants: Argument of type '"practice"' is not assignable to parameter of type 'ResourceType'.;
    Argument of type '"bestellijst"' is not assignable to parameter of type 'ResourceType'.
- src/services/orderOrchestration/centralOrderService.ts Â· TS18048 Â· 12 occurrences
  - Sample: L462 C22 - 'order' is possibly 'undefined'.
  - Variants: 'order' is possibly 'undefined'.; 'result' is possibly 'undefined'.
- src/presets/filters/products.ts Â· TS2322 Â· 10 occurrences
  - Sample: L29 C7 - Type '"large"' is not assignable to type '"xs" | "sm" | "md" | "lg"'.
  - Variants: Type '"large"' is not assignable to type '"xs" | "sm" | "md" | "lg"'.; Type '"medium"'
    is not assignable to type '"xs" | "sm" | "md" | "lg"'.; Type '"small"' is not assignable to type
    '"xs" | "sm" | "md" | "lg"'.
- src/pages/inventory/CountingSessionPage.vue Â· TS2339 Â· 9 occurrences
  - Sample: L25 C28 - Property 'products_counted' does not exist on type '{ approved_at: string |
    null; approved_by: string | null; completed_at: string | null; completed_by: stri...
  - Variants: Property 'products_counted' does not exist on type '{ approved_at: string | null;
    approved_by: string | null; completed_at: string | null; completed_by: string | null;
    count_all_products: boolean | null; created_at: string | null; ... 17 more ...;
    total_discrepancy_value?: number | null; }'.; Property 'session_type' does not exist on type '{
    approved_at: string | null; approved_by: string | null; completed_at: string | null;
    completed_by: string | null; count_all_products: boolean | null; created_at: string | null; ...
    17 more ...; total_discrepancy_value?: number | null; }'.; Property 'discrepancies_found' does
    not exist on type '{ approved_at: string | null; approved_by: string | null; completed_at:
    string | null; completed_by: string | null; count_all_products: boolean | null; created_at:
    string | null; ... 17 more ...; total_discrepancy_value?: number | null; }'. ...
- src/components/inventory/StockTransferDialog.vue Â· TS2339 Â· 8 occurrences
  - Sample: L60 C39 - Property 'image_url' does not exist on type 'ProductWithStock'.
  - Variants: Property 'image_url' does not exist on type 'ProductWithStock'.; Property
    'requires_batch_tracking' does not exist on type 'ProductWithStock'.; Property
    'getProductBatches' does not exist on type 'Store<"inventory", Pick<{ stockLevels: Ref<{ id:
    string; practiceId: string; productId: string; locationId: string; currentQuantity: number;
    availableQuantity: number; reservedQuantity: number; minimumQuantity: number; ... 16 more ...;
    raw?: { ...; }; }[], StockLevelView[] | { ...; }[]>; ... 17 more ...; refreshData...'. ...
- src/services/inventory/automationService.ts Â· TS2345 Â· 8 occurrences
  - Sample: L60 C42 - Argument of type 'undefined' is not assignable to parameter of type 'string'.
  - Variants: Argument of type 'undefined' is not assignable to parameter of type 'string'.;
    Argument of type 'unknown' is not assignable to parameter of type 'LogData'.; Argument of type
    '"maximum_quantity"' is not assignable to parameter of type '"get_order_advice" |
    "calculate_next_run_time" | "calculate_order_suggestions" | "check_and_create_stock_alerts" |
    "check_user_permission" | "check_user_permission_v2" | ... 29 more ... |
    "validate_personal_magic_code"'.

## Observations

- Heavy reliance on legacy snake_case fields from Supabase types drives most TS2339 failures in
  stores and components.
- Several services reference missing exports from @/types/supabase, suggesting generated types are
  out of sync with the database schema.
- exactOptionalPropertyTypes surfaces many string-or-undefined to string assignment issues across
  forms and stores.
- Supabase Realtime handlers instantiate channels with plain objects lacking the required
  RealtimeClient shape.
- Import conflicts and missing helper modules (@/types/supplier, src/stores/product) point to
  incomplete migrations.
