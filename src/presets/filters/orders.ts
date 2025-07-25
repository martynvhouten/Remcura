/**
 * OrdersPage Filter Preset
 * 
 * All fields validated against Supabase `orders` table schema:
 * ✅ status, supplier_id, order_date, total_amount exist
 * ✅ expected_delivery_date, actual_delivery_date exist
 */

import type { FilterPreset } from '@/types/filters'

export const ordersFilterPreset: FilterPreset = {
  id: 'orders',
  name: 'filters.orders.title',
  description: 'filters.orders.description',
  
  fields: [
    // === Primary Filters ===
    {
      id: 'status',
      type: 'select',
      label: 'filters.orders.fields.status.label',
      placeholder: 'filters.orders.fields.status.placeholder',
      icon: 'assignment',
      dataSource: {
        type: 'static',
        options: [
          { value: 'draft', label: 'filters.orders.fields.status.options.draft', color: 'grey', icon: 'edit' },
          { value: 'submitted', label: 'filters.orders.fields.status.options.submitted', color: 'blue', icon: 'send' },
          { value: 'confirmed', label: 'filters.orders.fields.status.options.confirmed', color: 'orange', icon: 'verified' },
          { value: 'shipped', label: 'filters.orders.fields.status.options.shipped', color: 'purple', icon: 'local_shipping' },
          { value: 'delivered', label: 'filters.orders.fields.status.options.delivered', color: 'positive', icon: 'check_circle' },
          { value: 'cancelled', label: 'filters.orders.fields.status.options.cancelled', color: 'negative', icon: 'cancel' }
        ]
      },
      clearable: true,
      priority: 1
    },

    {
      id: 'supplier',
      type: 'select',
      label: 'filters.orders.fields.supplier.label',
      placeholder: 'filters.orders.fields.supplier.placeholder',
      icon: 'business',
      dataSource: {
        type: 'supabase',
        table: 'suppliers',
        valueField: 'id',
        labelField: 'name',
        filters: [{ field: 'is_active', operator: 'eq', value: true }],
        orderBy: [{ field: 'name', direction: 'asc' }]
      },
      clearable: true,
      priority: 2
    },

    // === Date Filters ===
    {
      id: 'order_date',
      type: 'date_range',
      label: 'filters.orders.fields.orderDateRange.label',
      placeholder: 'filters.orders.fields.orderDateRange.placeholder',
      icon: 'date_range',
      clearable: true,
      priority: 3
    },

    {
      id: 'delivery_date',
      type: 'date_range',
      label: 'filters.orders.fields.expectedDeliveryRange.label',
      placeholder: 'filters.orders.fields.expectedDeliveryRange.placeholder',
      icon: 'local_shipping',
      clearable: true,
      priority: 4
    },

    // === Amount Filter ===
    {
      id: 'total_amount',
      type: 'number_range',
      label: 'filters.orders.fields.amountRange.label',
      placeholder: 'filters.orders.fields.amountRange.placeholder',
      icon: 'euro',
      currency: 'EUR',
      step: 0.01,
      clearable: true,
      priority: 5
    }
  ],

  // === Layout Configuration ===
  layout: {
    columns: { 
      desktop: 3, 
      tablet: 2, 
      mobile: 1 
    },
    showMoreThreshold: 4,
    resetButton: true,
    clearAllButton: true,
    compactMode: false
  },

  // === Default State ===
  defaultFilters: {
    status: null
  },

  // === Validation ===
  validation: {
    required: [],
    dependencies: []
  }
} 