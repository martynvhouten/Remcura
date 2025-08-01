// Re-export the modular products store for backward compatibility
export { useProductsStore } from './products/index';
export type { 
  ProductWithStock,
  ProductCategory,
  ProductFilter,
  CartItem,
  OrderListCart,
} from '@/types/inventory';