import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Json,
} from './supabase.generated';
import type { Database } from './supabase.generated';

type PracticeLocationRow = Tables<'practice_locations'>;
type ProductRowRaw = Tables<'products'>;
type SupplierRowRaw = Tables<'suppliers'>;

const resolveNullableNumber = (
  value: number | null | undefined
): number | null => (typeof value === 'number' ? value : null);

const resolveRelation = <T>(maybeRelation: T | undefined | null): T | null =>
  maybeRelation ?? null;

type ProductBatchRowWithRelations = ProductBatch & {
  product?: ProductRowRaw | null;
  supplier?: SupplierRowRaw | null;
  location?: PracticeLocationRow | null;
  total_cost?: number | null;
};
export type ProductBatchRow = ProductBatchRowWithRelations;

type StockLevelRowWithRelations = StockLevelRow & {
  products?: ProductRowRaw | null;
  practice_locations?: PracticeLocationRow | null;
};
export type StockLevelRowWithRelationsAlias = StockLevelRowWithRelations;

interface SimpleProductView {
  id: string;
  sku: string | null;
  name: string | null;
}

interface SimpleSupplierView {
  id: string;
  name: string | null;
}

interface SimpleLocationView {
  id: string;
  code: string | null;
  name: string | null;
}

interface StockMetricsView {
  onHand: number;
  available: number | null;
  reserved: number | null;
  minimum: number | null;
  maximum: number | null;
  reorderPoint: number | null;
}

interface SupplierProductView {
  id: string;
  supplier: SimpleSupplierView;
  supplierSku: string | null;
  costPrice: number | null;
  listPrice: number | null;
  currency: string | null;
  leadTimeDays: number | null;
  isPreferred: boolean | null;
  raw: SupplierProductRow;
}

