import type { FilterPreset } from '@/types/filters'

/**
 * SuppliersPage Filter Preset
 * 
 * All fields validated against Supabase `suppliers` table schema:
 * ✅ name, contact_email, contact_phone, is_active exist
 * ✅ country, city, integration_type exist
 */
export const suppliersFilterPreset: FilterPreset = {
  id: 'suppliers',
  name: 'filters.suppliers.title',
  description: 'filters.suppliers.description',
  
  fields: [
    // === Primary Search ===
    {
      id: 'search',
      type: 'text',
      label: 'filters.suppliers.fields.search.label',
      placeholder: 'filters.suppliers.fields.search.placeholder',
      icon: 'search',
      searchFields: ['name', 'contact_email', 'contact_phone', 'contact_person'],
      clearable: true,
      debounce: 300,
      priority: 1
    },

    // === Status Filter ===
    {
      id: 'status',
      type: 'select',
      label: 'filters.suppliers.fields.status.label',
      placeholder: 'filters.suppliers.fields.status.placeholder',
      icon: 'toggle_on',
      dataSource: {
        type: 'static',
        options: [
          { value: true, label: 'filters.suppliers.fields.status.options.active', color: 'positive', icon: 'check_circle' },
          { value: false, label: 'filters.suppliers.fields.status.options.inactive', color: 'negative', icon: 'cancel' }
        ]
      },
      clearable: true,
      priority: 2
    },

    // === Integration Type ===
    {
      id: 'integration_type',
      type: 'select',
      label: 'filters.suppliers.fields.integrationType.label',
      placeholder: 'filters.suppliers.fields.integrationType.placeholder',
      icon: 'integration_instructions',
      dataSource: {
        type: 'static',
        options: [
          { value: 'manual', label: 'filters.suppliers.fields.integrationType.options.manual', icon: 'person', color: 'grey' },
          { value: 'magento', label: 'filters.suppliers.fields.integrationType.options.magento', icon: 'shopping_cart', color: 'orange' },
          { value: 'api', label: 'filters.suppliers.fields.integrationType.options.api', icon: 'api', color: 'blue' }
        ]
      },
      clearable: true,
      priority: 3
    },

    // === Location Filters ===
    {
      id: 'country',
      type: 'country',
      label: 'filters.suppliers.fields.country.label',
      placeholder: 'filters.suppliers.fields.country.placeholder',
      icon: 'flag',
      dataSource: {
        type: 'supabase',
        table: 'suppliers',
        valueField: 'country',
        labelField: 'country',
        distinct: true,
        filters: [{ field: 'country', operator: 'is not', value: null }],
        orderBy: [{ field: 'country', direction: 'asc' }]
      },
      flagIcons: true,
      clearable: true,
      priority: 4
    },

    {
      id: 'city',
      type: 'select',
      label: 'filters.suppliers.fields.city.label',
      placeholder: 'filters.suppliers.fields.city.placeholder',
      icon: 'location_city',
      dataSource: {
        type: 'supabase',
        table: 'suppliers',
        valueField: 'city',
        labelField: 'city',
        distinct: true,
        filters: [{ field: 'city', operator: 'is not', value: null }],
        orderBy: [{ field: 'city', direction: 'asc' }]
      },
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
    status: true // Default to active suppliers
  },

  // === Validation ===
  validation: {
    required: [],
    dependencies: []
  }
} 