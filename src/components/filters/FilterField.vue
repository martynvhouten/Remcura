<template>  
  <div ref="fieldWrapper" class="filter-field-wrapper">
    <!-- Text Input - Only placeholder, no label -->
    <q-input
      v-if="field.type === 'text'"
      :model-value="modelValue as string"
      @update:model-value="handleChange"
      :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
      outlined
      dense
      :clearable="field.clearable"
      :debounce="field.debounce || 300"
      :disable="disabled"
      :readonly="readonly"
      :loading="loading"
      class="filter-input filter-input--text"
      hide-bottom-space
    >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="14px" class="text-gray-500" />
      </template>
      <template v-if="field.scannerButton" v-slot:append>
        <q-btn 
          flat 
          round 
          dense 
          icon="qr_code_scanner" 
          @click="handleScan"
          :disable="disabled"
          size="xs"
          class="text-gray-500 hover:text-primary"
        />
      </template>
    </q-input>

    <!-- Select Dropdown -->
    <div v-else-if="field.type === 'select'" class="field-with-label">
      <label v-if="field.label" class="field-label">
        {{ $t(field.label as string) }}
      </label>
      <q-select
        :model-value="modelValue"
        @update:model-value="handleChange"
        :options="selectOptions"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        dense
        :clearable="field.clearable"
        :disable="disabled || loading"
        :readonly="readonly"
        :loading="optionsLoading"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-input filter-input--select"
        hide-bottom-space
        max-height="200px"
        behavior="menu"
      >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="14px" class="text-gray-500" />
      </template>
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" dense>
          <q-item-section v-if="scope.opt.icon" avatar>
            <q-icon :name="scope.opt.icon" :color="scope.opt.color" size="14px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-sm">{{ scope.opt.label }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="field.flagIcons" side>
            <country-flag :country="scope.opt.value" size="small" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    </div>

    <!-- Multi Select -->
    <div v-else-if="field.type === 'multi_select'" class="field-with-label">
      <label v-if="field.label" class="field-label">
        {{ $t(field.label as string) }}
      </label>
      <q-select
        :model-value="modelValue"
        @update:model-value="handleChange"
        :options="selectOptions"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        dense
        :clearable="field.clearable"
        :disable="disabled || loading"
        :readonly="readonly"
        :loading="optionsLoading"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        multiple
        use-chips
        class="filter-input filter-input--multi-select"
        hide-bottom-space
        max-height="200px"
        behavior="menu"
      >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="14px" class="text-gray-500" />
      </template>
      <template v-slot:selected>
        <div class="flex flex-wrap gap-1">
          <q-chip
            v-for="value in (Array.isArray(modelValue) ? modelValue : [])"
            :key="value"
            removable
            dense
            color="primary"
            text-color="white"
            @remove="removeMultiSelectValue(value)"
            size="xs"
            class="text-xs"
          >
            {{ getOptionLabel(value) }}
          </q-chip>
        </div>
      </template>
    </q-select>
    </div>

    <!-- Boolean Toggle/Switch -->
    <div v-else-if="field.type === 'boolean'" class="boolean-field-container">
      <q-icon v-if="field.icon" :name="field.icon" class="boolean-field-icon" />
      <q-toggle
        v-if="field.variant === 'toggle'"
        :model-value="modelValue"
        @update:model-value="handleChange"
        :label="field.label ? $t(field.label as string) : ''"
        :color="field.color || 'primary'"
        :disable="disabled"
        :readonly="readonly"
        size="sm"
        class="boolean-field-input"
      />
      <q-checkbox
        v-else
        :model-value="modelValue"
        @update:model-value="handleChange"
        :label="field.label ? $t(field.label as string) : ''"
        :color="field.color || 'primary'"
        :disable="disabled"
        :readonly="readonly"
        size="sm"
        class="boolean-field-input"
      />
    </div>

    <!-- Number Input -->
    <div v-else-if="field.type === 'number'" class="field-with-label">
      <label v-if="field.label" class="field-label">
        {{ $t(field.label as string) }}
      </label>
      <q-input
        :model-value="String(modelValue || '')"
        @update:model-value="handleChange"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        dense
        :clearable="field.clearable"
        :disable="disabled"
        :readonly="readonly"
        :loading="loading"
        type="number"
        :step="field.step || 1"
        class="filter-input filter-input--number"
        hide-bottom-space
      >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="14px" class="text-gray-500" />
      </template>
      <template v-if="field.currency" v-slot:append>
        <span class="text-xs text-gray-500">{{ field.currency }}</span>
      </template>
    </q-input>
    </div>

    <!-- Number Range -->
    <div v-else-if="field.type === 'number_range'" class="range-field">
      <div class="range-label" v-if="field.label">
        {{ $t(field.label as string) }}
      </div>
      <div class="range-inputs">
        <q-input
          :model-value="rangeValue.min || ''"
          @update:model-value="(value) => handleRangeChange('min', value)"
          label="Van"
          type="number"
          :step="field.step || 1"
          outlined
          dense
          class="range-input filter-input"
          hide-bottom-space
        >
          <template v-if="field.currency" v-slot:append>
            <span class="currency-symbol">{{ field.currency }}</span>
          </template>
        </q-input>
        <q-input
          :model-value="rangeValue.max || ''"
          @update:model-value="(value) => handleRangeChange('max', value)"
          label="Tot"
          type="number"
          :step="field.step || 1"
          outlined
          dense
          class="range-input filter-input"
          hide-bottom-space
        >
          <template v-if="field.currency" v-slot:append>
            <span class="currency-symbol">{{ field.currency }}</span>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Date Input -->
    <div v-else-if="field.type === 'date'" class="field-with-label">
      <label v-if="field.label" class="field-label">
        {{ $t(field.label as string) }}
      </label>
      <q-input
        :model-value="String(modelValue || '')"
        @update:model-value="handleChange"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        dense
        :clearable="field.clearable"
        :disable="disabled"
        :readonly="readonly"
        :loading="loading"
        class="filter-input filter-input--date"
        hide-bottom-space
      >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="14px" class="text-gray-500" />
      </template>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer text-gray-500 hover:text-primary" size="14px">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              :model-value="modelValue"
              @update:model-value="handleChange"
              mask="YYYY-MM-DD"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Sluiten" color="primary" flat size="sm" />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    </div>

    <!-- Date Range -->
    <div v-else-if="field.type === 'date_range'" class="range-field">
      <div class="range-label" v-if="field.label">
        {{ $t(field.label as string) }}
      </div>
      <div class="range-inputs">
        <q-input
          :model-value="dateRangeValue.start || ''"
          @update:model-value="(value) => handleDateRangeChange('start', value)"
          label="Van"
          outlined
          dense
          class="range-input filter-input"
          hide-bottom-space
        >
          <template v-slot:append>
            <q-icon name="event" class="date-picker-icon">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="dateRangeValue.start"
                  @update:model-value="(value) => handleDateRangeChange('start', value)"
                  mask="YYYY-MM-DD"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Sluiten" color="primary" flat size="sm" />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          :model-value="dateRangeValue.end || ''"
          @update:model-value="(value) => handleDateRangeChange('end', value)"
          label="Tot"
          outlined
          dense
          class="range-input filter-input"
          hide-bottom-space
        >
          <template v-slot:append>
            <q-icon name="event" class="date-picker-icon">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="dateRangeValue.end"
                  @update:model-value="(value) => handleDateRangeChange('end', value)"
                  mask="YYYY-MM-DD"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Sluiten" color="primary" flat size="sm" />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Country Select -->
    <div v-else-if="field.type === 'country'" class="field-with-label">
      <label v-if="field.label" class="field-label">
        {{ $t(field.label as string) }}
      </label>
      <q-select
        :model-value="modelValue"
        @update:model-value="handleChange"
        :options="selectOptions"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        dense
        :clearable="field.clearable"
        :disable="disabled || loading"
        :readonly="readonly"
        :loading="optionsLoading"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-input filter-input--country"
        hide-bottom-space
        max-height="200px"
        behavior="menu"
      >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="14px" class="text-gray-500" />
      </template>
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" dense>
          <q-item-section side>
            <country-flag :country="scope.opt.value" size="small" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-sm">{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:selected>
        <div v-if="modelValue" class="flex items-center gap-2">
          <country-flag :country="String(modelValue)" size="small" />
          <span class="text-sm">{{ getSelectedCountryLabel() }}</span>
        </div>
      </template>
    </q-select>
    </div>

    <!-- Fallback for unknown types -->
    <div v-else class="unknown-field-container">
      <div class="unknown-field-content">
        <q-icon name="warning" class="unknown-field-icon" />
        <span class="unknown-field-message">Unknown filter type: {{ field.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/services/supabase'
import CountryFlag from '@/components/CountryFlag.vue'
import type { FilterField, FilterValue, FilterDataSource } from '@/types/filters'

interface Props {
  field: FilterField
  modelValue: FilterValue
  loading?: boolean
  disabled?: boolean
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: FilterValue): void
  (e: 'change', value: FilterValue, oldValue?: FilterValue): void
  (e: 'scan', scannedValue: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()

// State
const selectOptions = ref<Array<{ value: any; label: string; icon?: string; color?: string }>>([])
const optionsLoading = ref(false)

// Computed
const fieldClasses = computed(() => {
  const classes = [`filter-input--${props.field.type}`]
  
  if (props.field.size) {
    classes.push(`filter-input--${props.field.size}`)
  }
  
  if (props.field.dense) {
    classes.push('filter-input--dense')
  }
  
  return classes
})

const rangeValue = computed(() => {
  if (props.field.type === 'number_range' && typeof props.modelValue === 'object' && props.modelValue !== null) {
    return (props.modelValue as { min?: number; max?: number })
  }
  return { min: undefined, max: undefined }
})

const dateRangeValue = computed(() => {
  if (props.field.type === 'date_range' && typeof props.modelValue === 'object' && props.modelValue !== null) {
    return (props.modelValue as { start?: string; end?: string })
  }
  return { start: undefined, end: undefined }
})

// Methods
const handleChange = (value: FilterValue) => {
  const oldValue = props.modelValue
  emit('update:modelValue', value)
  emit('change', value, oldValue)
}

const isEmptyValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '') { return true; }
  if (typeof value === 'string' && value.trim() === '') { return true; }
  if (typeof value === 'number' && value === 0) { return true; }
  return false
}

const handleRangeChange = (key: 'min' | 'max', value: any) => {
  const currentRange = rangeValue.value
  const newRange = { ...currentRange, [key]: value }
  
  // Clean up null/undefined values
  if (isEmptyValue(newRange.min)) {
    delete newRange.min
  }
  if (isEmptyValue(newRange.max)) {
    delete newRange.max
  }
  
  handleChange(Object.keys(newRange).length > 0 ? newRange as any : null)
}

const handleDateRangeChange = (key: 'start' | 'end', value: any) => {
  const currentRange = dateRangeValue.value
  const newRange = { ...currentRange, [key]: value }
  
  // Clean up null/undefined values
  if (newRange.start === null || newRange.start === undefined || newRange.start === '') {
    delete newRange.start
  }
  if (newRange.end === null || newRange.end === undefined || newRange.end === '') {
    delete newRange.end
  }
  
  handleChange(Object.keys(newRange).length > 0 ? newRange as any : null)
}

const removeMultiSelectValue = (valueToRemove: any) => {
  if (Array.isArray(props.modelValue)) {
    const newValues = props.modelValue.filter(v => v !== valueToRemove)
    handleChange(newValues)
  }
}

const getOptionLabel = (value: any) => {
  const option = selectOptions.value.find(opt => opt.value === value)
  return option?.label || value
}

const handleScan = () => {
  // TODO: Implement barcode scanning
  // For now, emit scan event that parent can handle
  emit('scan', '')
}

const getSelectedCountryLabel = () => {
  const option = selectOptions.value.find(opt => opt.value === props.modelValue)
  return option?.label || props.modelValue
}

// Load select options based on data source
const loadSelectOptions = async () => {
  if (!props.field.dataSource) { return; }

  const dataSource = props.field.dataSource as FilterDataSource

  if (dataSource.type === 'static' && dataSource.options) {
    // Translate static option labels if they are i18n keys
    selectOptions.value = dataSource.options.map(option => ({
      ...option,
      label: option.label.startsWith('filters.') ? t(option.label) : option.label
    }))
    return
  }

  if (dataSource.type === 'supabase' && dataSource.table) {
    try {
      optionsLoading.value = true
      
      let query = supabase
        .from(dataSource.table)
        .select(`${dataSource.valueField}, ${dataSource.labelField}`)

      // Apply filters
      if (dataSource.filters) {
        dataSource.filters.forEach(filter => {
          // Map filter operators to Supabase syntax
          let supabaseOperator: string = filter.operator
          if (filter.operator === 'is not') {
            supabaseOperator = 'not.is'
          }
          
          query = query.filter(filter.field, supabaseOperator, filter.value)
        })
      }

      // Apply distinct
      if (dataSource.distinct) {
        // Note: Supabase doesn't have direct distinct, but we'll handle it client-side
      }

      // Apply ordering
      if (dataSource.orderBy) {
        dataSource.orderBy.forEach(order => {
          query = query.order(order.field, { ascending: order.direction === 'asc' })
        })
      }

      const { data, error } = await query

      if (error) {
        console.warn('Failed to load select options (likely RLS policy issue):', error)
        selectOptions.value = []
        return
      }

      if (data) {
        let options = data.map(item => ({
          value: item[dataSource.valueField!],
          label: item[dataSource.labelField!]
        }))

        // Handle distinct client-side
        if (dataSource.distinct) {
          const seen = new Set()
          options = options.filter(opt => {
            if (seen.has(opt.value)) { return false; }
            seen.add(opt.value)
            return true
          })
        }

        selectOptions.value = options
      }
    } catch (error) {
      console.warn('Failed to load select options (likely RLS policy issue):', error)
      selectOptions.value = []
    } finally {
      optionsLoading.value = false
    }
  }
}

// Watch for data source changes
watch(() => props.field.dataSource, loadSelectOptions, { immediate: true })

// Watch for model value changes to ensure proper label positioning
const hasValue = computed(() => {
  const value = props.modelValue
  
  // Null, undefined, empty string
  if (value === null || value === undefined || value === '') { return false; }
  
  // Empty arrays
  if (Array.isArray(value) && value.length === 0) return false
  
  // For objects (ranges), check if they have meaningful values
  if (typeof value === 'object' && value !== null) {
    // Empty object
    if (Object.keys(value).length === 0) return false
    
    // Cast to any for flexible property access
    const objValue = value as any
    
    // For range objects with min/max, only consider it "has value" if at least one meaningful value exists
    if ('min' in objValue || 'max' in objValue) {
      const hasMin = objValue.min !== null && objValue.min !== undefined && objValue.min !== '' && objValue.min !== 0
      const hasMax = objValue.max !== null && objValue.max !== undefined && objValue.max !== '' && objValue.max !== 0
      return hasMin || hasMax
    }
    
    // For date range objects with start/end
    if ('start' in objValue || 'end' in objValue) {
      const hasStart = objValue.start !== null && objValue.start !== undefined && objValue.start !== ''
      const hasEnd = objValue.end !== null && objValue.end !== undefined && objValue.end !== ''
      return hasStart || hasEnd
    }
    
    // For other objects, check if any values are meaningful
    return Object.values(objValue).some(v => v !== null && v !== undefined && v !== '')
  }
  
  // For numbers, any number including 0 is valid
  if (typeof value === 'number') return true
  
  // For booleans, both true and false are valid values
  if (typeof value === 'boolean') return true
  
  // For strings, check if not empty after trim
  if (typeof value === 'string') return value.trim() !== ''
  
  // Default: if we have any other value, consider it "has value"
  return Boolean(value)
})

// Template ref for field wrapper
const fieldWrapper = ref(null)

// Enhanced label positioning that actually works
const updateFieldValueClass = () => {
  nextTick(() => {
    if (!fieldWrapper.value) return
    
    const fieldElements = fieldWrapper.value.querySelectorAll('.q-field')
    fieldElements.forEach(fieldElement => {
      // Force proper classes based on value state
      if (hasValue.value) {
        fieldElement.classList.add('q-field--has-value')
        fieldElement.classList.add('q-field--float')
      } else {
        fieldElement.classList.remove('q-field--has-value')
        fieldElement.classList.remove('q-field--float')
      }
    })
  })
}

// More aggressive watching to ensure labels stay positioned
watch(hasValue, updateFieldValueClass, { immediate: true, flush: 'post' })
watch(() => props.modelValue, updateFieldValueClass, { immediate: true, flush: 'post' })

// Additional watch for string/array values to catch all cases
watch(() => props.modelValue, (newVal) => {
  // Extra check for edge cases
  setTimeout(updateFieldValueClass, 50)
}, { immediate: true, deep: true })

// Initialize on mount and after DOM updates
onMounted(() => {
  loadSelectOptions()
  updateFieldValueClass()
  // Additional timeout to ensure DOM is fully rendered
  setTimeout(updateFieldValueClass, 100)
})

// Force update after any interaction
const forceUpdateLabels = () => {
  setTimeout(updateFieldValueClass, 10)
}
</script>

<style lang="scss" scoped>
.filter-field-wrapper {
  width: 100%;
  min-width: 0; // Allow shrinking
  display: flex;
  flex-direction: column;
  
  // Clean structure with consistent spacing
  .field-with-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.2;
    margin-bottom: 0;
    padding-left: 2px; // Slight alignment with input content
  }
  
  .boolean-field-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0; // Consistent spacing with other fields
  }
  
  .range-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.filter-input {
  width: 100%;
  min-width: 0;
  
  // Clean focus styling using new field system
  :deep(.q-field--focused) {
    .q-field__control {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
    }
  }
  
  // Clean field without floating labels
  :deep(.q-field__control) {
    min-width: 0;
    width: 100%;
    display: flex;
    align-items: center;
    min-height: 40px;
  }
  
  // Better text vertical alignment
  :deep(.q-field__native) {
    min-width: 0;
    width: 100%;
    display: flex;
    align-items: center;
    line-height: 1.4;
  }
  
  // Ensure input text is not cut off
  :deep(.q-field__input) {
    min-width: 0;
    width: 100%;
    display: flex;
    align-items: center;
    line-height: 1.4;
  }
  
  // Fix for long placeholder text
  :deep(.q-placeholder) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    display: flex;
    align-items: center;
    line-height: 1.4;
  }
  
  // Better text alignment for inputs
  :deep(input) {
    line-height: 1.4;
    vertical-align: middle;
  }
  
  // Fix select dropdown text alignment
  :deep(.q-field__selected) {
    display: flex;
    align-items: center;
    line-height: 1.4;
    min-height: 24px;
  }
  
  // Hover styling handled by global field system
  
  // Special styling for text inputs (search fields)
  &.filter-input--text {
    :deep(.q-field__control) {
      background: var(--bg-secondary);
      border-radius: var(--radius-base);
    }
    
    :deep(.q-placeholder) {
      font-style: italic;
      color: var(--text-tertiary);
    }
  }
  
  // Better responsiveness for smaller screens
  @media (max-width: 768px) {
    :deep(.q-field__input) {
      font-size: 0.875rem;
    }
  }
}

