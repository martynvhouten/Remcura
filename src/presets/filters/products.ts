import type { FilterPreset } from '@/types/filters';

/**
 * ProductsPage Filter Preset
 *
 * All fields validated against Supabase `products` table schema:
 * ✅ gtin, gpc_brick_code, country_of_origin, product_lifecycle_status exist
 * ✅ category, brand, price, sku, name, description exist
 * ✅ preferred_supplier_id exists (relation to suppliers table)
 * ⚠️ stock_status is computed from stock_levels table join
 */
export const productsFilterPreset: FilterPreset = {
  id: 'products',
  name: 'filters.products.title',
  description: 'filters.products.description',

  fields: [
    // === PRIMARY SEARCH (No Group) ===
    {
      id: 'search',
      type: 'text',
      label: 'filters.products.fields.search.label',
      placeholder: 'filters.products.fields.search.placeholder',
      icon: 'search',
      searchFields: ['name', 'sku', 'brand', 'description'],
      clearable: true,
      debounce: 300,
      priority: 1,
      size: 'lg',
    },

    // === CATALOG GROUP ===
    {
      id: 'category',
      type: 'select',
      label: 'filters.products.fields.category.label',
      placeholder: 'filters.products.fields.category.placeholder',
      icon: 'category',
      group: 'catalog',
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
      priority: 2,
      size: 'md',
    },

    {
      id: 'supplier',
      type: 'select',
      label: 'filters.products.fields.supplier.label',
      placeholder: 'filters.products.fields.supplier.placeholder',
      icon: 'business',
      group: 'catalog',
      dataSource: {
        type: 'supabase',
        table: 'suppliers',
        valueField: 'id',
        labelField: 'name',
        filters: [{ field: 'is_active', operator: 'eq', value: true }],
        orderBy: [{ field: 'name', direction: 'asc' }],
      },
      clearable: true,
      priority: 3,
      size: 'md',
    },

    // === INVENTORY GROUP ===
    {
      id: 'stock_status',
      type: 'select',
      label: 'filters.products.fields.stockStatus.label',
      placeholder: 'filters.products.fields.stockStatus.placeholder',
      icon: 'inventory',
      group: 'inventory',
      dataSource: {
        type: 'static',
        options: [
          {
            value: 'in_stock',
            label: 'filters.products.fields.stockStatus.options.inStock',
            color: 'positive',
            icon: 'check_circle',
          },
          {
            value: 'low_stock',
            label: 'filters.products.fields.stockStatus.options.lowStock',
            color: 'warning',
            icon: 'warning',
          },
          {
            value: 'out_of_stock',
            label: 'filters.products.fields.stockStatus.options.outOfStock',
            color: 'negative',
            icon: 'cancel',
          },
        ],
      },
      clearable: true,
      priority: 4,
      size: 'md',
    },

    {
      id: 'price_range',
      type: 'number_range',
      label: 'filters.products.fields.priceRange.label',
      placeholder: {
        min: 'filters.products.fields.priceRange.placeholder.min',
        max: 'filters.products.fields.priceRange.placeholder.max',
      },
      icon: 'euro',
      currency: '€',
      step: 0.01,
      group: 'catalog',
      priority: 5,
      size: 'md',
    },

    {
      id: 'orderable_only',
      type: 'boolean',
      label: 'filters.products.fields.orderableOnly.label',
      tooltip: 'filters.products.fields.orderableOnly.tooltip',
      icon: 'shopping_cart',
      variant: 'toggle',
      color: 'positive',
      group: 'inventory',
      priority: 6,
      size: 'sm',
    },

    // === ADVANCED GROUP ===
    {
      id: 'gtin',
      type: 'text',
      label: 'filters.products.fields.gtin.label',
      placeholder: 'filters.products.fields.gtin.placeholder',
      icon: 'qr_code_2',
      scannerButton: true,
      tooltip: 'filters.products.fields.gtin.tooltip',
      clearable: true,
      group: 'advanced',
      priority: 7,
      size: 'md',
    },

    {
      id: 'country_of_origin',
      type: 'country',
      label: 'filters.products.fields.countryOfOrigin.label',
      placeholder: 'filters.products.fields.countryOfOrigin.placeholder',
      icon: 'flag',
      flagIcons: true,
      group: 'advanced',
      dataSource: {
        type: 'supabase',
        table: 'products',
        valueField: 'country_of_origin',
        labelField: 'country_of_origin',
        distinct: true,
        filters: [
          { field: 'active', operator: 'eq', value: true },
          { field: 'country_of_origin', operator: 'is not', value: null },
        ],
        orderBy: [{ field: 'country_of_origin', direction: 'asc' }],
      },
      clearable: true,
      priority: 8,
      size: 'md',
    },

    {
      id: 'gpc_brick_code',
      type: 'select',
      label: 'filters.products.fields.gpcBrickCode.label',
      placeholder: 'filters.products.fields.gpcBrickCode.placeholder',
      icon: 'widgets',
      group: 'advanced',
      dataSource: {
        type: 'supabase',
        table: 'products',
        valueField: 'gpc_brick_code',
        labelField: 'gpc_brick_code',
        distinct: true,
        filters: [
          { field: 'active', operator: 'eq', value: true },
          { field: 'gpc_brick_code', operator: 'is not', value: null },
        ],
        orderBy: [{ field: 'gpc_brick_code', direction: 'asc' }],
      },
      clearable: true,
      priority: 9,
      size: 'md',
    },

    {
      id: 'lifecycle_status',
      type: 'select',
      label: 'filters.products.fields.lifecycleStatus.label',
      placeholder: 'filters.products.fields.lifecycleStatus.placeholder',
      icon: 'timeline',
      group: 'advanced',
      dataSource: {
        type: 'static',
        options: [
          {
            value: 'active',
            label: 'filters.products.fields.lifecycleStatus.options.active',
            color: 'positive',
          },
          {
            value: 'discontinued',
            label:
              'filters.products.fields.lifecycleStatus.options.discontinued',
            color: 'negative',
          },
          {
            value: 'new',
            label: 'filters.products.fields.lifecycleStatus.options.new',
            color: 'info',
          },
          {
            value: 'phase_out',
            label: 'filters.products.fields.lifecycleStatus.options.phaseOut',
            color: 'warning',
          },
        ],
      },
      clearable: true,
      priority: 10,
      size: 'md',
    },
  ],

  // Default filter values
  defaultFilters: {
    search: '',
    category: '',
    supplier: '',
    stock_status: '',
    orderable_only: false,
  },

  // Layout configuration
  layout: {
    columns: {
      desktop: 4, // 4 columns on desktop - more compact
      tablet: 2, // 2 columns on tablet
      mobile: 1, // 1 column on mobile
    },
    spacing: 'sm', // Tighter spacing
    compactMode: true, // Enable compact mode
    showMoreThreshold: 4, // Show first 4 fields, then show more
    resetButton: true,
    clearAllButton: true,
  },

  // Group filters for better organization
  groups: {
    search: {
      label: 'filters.products.groups.search.label',
      description: 'filters.products.groups.search.description',
      icon: 'search',
      collapsed: false,
      collapsible: false,
    },
    catalog: {
      label: 'filters.products.groups.catalog.label',
      description: 'filters.products.groups.catalog.description',
      icon: 'category',
      collapsed: false,
      collapsible: true,
    },
    inventory: {
      label: 'filters.products.groups.inventory.label',
      description: 'filters.products.groups.inventory.description',
      icon: 'inventory',
      collapsed: true,
      collapsible: true,
    },
    advanced: {
      label: 'filters.products.groups.advanced.label',
      description: 'filters.products.groups.advanced.description',
      icon: 'tune',
      collapsed: true,
      collapsible: true,
    },
  },

  // Advanced options
  options: {
    enableBulkActions: true,
    enableExport: true,
    enableSavedFilters: true,
    enableRealtime: true,
  },
};
