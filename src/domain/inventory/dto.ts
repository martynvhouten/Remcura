import type { Tables } from '@/types/supabase.generated';

export type ProductBatchRow = Tables<'product_batches'>;
export type ProductRow = Tables<'products'>;
export type StockLevelRow = Tables<'stock_levels'>;
export type PracticeLocationRow = Tables<'practice_locations'>;
export type SupplierRow = Tables<'suppliers'>;
export type SupplierProductRow = Tables<'supplier_products'>;
export type OrderListRow = Tables<'order_lists'>;
export type OrderListItemRow = Tables<'order_list_items'>;
export type CountingSessionRow = Tables<'counting_sessions'>;
export type CountingEntryRow = Tables<'counting_entries'>;
export type PracticeRow = Tables<'practices'>;

export interface ProductWithStockDTO {
  id: string;
  practiceId: string | null;
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
  supplierId?: string | null;
  supplierName?: string | null;
  supplierCode?: string | null;
  supplierPhone?: string | null;
  supplierEmail?: string | null;
  imageUrl?: string | null;
  barcode?: string | null;
  gtin?: string | null;
  gpcBrickCode?: string | null;
  countryOfOrigin?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  requiresBatchTracking?: boolean | null;
  productLifecycleStatus?: string | null;
  baseUnitIndicator?: boolean | null;
  orderableUnitIndicator?: boolean | null;
  despatchUnitIndicator?: boolean | null;
  effectiveFromDate?: string | null;
  effectiveToDate?: string | null;
  netContentValue?: number | null;
  netContentUom?: string | null;
  netWeight?: number | null;
  grossWeight?: number | null;
  preferredSupplierId?: string | null;
  minimumStock?: number | null;
  batches?: ProductBatchSummary[];
}

export interface ProductBatchDTO {
  id: string;
  practiceId: string;
  productId: string;
  locationId: string;
  supplierId: string | null;
  batchNumber: string;
  expiryDate: string;
  receivedDate: string;
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number | null;
  unitCost: number | null;
  totalCost: number | null;
  currency: string | null;
  status: string | null;
  supplierBatchNumber: string | null;
  purchaseOrderNumber: string | null;
  invoiceNumber: string | null;
  qualityCheckPassed: boolean | null;
  qualityNotes: string | null;
  quarantineUntil: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  supplierName?: string | null;
  productName?: string | null;
  productSku?: string | null;
  locationName?: string | null;
  // Computed fields
  urgencyLevel: 'normal' | 'low' | 'warning' | 'high' | 'critical' | 'expired';
  daysUntilExpiry: number;
}

export interface StockLevelDTO {
  id: string;
  practiceId: string;
  productId: string;
  locationId: string;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number | null;
  minimumQuantity: number;
  maximumQuantity: number | null;
  reorderPoint: number | null;
  preferredSupplierId: string | null;
  lastCountedAt: string | null;
  lastMovementAt: string | null;
  lastOrderedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  productName?: string | null;
  productSku?: string | null;
  locationName?: string | null;
}

export interface ProductDTO {
  id: string;
  practiceId: string | null;
  sku: string;
  name: string;
  category: string | null;
  brand: string | null;
  unit: string | null;
  price: number | null;
  requiresBatchTracking: boolean;
  gtin: string | null;
  gpcBrickCode: string | null;
  countryOfOrigin: string | null;
  productLifecycleStatus: string | null;
  lastSyncedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  preferredSupplierId: string | null;
  imageUrl: string | null;
}

export interface PracticeLocationDTO {
  id: string;
  practiceId: string;
  name: string;
  code: string;
  locationType: string | null;
  isActive: boolean | null;
  isMainLocation: boolean | null;
  requiresCounting: boolean | null;
  allowsNegativeStock: boolean | null;
  restrictedAccess: boolean | null;
  accessCode: string | null;
}

export interface SupplierDTO {
  id: string;
  name: string;
  code: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactPerson: string | null;
  country: string | null;
  paymentTerms: number | null;
  minimumOrderAmount: number | null;
  shippingCost: number | null;
  freeShippingThreshold: number | null;
  isActive: boolean | null;
  integrationType: string | null;
  orderMethod: string | null;
  autoSyncEnabled: boolean | null;
  lastSyncAt: string | null;
}

export interface SupplierProductDTO {
  id: string;
  supplierId: string;
  productId: string;
  supplierSku: string;
  supplierName: string | null;
  costPrice: number | null;
  currency: string | null;
  minimumOrderQuantity: number | null;
  orderMultiple: number | null;
  leadTimeDays: number | null;
  isAvailable: boolean | null;
  isPreferred: boolean | null;
  lastSyncedAt: string | null;
}

export interface OrderListDTO {
  id: string;
  practiceId: string;
  locationId: string;
  supplierId: string | null;
  name: string;
  description: string | null;
  status: string | null;
  totalItems: number | null;
  totalValue: number | null;
  createdBy: string | null;
  listType: string | null;
  autoReorderEnabled: boolean | null;
  reorderFrequencyDays: number | null;
  lastAutoCheck: string | null;
  minOrderValue: number | null;
  preferredOrderDay: number | null;
  orderCutoffTime: string | null;
  tags: string[] | null;
  isTemplate: boolean | null;
  templateName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface OrderListItemDTO {
  id: string;
  orderListId: string;
  productId: string;
  supplierProductId: string | null;
  suggestedQuantity: number;
  orderedQuantity: number | null;
  receivedQuantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
  status: string | null;
  notes: string | null;
  minimumStock: number | null;
  maximumStock: number | null;
  currentStock: number | null;
  reorderPoint: number | null;
  preferredSupplierId: string | null;
  alternativeSuppliers: string[] | null;
  lastOrderDate: string | null;
  lastOrderQuantity: number | null;
  averageConsumption: number | null;
  leadTimeDays: number | null;
  urgencyLevel: string | null;
  autoSuggestEnabled: boolean | null;
  manualOverride: boolean | null;
  overrideReason: string | null;
  createdAt: string | null;
}

export interface CountingSessionDTO {
  id: string;
  practiceId: string;
  locationId: string;
  name: string;
  description: string | null;
  status: string | null;
  countAllProducts: boolean | null;
  productCategoryFilter: string | null;
  specificProductIds: string[] | null;
  startedAt: string | null;
  completedAt: string | null;
  approvedAt: string | null;
  totalProductsCounted: number | null;
  productsWithVariance: number | null;
  totalVarianceValue: number | null;
  createdBy: string | null;
  startedBy: string | null;
  completedBy: string | null;
  approvedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CountingEntryDTO {
  id: string;
  countingSessionId: string;
  practiceId: string;
  locationId: string;
  productId: string;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number | null;
  batchNumber: string | null;
  expiryDate: string | null;
  notes: string | null;
  confidenceLevel: string | null;
  countedBy: string | null;
  countedAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
