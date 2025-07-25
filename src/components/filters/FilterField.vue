<template>
  <div class="filter-field" :class="fieldClasses">
    <!-- Text Input -->
    <q-input
      v-if="field.type === 'text'"
      :model-value="modelValue as string"
      @update:model-value="handleChange"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder || '')"
      :outlined="true"
      :dense="true"
      :clearable="field.clearable"
      :debounce="field.debounce || 300"
      :disable="disabled"
      :readonly="readonly"
      :loading="loading"
      class="filter-input"
      filled
      label-color="grey-7"
    >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="18px" />
      </template>
      <template v-if="field.scannerButton" v-slot:append>
        <q-btn 
          flat 
          round 
          dense 
          icon="qr_code_scanner" 
          @click="handleScan"
          :disable="disabled"
          size="sm"
        >
          <q-tooltip>{{ $t('common.scanBarcode') }}</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <!-- Select Dropdown -->
    <q-select
      v-else-if="field.type === 'select'"
      :model-value="modelValue"
      @update:model-value="handleChange"
      :options="selectOptions"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder)"
      :outlined="true"
      :dense="true"
      :clearable="field.clearable"
      :disable="disabled || loading"
      :readonly="readonly"
      :loading="optionsLoading"
      option-value="value"
      option-label="label"
      emit-value
      map-options
      class="filter-select"
      filled
      label-color="grey-7"
      max-height="300px"
      behavior="menu"
    >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="18px" />
      </template>
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" class="filter-option-item">
          <q-item-section v-if="scope.opt.icon" avatar>
            <q-icon :name="scope.opt.icon" :color="scope.opt.color" size="16px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="filter-option-label">{{ scope.opt.label }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="field.flagIcons && field.type === 'country'" side>
            <country-flag :country="scope.opt.value" size="small" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Multi Select -->
    <q-select
      v-else-if="field.type === 'multi_select'"
      :model-value="modelValue"
      @update:model-value="handleChange"
      :options="selectOptions"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder)"
      :outlined="true"
      :dense="true"
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
      class="filter-multi-select"
      filled
      label-color="grey-7"
      max-height="300px"
      behavior="menu"
    >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="18px" />
      </template>
      <template v-slot:selected>
        <div class="filter-chips-container">
          <q-chip
            v-for="value in (Array.isArray(modelValue) ? modelValue : [])"
            :key="value"
            removable
            dense
            color="primary"
            text-color="white"
            @remove="removeMultiSelectValue(value)"
            class="filter-chip"
          >
            {{ getOptionLabel(value) }}
          </q-chip>
        </div>
      </template>
    </q-select>

    <!-- Boolean Toggle/Switch -->
    <div v-else-if="field.type === 'boolean'" class="filter-boolean">
      <div class="boolean-wrapper">
        <q-icon v-if="field.icon" :name="field.icon" size="18px" class="boolean-icon" />
        <q-toggle
          v-if="field.variant === 'toggle'"
          :model-value="modelValue"
          @update:model-value="handleChange"
          :label="$t(field.label)"
          :color="field.color || 'primary'"
          :disable="disabled"
          :readonly="readonly"
          class="boolean-toggle"
          size="sm"
          dense
        />
        <q-checkbox
          v-else
          :model-value="modelValue"
          @update:model-value="handleChange"
          :label="$t(field.label)"
          :color="field.color || 'primary'"
          :disable="disabled"
          :readonly="readonly"
          class="boolean-checkbox"
          size="sm"
          dense
        />
      </div>
    </div>

    <!-- Number Input -->
    <q-input
      v-else-if="field.type === 'number'"
      :model-value="modelValue"
      @update:model-value="handleChange"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder)"
      :outlined="true"
      :dense="true"
      :clearable="field.clearable"
      :disable="disabled"
      :readonly="readonly"
      :loading="loading"
      type="number"
      :step="field.step || 1"
      class="filter-number"
      filled
      label-color="grey-7"
    >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="18px" />
      </template>
      <template v-if="field.currency" v-slot:append>
        <span class="currency-symbol">{{ field.currency }}</span>
      </template>
    </q-input>

    <!-- Number Range -->
    <div v-else-if="field.type === 'number_range'" class="filter-number-range">
      <div class="range-header">
        <q-icon v-if="field.icon" :name="field.icon" size="18px" class="range-icon" />
        <span class="range-label">{{ $t(field.label) }}</span>
      </div>
      <div class="range-inputs">
        <q-input
          :model-value="rangeValue.min"
          @update:model-value="(value) => handleRangeChange('min', value)"
          :placeholder="$t(field.placeholder?.min || 'filters.common.min')"
          type="number"
          :step="field.step || 1"
          outlined
          dense
          class="range-input range-min"
          filled
          hide-bottom-space
        >
          <template v-if="field.currency" v-slot:append>
            <span class="currency-symbol">{{ field.currency }}</span>
          </template>
        </q-input>
        <div class="range-separator">-</div>
        <q-input
          :model-value="rangeValue.max"
          @update:model-value="(value) => handleRangeChange('max', value)"
          :placeholder="$t(field.placeholder?.max || 'filters.common.max')"
          type="number"
          :step="field.step || 1"
          outlined
          dense
          class="range-input range-max"
          filled
          hide-bottom-space
        >
          <template v-if="field.currency" v-slot:append>
            <span class="currency-symbol">{{ field.currency }}</span>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Date Input -->
    <q-input
      v-else-if="field.type === 'date'"
      :model-value="modelValue"
      @update:model-value="handleChange"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder)"
      :outlined="true"
      :dense="true"
      :clearable="field.clearable"
      :disable="disabled"
      :readonly="readonly"
      :loading="loading"
      class="filter-date"
      filled
      label-color="grey-7"
    >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="18px" />
      </template>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer" size="18px">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              :model-value="modelValue"
              @update:model-value="handleChange"
              mask="YYYY-MM-DD"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Sluiten" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <!-- Date Range -->
    <div v-else-if="field.type === 'date_range'" class="filter-date-range">
      <div class="range-header">
        <q-icon v-if="field.icon" :name="field.icon" size="18px" class="range-icon" />
        <span class="range-label">{{ $t(field.label) }}</span>
      </div>
      <div class="range-inputs">
        <q-input
          :model-value="dateRangeValue.start"
          @update:model-value="(value) => handleDateRangeChange('start', value)"
          :placeholder="$t(field.placeholder?.start || 'filters.common.from')"
          outlined
          dense
          class="range-input range-start"
          filled
          hide-bottom-space
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" size="18px">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="dateRangeValue.start"
                  @update:model-value="(value) => handleDateRangeChange('start', value)"
                  mask="YYYY-MM-DD"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Sluiten" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <div class="range-separator">-</div>
        <q-input
          :model-value="dateRangeValue.end"
          @update:model-value="(value) => handleDateRangeChange('end', value)"
          :placeholder="$t(field.placeholder?.end || 'filters.common.to')"
          outlined
          dense
          class="range-input range-end"
          filled
          hide-bottom-space
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" size="18px">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="dateRangeValue.end"
                  @update:model-value="(value) => handleDateRangeChange('end', value)"
                  mask="YYYY-MM-DD"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Sluiten" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Country Select -->
    <q-select
      v-else-if="field.type === 'country'"
      :model-value="modelValue"
      @update:model-value="handleChange"
      :options="selectOptions"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder)"
      :outlined="true"
      :dense="true"
      :clearable="field.clearable"
      :disable="disabled || loading"
      :readonly="readonly"
      :loading="optionsLoading"
      option-value="value"
      option-label="label"
      emit-value
      map-options
      class="filter-country-select"
      filled
      label-color="grey-7"
      max-height="300px"
      behavior="menu"
    >
      <template v-if="field.icon" v-slot:prepend>
        <q-icon :name="field.icon" size="18px" />
      </template>
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" class="filter-option-item">
          <q-item-section side>
            <country-flag :country="scope.opt.value" size="small" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="filter-option-label">{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:selected>
        <div v-if="modelValue" class="country-selected">
          <country-flag :country="modelValue" size="small" />
          <span class="country-name">{{ getSelectedCountryLabel() }}</span>
        </div>
      </template>
    </q-select>

    <!-- Fallback for unknown types -->
    <div v-else class="filter-unknown">
      <q-banner class="bg-warning text-dark">
        <template v-slot:avatar>
          <q-icon name="warning" />
        </template>
        Unknown filter type: {{ field.type }}
      </q-banner>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
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
  const classes = [`filter-field--${props.field.type}`]
  
  if (props.field.size) {
    classes.push(`filter-field--${props.field.size}`)
  }
  
  if (props.field.dense) {
    classes.push('filter-field--dense')
  }
  
  return classes
})

