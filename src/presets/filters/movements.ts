import type { FilterPreset } from 'src/types/filters'

/**
 * Stock Movements Filter Preset
 * 
 * Filters for the MovementsPage to filter stock movements by type, location, date range, etc.
 */
export const movementsFilterPreset: FilterPreset = {
  id: 'movements',
  name: 'filters.movements.title',
  description: 'filters.movements.description',
  
  fields: [
    // === Movement Type Filter ===
    {
      id: 'movement_type',
      type: 'select',
      label: 'filters.movements.fields.movementType.label',
      placeholder: 'filters.movements.fields.movementType.placeholder',
      icon: 'filter_list',
      dataSource: {
        type: 'static',
        options: [
          { value: 'receipt', label: 'inventory.movement.receipt', color: 'positive', icon: 'add_circle' },
          { value: 'usage', label: 'inventory.movement.usage', color: 'negative', icon: 'remove_circle' },
          { value: 'transfer', label: 'inventory.movement.transfer', color: 'info', icon: 'swap_horiz' },
          { value: 'adjustment', label: 'inventory.movement.adjustment', color: 'warning', icon: 'edit' },
          { value: 'count', label: 'inventory.movement.count', color: 'secondary', icon: 'checklist' },
          { value: 'waste', label: 'inventory.movement.waste', color: 'negative', icon: 'delete' }
        ]
      },
      clearable: true,
      priority: 1
    },

    // === Location Filter ===
    {
      id: 'location_id',
      type: 'select',
      label: 'filters.movements.fields.location.label',
      placeholder: 'filters.movements.fields.location.placeholder',
      icon: 'place',
      dataSource: {
        type: 'supabase',
        table: 'practice_locations',
        valueField: 'id',
        labelField: 'name',
        filters: [{ field: 'is_active', operator: 'eq', value: true }],
        orderBy: [{ field: 'name', direction: 'asc' }]
      },
      clearable: true,
      priority: 2
    },

    // === Date Range Filter ===
    {
      id: 'date_range',
      type: 'date_range',
      label: 'filters.movements.fields.dateRange.label',
      placeholder: 'filters.movements.fields.dateRange.placeholder',
      icon: 'date_range',
      clearable: true,
      priority: 3
    },

    // === Product Search ===
    {
      id: 'product_search',
      type: 'text',
      label: 'filters.movements.fields.productSearch.label',
      placeholder: 'filters.movements.fields.productSearch.placeholder',
      icon: 'search',
      searchFields: ['product.name', 'product.sku'],
      clearable: true,
      debounce: 300,
      priority: 4
    }
  ],

  // === Layout Configuration ===
  layout: {
    columns: { 
      desktop: 4, 
      tablet: 2, 
      mobile: 1 
    },
    showMoreThreshold: 3,
    resetButton: true,
    clearAllButton: true,
    compactMode: true
  },

  // === Default State ===
  defaultFilters: {},

  // === Validation ===
  validation: {
    required: [],
    dependencies: []
  }
}