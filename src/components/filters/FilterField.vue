<template>
  <div ref="fieldWrapper" class="filter-field-magento-wrapper">
    <!-- Text Input with label above -->
    <div v-if="field.type === 'text'" class="filter-field-container">
      <label v-if="field.label" class="filter-field-label">
        {{ $t(field.label as string) }}
      </label>
      <div v-else class="filter-field-label-spacer"></div>

      <q-input
        :model-value="modelValue as string"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        :clearable="field.clearable"
        :debounce="field.debounce || 300"
        :disable="disabled"
        :readonly="readonly"
        :loading="loading"
        class="filter-input-magento filter-input--text"
        hide-bottom-space
        @update:model-value="handleChange"
      >
        <template v-if="field.icon" #prepend>
          <q-icon :name="field.icon" class="filter-icon icon-size-sm" />
        </template>
        <template v-if="field.scannerButton" #append>
          <q-btn
            flat
            round
            dense
            icon="qr_code_scanner"
            :disable="disabled"
            size="sm"
            class="filter-scanner-btn"
            @click="handleScan"
          />
        </template>
      </q-input>
    </div>

    <!-- Select Dropdown with label above -->
    <div v-else-if="field.type === 'select'" class="filter-field-container">
      <label v-if="field.label" class="filter-field-label">
        {{ $t(field.label as string) }}
      </label>
      <div v-else class="filter-field-label-spacer"></div>

      <q-select
        :model-value="modelValue"
        :options="selectOptions"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        :clearable="field.clearable"
        :disable="disabled || loading"
        :readonly="readonly"
        :loading="optionsLoading"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-input-magento filter-input--select"
        hide-bottom-space
        max-height="200px"
        behavior="menu"
        @update:model-value="handleChange"
      >
        <template v-if="field.icon" #prepend>
          <q-icon :name="field.icon" size="16px" class="filter-icon" />
        </template>
        <template #option="scope">
          <q-item v-bind="scope.itemProps" dense>
            <q-item-section v-if="scope.opt.icon" avatar>
              <q-icon
                :name="scope.opt.icon"
                :color="scope.opt.color"
                class="icon-size-sm"
              />
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

    <!-- Multi Select with label above -->
    <div
      v-else-if="field.type === 'multi_select'"
      class="filter-field-container"
    >
      <label v-if="field.label" class="filter-field-label">
        {{ $t(field.label as string) }}
      </label>
      <div v-else class="filter-field-label-spacer"></div>

      <q-select
        :model-value="modelValue"
        :options="selectOptions"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
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
        class="filter-input-magento filter-input--multi-select"
        hide-bottom-space
        max-height="200px"
        behavior="menu"
        @update:model-value="handleChange"
      >
        <template v-if="field.icon" #prepend>
          <q-icon :name="field.icon" class="filter-icon icon-size-sm" />
        </template>
        <template #selected>
          <div class="flex flex-wrap gap-1">
            <q-chip
              v-for="value in Array.isArray(modelValue) ? modelValue : []"
              :key="value"
              removable
              dense
              color="primary"
              text-color="white"
              size="xs"
              class="text-xs"
              @remove="removeMultiSelectValue(value)"
            >
              {{ getOptionLabel(value) }}
            </q-chip>
          </div>
        </template>
      </q-select>
    </div>

    <!-- Boolean Checkbox with inline label -->
    <div
      v-else-if="field.type === 'boolean'"
      class="filter-field-container filter-field-container--checkbox"
    >
      <div class="filter-field-label-spacer"></div>

      <div class="filter-checkbox-container">
        <q-checkbox
          :model-value="modelValue"
          :color="field.color || 'primary'"
          :disable="disabled"
          :readonly="readonly"
          size="sm"
          class="filter-checkbox-magento"
          @update:model-value="handleChange"
        />
        <label v-if="field.label" class="filter-checkbox-label">
          <q-icon
            v-if="field.icon"
            :name="field.icon"
            class="filter-icon icon-size-sm q-mr-xs"
          />
          {{ $t(field.label as string) }}
        </label>
      </div>
    </div>

    <!-- Number Input with label above -->
    <div v-else-if="field.type === 'number'" class="filter-field-container">
      <label v-if="field.label" class="filter-field-label">
        {{ $t(field.label as string) }}
      </label>
      <div v-else class="filter-field-label-spacer"></div>

      <q-input
        :model-value="String(modelValue || '')"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        :clearable="field.clearable"
        :disable="disabled"
        :readonly="readonly"
        :loading="loading"
        type="number"
        :step="field.step || 1"
        class="filter-input-magento filter-input--number"
        hide-bottom-space
        @update:model-value="handleChange"
      >
        <template v-if="field.icon" #prepend>
          <q-icon :name="field.icon" class="filter-icon icon-size-sm" />
        </template>
        <template v-if="field.currency" #append>
          <span class="filter-currency">{{ field.currency }}</span>
        </template>
      </q-input>
    </div>

    <!-- Number Range with label above (Van - Tot format) -->
    <div
      v-else-if="field.type === 'number_range'"
      class="filter-field-container"
    >
      <label v-if="field.label" class="filter-field-label">
        {{ $t(field.label as string) }}
      </label>
      <div v-else class="filter-field-label-spacer"></div>

      <div class="filter-range-container">
        <q-input
          :model-value="rangeValue.min || ''"
          placeholder="Van"
          type="number"
          :step="field.step || 1"
          outlined
          class="filter-range-input filter-input-magento"
          hide-bottom-space
          @update:model-value="value => handleRangeChange('min', value)"
        >
          <template v-if="field.currency" #append>
            <span class="filter-currency">{{ field.currency }}</span>
          </template>
        </q-input>

        <span class="filter-range-separator">–</span>

        <q-input
          :model-value="rangeValue.max || ''"
          placeholder="Tot"
          type="number"
          :step="field.step || 1"
          outlined
          class="filter-range-input filter-input-magento"
          hide-bottom-space
          @update:model-value="value => handleRangeChange('max', value)"
        >
          <template v-if="field.currency" #append>
            <span class="filter-currency">{{ field.currency }}</span>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Date Input with label above -->
    <div v-else-if="field.type === 'date'" class="filter-field-container">
      <label v-if="field.label" class="filter-field-label">
        {{ $t(field.label as string) }}
      </label>
      <div v-else class="filter-field-label-spacer"></div>

      <q-input
        :model-value="String(modelValue || '')"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        :clearable="field.clearable"
        :disable="disabled"
        :readonly="readonly"
        :loading="loading"
        class="filter-input-magento filter-input--date"
        hide-bottom-space
        @update:model-value="handleChange"
      >
        <template v-if="field.icon" #prepend>
          <q-icon :name="field.icon" size="16px" class="filter-icon" />
        </template>
        <template #append>
          <q-icon name="event" class="filter-date-icon icon-size-sm">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                :model-value="modelValue"
                mask="YYYY-MM-DD"
                @update:model-value="handleChange"
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Sluiten"
                    color="primary"
                    flat
                    size="sm"
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <!-- Date Range with label above (Van - Tot format) -->
    <div v-else-if="field.type === 'date_range'" class="filter-field-container">
      <label v-if="field.label" class="filter-field-label">
        {{ $t(field.label as string) }}
      </label>
      <div v-else class="filter-field-label-spacer"></div>

      <div class="filter-range-container">
        <q-input
          :model-value="dateRangeValue.start || ''"
          placeholder="Van"
          outlined
          class="filter-range-input filter-input-magento"
          hide-bottom-space
          @update:model-value="value => handleDateRangeChange('start', value)"
        >
          <template #append>
            <q-icon name="event" class="filter-date-icon icon-size-sm">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  :model-value="dateRangeValue.start"
                  mask="YYYY-MM-DD"
                  @update:model-value="
                    value => handleDateRangeChange('start', value)
                  "
                >
                  <div class="row items-center justify-end">
                    <q-btn
                      v-close-popup
                      label="Sluiten"
                      color="primary"
                      flat
                      size="sm"
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <span class="filter-range-separator">–</span>

        <q-input
          :model-value="dateRangeValue.end || ''"
          placeholder="Tot"
          outlined
          class="filter-range-input filter-input-magento"
          hide-bottom-space
          @update:model-value="value => handleDateRangeChange('end', value)"
        >
          <template #append>
            <q-icon name="event" class="filter-date-icon" size="16px">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  :model-value="dateRangeValue.end"
                  mask="YYYY-MM-DD"
                  @update:model-value="
                    value => handleDateRangeChange('end', value)
                  "
                >
                  <div class="row items-center justify-end">
                    <q-btn
                      v-close-popup
                      label="Sluiten"
                      color="primary"
                      flat
                      size="sm"
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Country Select with label above -->
    <div v-else-if="field.type === 'country'" class="filter-field-container">
      <label v-if="field.label" class="filter-field-label">
        {{ $t(field.label as string) }}
      </label>
      <div v-else class="filter-field-label-spacer"></div>
      <q-select
        :model-value="modelValue"
        :options="selectOptions"
        :placeholder="field.placeholder ? $t(field.placeholder as string) : ''"
        outlined
        :clearable="field.clearable"
        :disable="disabled || loading"
        :readonly="readonly"
        :loading="optionsLoading"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-input-magento filter-input--country"
        hide-bottom-space
        max-height="200px"
        behavior="menu"
        @update:model-value="handleChange"
      >
        <template v-if="field.icon" #prepend>
          <q-icon :name="field.icon" size="16px" class="filter-icon" />
        </template>
        <template #option="scope">
          <q-item v-bind="scope.itemProps" dense>
            <q-item-section side>
              <country-flag :country="scope.opt.value" size="small" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-sm">{{ scope.opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template #selected>
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
        <span class="unknown-field-message"
          >Unknown filter type: {{ field.type }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { supabase } from '@/services/supabase';
  import CountryFlag from '@/components/CountryFlag.vue';
  import type {
    FilterField,
    FilterValue,
    FilterDataSource,
    FilterOption,
  } from '@/types/filters';

  interface Props {
    field: FilterField;
    modelValue: FilterValue;
    loading?: boolean;
    disabled?: boolean;
    readonly?: boolean;
  }

  interface Emits {
    (e: 'update:modelValue', value: FilterValue): void;
    (e: 'change', value: FilterValue, oldValue?: FilterValue): void;
    (e: 'scan', scannedValue: string): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    disabled: false,
    readonly: false,
  });

  const emit = defineEmits<Emits>();

  // Composables
  const { t } = useI18n();

  // State
  const selectOptions = ref<FilterOption[]>([]);
  const optionsLoading = ref(false);

  // Computed
  const fieldClasses = computed(() => {
    const classes = [`filter-input--${props.field.type}`];

    if (props.field.size) {
      classes.push(`filter-input--${props.field.size}`);
    }

    if (props.field.dense) {
      classes.push('filter-input--dense');
    }

    return classes;
  });

  type FilterRange = { min?: number; max?: number };
  type FilterDateRangeValue = { start?: string; end?: string };
  const rangeValue = computed<FilterRange>(() => {
    if (
      props.field.type === 'number_range' &&
      typeof props.modelValue === 'object' &&
      props.modelValue !== null
    ) {
      return props.modelValue as FilterRange;
    }
    return { min: undefined, max: undefined };
  });

  const dateRangeValue = computed<FilterDateRangeValue>(() => {
    if (
      props.field.type === 'date_range' &&
      typeof props.modelValue === 'object' &&
      props.modelValue !== null
    ) {
      return props.modelValue as FilterDateRangeValue;
    }
    return { start: undefined, end: undefined };
  });

  // Methods
  const handleChange = (value: FilterValue) => {
    const oldValue = props.modelValue;
    emit('update:modelValue', value);
    emit('change', value, oldValue);
  };

  const isEmptyValue = (
    value: FilterValue | FilterValue[] | undefined
  ): boolean => {
    if (value === null || value === undefined || value === '') {
      return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    if (typeof value === 'number' && value === 0) {
      return true;
    }
    return false;
  };

  const handleRangeChange = (
    key: 'min' | 'max',
    value: number | string | null
  ) => {
    const currentRange = rangeValue.value;
    const newRange: FilterRange = {
      ...currentRange,
      [key]: value ?? undefined,
    };

    // Clean up null/undefined values
    if (isEmptyValue(newRange.min)) {
      delete newRange.min;
    }
    if (isEmptyValue(newRange.max)) {
      delete newRange.max;
    }

    handleChange(
      Object.keys(newRange).length > 0 ? (newRange as FilterValue) : null
    );
  };

  const handleDateRangeChange = (
    key: 'start' | 'end',
    value: string | null
  ) => {
    const currentRange = dateRangeValue.value;
    const newRange: FilterDateRangeValue = {
      ...currentRange,
      [key]: value && value.trim() !== '' ? value : undefined,
    };

    // Clean up null/undefined values
    if (
      newRange.start === null ||
      newRange.start === undefined ||
      newRange.start === ''
    ) {
      delete newRange.start;
    }
    if (
      newRange.end === null ||
      newRange.end === undefined ||
      newRange.end === ''
    ) {
      delete newRange.end;
    }

    handleChange(
      Object.keys(newRange).length > 0 ? (newRange as FilterValue) : null
    );
  };

  const removeMultiSelectValue = (valueToRemove: FilterValue) => {
    if (Array.isArray(props.modelValue)) {
      const newValues = props.modelValue.filter(v => v !== valueToRemove);
      handleChange(newValues);
    }
  };

  const getOptionLabel = (value: FilterValue) => {
    const option = selectOptions.value.find(opt => opt.value === value);
    return option?.label || String(value);
  };

  const handleScan = () => {
    // TODO: Implement barcode scanning
    // For now, emit scan event that parent can handle
    emit('scan', '');
  };

  const getSelectedCountryLabel = () => {
    const option = selectOptions.value.find(
      opt => opt.value === props.modelValue
    );
    return option?.label || String(props.modelValue ?? '');
  };

  // Load select options based on data source
  const loadSelectOptions = async () => {
    if (!props.field.dataSource) {
      return;
    }

    const dataSource = props.field.dataSource as FilterDataSource;

    if (dataSource.type === 'static' && dataSource.options) {
      // Translate static option labels if they are i18n keys
      selectOptions.value = dataSource.options.map(option => ({
        ...option,
        label: option.label.startsWith('filters.')
          ? t(option.label)
          : option.label,
      }));
      return;
    }

    if (dataSource.type === 'supabase' && dataSource.table) {
      const { valueField, labelField } = dataSource;

      if (!valueField || !labelField) {
        console.warn(
          'Supabase data source requires both valueField and labelField to be defined',
          dataSource
        );
        selectOptions.value = [];
        return;
      }

      try {
        optionsLoading.value = true;

        let query = supabase
          .from(dataSource.table)
          .select(`${valueField}, ${labelField}`);

        // Apply filters
        if (dataSource.filters) {
          dataSource.filters.forEach(filter => {
            // Map filter operators to Supabase syntax
            let supabaseOperator: string = filter.operator;
            if (filter.operator === 'is not') {
              supabaseOperator = 'not.is';
            }

            query = query.filter(filter.field, supabaseOperator, filter.value);
          });
        }

        // Apply distinct
        if (dataSource.distinct) {
          // Note: Supabase doesn't have direct distinct, but we'll handle it client-side
        }

        // Apply ordering
        if (dataSource.orderBy) {
          dataSource.orderBy.forEach(order => {
            query = query.order(order.field, {
              ascending: order.direction === 'asc',
            });
          });
        }

        const { data, error } = await query;

        if (error) {
          console.warn(
            'Failed to load select options (likely RLS policy issue):',
            error
          );
          selectOptions.value = [];
          return;
        }

        if (data) {
          let options = (data as Array<Record<string, unknown>>).map(item => ({
            value: item[valueField],
            label: item[labelField],
          }));

          // Handle distinct client-side
          if (dataSource.distinct) {
            const seen = new Set();
            options = options.filter(opt => {
              if (seen.has(opt.value)) {
                return false;
              }
              seen.add(opt.value);
              return true;
            });
          }

          selectOptions.value = options;
        }
      } catch (error) {
        console.warn(
          'Failed to load select options (likely RLS policy issue):',
          error
        );
        selectOptions.value = [];
      } finally {
        optionsLoading.value = false;
      }
    }
  };

  // Watch for data source changes
  watch(() => props.field.dataSource, loadSelectOptions, { immediate: true });

  // Watch for model value changes to ensure proper label positioning
  const hasValue = computed(() => {
    const value = props.modelValue;

    // Null, undefined, empty string
    if (value === null || value === undefined || value === '') {
      return false;
    }

    // Empty arrays
    if (Array.isArray(value) && value.length === 0) return false;

    // For objects (ranges), check if they have meaningful values
    if (typeof value === 'object' && value !== null) {
      // Empty object
      if (Object.keys(value).length === 0) return false;

      // For range objects with min/max, only consider it "has value" if at least one meaningful value exists
      if ('min' in value || 'max' in value) {
        const range = value as FilterRange;
        const hasMin =
          range.min !== null &&
          range.min !== undefined &&
          range.min !== '' &&
          range.min !== 0;
        const hasMax =
          range.max !== null &&
          range.max !== undefined &&
          range.max !== '' &&
          range.max !== 0;
        return hasMin || hasMax;
      }

      // For date range objects with start/end
      if ('start' in value || 'end' in value) {
        const range = value as FilterDateRangeValue;
        const hasStart =
          range.start !== null &&
          range.start !== undefined &&
          range.start !== '';
        const hasEnd =
          range.end !== null && range.end !== undefined && range.end !== '';
        return hasStart || hasEnd;
      }

      // For other objects, check if any values are meaningful
      return Object.values(value).some(
        v => v !== null && v !== undefined && v !== ''
      );
    }

    // For numbers, any number including 0 is valid
    if (typeof value === 'number') return true;

    // For booleans, both true and false are valid values
    if (typeof value === 'boolean') return true;

    // For strings, check if not empty after trim
    if (typeof value === 'string') return value.trim() !== '';

    // Default: if we have any other value, consider it "has value"
    return Boolean(value);
  });

  // Template ref for field wrapper
  const fieldWrapper = ref(null);

  // Enhanced label positioning that actually works
  const updateFieldValueClass = () => {
    nextTick(() => {
      if (!fieldWrapper.value) return;

      const fieldElements = fieldWrapper.value.querySelectorAll('.q-field');
      fieldElements.forEach(fieldElement => {
        // Force proper classes based on value state
        if (hasValue.value) {
          fieldElement.classList.add('q-field--has-value');
          fieldElement.classList.add('q-field--float');
        } else {
          fieldElement.classList.remove('q-field--has-value');
          fieldElement.classList.remove('q-field--float');
        }
      });
    });
  };

  // More aggressive watching to ensure labels stay positioned
  watch(hasValue, updateFieldValueClass, { immediate: true, flush: 'post' });
  watch(() => props.modelValue, updateFieldValueClass, {
    immediate: true,
    flush: 'post',
  });

  // Additional watch for string/array values to catch all cases
  watch(
    () => props.modelValue,
    newVal => {
      // Extra check for edge cases
      setTimeout(updateFieldValueClass, 50);
    },
    { immediate: true, deep: true }
  );

  // Initialize on mount and after DOM updates
  onMounted(() => {
    loadSelectOptions();
    updateFieldValueClass();
    // Additional timeout to ensure DOM is fully rendered
    setTimeout(updateFieldValueClass, 100);
  });

  // Force update after any interaction
  const forceUpdateLabels = () => {
    setTimeout(updateFieldValueClass, 10);
  };
</script>

<style lang="scss" scoped>
  // ===================================================================
  // MAGENTO-STYLE FILTER FIELDS - CLEAN & CONSISTENT
  // ===================================================================

  .filter-field-magento-wrapper {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  // Compact field container with proper proportions
  .filter-field-container {
    display: flex;
    flex-direction: column;
    gap: 4px; // Proper gap for good visual spacing
    min-height: 66px; // Proper height: 18px label + 4px gap + 40px field + 4px margin

    &--checkbox {
      align-items: flex-start;
      min-height: 46px; // Proper height for checkboxes
    }
  }

  // Well-proportioned labels above fields
  .filter-field-label {
    font-size: 13px; // Good readable size
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.2; // Balanced line height
    margin-bottom: 0; // No margin - gap handles spacing
    min-height: 18px; // Proper label height
    display: flex;
    align-items: flex-end; // Align text to bottom of label area
  }

  // Empty spacer to maintain alignment when no label
  .filter-field-label-spacer {
    min-height: 18px; // Match label height exactly
  }

  // Compact Magento-style input styling
  .filter-input-magento {
    width: 100%;
    min-width: 0;

    // Fix the parent field height to match control height via tokens
    :deep(.q-field) {
      min-height: var(--control-height-md);
      height: var(--control-height-md);
    }

    // Compact Magento-style field control with perfect centering
    :deep(.q-field__control) {
      background-color: var(--bg-primary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      min-height: var(--control-height-md);
      height: var(--control-height-md);
      padding: 0 12px; // Restored padding for proper spacing
      transition: border-color 0.2s ease;
      display: flex; // Enable flex for proper centering
      align-items: center; // Perfect vertical centering

      &:hover {
        border-color: var(--border-secondary);
      }
    }

    // Focus state
    :deep(.q-field--focused .q-field__control) {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px var(--focus-ring-color, rgba(30, 58, 138, 0.3));
      border-color: transparent;
    }

    // Native input styling with perfect vertical centering
    :deep(.q-field__native) {
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.4;
      padding: var(--control-pad-y) 0;
      height: var(--control-height-md);
      min-height: var(--control-height-md);
      display: flex;
      align-items: center; // Perfect vertical centering
    }

    // Placeholder styling - normal text, secondary color, perfect centering
    :deep(.q-placeholder) {
      color: var(--text-tertiary);
      font-style: normal;
      font-size: 14px;
      line-height: 1.4;
      height: 100%; // Take full height
      display: flex;
      align-items: center; // Perfect vertical centering
    }

    // Selected value styling with perfect centering
    :deep(.q-field__selected) {
      color: var(--text-primary);
      font-size: 14px;
      line-height: 1.4;
      height: 100%; // Take full height
      display: flex;
      align-items: center; // Perfect vertical centering
      min-height: calc(var(--control-height-md) - 2px);
      padding: 0; // Remove any extra padding
    }

    // Fix Quasar label positioning for all inputs
    :deep(.q-field__label) {
      position: absolute;
      top: 50%; // Center vertically
      transform: translateY(-50%); // Perfect center
      left: 12px;
      font-size: 14px;
      color: var(--text-tertiary);
      pointer-events: none;
      transition: all 0.2s ease;
      line-height: 1;
    }

    // When field has value or is focused, move label up
    :deep(.q-field--float .q-field__label) {
      top: -6px;
      font-size: 12px;
      color: var(--brand-primary);
      background: var(--bg-primary);
      padding: 0 4px;
      transform: none;
    }
  }

  // Icon styling - consistent positioning, size and perfect centering
  .filter-icon {
    color: var(--text-secondary);
    flex-shrink: 0;
    display: flex;
    align-items: center; // Perfect vertical centering
    justify-content: center; // Perfect horizontal centering
  }

  // Scanner button styling with perfect centering
  .filter-scanner-btn {
    color: var(--text-secondary);
    display: flex;
    align-items: center; // Perfect vertical centering
    justify-content: center; // Perfect horizontal centering

    &:hover {
      color: var(--brand-primary);
    }
  }

  // Date picker icon styling with perfect centering
  .filter-date-icon {
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center; // Perfect vertical centering
    justify-content: center; // Perfect horizontal centering

    &:hover {
      color: var(--brand-primary);
    }
  }

  // Currency display styling
  .filter-currency {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: normal;
  }

  // Checkbox container and styling
  .filter-checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: var(--control-height-md);
  }

  .filter-checkbox-magento {
    :deep(.q-checkbox__inner) {
      border: 1px solid var(--border-primary);
      border-radius: 3px;
      background: var(--bg-primary);
    }

    :deep(.q-checkbox__inner:hover) {
      border-color: var(--border-secondary);
    }
  }

  .filter-checkbox-label {
    font-size: 14px;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  // Well-balanced range container - maintains Van-Tot format
  .filter-range-container {
    display: flex;
    align-items: center;
    gap: 8px; // Proper gap for good visual spacing
    width: 100%;
    min-height: 42px; // Match field height exactly
  }

  .filter-range-input {
    flex: 1;
    min-width: 0;

    // Ensure range inputs have exact same height and centering as other fields
    :deep(.q-field__control) {
      min-height: var(--control-height-md);
      height: var(--control-height-md);
      display: flex; // Enable flex for proper centering
      align-items: center; // Perfect vertical centering
    }

    // Range inputs inherit label styling from parent .filter-input-magento
  }

  .filter-range-separator {
    font-size: 14px; // Reduced size for compactness
    color: #666;
    font-weight: normal;
    margin: 0 2px; // Reduced margin
    line-height: 1;
  }

  // Mobile responsiveness - compact yet touch-friendly
  @media (max-width: 768px) {
    .filter-field-container {
      min-height: 62px; // Mobile: 18px label + 4px gap + 40px field
      gap: 4px; // Proper gap for mobile

      &--checkbox {
        min-height: 44px; // Touch-friendly checkboxes
      }
    }

    .filter-range-container {
      flex-direction: column;
      gap: 8px; // Proper gap on mobile for touch

      .filter-range-separator {
        display: none;
      }

      .filter-range-input {
        :deep(.q-field__control) {
          min-height: var(--control-height-md);
          height: var(--control-height-md);
        }
      }
    }

    .filter-input-magento {
      :deep(.q-field__control) {
        min-height: var(--control-height-md);
        height: var(--control-height-md);
        font-size: 16px; // Prevent zoom on iOS
        display: flex; // Maintain flex for centering
        align-items: center; // Perfect vertical centering
      }

      // Mobile label positioning
      :deep(.q-field__label) {
        top: 50%; // Center vertically on mobile too
        transform: translateY(-50%);
        font-size: 16px; // Larger on mobile
      }

      :deep(.q-field--float .q-field__label) {
        top: -8px; // Adjust for mobile
        font-size: 14px; // Smaller when floating
      }
    }
  }
</style>
