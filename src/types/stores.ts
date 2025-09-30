import type {
  OrderListDTO,
  OrderListItemDTO,
  OrderListStatus,
} from '@/types/inventory';

export interface OrderListWithItems extends OrderListDTO {
  items: OrderListItemDTO[];
}

export interface CreateOrderListRequest {
  practice_id: string;
  supplier_id?: string;
  location_id: string;
  name: string;
  description?: string;
  status?: OrderListStatus;
}

export interface UpdateOrderListRequest {
  id: string;
  supplier_id?: string;
  location_id?: string;
  name?: string;
  description?: string;
  status?: OrderListStatus;
}

export interface AddOrderListItemRequest {
  order_list_id: string;
  product_id: string;
  supplier_product_id: string;
  requested_quantity: number;
  notes?: string;
}
