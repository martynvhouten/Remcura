<template>
  <div class="filter-panel">
    <!-- Filter Toggle Button -->
    <div class="filter-toggle">
      <q-btn
        flat
        :icon="isFiltersVisible ? 'filter_list' : 'filter_list_off'"
        :label="t('filters.filterPanel.filtersButton')"
        @click="toggleFilters"
        class="filter-toggle-btn"
        :class="{ 'active': isFiltersVisible, 'has-active-filters': activeFiltersCount > 0 }"
      />
          <q-chip 
            v-if="activeFiltersCount > 0" 
            :label="activeFiltersCount" 
            color="primary"
            text-color="white"
            size="sm"
        class="filter-count-chip"
      />
    </div>

    <!-- Filter Content - Collapsible -->
    <q-slide-transition>
      <div v-show="isFiltersVisible" class="filter-content">
        <!-- Main Filter Fields Grid -->
        <div class="filter-grid">
          <!-- Regular fields (non-boolean) -->
          <template v-for="field in regularFields" :key="field.id">
            <div :class="getFieldGridClass(field)">
                <FilterField
                  :field="field"
                  :model-value="modelValue[field.id]"
                  @update:model-value="(value) => handleFieldChange(field.id, value)"
                  @change="(value, oldValue) => handleFieldChangeEvent(field, value, oldValue)"
                  @scan="(value) => handleScanEvent(field, value)"
                  :loading="loading"
                  :disabled="disabled"
                  :readonly="readonly"
                />
              </div>
            </template>
        </div>

        <!-- Boolean/Toggle Fields Section -->
        <div v-if="booleanFields.length > 0" class="filter-boolean-section">
          <template v-for="field in booleanFields" :key="field.id">
            <div class="filter-boolean-field">
              <FilterField
                :field="field"
                :model-value="modelValue[field.id]"
                @update:model-value="(value) => handleFieldChange(field.id, value)"
                @change="(value, oldValue) => handleFieldChangeEvent(field, value, oldValue)"
                @scan="(value) => handleScanEvent(field, value)"
                :loading="loading"
                :disabled="disabled"
                :readonly="readonly"
              />
            </div>
          </template>
        </div>

        <!-- Clear All Filters Button - Only when there are active filters -->
        <div v-if="activeFiltersCount > 0" class="filter-actions">
            <q-btn
              flat
              icon="clear_all"
            :label="t('filters.filterPanel.clearAllFilters')"
              @click="handleClearAll"
              :disable="disabled"
            class="filter-btn filter-btn--clear-all"
            />
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import FilterField from './FilterField.vue'
import type { 
  FilterPreset, 
  FilterValues, 
  FilterField as FilterFieldType,
  FilterChangeEvent,
  FilterResetEvent 
} from '@/types/filters'

interface Props {
  preset: FilterPreset
  modelValue: FilterValues
  loading?: boolean
  disabled?: boolean
  readonly?: boolean
  showHeader?: boolean
  showFooter?: boolean
  collapsible?: boolean
  initiallyCollapsed?: boolean
}

interface Emits {
  (e: 'update:modelValue', values: FilterValues): void
  (e: 'change', event: FilterChangeEvent): void
  (e: 'reset', event: FilterResetEvent): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  readonly: false,
  showHeader: true,
  showFooter: true,
  collapsible: true,
  initiallyCollapsed: false,
})

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()

// State
const isFiltersVisible = ref(!props.initiallyCollapsed)

// Computed - separated regular and boolean fields
const allFields = computed(() => {
  return [...props.preset.fields].sort((a, b) => (a.priority || 999) - (b.priority || 999))
})

const regularFields = computed(() => {
  return allFields.value.filter(field => field.type !== 'boolean')
})

const booleanFields = computed(() => {
  return allFields.value.filter(field => field.type === 'boolean')
})

const activeFiltersCount = computed(() => {
  return Object.values(props.modelValue).filter(value => {
    if (value === null || value === undefined || value === '') { return false; }
    if (Array.isArray(value) && value.length === 0) return false
    if (typeof value === 'object' && Object.keys(value).length === 0) return false
    return true
  }).length
})

