// Magento integration types
export interface MagentoConfig {
  baseUrl: string;
  adminToken: string;
  token?: string; // Alias for adminToken, used by API service
  storeId?: number;
  storeCode?: string; // Store view code
  timeout?: number;
}

export interface MagentoOrder {
  entity_id: number;
  increment_id: string;
  state: string;
  status: string;
  customer_email: string;
  customer_firstname: string;
  customer_lastname: string;
  grand_total: number;
  created_at: string;
  updated_at: string;
  items: MagentoOrderItem[];
  billing_address: MagentoAddress;
  shipping_address: MagentoAddress;
  payment: MagentoPayment;
}

export interface MagentoOrderItem {
  item_id: number;
  product_id: number;
  sku: string;
  name: string;
  qty_ordered: number;
  qty_shipped: number;
  qty_invoiced: number;
  price: number;
  row_total: number;
}

export interface MagentoAddress {
  entity_id: number;
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region: string;
  postcode: string;
  country_id: string;
  telephone: string;
  email?: string;
}

export interface MagentoPayment {
  method: string;
  amount_ordered: number;
  amount_paid: number;
  base_amount_ordered: number;
  base_amount_paid: number;
}

export interface MagentoInvoice {
  entity_id: number;
  order_id: number;
  increment_id: string;
  state: number;
  grand_total: number;
  created_at: string;
  items: MagentoInvoiceItem[];
}

export interface MagentoInvoiceItem {
  entity_id: number;
  sku: string;
  name: string;
  qty: number;
  price: number;
  row_total: number;
}

export interface MagentoProduct {
  id: number;
  sku: string;
  name: string;
  price: number;
  status: number;
  visibility: number;
  type_id: string;
  weight: number;
  custom_attributes: MagentoCustomAttribute[];
}

export interface MagentoCustomAttribute {
  attribute_code: string;
  value: any;
}

export interface MagentoSearchCriteria {
  filterGroups: MagentoFilterGroup[];
  sortOrders?: MagentoSortOrder[];
  pageSize?: number;
  currentPage?: number;
}

export interface MagentoFilterGroup {
  filters: MagentoFilter[];
}

export interface MagentoFilter {
  field: string;
  value: any;
  condition_type: string;
}

export interface MagentoSortOrder {
  field: string;
  direction: 'ASC' | 'DESC';
}