// Boolean field container styling
.boolean-field-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 8px 0;
  
  .boolean-field-icon {
    flex-shrink: 0;
    color: var(--text-tertiary);
    order: 1; // Icon first
  }
  
  .boolean-field-input {
    order: 2; // Input second
    
    // Better vertical alignment for checkboxes and toggles
    :deep(.q-checkbox__inner),
    :deep(.q-toggle__inner) {
      display: flex;
      align-items: center;
    }
    
    // Label to the right of the control
    :deep(.q-checkbox),
    :deep(.q-toggle) {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .q-checkbox__label,
      .q-toggle__label {
        order: 2;
        margin-left: 8px;
      }
      
      .q-checkbox__inner,
      .q-toggle__inner {
        order: 1;
      }
    }
    
    // Remove focus border on boolean fields too
    :deep(.q-checkbox.q-checkbox--focused),
    :deep(.q-toggle.q-toggle--focused) {
      .q-checkbox__inner::after,
      .q-toggle__track::after {
        display: none;
      }
    }
  }
}

// Range field styling  
.range-field {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  
  .range-label {
    margin-bottom: 2px;
    font-size: 0.75rem; // Smaller label  
    font-weight: 500;
    color: var(--text-secondary);
    line-height: 1.2;
    min-height: 14px; // Reserve space for label
    flex-shrink: 0;
    padding-left: 4px; // Align with input padding
  }
  
  .range-inputs {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
    min-width: 0;
    flex: 1; // Take remaining space to align with other inputs
    
    .range-input {
      flex: 1;
      min-width: 0;
      width: 50%;
      
      // Apply same focus styling as other inputs
      :deep(.q-field--focused) {
        .q-field__control {
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }
      }
      
      // Ensure range inputs align with single inputs
      :deep(.q-field__control) {
        min-height: 40px; // Match standard input height
        padding-top: 4px; // Match other fields
      }
      
      // Hover styling handled by global field system
    }
    
    .currency-symbol {
      flex-shrink: 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .date-picker-icon {
      cursor: pointer;
      color: var(--text-tertiary);
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--brand-primary);
      }
    }
  }
}

// Unknown field styling
.unknown-field-container {
  padding: 12px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-secondary);
  
  .unknown-field-content {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .unknown-field-icon {
      color: var(--brand-warning);
    }
    
    .unknown-field-message {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  }
}

// Country select specific styling
.filter-input.country-select {
  :deep(.q-field__selected) {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    
    span {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>