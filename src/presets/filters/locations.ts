import type { FilterPreset } from 'src/types/filters';

/**
 * Locations Filter Preset
 *
 * Filters for the LocationsPage to search and filter locations.
 */
export const locationsFilterPreset: FilterPreset = {
  id: 'locations',
  name: 'filters.locations.title',
  description: 'filters.locations.description',

  fields: [
    // === Primary Search ===
    {
      id: 'search',
      type: 'text',
      label: 'filters.locations.fields.search.label',
      placeholder: 'filters.locations.fields.search.placeholder',
      icon: 'search',
      searchFields: ['name', 'type', 'description'],
      clearable: true,
      debounce: 300,
      priority: 1,
    },

    // === Location Type Filter ===
    {
      id: 'type',
      type: 'select',
      label: 'filters.locations.fields.type.label',
      placeholder: 'filters.locations.fields.type.placeholder',
      icon: 'category',
      dataSource: {
        type: 'static',
        options: [
          {
            value: 'warehouse',
            label: 'locations.types.warehouse',
            icon: 'warehouse',
          },
          {
            value: 'pharmacy',
            label: 'locations.types.pharmacy',
            icon: 'local_pharmacy',
          },
          {
            value: 'treatment_room',
            label: 'locations.types.treatmentRoom',
            icon: 'meeting_room',
          },
          {
            value: 'storage',
            label: 'locations.types.storage',
            icon: 'inventory_2',
          },
        ],
      },
      clearable: true,
      priority: 2,
    },

    // === Main Location Filter ===
    {
      id: 'is_main',
      type: 'boolean',
      label: 'filters.locations.fields.isMain.label',
      icon: 'star',
      variant: 'toggle',
      color: 'warning',
      priority: 3,
    },
  ],

  // === Layout Configuration ===
  layout: {
    columns: {
      desktop: 3,
      tablet: 2,
      mobile: 1,
    },
    showMoreThreshold: 3,
    resetButton: true,
    clearAllButton: true,
    compactMode: true,
  },

  // === Default State ===
  defaultFilters: {},

  // === Validation ===
  validation: {
    required: [],
    dependencies: [],
  },
};
