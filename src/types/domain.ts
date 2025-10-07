/**
 * Core domain types for Remcura application
 * These types represent the business entities and their relationships
 */

// ============================================================================
// Product Domain
// ============================================================================

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string | null;
  brand?: string | null;
  unit?: string | null;
  description?: string | null;
  isActive?: boolean;
  batchTracked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductWithStock extends Product {
  stockLevels?: StockLevel[];
  totalStock?: number;
}

// ============================================================================
// Stock & Inventory Domain
// ============================================================================

export interface StockLevel {
  id: string;
  productId: string;
  locationId: string;
  currentQuantity: number;
  minimumQuantity?: number | null;
  maximumQuantity?: number | null;
  reservedQuantity?: number | null;
  availableQuantity?: number | null;
  productName?: string;
  locationName?: string;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  locationId: string;
  movementType: 'in' | 'out' | 'transfer' | 'adjustment' | 'count';
  quantityChange: number;
  reason?: string | null;
  batchId?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

// ============================================================================
// Batch Domain
// ============================================================================

export interface ProductBatch {
  id: string;
  productId: string;
  locationId: string;
  batchNumber: string;
  expiryDate: string;
  receivedDate?: string;
  currentQuantity: number;
  reservedQuantity?: number | null;
  availableQuantity?: number | null;
  status?: string | null;
  productName?: string;
  locationName?: string;
  supplierId?: string | null;
  supplierName?: string | null;
}

export interface ExpiringBatch {
  batchId: string;
  productId: string;
  productName: string;
  productSku: string;
  locationId: string;
  locationName: string;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  daysUntilExpiry: number;
  urgencyLevel: 'normal' | 'warning' | 'high' | 'critical' | 'expired';
}

// ============================================================================
// Supplier Domain
// ============================================================================

export interface Supplier {
  id: string;
  name: string;
  code?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierProduct {
  id: string;
  productId: string;
  supplierId: string;
  supplierSku?: string | null;
  costPrice?: number | null;
  listPrice?: number | null;
  minimumOrderQuantity?: number | null;
  leadTimeDays?: number | null;
  isPreferred?: boolean;
  isAvailable?: boolean;
  supplierName?: string;
  productName?: string;
}

// ============================================================================
// Order List Domain
// ============================================================================

export type OrderListStatus =
  | 'draft'
  | 'pending'
  | 'ordered'
  | 'partial'
  | 'delivered'
  | 'cancelled';

export interface OrderList {
  id: string;
  practiceId: string;
  locationId?: string | null;
  name: string;
  description?: string | null;
  status: OrderListStatus;
  supplierId?: string | null;
  supplierName?: string | null;
  totalItems?: number;
  createdBy?: string | null;
  createdAt: string;
  updatedAt?: string;
  autoReorderEnabled?: boolean;
}

export interface OrderListItem {
  id: string;
  orderListId: string;
  productId: string;
  supplierProductId?: string | null;
  suggestedQuantity?: number | null;
  orderedQuantity?: number | null;
  receivedQuantity?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  status?: string | null;
  notes?: string | null;
  productName?: string;
  productSku?: string;
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
}

export interface OrderListWithItems extends OrderList {
  items: OrderListItem[];
}

// ============================================================================
// Location Domain
// ============================================================================

export interface Location {
  id: string;
  practiceId: string;
  name: string;
  code?: string | null;
  locationType?: string | null;
  address?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Counting Domain
// ============================================================================

export interface CountingSession {
  id: string;
  practiceId: string;
  locationId: string;
  name: string;
  description?: string | null;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdBy?: string | null;
  locationName?: string;
}

export interface CountingEntry {
  id: string;
  sessionId: string;
  productId: string;
  locationId: string;
  systemQuantity: number;
  countedQuantity?: number | null;
  varianceQuantity?: number;
  status: 'pending' | 'counted' | 'reconciled';
  notes?: string | null;
  productName?: string;
  productSku?: string;
  batchNumber?: string | null;
}

// ============================================================================
// Analytics Domain
// ============================================================================

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'alert' | 'table';
  data: Record<string, unknown>;
  size?: 'small' | 'medium' | 'large';
  position?: number;
  visible?: boolean;
  loading?: boolean;
  error?: string;
}

export interface AnalyticsSummary {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  expiringBatches: number;
  pendingOrders: number;
  recentMovements: number;
}

// ============================================================================
// User & Permission Domain
// ============================================================================

export type UserRole =
  | 'admin'
  | 'member'
  | 'viewer'
  | 'guest'
  | 'platform_owner';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  practiceId?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Filter & Search Domain
// ============================================================================

export interface FilterField {
  id: string;
  type: 'text' | 'select' | 'date' | 'number' | 'multiselect' | 'boolean';
  label: string;
  value?: unknown;
  options?: Array<{ label: string; value: string | number }>;
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: string | number | boolean | string[] | null | undefined;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isProduct(obj: unknown): obj is Product {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'sku' in obj
  );
}

export function isOrderList(obj: unknown): obj is OrderList {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'status' in obj
  );
}

export function isSupplier(obj: unknown): obj is Supplier {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as Supplier).name === 'string'
  );
}
