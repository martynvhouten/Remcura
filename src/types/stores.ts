import type { OrderList, OrderListItem } from '@/types/inventory';

// Store-specific types that extend base types
export interface OrderListWithItems extends OrderList {
  items: OrderListItem[];
  total_items: number;
  total_cost: number;
}

export interface CreateOrderListRequest {
  name: string;
  description?: string;
  location_id: string;
  supplier_id?: string;
  status?: 'draft' | 'active' | 'submitted' | 'completed' | 'cancelled';
  is_template?: boolean;
  template_name?: string;
}

export interface UpdateOrderListRequest {
  name?: string;
  description?: string;
  location_id?: string;
  supplier_id?: string;
  status?: 'draft' | 'active' | 'submitted' | 'completed' | 'cancelled';
  is_template?: boolean;
  template_name?: string;
}

export interface AddOrderListItemRequest {
  order_list_id: string;
  product_id: string;
  quantity: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

// Product store types
export type ProductInsert = {
  practice_id: string;
  name: string;
  description?: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  price?: number;
  cost?: number;
  category?: string;
  tags?: string[];
  is_active?: boolean;
  min_stock_level?: number;
  max_stock_level?: number;
  unit?: string;
  storage_requirements?: string;
  supplier_id?: string;
};

export type ProductUpdate = Partial<ProductInsert>;

export type StockLevel = {
  product_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  min_level: number;
  max_level: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  last_updated: string;
};

// RPC response interface for get_products_with_stock_levels
export interface ProductWithStockRPC {
  id: string;
  name: string;
  description: string;
  brand: string;
  sku: string;
  barcode: string;
  price: number;
  cost: number;
  category: string;
  tags: string[];
  is_active: boolean;
  min_stock_level: number;
  max_stock_level: number;
  unit: string;
  storage_requirements: string;
  supplier_id: string;
  practice_id: string;
  created_at: string;
  updated_at: string;
  // Stock level fields from RPC
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  location_count: number;
}