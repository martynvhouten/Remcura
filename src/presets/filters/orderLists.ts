/**
 * Order Lists Filter Preset
 *
 * FilterPreset configuratie voor OrderListsPage met search, supplier en status filters
 */

import type { FilterPreset } from '@/types/filters';

export const orderListsFilterPreset: FilterPreset = {
  id: 'orderLists',
  name: 'orderLists.filtersTitle',
  description: 'orderLists.filtersDescription',
  version: '1.0.0',

  fields: [
    // Search Field - prioriteit 1
    {
      id: 'search',
      type: 'text',
      label: 'common.search',
      placeholder: 'orderLists.searchPlaceholder',
      icon: 'search',
      priority: 1,
      clearable: true,
      debounce: 300,
      size: 'md',
      searchFields: ['name', 'description', 'supplier.name'],
    },

    // Supplier Filter - prioriteit 2
    {
      id: 'supplier',
      type: 'select',
      label: 'orderLists.supplier',
      placeholder: 'orderLists.selectSupplier',
      icon: 'business',
      priority: 2,
      clearable: true,
      size: 'md',
      dataSource: {
        type: 'supabase',
        table: 'suppliers',
        valueField: 'id',
        labelField: 'name',
        orderBy: [{ field: 'name', direction: 'asc' }],
        filters: [{ field: 'active', operator: 'eq', value: true }],
      },
    },

    // Status Filter - prioriteit 3
    {
      id: 'status',
      type: 'select',
      label: 'orderLists.status',
      placeholder: 'orderLists.selectStatus',
      icon: 'assignment_turned_in',
      priority: 3,
      clearable: true,
      size: 'md',
      dataSource: {
        type: 'static',
        options: [
          {
            value: 'draft',
            label: 'orderLists.statusDraft',
            icon: 'edit',
            color: 'grey',
          },
          {
            value: 'ready',
            label: 'orderLists.statusReady',
            icon: 'check_circle',
            color: 'blue',
          },
          {
            value: 'submitted',
            label: 'orderLists.statusSubmitted',
            icon: 'send',
            color: 'orange',
          },
          {
            value: 'confirmed',
            label: 'orderLists.statusConfirmed',
            icon: 'verified',
            color: 'green',
          },
          {
            value: 'delivered',
            label: 'orderLists.statusDelivered',
            icon: 'local_shipping',
            color: 'positive',
          },
          {
            value: 'cancelled',
            label: 'orderLists.statusCancelled',
            icon: 'cancel',
            color: 'negative',
          },
        ],
      },
    },

    // Date Range Filter - prioriteit 4
    {
      id: 'dateRange',
      type: 'date_range',
      label: 'orderLists.dateRange',
      placeholder: {
        start: 'orderLists.dateFrom',
        end: 'orderLists.dateTo',
      },
      icon: 'date_range',
      priority: 4,
      clearable: true,
      size: 'md',
    },

    // Total Amount Range - prioriteit 5
    {
      id: 'amountRange',
      type: 'number_range',
      label: 'orderLists.amountRange',
      placeholder: {
        min: 'orderLists.minAmount',
        max: 'orderLists.maxAmount',
      },
      icon: 'euro',
      priority: 5,
      clearable: true,
      currency: '€',
      step: 0.01,
      size: 'md',
    },

    // Only lists with items
    {
      id: 'hasItems',
      type: 'boolean',
      label: 'orderLists.onlyWithItems',
      icon: 'inventory',
      priority: 6,
      variant: 'checkbox',
      size: 'md',
    },
  ],

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
    spacing: 'md',
  },

  // No default filters - all fields start empty
};