const rangeValue = computed(() => {
  if (props.field.type === 'number_range') {
    return (props.modelValue as { min?: number; max?: number }) || {}
  }
  return {}
})

const dateRangeValue = computed(() => {
  if (props.field.type === 'date_range') {
    return (props.modelValue as { start?: string; end?: string }) || {}
  }
  return {}
})

// Methods
const handleChange = (value: FilterValue) => {
  const oldValue = props.modelValue
  emit('update:modelValue', value)
  emit('change', value, oldValue)
}

const handleRangeChange = (key: 'min' | 'max', value: any) => {
  const currentRange = rangeValue.value || { min: null, max: null }
  const newRange = { ...currentRange, [key]: value }
  
  // Clean up null/undefined values
  if (newRange.min === null || newRange.min === undefined || newRange.min === '') {
    delete newRange.min
  }
  if (newRange.max === null || newRange.max === undefined || newRange.max === '') {
    delete newRange.max
  }
  
  handleChange(Object.keys(newRange).length > 0 ? newRange : null)
}

const handleDateRangeChange = (key: 'start' | 'end', value: any) => {
  const currentRange = dateRangeValue.value || { start: null, end: null }
  const newRange = { ...currentRange, [key]: value }
  
  // Clean up null/undefined values
  if (newRange.start === null || newRange.start === undefined || newRange.start === '') {
    delete newRange.start
  }
  if (newRange.end === null || newRange.end === undefined || newRange.end === '') {
    delete newRange.end
  }
  
  handleChange(Object.keys(newRange).length > 0 ? newRange : null)
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
  if (!props.field.dataSource) return

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
        console.error('Error loading select options:', error)
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
            if (seen.has(opt.value)) return false
            seen.add(opt.value)
            return true
          })
        }

        selectOptions.value = options
      }
    } catch (error) {
      console.error('Error loading select options:', error)
    } finally {
      optionsLoading.value = false
    }
  }
}

