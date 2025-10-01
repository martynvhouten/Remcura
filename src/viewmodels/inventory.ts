/**
 * Inventory View Models
 * Maps Supabase snake_case data to camelCase DTOs for safe template usage
 * No business logic - pure data transformation only
 */

import type { Tables } from '@/types/supabase.generated';

// ============================================================================
// Product Batch View Models
// ============================================================================

export interface ProductBatchViewModel {
  id: string;
  practiceId: string;
  productId: string;
  locationId: string;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  initialQuantity: number;
  receivedDate: string;
  supplierId: string | null;
  unitCost: number | null;
  totalCost: number | null;
  currency: string | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Convert Supabase product_batches row to camelCase ViewModel
 */
export function toProductBatchViewModel(
  row: Tables<'product_batches'>
): ProductBatchViewModel {
  return {
    id: row.id,
    practiceId: row.practice_id,
    productId: row.product_id,
    locationId: row.location_id,
    batchNumber: row.batch_number,
    expiryDate: row.expiry_date,
    currentQuantity: row.current_quantity,
    availableQuantity: row.available_quantity ?? row.current_quantity,
    reservedQuantity: row.reserved_quantity ?? 0,
    initialQuantity: row.initial_quantity,
    receivedDate: row.received_date,
    supplierId: row.supplier_id ?? null,
    unitCost: row.unit_cost ?? null,
    totalCost: row.total_cost ?? null,
    currency: row.currency ?? null,
    status: row.status ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Stock Level View Models
// ============================================================================

export interface StockLevelViewModel {
  id: string;
  practiceId: string;
  productId: string;
  locationId: string;
  currentQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number | null;
  reorderPoint: number | null;
  lastCountedAt: string | null;
  lastMovementAt: string | null;
  lastOrderedAt: string | null;
  preferredSupplierId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Convert Supabase stock_levels row to camelCase ViewModel
 */
export function toStockLevelViewModel(
  row: Tables<'stock_levels'>
): StockLevelViewModel {
  return {
    id: row.id,
    practiceId: row.practice_id,
    productId: row.product_id,
    locationId: row.location_id,
    currentQuantity: row.current_quantity ?? 0,
    availableQuantity: row.available_quantity ?? 0,
    reservedQuantity: row.reserved_quantity ?? 0,
    minimumQuantity: row.minimum_quantity ?? 0,
    maximumQuantity: row.maximum_quantity ?? null,
    reorderPoint: row.reorder_point ?? null,
    lastCountedAt: row.last_counted_at,
    lastMovementAt: row.last_movement_at,
    lastOrderedAt: row.last_ordered_at,
    preferredSupplierId: row.preferred_supplier_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Counting Entry View Models
// ============================================================================

export interface CountingEntryViewModel {
  id: string;
  countingSessionId: string;
  practiceId: string;
  productId: string;
  locationId: string;
  batchNumber: string | null;
  expiryDate: string | null;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number | null;
  notes: string | null;
  countedBy: string | null;
  countedAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  confidenceLevel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Convert Supabase counting_entries row to camelCase ViewModel
 */
export function toCountingEntryViewModel(
  row: Tables<'counting_entries'>
): CountingEntryViewModel {
  return {
    id: row.id,
    countingSessionId: row.counting_session_id,
    practiceId: row.practice_id,
    productId: row.product_id,
    locationId: row.location_id,
    batchNumber: row.batch_number ?? null,
    expiryDate: row.expiry_date ?? null,
    systemQuantity: row.system_quantity,
    countedQuantity: row.counted_quantity,
    varianceQuantity: row.variance_quantity ?? null,
    notes: row.notes ?? null,
    countedBy: row.counted_by ?? null,
    countedAt: row.counted_at ?? null,
    verifiedBy: row.verified_by ?? null,
    verifiedAt: row.verified_at ?? null,
    confidenceLevel: row.confidence_level ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Product View Models
// ============================================================================

export interface ProductViewModel {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  brand: string | null;
  unit: string | null;
  barcode: string | null;
  gtin: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  active: boolean;
  requiresBatchTracking: boolean;
  preferredSupplierId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Convert Supabase products row to camelCase ViewModel
 */
export function toProductViewModel(row: Tables<'products'>): ProductViewModel {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category ?? null,
    brand: row.brand ?? null,
    unit: row.unit ?? null,
    barcode: row.barcode ?? null,
    gtin: row.gtin ?? null,
    description: row.description ?? null,
    imageUrl: row.image_url ?? null,
    price: row.price ?? null,
    active: row.active ?? true,
    requiresBatchTracking: row.requires_batch_tracking,
    preferredSupplierId: row.preferred_supplier_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Location View Models
// ============================================================================

export interface LocationViewModel {
  id: string;
  practiceId: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isMainLocation: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Convert Supabase practice_locations row to camelCase ViewModel
 */
export function toLocationViewModel(
  row: Tables<'practice_locations'>
): LocationViewModel {
  return {
    id: row.id,
    practiceId: row.practice_id,
    code: row.code,
    name: row.name,
    description: row.description ?? null,
    isActive: row.is_active ?? true,
    isMainLocation: row.is_main_location ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
