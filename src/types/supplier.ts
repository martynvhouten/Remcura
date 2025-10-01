/**
 * Supplier-related type definitions
 */

import type { Database } from './supabase.generated';

// Basic supplier types from database
export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type SupplierInsert =
  Database['public']['Tables']['suppliers']['Insert'];
export type SupplierUpdate =
  Database['public']['Tables']['suppliers']['Update'];

export type SupplierProduct =
  Database['public']['Tables']['supplier_products']['Row'];
export type SupplierProductInsert =
  Database['public']['Tables']['supplier_products']['Insert'];
export type SupplierProductUpdate =
  Database['public']['Tables']['supplier_products']['Update'];

export type SupplierOrder =
  Database['public']['Tables']['supplier_orders']['Row'];
export type SupplierOrderInsert =
  Database['public']['Tables']['supplier_orders']['Insert'];
export type SupplierOrderUpdate =
  Database['public']['Tables']['supplier_orders']['Update'];

// Legacy type aliases for compatibility
export type SupplierProductRecord = SupplierProduct;