// Watch for data source changes
watch(() => props.field.dataSource, loadSelectOptions, { immediate: true })

onMounted(() => {
  loadSelectOptions()
})
</script>

<style lang="scss" scoped>
// =============================================
// MODERN FILTER FIELD DESIGN SYSTEM
// Revolutionary UI with enhanced UX patterns
// =============================================

.filter-field {
  width: 100%;
  position: relative;

  // =============================================
  // ENHANCED FIELD STYLING WITH MODERN DEPTH
  // =============================================
  
  :deep(.q-field) {
    .q-field__control {
      min-height: 48px;
      height: 48px;
      font-size: 15px;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.9) 0%, 
        rgba(248, 250, 252, 0.95) 100%);
      border-radius: 12px;
      border: 1.5px solid rgba(226, 232, 240, 0.6);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      
      // Subtle inner shadow for depth
      box-shadow: 
        inset 0 1px 2px rgba(0, 0, 0, 0.02),
        0 1px 3px rgba(0, 0, 0, 0.02);
      
      .body--dark & {
        background: linear-gradient(135deg, 
          rgba(30, 41, 59, 0.9) 0%, 
          rgba(15, 23, 42, 0.95) 100%);
        border-color: rgba(71, 85, 105, 0.4);
        box-shadow: 
          inset 0 1px 2px rgba(0, 0, 0, 0.1),
          0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      // Elegant hover state
      &:hover {
        border-color: rgba(59, 130, 246, 0.4);
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.98) 0%, 
          rgba(248, 250, 252, 1) 100%);
        box-shadow: 
          inset 0 1px 2px rgba(59, 130, 246, 0.03),
          0 2px 8px rgba(59, 130, 246, 0.06);
        transform: translateY(-1px);
        
        .body--dark & {
          border-color: rgba(96, 165, 250, 0.5);
          background: linear-gradient(135deg, 
            rgba(30, 41, 59, 0.98) 0%, 
            rgba(15, 23, 42, 1) 100%);
          box-shadow: 
            inset 0 1px 2px rgba(59, 130, 246, 0.08),
            0 2px 8px rgba(59, 130, 246, 0.12);
        }
      }
    }
    
    // =============================================
    // ENHANCED LABEL SYSTEM
    // =============================================
    
    .q-field__label {
      font-size: 13px;
      font-weight: 600;
      color: rgba(71, 85, 105, 0.8);
      top: 14px;
      left: 16px;
      transform: none;
      position: absolute;
      background: transparent;
      padding: 0 6px;
      z-index: 2;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.025em;
      
      .body--dark & {
        color: rgba(148, 163, 184, 0.9);
      }
    }
    
    // =============================================
    // ADVANCED INPUT STYLING
    // =============================================
    
    .q-field__native {
      font-size: 15px;
      font-weight: 500;
      color: rgba(15, 23, 42, 0.95);
      min-height: 48px;
      padding: 16px 16px 8px 16px;
      background: transparent;
      
      .body--dark & {
        color: rgba(248, 250, 252, 0.95);
      }
      
      // Placeholder styling
      &::placeholder {
        color: rgba(71, 85, 105, 0.4);
        font-weight: 400;
        
        .body--dark & {
          color: rgba(148, 163, 184, 0.5);
        }
      }
    }
    
    // =============================================
    // FLOATING LABEL ANIMATION
    // =============================================
    
    &.q-field--focused .q-field__label,
    &.q-field--float .q-field__label {
      top: -8px;
      left: 12px;
      font-size: 11px;
      font-weight: 700;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(248, 250, 252, 1) 100%);
      color: rgba(59, 130, 246, 0.9);
      border-radius: 6px;
      padding: 2px 8px;
      
      .body--dark & {
        background: linear-gradient(135deg, 
          rgba(30, 41, 59, 0.95) 0%, 
          rgba(15, 23, 42, 1) 100%);
        color: rgba(96, 165, 250, 1);
      }
    }
    
    // =============================================
    // FOCUS STATE ENHANCEMENT
    // =============================================
    
    &.q-field--focused .q-field__control {
      border-color: rgba(59, 130, 246, 0.8);
      box-shadow: 
        0 0 0 3px rgba(59, 130, 246, 0.1),
        inset 0 1px 2px rgba(59, 130, 246, 0.05),
        0 4px 12px rgba(59, 130, 246, 0.1);
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 1) 0%, 
        rgba(248, 250, 252, 1) 100%);
      transform: translateY(-1px);
      
      .body--dark & {
        border-color: rgba(96, 165, 250, 0.9);
        box-shadow: 
          0 0 0 3px rgba(59, 130, 246, 0.15),
          inset 0 1px 2px rgba(59, 130, 246, 0.1),
          0 4px 12px rgba(59, 130, 246, 0.2);
        background: linear-gradient(135deg, 
          rgba(30, 41, 59, 1) 0%, 
          rgba(15, 23, 42, 1) 100%);
      }
    }
  }

  // =============================================
  // SELECT DROPDOWN ENHANCEMENTS
  // =============================================
  
  :deep(.q-select) {
    .q-field__append {
      padding: 0 16px;
    }
    
    .q-select__dropdown-icon {
      font-size: 18px;
      color: rgba(71, 85, 105, 0.6);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      .body--dark & {
        color: rgba(148, 163, 184, 0.7);
      }
    }
    
    &.q-field--focused .q-select__dropdown-icon {
      color: rgba(59, 130, 246, 0.8);
      transform: rotate(180deg) scale(1.1);
      
      .body--dark & {
        color: rgba(96, 165, 250, 0.9);
      }
    }
    
    // Enhanced selected value display
    .q-field__native {
      font-weight: 600;
    }
  }

  // =============================================
  // BEAUTIFUL OPTION ITEMS
  // =============================================
  
  .filter-option-item {
    min-height: 44px;
    padding: 12px 20px;
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 2px 8px;
    
    .filter-option-label {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      color: rgba(15, 23, 42, 0.9);
      
      .body--dark & {
        color: rgba(248, 250, 252, 0.9);
      }
    }
    
    &:hover {
      background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.08) 0%, 
        rgba(139, 92, 246, 0.08) 100%);
      transform: translateX(4px);
      
      .filter-option-label {
        color: rgba(59, 130, 246, 0.9);
        font-weight: 600;
        
        .body--dark & {
          color: rgba(96, 165, 250, 1);
        }
      }
    }
  }

  // =============================================
  // ADVANCED MULTI-SELECT CHIPS
  // =============================================
  
  :deep(.q-field--auto-height) {
    .q-field__control {
      min-height: 48px;
      height: auto;
      max-height: 140px;
      overflow-y: auto;
      padding: 8px 16px;
      
      // Custom scrollbar
      &::-webkit-scrollbar {
        width: 4px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(226, 232, 240, 0.3);
        border-radius: 2px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.4);
        border-radius: 2px;
        
        &:hover {
          background: rgba(59, 130, 246, 0.6);
        }
      }
    }
  }
  
  .filter-chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0;
    max-width: 100%;
  }
  
  .filter-chip {
    font-size: 12px;
    font-weight: 600;
    height: 32px;
    border-radius: 16px;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(139, 92, 246, 0.1) 100%);
    color: rgba(59, 130, 246, 0.9);
    border: 1.5px solid rgba(59, 130, 246, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .body--dark & {
      background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.15) 0%, 
        rgba(139, 92, 246, 0.15) 100%);
      color: rgba(96, 165, 250, 1);
      border-color: rgba(96, 165, 250, 0.3);
    }
    
    :deep(.q-chip__content) {
      padding: 0 14px;
      font-weight: 600;
    }
    
    :deep(.q-chip__icon--remove) {
      font-size: 16px;
      margin-left: 8px;
      color: rgba(59, 130, 246, 0.7);
      transition: all 0.2s ease;
      
      &:hover {
        color: rgba(239, 68, 68, 0.8);
        transform: scale(1.2);
      }
      
      .body--dark & {
        color: rgba(96, 165, 250, 0.8);
        
        &:hover {
          color: rgba(248, 113, 113, 0.9);
        }
      }
    }
    
    &:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.4);
      
      .body--dark & {
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        border-color: rgba(96, 165, 250, 0.5);
      }
    }
  }

  // =============================================
  // SOPHISTICATED RANGE FIELDS
  // =============================================
  
  .filter-number-range,
  .filter-date-range {
    position: relative;

    .range-inputs {
      display: flex;
      align-items: stretch;
      gap: 12px;
      position: relative;

      .range-input {
        flex: 1;
        
        :deep(.q-field__control) {
          min-height: 48px;
          height: 48px;
        }
        
        :deep(.q-field__native) {
          font-size: 15px;
          font-weight: 500;
          padding: 16px 16px 8px 16px;
        }
        
        :deep(.q-field__label) {
          font-size: 13px;
          font-weight: 600;
          top: 14px;
        }
        
        :deep(.q-field--focused .q-field__label),
        :deep(.q-field--float .q-field__label) {
          top: -8px;
          font-size: 11px;
          font-weight: 700;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(248, 250, 252, 1) 100%);
          color: rgba(59, 130, 246, 0.9);
          padding: 2px 8px;
          border-radius: 6px;
          
          .body--dark & {
            background: linear-gradient(135deg, 
              rgba(30, 41, 59, 0.95) 0%, 
              rgba(15, 23, 42, 1) 100%);
            color: rgba(96, 165, 250, 1);
          }
        }
      }

      .range-separator {
        color: rgba(71, 85, 105, 0.6);
        font-weight: 700;
        font-size: 18px;
        padding: 0 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 48px;
        
        .body--dark & {
          color: rgba(148, 163, 184, 0.7);
        }
      }
    }
    
    // Floating label for entire range
    &::before {
      content: attr(data-range-label);
      position: absolute;
      top: -8px;
      left: 12px;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(248, 250, 252, 1) 100%);
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 700;
      color: rgba(59, 130, 246, 0.9);
      z-index: 2;
      border-radius: 6px;
      
      .body--dark & {
        background: linear-gradient(135deg, 
          rgba(30, 41, 59, 0.95) 0%, 
          rgba(15, 23, 42, 1) 100%);
        color: rgba(96, 165, 250, 1);
      }
    }
  }

  // =============================================
  // ENHANCED BOOLEAN FIELDS
  // =============================================
  
  .filter-boolean {
    min-height: 48px;
    padding: 0;
    
    .boolean-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
      min-height: 48px;
      padding: 0 20px;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.9) 0%, 
        rgba(248, 250, 252, 0.95) 100%);
      border-radius: 12px;
      border: 1.5px solid rgba(226, 232, 240, 0.6);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      .body--dark & {
        background: linear-gradient(135deg, 
          rgba(30, 41, 59, 0.9) 0%, 
          rgba(15, 23, 42, 0.95) 100%);
        border-color: rgba(71, 85, 105, 0.4);
      }
      
      &:hover {
        border-color: rgba(59, 130, 246, 0.4);
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.98) 0%, 
          rgba(248, 250, 252, 1) 100%);
        transform: translateY(-1px);
        
        .body--dark & {
          border-color: rgba(96, 165, 250, 0.5);
          background: linear-gradient(135deg, 
            rgba(30, 41, 59, 0.98) 0%, 
            rgba(15, 23, 42, 1) 100%);
        }
      }
    }
    
    .boolean-icon {
      color: rgba(59, 130, 246, 0.7);
      font-size: 20px;
      
      .body--dark & {
        color: rgba(96, 165, 250, 0.8);
      }
    }
    
    .boolean-toggle,
    .boolean-checkbox {
      flex: 1;
      
      :deep(.q-toggle__inner),
      :deep(.q-checkbox__inner) {
        font-size: 15px;
      }
      
      :deep(.q-toggle__label),
      :deep(.q-checkbox__label) {
        font-size: 15px;
        font-weight: 600;
        color: rgba(15, 23, 42, 0.9);
        margin-left: 12px;
        
        .body--dark & {
          color: rgba(248, 250, 252, 0.95);
        }
      }
    }
  }

  // =============================================
  // ELEGANT COUNTRY SELECT
  // =============================================
  
  .country-selected {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 32px;
    padding: 4px 0;
    
    .country-name {
      font-size: 15px;
      font-weight: 600;
      color: rgba(15, 23, 42, 0.9);
      
      .body--dark & {
        color: rgba(248, 250, 252, 0.95);
      }
    }
  }

  // =============================================
  // REFINED CURRENCY SYMBOL
  // =============================================
  
  .currency-symbol {
    font-size: 14px;
    font-weight: 700;
    color: rgba(71, 85, 105, 0.7);
    padding: 0 6px;
    
    .body--dark & {
      color: rgba(148, 163, 184, 0.8);
    }
  }

  // =============================================
  // FIELD SIZE VARIANTS
  // =============================================
  
  &.filter-field--small {
    :deep(.q-field__control) {
      min-height: 40px;
      height: 40px;
    }
    
    :deep(.q-field__native) {
      min-height: 40px;
      padding: 12px 14px 6px 14px;
      font-size: 14px;
    }
    
    :deep(.q-field__label) {
      font-size: 12px;
      top: 12px;
    }
  }
  
  &.filter-field--large {
    :deep(.q-field__control) {
      min-height: 56px;
      height: 56px;
    }
    
    :deep(.q-field__native) {
      min-height: 56px;
      padding: 20px 20px 10px 20px;
      font-size: 16px;
    }
    
    :deep(.q-field__label) {
      font-size: 14px;
      top: 16px;
    }
  }
  
  // =============================================
  // DENSE VARIANT
  // =============================================
  
  &.filter-field--dense {
    :deep(.q-field__control) {
      min-height: 40px;
      height: 40px;
      
      .q-field__native {
        padding: 12px 14px 6px 14px;
        font-size: 14px;
        min-height: 40px;
      }
      
      .q-field__label {
        font-size: 12px;
        top: 12px;
      }
      
      &.q-field--focused .q-field__label,
      &.q-field--float .q-field__label {
        top: -6px;
        font-size: 10px;
      }
    }
  }

  // =============================================
  // ERROR HANDLING
  // =============================================
  
  .filter-unknown {
    min-height: 48px;
    display: flex;
    align-items: center;
    padding: 12px;
    
    .q-banner {
      border-radius: 8px;
      font-size: 14px;
      flex: 1;
    }
  }

  // =============================================
  // ENHANCED ACCESSIBILITY
  // =============================================
  
  :deep(.q-field--focused) {
    .q-field__control {
      outline: none; // We handle focus with box-shadow
    }
  }

  // =============================================
  // LOADING STATES
  // =============================================
  
  :deep(.q-field--loading) {
    .q-field__control {
      opacity: 0.8;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(59, 130, 246, 0.1) 50%, 
          transparent 100%);
        animation: loading-shimmer 1.5s infinite;
      }
    }
  }
  
  @keyframes loading-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
}

