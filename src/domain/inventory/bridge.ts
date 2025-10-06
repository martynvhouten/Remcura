import type { Tables } from '@/types/supabase.generated';
import {
  ProductBatchDTO,
  ProductDTO,
  ProductBatchRow,
  StockLevelDTO,
  StockLevelRow,
  PracticeLocationDTO,
  PracticeLocationRow,
  SupplierDTO,
  SupplierRow,
  SupplierProductDTO,
  SupplierProductRow,
  OrderListDTO,
  OrderListRow,
  OrderListItemDTO,
  OrderListItemRow,
  CountingSessionDTO,
  CountingSessionRow,
  CountingEntryDTO,
  CountingEntryRow,
} from './dto';

const toDateString = (
  value: Date | string | null | undefined
): string | null => {
  if (!value) return null;
  return typeof value === 'string' ? value : value.toISOString();
};

export const mapProductBatchRow = (
  row: ProductBatchRow,
  relations?: {
    product?: Pick<Tables<'products'>, 'name' | 'sku'> | null;
    location?: Pick<Tables<'practice_locations'>, 'name'> | null;
    supplier?: Pick<Tables<'suppliers'>, 'name'> | null;
  }
): ProductBatchDTO => ({
  id: row.id,
  practiceId: row.practice_id,
  productId: row.product_id,
  locationId: row.location_id,
  supplierId: row.supplier_id ?? null,
  batchNumber: row.batch_number,
  supplierBatchNumber: row.supplier_batch_number ?? null,
  expiryDate: row.expiry_date,
  receivedDate: row.received_date,
  initialQuantity: Number(row.initial_quantity),
  currentQuantity: Number(row.current_quantity),
  reservedQuantity: Number(row.reserved_quantity ?? 0),
  availableQuantity:
    row.available_quantity !== null ? Number(row.available_quantity) : null,
  unitCost: row.unit_cost !== null ? Number(row.unit_cost) : null,
  totalCost: row.total_cost !== null ? Number(row.total_cost) : null,
  currency: row.currency ?? null,
  status: row.status ?? null,
  purchaseOrderNumber: row.purchase_order_number ?? null,
  invoiceNumber: row.invoice_number ?? null,
  qualityCheckPassed: row.quality_check_passed ?? null,
  qualityNotes: row.quality_notes ?? null,
  quarantineUntil: row.quarantine_until ?? null,
  createdAt: toDateString(row.created_at),
  updatedAt: toDateString(row.updated_at),
  supplierName: relations?.supplier?.name ?? null,
  productName: relations?.product?.name ?? null,
  productSku: relations?.product?.sku ?? null,
  locationName: relations?.location?.name ?? null,
  daysUntilExpiry: Math.ceil(
    (new Date(row.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ),
  urgencyLevel: (() => {
    const days = Math.ceil(
      (new Date(row.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return 'expired' as const;
    if (days <= 7) return 'critical' as const;
    if (days <= 30) return 'high' as const;
    if (days <= 90) return 'warning' as const;
    if (days <= 180) return 'low' as const;
    return 'normal' as const;
  })(),
});

export const mapStockLevelRow = (
  row: StockLevelRow,
  relations?: {
    product?: Pick<Tables<'products'>, 'name' | 'sku'> | null;
    location?: Pick<Tables<'practice_locations'>, 'name'> | null;
  }
): StockLevelDTO => ({
  id: row.id,
  practiceId: row.practice_id,
  productId: row.product_id,
  locationId: row.location_id,
  currentQuantity: Number(row.current_quantity ?? 0),
  reservedQuantity: Number(row.reserved_quantity ?? 0),
  availableQuantity:
    row.available_quantity !== null ? Number(row.available_quantity) : null,
  minimumQuantity: Number(row.minimum_quantity ?? 0),
  maximumQuantity:
    row.maximum_quantity !== null ? Number(row.maximum_quantity) : null,
  reorderPoint: row.reorder_point !== null ? Number(row.reorder_point) : null,
  preferredSupplierId: row.preferred_supplier_id ?? null,
  lastCountedAt: toDateString(row.last_counted_at),
  lastMovementAt: toDateString(row.last_movement_at),
  lastOrderedAt: toDateString(row.last_ordered_at),
  createdAt: toDateString(row.created_at),
  updatedAt: toDateString(row.updated_at),
  productName: relations?.product?.name ?? null,
  productSku: relations?.product?.sku ?? null,
  locationName: relations?.location?.name ?? null,
});

export const mapProductRow = (
  row: Tables<'products'>,
  relations?: {
    practice?: Pick<Tables<'practices'>, 'id'> | null;
  }
): ProductDTO => ({
  id: row.id,
  practiceId: relations?.practice?.id ?? null,
  sku: row.sku,
  name: row.name,
  category: row.category ?? null,
  brand: row.brand ?? null,
  unit: row.unit ?? null,
  price: row.price !== null ? Number(row.price) : null,
  requiresBatchTracking: row.requires_batch_tracking,
  gtin: row.gtin ?? null,
  gpcBrickCode: row.gpc_brick_code ?? null,
  countryOfOrigin: row.country_of_origin ?? null,
  productLifecycleStatus: row.product_lifecycle_status ?? null,
  lastSyncedAt: toDateString(row.last_synced_at),
  createdAt: toDateString(row.created_at),
  updatedAt: toDateString(row.updated_at),
  preferredSupplierId: row.preferred_supplier_id ?? null,
  imageUrl: row.image_url ?? null,
});

export const mapPracticeLocationRow = (
  row: PracticeLocationRow
): PracticeLocationDTO => ({
  id: row.id,
  practiceId: row.practice_id,
  name: row.name,
  code: row.code,
  locationType: row.location_type ?? null,
  isActive: row.is_active ?? null,
  isMainLocation: row.is_main_location ?? null,
  requiresCounting: row.requires_counting ?? null,
  allowsNegativeStock: row.allows_negative_stock ?? null,
  restrictedAccess: row.restricted_access ?? null,
  accessCode: row.access_code ?? null,
});

export const mapSupplierRow = (row: SupplierRow): SupplierDTO => ({
  id: row.id,
  name: row.name,
  code: row.code,
  contactEmail: row.contact_email ?? null,
  contactPhone: row.contact_phone ?? null,
  contactPerson: row.contact_person ?? null,
  country: row.country ?? null,
  paymentTerms: row.payment_terms ?? null,
  minimumOrderAmount:
    row.minimum_order_amount !== null ? Number(row.minimum_order_amount) : null,
  shippingCost: row.shipping_cost !== null ? Number(row.shipping_cost) : null,
  freeShippingThreshold:
    row.free_shipping_threshold !== null
      ? Number(row.free_shipping_threshold)
      : null,
  isActive: row.is_active ?? null,
  integrationType: row.integration_type ?? null,
  orderMethod: row.order_method ?? null,
  autoSyncEnabled: row.auto_sync_enabled ?? null,
  lastSyncAt: toDateString(row.last_sync_at),
});

export const mapSupplierProductRow = (
  row: SupplierProductRow
): SupplierProductDTO => ({
  id: row.id,
  supplierId: row.supplier_id,
  productId: row.product_id,
  supplierSku: row.supplier_sku,
  supplierName: row.supplier_name ?? null,
  costPrice: row.cost_price !== null ? Number(row.cost_price) : null,
  currency: row.currency ?? null,
  minimumOrderQuantity: row.minimum_order_quantity ?? null,
  orderMultiple: row.order_multiple ?? null,
  leadTimeDays: row.lead_time_days ?? null,
  isAvailable: row.is_available ?? null,
  isPreferred: row.is_preferred ?? null,
  lastSyncedAt: toDateString(row.last_synced_at),
});

export const mapOrderListRow = (row: OrderListRow): OrderListDTO => ({
  id: row.id,
  practiceId: row.practice_id,
  locationId: row.location_id,
  supplierId: row.supplier_id ?? null,
  name: row.name,
  description: row.description ?? null,
  status: row.status ?? null,
  totalItems: row.total_items ?? null,
  totalValue: row.total_value !== null ? Number(row.total_value) : null,
  createdBy: row.created_by ?? null,
  listType: row.list_type ?? null,
  autoReorderEnabled: row.auto_reorder_enabled ?? null,
  reorderFrequencyDays: row.reorder_frequency_days ?? null,
  lastAutoCheck: toDateString(row.last_auto_check),
  minOrderValue:
    row.min_order_value !== null ? Number(row.min_order_value) : null,
  preferredOrderDay: row.preferred_order_day ?? null,
  orderCutoffTime: row.order_cutoff_time ?? null,
  tags: row.tags ?? null,
  isTemplate: row.is_template ?? null,
  templateName: row.template_name ?? null,
  createdAt: toDateString(row.created_at),
  updatedAt: toDateString(row.updated_at),
});

export const mapOrderListItemRow = (
  row: OrderListItemRow
): OrderListItemDTO => ({
  id: row.id,
  orderListId: row.order_list_id,
  productId: row.product_id,
  supplierProductId: row.supplier_product_id ?? null,
  suggestedQuantity: Number(row.suggested_quantity),
  orderedQuantity:
    row.ordered_quantity !== null ? Number(row.ordered_quantity) : null,
  receivedQuantity:
    row.received_quantity !== null ? Number(row.received_quantity) : null,
  unitPrice: row.unit_price !== null ? Number(row.unit_price) : null,
  totalPrice: row.total_price !== null ? Number(row.total_price) : null,
  status: row.status ?? null,
  notes: row.notes ?? null,
  minimumStock: row.minimum_stock !== null ? Number(row.minimum_stock) : null,
  maximumStock: row.maximum_stock !== null ? Number(row.maximum_stock) : null,
  currentStock: row.current_stock !== null ? Number(row.current_stock) : null,
  reorderPoint: row.reorder_point !== null ? Number(row.reorder_point) : null,
  preferredSupplierId: row.preferred_supplier_id ?? null,
  alternativeSuppliers: row.alternative_suppliers ?? null,
  lastOrderDate: toDateString(row.last_order_date),
  lastOrderQuantity:
    row.last_order_quantity !== null ? Number(row.last_order_quantity) : null,
  averageConsumption:
    row.average_consumption !== null ? Number(row.average_consumption) : null,
  leadTimeDays: row.lead_time_days ?? null,
  urgencyLevel: row.urgency_level ?? null,
  autoSuggestEnabled: row.auto_suggest_enabled ?? null,
  manualOverride: row.manual_override ?? null,
  overrideReason: row.override_reason ?? null,
  createdAt: toDateString(row.created_at),
});

export const mapCountingSessionRow = (
  row: CountingSessionRow
): CountingSessionDTO => ({
  id: row.id,
  practiceId: row.practice_id,
  locationId: row.location_id,
  name: row.name,
  description: row.description ?? null,
  status: row.status ?? null,
  countAllProducts: row.count_all_products ?? null,
  productCategoryFilter: row.product_category_filter ?? null,
  specificProductIds: row.specific_product_ids ?? null,
  startedAt: toDateString(row.started_at),
  completedAt: toDateString(row.completed_at),
  approvedAt: toDateString(row.approved_at),
  totalProductsCounted: row.total_products_counted ?? null,
  productsWithVariance: row.products_with_variance ?? null,
  totalVarianceValue:
    row.total_variance_value !== null ? Number(row.total_variance_value) : null,
  createdBy: row.created_by ?? null,
  startedBy: row.started_by ?? null,
  completedBy: row.completed_by ?? null,
  approvedBy: row.approved_by ?? null,
  createdAt: toDateString(row.created_at),
  updatedAt: toDateString(row.updated_at),
});

export const mapCountingEntryRow = (
  row: CountingEntryRow
): CountingEntryDTO => ({
  id: row.id,
  countingSessionId: row.counting_session_id,
  practiceId: row.practice_id,
  locationId: row.location_id,
  productId: row.product_id,
  systemQuantity: Number(row.system_quantity),
  countedQuantity: Number(row.counted_quantity),
  varianceQuantity:
    row.variance_quantity !== null ? Number(row.variance_quantity) : null,
  batchNumber: row.batch_number ?? null,
  expiryDate: row.expiry_date ?? null,
  notes: row.notes ?? null,
  confidenceLevel: row.confidence_level ?? null,
  countedBy: row.counted_by ?? null,
  countedAt: toDateString(row.counted_at),
  verifiedBy: row.verified_by ?? null,
  verifiedAt: toDateString(row.verified_at),
  createdAt: toDateString(row.created_at),
  updatedAt: toDateString(row.updated_at),
});

// Re-export DTOs for convenience
export type {
  ProductBatchDTO,
  ProductDTO,
  StockLevelDTO,
  PracticeLocationDTO,
  SupplierDTO,
  SupplierProductDTO,
  OrderListDTO,
  OrderListItemDTO,
  CountingSessionDTO,
  CountingEntryDTO,
};
