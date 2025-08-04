<template>
  <div class="filter-panel-container">
    <!-- Filter Toggle Button - Top Right -->
    <div class="filter-panel-header">
      <q-btn
        unelevated
        @click="toggleFilters"
        class="filter-toggle-btn app-btn-filter"
        :class="{ 'active': isFiltersVisible }"
        size="sm"
        padding="10px 18px"
      >
        <template v-slot:default>
          <q-icon name="tune" size="16px" class="q-mr-xs" />
          {{ t('filters.filterPanel.filtersButton') }}
          <q-chip 
            v-if="activeFiltersCount > 0" 
            :label="activeFiltersCount" 
            color="primary"
            text-color="white"
            size="xs"
            class="q-ml-sm"
          />
        </template>
      </q-btn>
    </div>

    <!-- Filter Content - Collapsible -->
    <q-slide-transition>
      <div v-show="isFiltersVisible" class="filter-content">
        <!-- Main Filter Fields Grid - 12 Column Layout -->
        <div class="filter-grid-12col">
          <!-- Regular fields (non-boolean) -->
          <template v-for="field in regularFields" :key="field.id">
            <div :class="getMagentoFieldClass(field)">
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

          <!-- Boolean Fields Inline -->
          <template v-for="field in booleanFields" :key="field.id">
            <div :class="getMagentoFieldClass(field)">
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

        <!-- Action Buttons - Right Bottom -->
        <div class="filter-actions">
          <q-btn
            unelevated
            :label="t('filters.filterPanel.clearAllFilters')"
            @click="handleClearAll"
            :disable="disabled || activeFiltersCount === 0"
            class="filter-btn filter-btn--clear app-btn-secondary"
            size="sm"
            padding="10px 18px"
          />
          <q-btn
            unelevated
            :label="t('filters.filterPanel.applyFilters')"
            @click="handleApplyFilters"
            :disable="disabled"
            class="filter-btn filter-btn--apply app-btn-primary"
            size="sm"
            padding="10px 20px"
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
  (e: 'apply', values: FilterValues): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  readonly: false,
  showHeader: true,
  showFooter: true,
  collapsible: true,
  initiallyCollapsed: true, // Default to collapsed (hidden)
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

// Methods - New Magento-style 12-column grid system
const getMagentoFieldClass = (field: FilterFieldType) => {
  const baseClasses = ['filter-field-magento']
  
  // Compact multi-column grid sizing (3-4 fields per row)
  if (field.size) {
    switch(field.size) {
      case 'xs':
        baseClasses.push('col-span-3') // 4 fields per row (3/12)
        break
      case 'sm':
        baseClasses.push('col-span-3') // 4 fields per row (3/12)
        break
      case 'md':
        baseClasses.push('col-span-4') // 3 fields per row (4/12)
        break
      case 'lg':
        baseClasses.push('col-span-6') // 2 fields per row (6/12)
        break
      default:
        baseClasses.push('col-span-3') // Default: 4 per row
    }
  } else {
    // Auto-sizing based on field type for compact layout
    if (field.type === 'number_range' || field.type === 'date_range') {
      baseClasses.push('col-span-6') // Ranges take half width (2 per row)
    } else if (field.type === 'text' && field.id === 'search') {
      baseClasses.push('col-span-6') // Search takes half width
    } else if (field.type === 'boolean') {
      baseClasses.push('col-span-4') // Checkboxes: 3 per row
    } else {
      baseClasses.push('col-span-3') // Default: 4 per row
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

const handleApplyFilters = () => {
  // Emit apply event for parent to handle
  emit('apply', props.modelValue)
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
// ===================================================================
// MAGENTO-STYLE FILTER PANEL - CLEAN & CONSISTENT  
// ===================================================================

.filter-panel-container {
  width: 100%;
  background: transparent;
  position: relative;
}

// Header with toggle button - top right position
.filter-panel-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  
  // Filter toggle button styling is now handled by app-btn-filter class in app.scss
  .filter-toggle-btn {
    // All styling moved to global app-btn-filter class for consistency
  }
}

// Modern filter content panel
.filter-content {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px; // More rounded for modern look
  padding: 24px; // Slightly more padding
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); // Subtle modern shadow
}

// Well-balanced grid with proper proportions
.filter-grid-12col {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px 8px; // Balanced gaps for good visual spacing
  margin-bottom: 16px; // Proper margin
  
  // Desktop: 3-4 fields per row
  @media (min-width: 1200px) {
    grid-template-columns: repeat(12, 1fr); // 4 fields x 3 cols = 12
  }
  
  // Large tablet: 3 fields per row  
  @media (min-width: 1025px) and (max-width: 1199px) {
    grid-template-columns: repeat(9, 1fr); // 3 fields x 3 cols = 9
  }
  
  // Tablet: 2 fields per row
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(6, 1fr); // 2 fields x 3 cols = 6
  }
  
  // Mobile: 1 field per row
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px; // Proper mobile spacing
  }
}

// Well-proportioned field containers with perfect alignment
.filter-field-magento {
  display: flex;
  flex-direction: column;
  min-height: 68px; // Consistent with FilterField.vue updated height
  margin: 0; // Reset any default margins
  padding: 0; // Reset any default padding
  
  // Grid column span classes for compact layout
  &.col-span-3 {
    grid-column: span 3; // 4 fields per row (desktop)
  }
  
  &.col-span-4 {
    grid-column: span 4; // 3 fields per row (desktop)
  }
  
  &.col-span-6 {
    grid-column: span 6; // 2 fields per row (desktop)
  }
  
  &.col-span-12 {
    grid-column: span 12; // Full width
  }
  
  // Responsive behavior for compact layout
  @media (min-width: 1025px) and (max-width: 1199px) {
    // Large tablet: adjust for 9-column grid (3 fields per row)
    &.col-span-3 {
      grid-column: span 3; // 3 fields per row
    }
    
    &.col-span-4 {
      grid-column: span 3; // 3 fields per row
    }
    
    &.col-span-6 {
      grid-column: span 4.5; // Approximate 2 fields per row
    }
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    // Tablet: adjust for 6-column grid (2 fields per row)
    &.col-span-3,
    &.col-span-4 {
      grid-column: span 3; // 2 fields per row
    }
    
    &.col-span-6 {
      grid-column: span 6; // Full width on tablet
    }
  }
  
  @media (max-width: 768px) {
    // Mobile: all fields full width
    &.col-span-3,
    &.col-span-4,
    &.col-span-6,
    &.col-span-12 {
      grid-column: span 1; // Stack on mobile
    }
  }
}

// Action buttons section - larger and clearer
.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px; // Increased gap
  padding-top: 20px; // Increased padding
  border-top: 1px solid #e0e0e0;
  margin-top: 20px; // Increased margin
  
  // Filter action button styling is now handled by app-btn-primary and app-btn-secondary classes
  .filter-btn {
    // All styling moved to global button classes for consistency
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .filter-panel-header {
    margin-bottom: 12px;
  }
  
  .filter-content {
    padding: 16px;
  }
  
  .filter-actions {
    flex-direction: column;
    gap: 12px; // Increased gap on mobile
    padding-top: 16px;
    
    .filter-btn {
      width: 100%;
      justify-content: center;
      min-height: 48px; // Larger touch target for mobile
      
      // Enhanced touch feedback
      &:active {
        transform: scale(0.98) !important;
      }
    }
  }
}

// Dark mode support now handled by global app.scss classes
body.body--dark {
  .filter-content {
    background: var(--bg-secondary);
    border-color: var(--border-primary);
  }
  
  .filter-actions {
    border-color: var(--border-primary);
  }
}
</style> 