export const mapProductBatchRowToDetails = (
  row: ProductBatch | ProductBatchRowWithRelations
): ProductBatchWithDetails => {
  const withRelations: ProductBatchRowWithRelations = row;
  const resolvedProduct = resolveRelation(withRelations.product);
  const resolvedSupplier = resolveRelation(withRelations.supplier);
  const resolvedLocation = resolveRelation(withRelations.location);

  // Calculate urgency fields
  const daysUntilExpiry = Math.ceil(
    (new Date(row.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  let urgencyLevel:
    | 'normal'
    | 'low'
    | 'warning'
    | 'high'
    | 'critical'
    | 'expired' = 'normal';
  if (daysUntilExpiry < 0) {
    urgencyLevel = 'expired';
  } else if (daysUntilExpiry <= 7) {
    urgencyLevel = 'critical';
  } else if (daysUntilExpiry <= 30) {
    urgencyLevel = 'high';
  } else if (daysUntilExpiry <= 90) {
    urgencyLevel = 'warning';
  } else if (daysUntilExpiry <= 180) {
    urgencyLevel = 'low';
  }

  const legacy: ProductBatchLegacyView = {
    id: row.id,
    practice_id: row.practice_id,
    product_id: row.product_id,
    location_id: row.location_id,
    supplier_id: row.supplier_id ?? null,
    batch_number: row.batch_number,
    expiry_date: row.expiry_date,
    current_quantity: row.current_quantity,
    available_quantity: row.available_quantity ?? null,
    reserved_quantity: row.reserved_quantity ?? null,
    unit_cost: row.unit_cost ?? null,
    total_cost: resolveNullableNumber(withRelations.total_cost),
    product_name: resolvedProduct?.name ?? null,
    product_sku: resolvedProduct?.sku ?? null,
    product_category: resolvedProduct?.category ?? null,
    location_name: resolvedLocation?.name ?? null,
    location_code: resolvedLocation?.code ?? null,
    location_type: resolvedLocation?.location_type ?? null,
    supplier_name: resolvedSupplier?.name ?? null,
  };

  return {
    id: row.id,
    practiceId: row.practice_id,
    productId: row.product_id,
    locationId: row.location_id,
    supplierId: row.supplier_id ?? resolvedSupplier?.id ?? null,
    batchNumber: row.batch_number,
    expiryDate: row.expiry_date,
    currentQuantity: row.current_quantity,
    availableQuantity: row.available_quantity ?? null,
    reservedQuantity: row.reserved_quantity ?? null,
    unitCost: row.unit_cost ?? null,
    totalCost: resolveNullableNumber(withRelations.total_cost),
    productName: legacy.product_name,
    productSku: legacy.product_sku,
    productCategory: legacy.product_category,
    locationName: legacy.location_name,
    locationCode: legacy.location_code,
    locationType: legacy.location_type,
    supplierName: legacy.supplier_name,
    product: resolvedProduct
      ? {
          id: resolvedProduct.id,
          sku: resolvedProduct.sku ?? null,
          name: resolvedProduct.name ?? legacy.product_name,
        }
      : null,
    supplier: resolvedSupplier
      ? {
          id: resolvedSupplier.id,
          name: resolvedSupplier.name ?? legacy.supplier_name,
        }
      : null,
    location: resolvedLocation
      ? {
          id: resolvedLocation.id,
          code: resolvedLocation.code ?? legacy.location_code,
          name: resolvedLocation.name ?? legacy.location_name,
        }
      : null,
    stock: {
      onHand: row.current_quantity,
      reserved: row.reserved_quantity ?? null,
      available: row.available_quantity ?? null,
      minimum: null, // Not available on batch records
      maximum: null, // Not available on batch records
      reorderPoint: null, // Not available on batch records
    },
    urgencyLevel,
    daysUntilExpiry,
    legacy,
    raw: withRelations,
    // Deprecated snake_case properties (for backward compatibility)
    practice_id: row.practice_id,
    product_id: row.product_id,
    location_id: row.location_id,
    supplier_id: row.supplier_id ?? resolvedSupplier?.id ?? null,
    batch_number: row.batch_number,
    expiry_date: row.expiry_date,
    current_quantity: row.current_quantity,
    available_quantity: row.available_quantity ?? null,
    reserved_quantity: row.reserved_quantity ?? null,
    unit_cost: row.unit_cost ?? null,
    total_cost: resolveNullableNumber(withRelations.total_cost),
    product_name: legacy.product_name,
    product_sku: legacy.product_sku,
    product_category: legacy.product_category,
    location_name: legacy.location_name,
    location_code: legacy.location_code,
    location_type: legacy.location_type,
    supplier_name: legacy.supplier_name,
  };
};

export const mapProductBatchRowToView = (
  row: ProductBatch | ProductBatchRowWithRelations
): ProductBatchWithDetails => mapProductBatchRowToDetails(row);
export type PracticeRow = Tables<'practices'>;
export type PracticeInsert = TablesInsert<'practices'>;
export type PracticeUpdate = TablesUpdate<'practices'>;

export type Supplier = Tables<'suppliers'>;
export type SupplierRow = Tables<'suppliers'>;
export type SupplierView = SupplierRow & {
  contact_email: string | null;
  contact_phone: string | null;
  contact_person: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  website: string | null;
  payment_terms: number | null;
  minimum_order_amount: number | null;
  shipping_cost: number | null;
  free_shipping_threshold: number | null;
  api_endpoint: string | null;
  api_type: string | null;
  sync_enabled: boolean | null;
  is_active: boolean | null;
  preferred_order_day: number | null;
  order_cutoff_time: string | null;
};

export type SupplierInsert = TablesInsert<'suppliers'>;
export type SupplierUpdate = TablesUpdate<'suppliers'>;

export type SupplierProduct = Tables<'supplier_products'>;
export type SupplierProductRow = Tables<'supplier_products'>;
export type SupplierProductInsert = TablesInsert<'supplier_products'>;
export type SupplierProductUpdate = TablesUpdate<'supplier_products'>;

export type PracticeLocation = Tables<'practice_locations'>;
export type PracticeLocationInsert = TablesInsert<'practice_locations'>;
export type PracticeLocationUpdate = TablesUpdate<'practice_locations'>;

export type OrderAdviceResult =
  Database['public']['Functions']['get_order_advice']['Returns'];

export type PracticeMemberRow = Tables<'practice_members'>;
export type PracticeMemberInsert = TablesInsert<'practice_members'>;
export type PracticeMemberUpdate = TablesUpdate<'practice_members'>;

export type OrderListRow = Tables<'order_lists'>;
export type OrderListInsert = TablesInsert<'order_lists'>;
export type OrderListUpdate = TablesUpdate<'order_lists'>;

export type ProductRow = Tables<'products'>;

export type ProductBatch = Tables<'product_batches'>;

export interface ProductBatchWithDetails {
  id: string;
  practiceId: string;
  productId: string;
  locationId: string;
  supplierId: string | null;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  availableQuantity: number | null;
  reservedQuantity: number | null;
  unitCost: number | null;
  totalCost: number | null;
  productName: string | null;
  productSku: string | null;
  productCategory: string | null;
  locationName: string | null;
  locationCode: string | null;
  locationType: string | null;
  supplierName: string | null;
  product: SimpleProductView | null;
  supplier: SimpleSupplierView | null;
  location: SimpleLocationView | null;
  stock: StockMetricsView;
  legacy: ProductBatchLegacyView;
  raw?: ProductBatchRowWithRelations;
  // Computed fields
  urgencyLevel: 'normal' | 'low' | 'warning' | 'high' | 'critical' | 'expired';
  daysUntilExpiry: number;
  /** @deprecated use practiceId */
  practice_id: string;
  /** @deprecated use productId */
  product_id: string;
  /** @deprecated use locationId */
  location_id: string;
  /** @deprecated use supplierId */
  supplier_id: string | null;
  /** @deprecated use batchNumber */
  batch_number: string;
  /** @deprecated use expiryDate */
  expiry_date: string;
  /** @deprecated use currentQuantity */
  current_quantity: number;
  /** @deprecated use availableQuantity */
  available_quantity: number | null;
  /** @deprecated use reservedQuantity */
  reserved_quantity: number | null;
  /** @deprecated use unitCost */
  unit_cost: number | null;
  /** @deprecated use totalCost */
  total_cost: number | null;
  /** @deprecated use productName */
  product_name: string | null;
  /** @deprecated use productSku */
  product_sku: string | null;
  /** @deprecated use productCategory */
  product_category: string | null;
  /** @deprecated use locationName */
  location_name: string | null;
  /** @deprecated use locationCode */
  location_code: string | null;
  /** @deprecated use locationType */
  location_type: string | null;
  /** @deprecated use supplierName */
  supplier_name: string | null;
}

export interface ProductBatchLegacyView {
  /** @deprecated use camelCase fields */
  id: string;
  practice_id: string;
  product_id: string;
  location_id: string;
  supplier_id: string | null;
  batch_number: string;
  expiry_date: string;
  current_quantity: number;
  available_quantity: number | null;
  reserved_quantity: number | null;
  unit_cost: number | null;
  total_cost: number | null;
  product_name: string | null;
  product_sku: string | null;
  product_category: string | null;
  location_name: string | null;
  location_code: string | null;
  location_type: string | null;
  supplier_name: string | null;
  /** @deprecated use camelCase fields */
  practiceId?: string;
  /** @deprecated use camelCase fields */
  productId?: string;
  /** @deprecated use camelCase fields */
  locationId?: string;
  /** @deprecated use camelCase fields */
  supplierId?: string | null;
  /** @deprecated use camelCase fields */
  batchNumber?: string;
  /** @deprecated use camelCase fields */
  expiryDate?: string;
  /** @deprecated use camelCase fields */
  currentQuantity?: number;
  /** @deprecated use camelCase fields */
  availableQuantity?: number | null;
  /** @deprecated use camelCase fields */
  reservedQuantity?: number | null;
  /** @deprecated use camelCase fields */
  unitCost?: number | null;
  /** @deprecated use camelCase fields */
  totalCost?: number | null;
  /** @deprecated use camelCase fields */
  productName?: string | null;
  /** @deprecated use camelCase fields */
  productSku?: string | null;
  /** @deprecated use camelCase fields */
  productCategory?: string | null;
  /** @deprecated use camelCase fields */
  locationName?: string | null;
  /** @deprecated use camelCase fields */
  locationCode?: string | null;
  /** @deprecated use camelCase fields */
  locationType?: string | null;
  /** @deprecated use camelCase fields */
  supplierName?: string | null;
}

export type ProductBatchWithDetailsView = ProductBatchWithDetails & {
  days_until_expiry: number | null;
  daysUntilExpiry: number | null;
  urgency_level?: ExpiryUrgencyLevel;
  urgencyLevel?: ExpiryUrgencyLevel;
};

export interface BatchMovement {
  batch_id: string;
  batch_number: string;
  quantity_used: number;
  expiry_date: string;
}

export interface FifoBatch {
  batch_id: string;
  batch_number: string;
  available_quantity: number;
  expiry_date: string;
  use_quantity: number;
}

export interface ExpiringBatch {
  batch_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  location_id: string;
  location_name: string;
  batch_number: string;
  expiry_date: string;
  current_quantity: number;
  days_until_expiry: number;
  urgency_level: 'normal' | 'warning' | 'critical' | 'expired';
}

export type StockLevelRow = Tables<'stock_levels'>;

export interface StockLevelView {
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
  preferredSupplierId: string | null;
  preferredSupplierName: string | null;
  lastCountedAt: string | null;
  lastMovementAt: string | null;
  lastOrderedAt: string | null;
  locationName: string | null;
  productName: string | null;
  stockStatus: string | null;
  averageConsumption: number | null;
  reorderRecommendation: number | null;
  priority: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  legacy: StockLevelLegacyView;
  raw?: StockLevelRowWithRelations;
}

export interface StockLevelLegacyView {
  /** @deprecated use camelCase fields */
  id: string;
  practice_id: string;
  product_id: string;
  location_id: string;
  current_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  minimum_quantity: number;
  maximum_quantity: number | null;
  reorder_point: number | null;
  preferred_supplier_id: string | null;
  preferred_supplier_name: string | null;
  last_counted_at: string | null;
  last_movement_at: string | null;
  last_ordered_at: string | null;
  location_name: string | null;
  product_name: string | null;
  stock_status: string | null;
  average_consumption: number | null;
  reorder_recommendation: number | null;
  priority: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const mapStockLevelRowToView = (
  row: StockLevelRow | StockLevelRowWithRelations
): StockLevelView => {
  const extended = row as StockLevelRowWithRelations;
  const locationName = extended.practice_locations?.name ?? null;
  const productName = extended.products?.name ?? null;
  const stockStatus = null; // Computed field not available on row
  const averageConsumption = null; // Computed field not available on row
  const reorderRecommendation = null; // Computed field not available on row
  const priority = null; // Computed field not available on row
  const preferredSupplierName = null; // Would need supplier join

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
    preferredSupplierId: row.preferred_supplier_id ?? null,
    preferredSupplierName,
    lastCountedAt: row.last_counted_at ?? null,
    lastMovementAt: row.last_movement_at ?? null,
    lastOrderedAt: row.last_ordered_at ?? null,
    locationName,
    productName,
    stockStatus,
    averageConsumption,
    reorderRecommendation,
    priority,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    legacy: {
      id: row.id,
      practice_id: row.practice_id,
      product_id: row.product_id,
      location_id: row.location_id,
      current_quantity: row.current_quantity ?? 0,
      available_quantity: row.available_quantity ?? 0,
      reserved_quantity: row.reserved_quantity ?? 0,
      minimum_quantity: row.minimum_quantity ?? 0,
      maximum_quantity: row.maximum_quantity ?? null,
      reorder_point: row.reorder_point ?? null,
      preferred_supplier_id: row.preferred_supplier_id ?? null,
      preferred_supplier_name: preferredSupplierName,
      last_counted_at: row.last_counted_at ?? null,
      last_movement_at: row.last_movement_at ?? null,
      last_ordered_at: row.last_ordered_at ?? null,
      location_name: locationName,
      product_name: productName,
      stock_status: stockStatus,
      average_consumption: averageConsumption,
      reorder_recommendation: reorderRecommendation,
      priority,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    },
    raw: extended,
  };
};

export type StockMovement = Tables<'stock_movements'>;

export type StockMovementInsert = TablesInsert<'stock_movements'>;

export type StockMovementUpdate = TablesUpdate<'stock_movements'>;

export type StockMovementRow = Tables<'stock_movements'>;

export type MovementWithRelations = StockMovementRow & {
  product?: Pick<
    Tables<'products'>,
    'id' | 'name' | 'sku' | 'category' | 'brand' | 'unit'
  > | null;
  location?: Pick<
    Tables<'practice_locations'>,
    'id' | 'name' | 'location_type'
  > | null;
  from_location?: Pick<Tables<'practice_locations'>, 'id' | 'name'> | null;
  to_location?: Pick<Tables<'practice_locations'>, 'id' | 'name'> | null;
};

export type MovementQueryRow = Tables<'stock_movements'> & {
  product: Pick<Tables<'products'>, 'id' | 'name' | 'sku'> | null;
  location: Pick<Tables<'practice_locations'>, 'id' | 'name'> | null;
};

export type CountingSession = Tables<'counting_sessions'> & {
  location_ids?: string[];
  product_ids?: string[];
  total_discrepancy_value?: number | null;
};

export type CountingEntry = Tables<'counting_entries'>;

export type OrderListItemRow = Tables<'order_list_items'>;
export type OrderListItemInsert = TablesInsert<'order_list_items'>;
export type OrderListItemUpdate = TablesUpdate<'order_list_items'>;

export type OrderListStatus = Database['public']['Enums']['order_list_status'];

export type OrderListItemStatus = OrderListItemRow['status'];

export interface OrderListDTO {
  id: string;
  practice_id: string;
  location_id: string;
  supplier_id: string | null;
  name: string;
  description: string | null;
  status: OrderListStatus | null;
  total_items: number;
  total_cost: number;
  min_order_value: number | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  submitted_at: string | null;
  submitted_by: string | null;
  supplier: Tables<'suppliers'> | null;
}

export interface OrderListItemDTO {
  id: string;
  order_list_id: string;
  product_id: string;
  supplier_product_id: string | null;
  suggested_quantity: number;
  ordered_quantity: number;
  unit_price: number | null;
  total_price: number | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  product: Tables<'products'> | null;
  supplier_product: Tables<'supplier_products'> | null;
}

// Type unions
export type MovementType =
  | 'count'
  | 'receipt'
  | 'usage'
  | 'transfer'
  | 'adjustment'
  | 'waste'
  | 'order_received'
  | 'consumption'
  | 'expired'
  | 'manual_adjustment'
  | 'correction';

export type ReasonCode =
  | 'normal_usage'
  | 'expired'
  | 'damaged'
  | 'lost'
  | 'found'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'count_correction';

export type OrderListWorkflowStatus =
  | 'draft'
  | 'ready'
  | 'submitted'
  | 'confirmed'
  | 'delivered'
  | 'cancelled';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type BatchStatus = 'active' | 'depleted' | 'expired' | 'recalled';

export type ExpiryUrgencyLevel = 'normal' | 'warning' | 'critical' | 'expired';

// Enhanced types with relationships
export interface StockLevelWithDetails extends StockLevelView {
  location?: PracticeLocation;
  product?: {
    id: string;
    name: string;
    sku: string;
    category?: string;
    brand?: string;
    unit?: string;
  };
  preferred_supplier?: Supplier | null;
}

export interface OrderSuggestion {
  product_id: string;
  product_name: string;
  product_sku: string;
  location_id: string;
  location_name: string;
  current_stock: number;
  minimum_stock: number;
  suggested_quantity: number;
  preferred_supplier_id: string | null;
  supplier_name: string | null;
  urgency_level: UrgencyLevel | null;
  days_until_stockout: number | null;
  productName?: string;
  productSku?: string;
  locationName?: string;
  currentStock?: number;
  minimumStock?: number;
  suggestedQuantity?: number;
  preferredSupplierId?: string | null;
  supplierName?: string | null;
  urgencyLevel?: UrgencyLevel | null;
  daysUntilStockout?: number | null;
}

export interface StockAlert {
  id: string;
  type:
    | 'out_of_stock'
    | 'low_stock'
    | 'overstock'
    | 'expired'
    | 'expiring_soon';
  severity?: 'critical' | 'warning' | 'info';
  product_id: string;
  product_name?: string;
  product_sku?: string;
  location_id: string;
  location_name?: string;
  current_stock: number;
  minimum_stock?: number;
  threshold_quantity?: number;
  batch_number?: string;
  expiry_date?: string;
  days_until_expiry?: number;
  message: string;
  title?: string;
  suggested_action?: string;
  created_at: string;
}

// Form types for API operations
export interface CreateSupplierRequest {
  name: string;
  code: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  payment_terms?: number;
  minimum_order_amount?: number;
  shipping_cost?: number;
  notes?: string;
}

export interface CreateLocationRequest {
  practice_id: string;
  name: string;
  code: string;
  description?: string;
  location_type:
    | 'storage'
    | 'treatment'
    | 'emergency'
    | 'mobile'
    | 'warehouse'
    | 'clinic'
    | 'drop_point';
  address?: string;
  floor_level?: string;
  room_number?: string;
  contact_email?: string;
  contact_phone?: string;
  is_main_location?: boolean;
  requires_counting?: boolean;
  allows_negative_stock?: boolean;
}

export interface UpdateLocationRequest {
  id: string;
  practice_id: string;
  name?: string;
  code?: string;
  description?: string;
  location_type?:
    | 'storage'
    | 'treatment'
    | 'emergency'
    | 'mobile'
    | 'warehouse'
    | 'clinic'
    | 'drop_point';
  address?: string;
  floor_level?: string;
  room_number?: string;
  contact_email?: string;
  contact_phone?: string;
  is_main_location?: boolean;
  requires_counting?: boolean;
  allows_negative_stock?: boolean;
  restricted_access?: boolean;
  access_code?: string;
  responsible_user_id?: string;
}

export interface StockUpdateRequest {
  practice_id: string;
  location_id: string;
  product_id: string;
  quantity_change: number;
  movement_type: MovementType;
  reference_type?: string;
  reference_id?: string;
  reason_code?: ReasonCode;
  notes?: string;
  batch_number?: string;
  expiry_date?: string;
  use_fifo?: boolean;
}

export interface CreateBatchRequest {
  practice_id: string;
  product_id: string;
  location_id: string;
  batch_number: string;
  supplier_batch_number?: string;
  expiry_date: string;
  received_date?: string;
  initial_quantity: number;
  unit_cost?: number;
  currency?: string;
  supplier_id?: string;
  purchase_order_number?: string;
  invoice_number?: string;
  quality_check_passed?: boolean;
  quality_notes?: string;
}

export interface UpdateBatchRequest {
  id: string;
  practice_id: string;
  current_quantity?: number;
  reserved_quantity?: number;
  unit_cost?: number;
  status?: BatchStatus;
  quality_check_passed?: boolean;
  quality_notes?: string;
  quarantine_until?: string;
}

export interface BatchStockMovementRequest {
  practice_id: string;
  location_id: string;
  product_id: string;
  quantity_change: number;
  movement_type: MovementType;
  batch_movements: BatchMovement[];
  reason_code?: ReasonCode;
  notes?: string;
}

export interface StartCountingSessionRequest {
  practice_id: string;
  name: string;
  session_type: 'full' | 'partial' | 'spot_check' | 'cycle';
  location_ids: string[];
  product_ids?: string[];
  category_filter?: string;
  allow_negative_counts?: boolean;
  require_approval?: boolean;
  auto_adjust_stock?: boolean;
  notes?: string;
}

// Mobile-optimized types for counting interface
export interface CountingProduct {
  id: string;
  name: string;
  sku: string;
  category?: string;
  brand?: string;
  unit?: string;
  currentSystemQuantity: number;
  lastCountedAt?: string;
  locationName: string;
  barcode?: string;
  imageUrl?: string;
}

export interface CountingStats {
  totalProducts: number;
  countedProducts: number;
  remainingProducts: number;
  discrepancies: number;
  progressPercentage: number;
}

// Analytics types
export interface InventoryKPI {
  totalSkuCount: number;
  totalStockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockTurnoverRate: number;
  averageDaysToStockout: number;
  topMovingProducts: Array<{
    productId: string;
    productName: string;
    movementCount: number;
    totalQuantityMoved: number;
  }>;
  stockAccuracyPercentage: number;
  lastFullCountDate: string | null;
}

export interface LocationPerformance {
  locationId: string;
  locationName: string;
  totalProducts: number;
  stockAccuracy: number;
  avgCountFrequencyDays: number;
  lastCountedAt?: string;
  criticalItemsCount: number;
}

// Product-related types for ProductsPage
export type ProductWithRelations = ProductRow & {
  stock_levels?: StockLevelRow[] | null;
  supplier_products?: SupplierProductRow[] | null;
};

export interface ProductWithStock {
  id: string;
  practiceId: string;
  sku: string;
  name: string;
  category: string | null;
  brand: string | null;
  unit: string | null;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  reorderLevel: number | null;
  unitPrice: number | null;
  lowestPrice: number | null;
  supplier: SimpleSupplierView | null;
  stockLevels: StockLevelView[];
  supplierProducts: SupplierProductView[];
  batches: ProductBatchSummary[];
  legacy: ProductLegacyView;
  netContentValue?: number | null;
  netContentUom?: string | null;
  netWeight?: number | null;
  grossWeight?: number | null;
  gtin?: string | null;
  gpcBrickCode?: string | null;
  countryOfOrigin?: string | null;
  productLifecycleStatus?: string | null;
  lifecycleStatus?: string | null; // Alias for productLifecycleStatus
  imageUrl?: string | null;
  requiresBatchTracking?: boolean | null;
  baseUnitIndicator?: boolean | null;
  orderableUnitIndicator?: boolean | null;
  despatchUnitIndicator?: boolean | null;
  effectiveFromDate?: string | null;
  effectiveToDate?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  barcode?: string | null;
  preferredSupplierId?: string | null;
  minimumStock?: number | null;
  // Legacy snake_case aliases for backward compatibility
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  minimum_stock?: number | null;
  maximum_stock?: number | null;
  raw?: ProductWithRelations;
}

export interface ProductLegacyView {
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  reorderLevel?: number | null;
  supplierId?: string | null;
  supplierName?: string | null;
  supplierCode?: string | null;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  expiryDate?: string | null;
  gs1Status?: 'complete' | 'incomplete' | null;
  batchStatus?: 'batch_tracked' | 'manual_stock' | null;
  /** @deprecated use camelCase fields */
  total_stock?: number;
  /** @deprecated use camelCase fields */
  available_stock?: number;
  /** @deprecated use camelCase fields */
  reserved_stock?: number;
  /** @deprecated use camelCase fields */
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  /** @deprecated use camelCase fields */
  reorder_level?: number | null;
  /** @deprecated use camelCase fields */
  supplier_id?: string | null;
  /** @deprecated use camelCase fields */
  supplier_name?: string | null;
  /** @deprecated use camelCase fields */
  supplier_code?: string | null;
  /** @deprecated use camelCase fields */
  supplier_phone?: string | null;
  /** @deprecated use camelCase fields */
  supplier_email?: string | null;
  /** @deprecated use camelCase fields */
  expiry_date?: string | null;
  /** @deprecated use camelCase fields */
  gs1_status?: 'complete' | 'incomplete' | null;
  /** @deprecated use camelCase fields */
  batch_status?: 'batch_tracked' | 'manual_stock' | null;
}

export const determineStockStatus = (
  current: number,
  minimum: number
): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  if (current <= 0) return 'out_of_stock';
  if (current < minimum) return 'low_stock';
  return 'in_stock';
};

export const mapProductRowToView = (
  row: ProductWithRelations
): ProductWithStock => {
  const supplierProducts: SupplierProductView[] = (
    row.supplier_products ?? []
  ).map(product => ({
    id: product.id,
    supplier: {
      id: product.supplier_id,
      name: product.supplier_name ?? null,
    },
    supplierSku: product.supplier_sku ?? null,
    costPrice: product.cost_price ?? null,
    listPrice: product.list_price ?? null,
    currency: product.currency ?? null,
    leadTimeDays: product.lead_time_days ?? null,
    isPreferred: product.is_preferred ?? null,
    raw: product,
  }));

  const stockLevels = (row.stock_levels ?? []).map(level =>
    mapStockLevelRowToView(level)
  );

  const totalStock = stockLevels.reduce(
    (sum, level) => sum + level.currentQuantity,
    0
  );

  const availableStock = stockLevels.reduce(
    (sum, level) => sum + level.availableQuantity,
    0
  );

  const reservedStock = stockLevels.reduce(
    (sum, level) => sum + level.reservedQuantity,
    0
  );

  const minimumStock = (row as any).minimum_stock ?? null;

  const legacy: ProductLegacyView = {
    totalStock,
    availableStock,
    reservedStock,
    status: determineStockStatus(totalStock, minimumStock ?? 0),
    reorderLevel: minimumStock,
    supplierId: (row as any).supplier_id ?? null,
    supplierName: (row as any).supplier_name ?? null,
    supplierCode: (row as any).supplier_code ?? null,
    supplierPhone: (row as any).supplier_phone ?? null,
    supplierEmail: (row as any).supplier_email ?? null,
    expiryDate: (row as any).expiry_date ?? null,
    gs1Status: (row as any).gs1_status ?? null,
    batchStatus: (row as any).batch_status ?? null,
    /** @deprecated */ total_stock: totalStock,
    /** @deprecated */ available_stock: availableStock,
    /** @deprecated */ reserved_stock: reservedStock,
    /** @deprecated */ stock_status: determineStockStatus(
      totalStock,
      minimumStock ?? 0
    ),
    /** @deprecated */ reorder_level: minimumStock,
    /** @deprecated */ supplier_id: (row as any).supplier_id ?? null,
    /** @deprecated */ supplier_name: (row as any).supplier_name ?? null,
    /** @deprecated */ supplier_code: (row as any).supplier_code ?? null,
    /** @deprecated */ supplier_phone: (row as any).supplier_phone ?? null,
    /** @deprecated */ supplier_email: (row as any).supplier_email ?? null,
    /** @deprecated */ expiry_date: (row as any).expiry_date ?? null,
    /** @deprecated */ gs1_status: (row as any).gs1_status ?? null,
    /** @deprecated */ batch_status: (row as any).batch_status ?? null,
  };

  const rowAny = row as any;
  const preferredSupplierId =
    stockLevels[0]?.preferredSupplierId ?? rowAny.preferred_supplier_id ?? null;
  const maximumStock =
    rowAny.maximum_stock ?? stockLevels[0]?.maximumQuantity ?? null;

  return {
    id: row.id,
    practiceId: rowAny.practice_id ?? row.id,
    sku: row.sku,
    name: row.name,
    category: row.category ?? null,
    brand: row.brand ?? null,
    unit: row.unit ?? null,
    totalStock,
    availableStock,
    reservedStock,
    status: legacy.status,
    reorderLevel: minimumStock,
    unitPrice: rowAny.unit_price ?? null,
    lowestPrice: rowAny.lowest_price ?? null,
    supplier: rowAny.supplier_id
      ? { id: rowAny.supplier_id, name: rowAny.supplier_name ?? null }
      : null,
    stockLevels,
    supplierProducts,
    batches: [],
    description: row.description ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    requiresBatchTracking: row.requires_batch_tracking ?? null,
    productLifecycleStatus: row.product_lifecycle_status ?? null,
    lifecycleStatus: row.product_lifecycle_status ?? null, // Alias
    gpcBrickCode: row.gpc_brick_code ?? null,
    countryOfOrigin: row.country_of_origin ?? null,
    imageUrl: row.image_url ?? null,
    barcode: row.barcode ?? null,
    gtin: row.gtin ?? null,
    baseUnitIndicator: row.base_unit_indicator ?? null,
    orderableUnitIndicator: row.orderable_unit_indicator ?? null,
    despatchUnitIndicator: row.despatch_unit_indicator ?? null,
    effectiveFromDate: row.effective_from_date ?? null,
    effectiveToDate: row.effective_to_date ?? null,
    netContentValue: row.net_content_value ?? null,
    netContentUom: row.net_content_uom ?? null,
    netWeight: row.net_weight ?? null,
    grossWeight: row.gross_weight ?? null,
    preferredSupplierId,
    minimumStock,
    // Legacy snake_case aliases
    stock_status: legacy.status,
    minimum_stock: minimumStock,
    maximum_stock: maximumStock,
    legacy,
    raw: row,
  };
};

export interface LocationSummary {
  id: string;
  name: string;
}

export interface StockTransferRequest {
  practice_id: string;
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  reason: string;
  notes?: string;
  batch_id?: string | null;
}

export interface ProductBatchSummary {
  id: string;
  batch_number: string;
  expiry_date: string;
  current_quantity: number;
  urgency: ExpiryUrgencyLevel;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  supplier?: string;
  stock_status?: string;
  sort_by?: 'name' | 'price' | 'stock' | 'category' | 'sku' | 'last_updated';
  sort_order?: 'asc' | 'desc';

  // GS1 Filters
  gtin?: string;
  country_of_origin?: string;
  gpc_brick_code?: string;
  lifecycle_status?: string;
  orderable_only?: boolean;
}

export interface CartItem {
  product_id: string;
  product: ProductRow;
  quantity: number;
  unit_price?: number;
  supplier_id?: string;
  notes?: string;
}

export interface OrderListCart {
  id?: string;
  name: string;
  supplier_id?: string;
  items: CartItem[];
  total_items: number;
  estimated_total?: number;
  notes?: string;
}

// Unified stock view interface for consolidated stock information
export interface UnifiedStockView {
  practice_id: string;
  location_id: string;
  product_id: string;

  // Product details
  product_name: string;
  product_sku: string;
  product_category: string | null;
  product_brand: string | null;
  product_unit: string | null;
  product_price: number | null;
  requires_batch_tracking: boolean;

  // Location details
  location_name: string;
  location_code: string;
  location_type: string;

  // Stock quantities
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;

  // Stock status
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  minimum_quantity: number;
  maximum_quantity: number | null;
  reorder_point: number | null;
  preferred_supplier_id: string | null;
  last_counted_at: string | null;

  // Tracking
  last_movement_at: string;
  stock_source: 'batch' | 'manual';
  calculated_at: string;
}

export interface CountingEntryDTO {
  id: string;
  session_id: string;
  practice_id: string;
  location_id: string;
  product_id: string;
  system_quantity: number;
  counted_quantity: number;
  variance: number;
  confidence_level?: 'low' | 'medium' | 'high' | null;
  counted_by: string | null;
  counted_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  status: 'discrepancy' | 'verified' | 'pending';
  location_name?: string | null;
  product_name?: string | null;
  product_sku?: string | null;
}

export const mapOrderListRowToDTO = (row: OrderListRow): OrderListDTO => ({
  id: row.id,
  practice_id: row.practice_id,
  location_id: row.location_id,
  supplier_id: row.supplier_id ?? null,
  name: row.name,
  description: row.description ?? null,
  status: row.status ?? null,
  total_items: row.total_items ?? 0,
  total_cost: row.total_value ?? 0,
  min_order_value: row.min_order_value ?? null,
  created_at: row.created_at ?? null,
  updated_at: row.updated_at ?? null,
  created_by: row.created_by ?? null,
  submitted_at: (row as { submitted_at?: string | null }).submitted_at ?? null,
  submitted_by: (row as { submitted_by?: string | null }).submitted_by ?? null,
  supplier: null,
});

export const mapOrderListItemRowToDTO = (
  row: OrderListItemRow
): OrderListItemDTO => ({
  id: row.id,
  order_list_id: row.order_list_id,
  product_id: row.product_id,
  supplier_product_id: row.supplier_product_id ?? null,
  suggested_quantity: row.suggested_quantity ?? 0,
  ordered_quantity: row.ordered_quantity ?? 0,
  unit_price: row.unit_price ?? null,
  total_price: row.total_price ?? null,
  status: row.status ?? null,
  notes: row.notes ?? null,
  created_at: row.created_at ?? null,
  updated_at: (row as any).updated_at ?? null,
  product: null,
  supplier_product: null,
});