// Methods
const getFieldGridClass = (field: FilterFieldType) => {
  const baseClasses = ['filter-field-container']
  
  // Add size-based classes based on field.size
  if (field.size) {
    baseClasses.push(`field-size-${field.size}`)
  } else {
    // Default sizing based on field type
    if (field.type === 'number_range' || field.type === 'date_range') {
      baseClasses.push('field-size-large')
    } else if (field.type === 'boolean') {
      baseClasses.push('field-size-small')
    } else {
      baseClasses.push('field-size-medium')
    }
  }
  
  return baseClasses.join(' ')
}

const handleFieldChange = (fieldId: string, value: any) => {
  const newValues = { ...props.modelValue, [fieldId]: value }
  
  // Clean up null/undefined values
  if (value === null || value === undefined || value === '') {
    delete newValues[fieldId]
  }
  
  emit('update:modelValue', newValues)
}

const handleFieldChangeEvent = (field: FilterFieldType, value: any, oldValue?: any) => {
  const changeEvent: FilterChangeEvent = {
    field: field.id,
    value,
    oldValue,
    preset: props.preset.id
  }
  
  emit('change', changeEvent)
}

const handleScanEvent = (field: FilterFieldType, scannedValue: string) => {
  // Handle barcode scanning for fields that support it
  if (field.scannerButton) {
    handleFieldChange(field.id, scannedValue)
  }
}

const handleClearAll = () => {
  emit('update:modelValue', {})
  emit('clear')
}

const toggleFilters = () => {
  isFiltersVisible.value = !isFiltersVisible.value
}

// Apply default filters on mount
onMounted(() => {
  if (props.preset.defaultFilters && Object.keys(props.modelValue).length === 0) {
    emit('update:modelValue', { ...props.preset.defaultFilters })
  }
})
</script>

<style lang="scss" scoped>
.filter-panel {
  width: 100%;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--neutral-200);
  overflow: hidden;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--space-4) var(--space-6);
  background: var(--neutral-50);
  border-bottom: 1px solid var(--neutral-200);
  
  .filter-toggle-btn {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    transition: all var(--transition-base);
    
    &.has-active-filters {
      color: var(--brand-primary);
      background: rgba(30, 58, 138, 0.08);
    }
    
    &.active {
      color: var(--brand-primary);
    }
  }
  
  .filter-count-chip {
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-full);
  }
}

.filter-content {
  padding: var(--space-6);
  background: white;
}

.filter-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: var(--space-6);
  
  // Responsive grid
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.filter-field-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0; // Allow shrinking
  
  // Size variations
  &.field-size-small {
    grid-column: span 1;
    max-width: 200px;
  }
  
  &.field-size-medium {
    grid-column: span 1;
  }
  
  &.field-size-large {
    grid-column: span 2;
    
    @media (max-width: 768px) {
      grid-column: span 1;
    }
  }
  
  &.field-size-full {
    grid-column: 1 / -1;
  }
}

.filter-btn {
  font-weight: var(--font-weight-medium);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-base);
  transition: all var(--transition-base);
  
  &--clear-all {
    color: var(--text-secondary);
    border: 1px solid var(--neutral-300);
    
    &:hover {
      color: var(--text-primary);
      background: var(--neutral-100);
      border-color: var(--neutral-400);
    }
  }
}

// Boolean fields section styling
.filter-boolean-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--neutral-200);
  
  .filter-boolean-field {
    display: flex;
    align-items: center;
    min-width: 200px;
    
    // On smaller screens, full width
    @media (max-width: 768px) {
      width: 100%;
      min-width: auto;
    }
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .filter-panel {
    border-radius: var(--radius-base);
    margin: 0 var(--space-2);
  }
  
  .filter-toggle {
    padding: var(--space-3) var(--space-4);
  }
  
  .filter-content {
    padding: var(--space-4);
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }
  
  .filter-field-container {
    &.field-size-small,
    &.field-size-medium,
    &.field-size-large {
      grid-column: span 1;
      max-width: none;
    }
  }
}

// Dark mode adjustments
body.body--dark {
  .filter-panel {
    background: var(--bg-secondary);
    border-color: var(--border-primary);
  }
  
  .filter-toggle {
    background: var(--bg-tertiary);
    border-color: var(--border-primary);
  }
  
  .filter-content {
    background: var(--bg-secondary);
  }
  
  .filter-btn--clear-all {
    color: var(--text-secondary);
    border-color: var(--border-secondary);
    
    &:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
      border-color: var(--border-primary);
    }
  }
  
  .filter-boolean-section {
    border-color: var(--border-primary);
  }
}
</style> 