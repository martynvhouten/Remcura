/**
 * Filter System Types
 *
 * Comprehensive type definitions for the herbruikbaar FilterPanel component system
 */

// === Core Filter Field Types ===
export type FilterFieldType =
  | 'text'
  | 'select'
  | 'multi_select'
  | 'boolean'
  | 'number'
  | 'number_range'
  | 'date'
  | 'date_range'
  | 'country';

export type FilterOperator =
  | 'eq' // equals
  | 'neq' // not equals
  | 'gt' // greater than
  | 'gte' // greater than or equal
  | 'lt' // less than
  | 'lte' // less than or equal
  | 'like' // contains (case insensitive)
  | 'ilike' // contains (case insensitive)
  | 'in' // in array
  | 'not in' // not in array
  | 'is' // is null
  | 'is not'; // is not null

// === Data Source Configuration ===
export interface FilterDataSource {
  type: 'supabase' | 'static' | 'computed';

  // For Supabase sources
  table?: string;
  valueField?: string;
  labelField?: string;
  distinct?: boolean;
  filters?: Array<{
    field: string;
    operator: FilterOperator;
    value: unknown;
  }>;
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;

  // For static sources
  options?: Array<{
    value: string | number | boolean;
    label: string;
    icon?: string;
    color?: string;
    disabled?: boolean;
  }>;

  // For computed sources
  computation?: {
    source: string;
    logic: string;
    dependencies?: string[];
  };
}

// === Filter Field Validation ===
export interface FilterValidation {
  required?: boolean;
  pattern?: RegExp;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  message?: string;
  customValidator?: (value: unknown) => boolean | string;
}

// === Individual Filter Field Definition ===
export interface FilterField {
  // Core Properties
  id: string;
  type: FilterFieldType;
  label: string;
  placeholder?: string | { min?: string; max?: string };
  icon?: string;

  // Data & Options
  dataSource?: FilterDataSource;
  clearable?: boolean;
  multiple?: boolean;

  // Styling & Behavior
  variant?: 'outlined' | 'filled' | 'standard' | 'toggle' | 'switch' | 'chip';
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dense?: boolean;

  // Special Features
  scannerButton?: boolean; // For GTIN/barcode fields
  flagIcons?: boolean; // For country fields
  currency?: string; // For price fields
  step?: number; // For number fields
  debounce?: number; // For text fields

  // Organization
  group?: string;
  priority?: number;
  searchFields?: string[]; // Which database fields to search

  // Validation
  validation?: FilterValidation;

  // Computed Fields
  computed?: {
    source: string;
    logic: string;
    dependencies?: string[];
  };

  // Conditional Display
  showWhen?: {
    field: string;
    operator: FilterOperator;
    value: unknown;
  };
}

// === Filter Groups ===
export interface FilterGroup {
  label: string;
  icon?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  description?: string;
  color?: string;
}

// === Layout Configuration ===
export interface FilterLayout {
  columns: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  showMoreThreshold?: number;
  resetButton?: boolean;
  clearAllButton?: boolean;
  compactMode?: boolean;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
}

// === Filter Preset Definition ===
export interface FilterPreset {
  // Metadata
  id: string;
  name: string;
  description?: string;
  version?: string;

  // Filter Configuration
  fields: FilterField[];
  groups?: Record<string, FilterGroup>;
  layout: FilterLayout;

  // State Management
  defaultFilters?: Record<string, unknown>;
  validation?: {
    required?: string[];
    dependencies?: Array<{
      field: string;
      dependsOn: string;
      condition: FilterOperator;
      value: unknown;
    }>;
  };

  // Advanced Features
  saveState?: boolean;
  urlSync?: boolean;
  exportable?: boolean;
}

// === Filter Values ===
export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | Array<string | number>
  | { min?: number; max?: number }
  | { from?: Date; to?: Date }
  | null
  | undefined;

export type FilterValues = Record<string, FilterValue>;

// === Filter Change Events ===
export interface FilterChangeEvent {
  field: string;
  value: FilterValue;
  oldValue?: FilterValue;
  preset: string;
}

export interface FilterResetEvent {
  fields: string[];
  preset: string;
}

// === Component Props ===
export interface FilterPanelProps {
  preset: FilterPreset;
  modelValue: FilterValues;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;

  // Customization
  showHeader?: boolean;
  showFooter?: boolean;
  collapsible?: boolean;
  initiallyCollapsed?: boolean;

  // Events
  'onUpdate:modelValue'?: (values: FilterValues) => void;
  onChange?: (event: FilterChangeEvent) => void;
  onReset?: (event: FilterResetEvent) => void;
  onClear?: () => void;
}

export interface FilterFieldProps {
  field: FilterField;
  modelValue: FilterValue;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;

  // Events
  'onUpdate:modelValue'?: (value: FilterValue) => void;
  onChange?: (value: FilterValue, oldValue?: FilterValue) => void;
  onScan?: (scannedValue: string) => void; // For scanner buttons
}

// === Utility Types ===
export type FilterPresetRegistry = Record<string, FilterPreset>;

export interface FilterManager {
  getPreset(id: string): FilterPreset | undefined;
  registerPreset(preset: FilterPreset): void;
  validateFilters(preset: FilterPreset, values: FilterValues): string[];
  applyDefaults(preset: FilterPreset): FilterValues;
  serializeFilters(values: FilterValues): string;
  deserializeFilters(serialized: string): FilterValues;
}
