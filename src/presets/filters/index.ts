/**
 * Central Filter Presets Export
 *
 * Collectie van alle FilterPreset configuraties voor herbruikbaar gebruik
 */

export { productsFilterPreset } from './products';
export { suppliersFilterPreset } from './suppliers';
export { ordersFilterPreset } from './orders';
export { inventoryFilterPreset } from './inventory';
export { orderListsFilterPreset } from './orderLists';

// Type exports
export type * from '@/types/filters';

// Registry object voor dynamisch gebruik
import { productsFilterPreset } from './products';
import { suppliersFilterPreset } from './suppliers';
import { ordersFilterPreset } from './orders';
import { inventoryFilterPreset } from './inventory';
import { orderListsFilterPreset } from './orderLists';
import type { FilterPresetRegistry } from '@/types/filters';

export const filterPresetRegistry: FilterPresetRegistry = {
  products: productsFilterPreset,
  suppliers: suppliersFilterPreset,
  orders: ordersFilterPreset,
  inventory: inventoryFilterPreset,
  orderLists: orderListsFilterPreset,
};

// Helper function to get preset by ID
export function getFilterPreset(id: string) {
  return filterPresetRegistry[id];
}

// Helper function to list all available presets
export function listFilterPresets() {
  return Object.keys(filterPresetRegistry);
}
