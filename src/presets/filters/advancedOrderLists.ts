import type { FilterPreset } from '@/types/filters';

export const advancedOrderListsFilterPreset: FilterPreset = {
  id: 'advancedOrderLists',
  name: 'Geavanceerde Bestellijsten Filters',
  fields: [
    {
      id: 'search',
      label: 'Zoeken',
      type: 'text',
      placeholder: 'Zoek bestellijsten...',
      icon: 'search',
      priority: 1,
      variant: 'outlined',
      size: 'md',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Actief', value: 'active' },
        { label: 'Concept', value: 'draft' },
        { label: 'Verzonden', value: 'submitted' },
        { label: 'Voltooid', value: 'completed' },
        { label: 'Geannuleerd', value: 'cancelled' },
      ],
      priority: 2,
      variant: 'outlined',
      size: 'md',
    },
    {
      id: 'supplier',
      label: 'Leverancier',
      type: 'select',
      options: [], // Will be populated dynamically
      priority: 3,
      variant: 'outlined',
      size: 'md',
    },
    {
      id: 'urgency',
      label: 'Urgentie',
      type: 'select',
      options: [
        { label: 'Kritiek', value: 'critical' },
        { label: 'Hoog', value: 'high' },
        { label: 'Normaal', value: 'normal' },
        { label: 'Laag', value: 'low' },
      ],
      priority: 4,
      variant: 'outlined',
      size: 'md',
    },
    {
      id: 'viewMode',
      label: 'Weergave',
      type: 'toggle',
      options: [
        { label: 'Kaarten', value: 'cards', icon: 'view_module' },
        { label: 'Lijst', value: 'list', icon: 'view_list' },
      ],
      priority: 5,
      variant: 'outlined',
      size: 'md',
    },
  ],

  layout: {
    columns: {
      desktop: 4,
      tablet: 2,
      mobile: 1,
    },
    showMoreThreshold: 4,
    resetButton: true,
    clearAllButton: true,
    compactMode: false,
    spacing: 'md',
  },
};