// =============================================
// RESPONSIVE MOBILE OPTIMIZATIONS
// =============================================

@media (max-width: 640px) {
  .filter-field {
    // Enhanced mobile sizing
    :deep(.q-field__control) {
      min-height: 52px;
      height: 52px;
    }
    
    :deep(.q-field__native) {
      font-size: 16px; // Prevents zoom on iOS
      min-height: 52px;
      padding: 18px 16px 8px 16px;
    }
    
    :deep(.q-field__label) {
      font-size: 13px;
      top: 16px;
    }
    
    // Stack range inputs vertically on mobile
    .filter-number-range,
    .filter-date-range {
      .range-inputs {
        flex-direction: column;
        gap: 12px;
        
        .range-separator {
          display: none;
        }
      }
    }
    
    // Enhanced mobile boolean styling
    .filter-boolean {
      .boolean-wrapper {
        min-height: 52px;
        padding: 0 20px;
      }
    }
    
    // Better mobile chips
    .filter-chip {
      height: 36px;
      font-size: 13px;
      
      :deep(.q-chip__content) {
        padding: 0 16px;
      }
    }
  }
}

// =============================================
// REDUCED MOTION SUPPORT
// =============================================

@media (prefers-reduced-motion: reduce) {
  .filter-field {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

// =============================================
// DARK MODE ENHANCEMENTS
// =============================================

.body--dark .filter-field {
  .currency-symbol {
    color: rgba(148, 163, 184, 0.8);
  }
  
  .range-separator {
    color: rgba(148, 163, 184, 0.7);
  }
  
  .country-name {
    color: rgba(248, 250, 252, 0.95);
  }
  
  // Enhanced dark mode scrollbar
  :deep(.q-field--auto-height) {
    .q-field__control {
      &::-webkit-scrollbar-track {
        background: rgba(71, 85, 105, 0.3);
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(96, 165, 250, 0.5);
        
        &:hover {
          background: rgba(96, 165, 250, 0.7);
        }
      }
    }
  }
}
</style> 