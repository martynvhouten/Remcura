import type { FilterPreset } from 'src/types/filters';

/**
 * InventoryLevelsPage Filter Preset
 *
 * All fields validated against Supabase `stock_levels` table schema:
 * ✅ location_id, product_id (via products relation) exist
 * ⚠️ stock_status is computed from current_quantity vs minimum_quantity
 */
export const inventoryFilterPreset: FilterPreset = {
  id: 'inventory',
  name: 'filters.inventory.title',
  description: 'filters.inventory.description',

  fields: [
    // === Primary Search ===
    {
      id: 'search',
      type: 'text',
      label: 'filters.inventory.fields.search.label',
      placeholder: 'filters.inventory.fields.search.placeholder',
      icon: 'search',
      searchFields: ['products.name', 'products.sku', 'products.brand'],
      clearable: true,
      debounce: 300,
      priority: 1,
    },

    // === Location Filter ===
    {
      id: 'location',
      type: 'select',
      label: 'filters.inventory.fields.location.label',
      placeholder: 'filters.inventory.fields.location.placeholder',
      icon: 'location_on',
      dataSource: {
        type: 'supabase',
        table: 'practice_locations',
        valueField: 'id',
        labelField: 'name',
        filters: [{ field: 'is_active', operator: 'eq', value: true }],
        orderBy: [{ field: 'name', direction: 'asc' }],
      },
      clearable: true,
      priority: 2,
    },

    // === Stock Status Filter ===
    {
      id: 'stock_status',
      type: 'select',
      label: 'filters.inventory.fields.stockStatus.label',
      placeholder: 'filters.inventory.fields.stockStatus.placeholder',
      icon: 'inventory',
      dataSource: {
        type: 'static',
        options: [
          {
            value: 'in_stock',
            label: 'filters.inventory.fields.stockStatus.options.inStock',
            color: 'positive',
            icon: 'check_circle',
          },
          {
            value: 'low_stock',
            label: 'filters.inventory.fields.stockStatus.options.lowStock',
            color: 'warning',
            icon: 'warning',
          },
          {
            value: 'out_of_stock',
            label: 'filters.inventory.fields.stockStatus.options.outOfStock',
            color: 'negative',
            icon: 'cancel',
          },
        ],
      },
      clearable: true,
      priority: 3,
      // TODO: Implement computed field logic
      computed: {
        source: 'stock_levels',
        logic: 'current_quantity vs minimum_quantity',
      },
    },

    // === Category Filter ===
    {
      id: 'category',
      type: 'select',
      label: 'filters.inventory.fields.category.label',
      placeholder: 'filters.inventory.fields.category.placeholder',
      icon: 'category',
      dataSource: {
        type: 'supabase',
        table: 'products',
        valueField: 'category',
        labelField: 'category',
        distinct: true,
        filters: [{ field: 'active', operator: 'eq', value: true }],
        orderBy: [{ field: 'category', direction: 'asc' }],
      },
      clearable: true,
      priority: 4,
    },

    // === Quantity Filters ===
    {
      id: 'current_quantity',
      type: 'number_range',
      label: 'filters.inventory.fields.quantityRange.label',
      placeholder: 'filters.inventory.fields.quantityRange.placeholder',
      icon: 'format_list_numbered',
      step: 1,
      clearable: true,
      priority: 5,
    },

    // === Low Stock Toggle ===
    {
      id: 'low_stock_only',
      type: 'boolean',
      label: 'filters.inventory.fields.lowStockOnly.label',
      tooltip: 'filters.inventory.fields.lowStockOnly.tooltip',
      icon: 'warning',
      variant: 'toggle',
      color: 'warning',
      priority: 6,
    },
  ],

  // === Layout Configuration ===
  layout: {
    columns: {
      desktop: 3,
      tablet: 2,
      mobile: 1,
    },
    showMoreThreshold: 4,
    resetButton: true,
    clearAllButton: true,
    compactMode: false,
  },

  // === Default State ===
  defaultFilters: {
    location: null,
    stock_status: null,
    low_stock_only: false,
  },

  // === Validation ===
  validation: {
    required: [],
    dependencies: [],
  },
};
