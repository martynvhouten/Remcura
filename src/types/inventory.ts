// Core inventory types for the enhanced multi-supplier, multi-location system

export interface Supplier {
  id: string
  name: string
  code: string
  contact_email?: string
  contact_phone?: string
  contact_person?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  website?: string
  vat_number?: string
  business_registration?: string
  payment_terms: number
  minimum_order_amount: number
  shipping_cost: number
  free_shipping_threshold?: number
  api_endpoint?: string
  api_key_encrypted?: string
  api_type?: string
  sync_enabled: boolean
  last_sync_at?: string
  notes?: string
  is_active: boolean
  preferred_order_day?: number
  order_cutoff_time?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface SupplierProduct {
  id: string
  supplier_id: string
  product_id: string
  supplier_sku: string
  supplier_name?: string
  supplier_description?: string
  unit_price: number
  currency: string
  price_tier?: string
  minimum_order_quantity: number
  maximum_order_quantity?: number
  order_multiple: number
  pack_size: number
  is_available: boolean
  is_backorder_allowed: boolean
  lead_time_days: number
  expected_restock_date?: string
  catalog_page?: string
  category_path?: string
  created_at: string
  updated_at: string
  last_price_update: string
}

export interface PracticeLocation {
  id: string
  practice_id: string
  name: string
  code: string
  description?: string
  location_type: 'storage' | 'treatment' | 'emergency' | 'mobile' | 'warehouse' | 'clinic' | 'drop_point'
  address?: string
  floor_level?: string
  room_number?: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
  is_main_location: boolean
  requires_counting: boolean
  allows_negative_stock: boolean
  restricted_access: boolean
  access_code?: string
  responsible_user_id?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface StockLevel {
  id: string
  practice_id: string
  location_id: string
  product_id: string
  current_quantity: number
  reserved_quantity: number
  available_quantity: number
  minimum_stock: number
  maximum_stock: number
  reorder_point: number
  preferred_supplier_id?: string
  preferred_order_quantity?: number
  last_counted_at?: string
  last_counted_by?: string
  last_movement_at: string
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: string
  practice_id: string
  location_id: string
  product_id: string
  movement_type: MovementType
  quantity_change: number
  quantity_before: number
  quantity_after: number
  reference_type?: string
  reference_id?: string
  batch_number?: string
  expiry_date?: string
  performed_by: string
  reason_code?: ReasonCode
  notes?: string
  from_location_id?: string
  to_location_id?: string
  created_at: string
}

export interface CountingSession {
  id: string
  practice_id: string
  name: string
  session_type: 'full' | 'partial' | 'spot_check' | 'cycle'
  status: 'active' | 'completed' | 'cancelled' | 'approved'
  location_ids: string[]
  product_ids?: string[]
  category_filter?: string
  total_products_to_count: number
  products_counted: number
  discrepancies_found: number
  started_at: string
  completed_at?: string
  approved_at?: string
  started_by: string
  completed_by?: string
  approved_by?: string
  allow_negative_counts: boolean
  require_approval: boolean
  auto_adjust_stock: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface CountingEntry {
  id: string
  session_id: string
  practice_id: string
  location_id: string
  product_id: string
  system_quantity: number
  counted_quantity: number
  variance: number
  count_method: 'manual' | 'barcode' | 'rfid'
  confidence_level: 'low' | 'medium' | 'high'
  recount_required: boolean
  recount_reason?: string
  batch_number?: string
  expiry_date?: string
  counted_by: string
  counted_at: string
  verified_by?: string
  verified_at?: string
  notes?: string
  photos?: string[]
  status: 'pending' | 'verified' | 'discrepancy' | 'approved'
  created_at: string
  updated_at: string
}

export interface OrderList {
  id: string
  practice_id: string
  supplier_id: string
  name: string
  description?: string
  status: OrderListStatus
  order_number?: string
  total_items: number
  total_amount: number
  currency: string
  created_at: string
  updated_at: string
  submitted_at?: string
  confirmed_at?: string
  expected_delivery_date?: string
  actual_delivery_date?: string
  created_by: string
  updated_by?: string
  submitted_by?: string
  auto_suggest_quantities: boolean
  urgent_order: boolean
  supplier_order_reference?: string
  tracking_number?: string
  notes?: string
  internal_notes?: string
}

export interface OrderListItem {
  id: string
  order_list_id: string
  practice_id: string
  product_id: string
  supplier_product_id: string
  location_id?: string
  requested_quantity: number
  confirmed_quantity?: number
  delivered_quantity?: number
  unit_price: number
  total_price: number
  currency: string
  suggestion_source: 'manual' | 'auto_reorder' | 'low_stock' | 'usage_pattern'
  source_location_id?: string
  status: 'pending' | 'confirmed' | 'backordered' | 'delivered'
  notes?: string
  created_at: string
  updated_at: string
}

// Type unions
export type MovementType = 
  | 'count' 
  | 'receipt' 
  | 'usage' 
  | 'transfer' 
  | 'adjustment' 
  | 'waste'

export type ReasonCode = 
  | 'normal_usage' 
  | 'expired' 
  | 'damaged' 
  | 'lost' 
  | 'found'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'count_correction'

export type OrderListStatus = 
  | 'draft' 
  | 'ready' 
  | 'submitted' 
  | 'confirmed' 
  | 'delivered' 
  | 'cancelled'

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

// Enhanced types with relationships
export interface StockLevelWithDetails extends StockLevel {
  location: PracticeLocation
  product: {
    id: string
    name: string
    sku: string
    category?: string
    brand?: string
    unit?: string
  }
  preferred_supplier?: Supplier
}

export interface MovementWithRelations extends StockMovement {
  product?: {
    id: string
    name: string
    sku: string
    category?: string
    brand?: string
    unit?: string
  }
  location?: {
    id: string
    name: string
    code: string
    location_type: string
  }
  from_location?: {
    id: string
    name: string
    code: string
  }
  to_location?: {
    id: string
    name: string
    code: string
  }
}

export interface OrderSuggestion {
  product_id: string
  product_name: string
  product_sku: string
  location_id: string
  location_name: string
  current_stock: number
  minimum_stock: number
  suggested_quantity: number
  preferred_supplier_id?: string
  supplier_name?: string
  urgency_level: UrgencyLevel
  days_until_stockout: number
}

export interface StockAlert {
  type: 'out_of_stock' | 'low_stock' | 'overstock' | 'expired'
  urgency: UrgencyLevel
  product_id: string
  product_name: string
  product_sku: string
  location_id: string
  location_name: string
  current_quantity: number
  threshold_quantity?: number
  message: string
  suggested_action?: string
  created_at: string
}

// Form types for API operations
export interface CreateSupplierRequest {
  name: string
  code: string
  contact_email?: string
  contact_phone?: string
  contact_person?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  website?: string
  payment_terms?: number
  minimum_order_amount?: number
  shipping_cost?: number
  notes?: string
}

export interface CreateLocationRequest {
  practice_id: string
  name: string
  code: string
  description?: string
  location_type: 'storage' | 'treatment' | 'emergency' | 'mobile' | 'warehouse' | 'clinic' | 'drop_point'
  address?: string
  floor_level?: string
  room_number?: string
  contact_email?: string
  contact_phone?: string
  is_main_location?: boolean
  requires_counting?: boolean
  allows_negative_stock?: boolean
}

export interface UpdateLocationRequest {
  id: string
  practice_id: string
  name?: string
  code?: string
  description?: string
  location_type?: 'storage' | 'treatment' | 'emergency' | 'mobile' | 'warehouse' | 'clinic' | 'drop_point'
  address?: string
  floor_level?: string
  room_number?: string
  contact_email?: string
  contact_phone?: string
  is_main_location?: boolean
  requires_counting?: boolean
  allows_negative_stock?: boolean
  restricted_access?: boolean
  access_code?: string
  responsible_user_id?: string
}

export interface StockUpdateRequest {
  practice_id: string
  location_id: string
  product_id: string
  quantity_change: number
  movement_type: MovementType
  reference_type?: string
  reference_id?: string
  reason_code?: ReasonCode
  notes?: string
}

export interface StartCountingSessionRequest {
  practice_id: string
  name: string
  session_type: 'full' | 'partial' | 'spot_check' | 'cycle'
  location_ids: string[]
  product_ids?: string[]
  category_filter?: string
  allow_negative_counts?: boolean
  require_approval?: boolean
  auto_adjust_stock?: boolean
  notes?: string
}

// Mobile-optimized types for counting interface
export interface CountingProduct {
  id: string
  name: string
  sku: string
  category?: string
  brand?: string
  unit?: string
  current_system_quantity: number
  last_counted_at?: string
  location_name: string
  barcode?: string
  image_url?: string
}

export interface CountingStats {
  total_products: number
  counted_products: number
  remaining_products: number
  discrepancies: number
  progress_percentage: number
}

// Analytics types
export interface InventoryKPI {
  total_sku_count: number
  total_stock_value: number
  low_stock_items: number
  out_of_stock_items: number
  stock_turnover_rate: number
  average_days_to_stockout: number
  top_moving_products: Array<{
    product_id: string
    product_name: string
    movement_count: number
    total_quantity_moved: number
  }>
  stock_accuracy_percentage: number
  last_full_count_date?: string
}

export interface LocationPerformance {
  location_id: string
  location_name: string
  total_products: number
  stock_accuracy: number
  avg_count_frequency_days: number
  last_counted_at?: string
  critical_items_count: number
} 