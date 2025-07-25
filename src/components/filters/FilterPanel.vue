<template>
  <div class="filter-panel" :class="panelClasses">
    <!-- Filter Header -->
    <div v-if="showHeader" class="filter-panel-header">
      <div class="header-content">
        <div class="header-info">
          <q-icon v-if="preset.groups" name="tune" size="20px" />
          <div class="header-text">
            <h3 class="header-title">{{ t(preset.name) }}</h3>
            <p v-if="preset.description" class="header-description">{{ t(preset.description) }}</p>
          </div>
        </div>
        <div class="header-actions">
          <q-btn
            v-if="collapsible"
            flat
            round
            dense
            :icon="isCollapsed ? 'expand_more' : 'expand_less'"
            @click="toggleCollapse"
            size="sm"
          >
            <q-tooltip>{{ isCollapsed ? t('filters.filterPanel.showMore') : t('filters.filterPanel.showLess') }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Filter Content -->
    <q-slide-transition>
      <div v-show="!isCollapsed" class="filter-panel-content">
        <!-- Main Filter Fields -->
        <div class="filter-fields-container">
          <div class="filter-fields-grid" :class="gridClasses">
            <!-- Visible fields (not in groups) -->
            <template v-for="field in visibleMainFields" :key="field.id">
              <div class="filter-field-wrapper" :class="fieldWrapperClasses(field)">
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

          <!-- Show More/Less Button for Main Fields -->
          <div v-if="hasMoreMainFields" class="show-more-section">
            <q-btn
              flat
              :label="showingAllMainFields ? t('filters.filterPanel.showLess') : t('filters.filterPanel.showMore')"
              :icon="showingAllMainFields ? 'expand_less' : 'expand_more'"
              @click="toggleShowMore"
              color="primary"
              size="sm"
            />
          </div>
        </div>

        <!-- Filter Groups -->
        <div v-if="preset.groups && Object.keys(preset.groups).length > 0" class="filter-groups">
          <div v-for="(group, groupId) in preset.groups" :key="groupId" class="filter-group">
            <div class="filter-group-header" @click="toggleGroup(groupId)">
              <div class="group-header-content">
                <q-icon v-if="group.icon" :name="group.icon" size="18px" />
                <span class="group-title">{{ t(group.label) }}</span>
                <q-icon
                  v-if="group.collapsible"
                  :name="groupStates[groupId]?.collapsed ? 'expand_more' : 'expand_less'"
                  size="18px"
                  class="group-toggle"
                />
              </div>
              <p v-if="group.description" class="group-description">{{ t(group.description) }}</p>
            </div>

            <q-slide-transition>
              <div v-show="!groupStates[groupId]?.collapsed" class="filter-group-content">
                <div class="filter-fields-grid" :class="gridClasses">
                  <template v-for="field in getGroupFields(groupId)" :key="field.id">
                    <div class="filter-field-wrapper" :class="fieldWrapperClasses(field)">
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
              </div>
            </q-slide-transition>
          </div>
        </div>
      </div>
    </q-slide-transition>

    <!-- Filter Footer -->
    <div v-if="showFooter" class="filter-panel-footer">
      <div class="footer-content">
        <div class="active-filters-summary">
          <span class="active-count">{{ t('filters.filterPanel.filtersActive', { count: activeFiltersCount }) }}</span>
        </div>
        <div class="footer-actions">
          <q-btn
            v-if="preset.layout.resetButton"
            flat
            :label="t('filters.filterPanel.resetAll')"
            icon="refresh"
            @click="handleReset"
            :disable="disabled || activeFiltersCount === 0"
            size="sm"
          />
          <q-btn
            v-if="preset.layout.clearAllButton"
            flat
            :label="t('filters.filterPanel.clearAll')"
            icon="clear_all"
            @click="handleClearAll"
            :disable="disabled || activeFiltersCount === 0"
            color="negative"
            size="sm"
          />
        </div>
      </div>
    </div>
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
  collapsible: false,
  initiallyCollapsed: false,
})

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()

// State
const isCollapsed = ref(props.initiallyCollapsed)
const showingAllMainFields = ref(false)
const groupStates = reactive<Record<string, { collapsed: boolean }>>({})

// Initialize group states
onMounted(() => {
  if (props.preset.groups) {
    Object.keys(props.preset.groups).forEach(groupId => {
      const group = props.preset.groups![groupId]
      groupStates[groupId] = {
        collapsed: group.collapsed ?? false
      }
    })
  }
})

// Computed
const panelClasses = computed(() => {
  const classes = ['filter-panel']
  
  if (props.preset.layout.compactMode) {
    classes.push('filter-panel--compact')
  }
  
  if (props.disabled) {
    classes.push('filter-panel--disabled')
  }
  
  if (props.readonly) {
    classes.push('filter-panel--readonly')
  }
  
  return classes
})

const gridClasses = computed(() => {
  const layout = props.preset.layout
  return [
    'filter-grid',
    `filter-grid--desktop-${layout.columns.desktop}`,
    `filter-grid--tablet-${layout.columns.tablet}`,
    `filter-grid--mobile-${layout.columns.mobile}`,
    layout.spacing ? `filter-grid--spacing-${layout.spacing}` : 'filter-grid--spacing-md'
  ]
})

// Filter field organization
const sortedFields = computed(() => {
  return [...props.preset.fields].sort((a, b) => (a.priority || 999) - (b.priority || 999))
})

const mainFields = computed(() => {
  return sortedFields.value.filter(field => !field.group)
})

const visibleMainFields = computed(() => {
  const threshold = props.preset.layout.showMoreThreshold || 6
  
  if (showingAllMainFields.value || mainFields.value.length <= threshold) {
    return mainFields.value
  }
  
  return mainFields.value.slice(0, threshold)
})

const hasMoreMainFields = computed(() => {
  const threshold = props.preset.layout.showMoreThreshold || 6
  return mainFields.value.length > threshold
})

const hiddenMainFieldsCount = computed(() => {
  const threshold = props.preset.layout.showMoreThreshold || 6
  return Math.max(0, mainFields.value.length - threshold)
})

const activeFiltersCount = computed(() => {
  return Object.values(props.modelValue).filter(value => {
    if (value === null || value === undefined || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    if (typeof value === 'object' && Object.keys(value).length === 0) return false
    return true
  }).length
})

// Methods
const fieldWrapperClasses = (field: FilterFieldType) => {
  const classes = []
  
  if (field.size) {
    classes.push(`field-wrapper--${field.size}`)
  }
  
  return classes
}

const getGroupFields = (groupId: string) => {
  return sortedFields.value.filter(field => field.group === groupId)
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

const handleReset = () => {
  const resetFields = Object.keys(props.modelValue)
  const defaultValues = props.preset.defaultFilters || {}
  
  const resetEvent: FilterResetEvent = {
    fields: resetFields,
    preset: props.preset.id
  }
  
  emit('update:modelValue', { ...defaultValues })
  emit('reset', resetEvent)
}

const handleClearAll = () => {
  emit('update:modelValue', {})
  emit('clear')
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleShowMore = () => {
  showingAllMainFields.value = !showingAllMainFields.value
}

const toggleGroup = (groupId: string) => {
  const group = props.preset.groups?.[groupId]
  if (group?.collapsible) {
    groupStates[groupId].collapsed = !groupStates[groupId].collapsed
  }
}

// Apply default filters on mount
onMounted(() => {
  if (props.preset.defaultFilters && Object.keys(props.modelValue).length === 0) {
    emit('update:modelValue', { ...props.preset.defaultFilters })
  }
})
</script>

<style lang="scss" scoped>
// =============================================
// MODERN FILTER PANEL DESIGN
// Enhanced typography, spacing, colors & visual hierarchy
// =============================================

.filter-panel {
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.04),
    0 1px 4px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  // Dark mode support with enhanced visual depth
  .body--dark & {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
    border-color: rgba(71, 85, 105, 0.6);
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  // Compact mode refinements
  &.filter-panel--compact {
    border-radius: 12px;
    
    .filter-panel-header {
      padding: 16px 20px;
    }
    
    .filter-panel-content {
      padding: 16px 20px;
    }
    
    .filter-panel-footer {
      padding: 12px 20px;
    }
  }

  // Enhanced hover state
  &:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    
    .body--dark & {
      box-shadow: 
        0 12px 32px rgba(0, 0, 0, 0.2),
        0 4px 16px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
  }

  // Disabled state
  &.filter-panel--disabled {
    opacity: 0.6;
    pointer-events: none;
    transform: none;
  }

  // Readonly state
  &.filter-panel--readonly {
    .filter-panel-footer {
      display: none;
    }
  }
}

// =============================================
// ENHANCED HEADER DESIGN
// =============================================

.filter-panel-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, 
    rgba(248, 250, 252, 0.9) 0%, 
    rgba(241, 245, 249, 0.95) 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  position: relative;

  // Subtle pattern overlay
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }

  .body--dark & {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.9) 0%, 
      rgba(15, 23, 42, 0.95) 100%);
    border-bottom-color: rgba(71, 85, 105, 0.4);
    
    &::before {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
    }
  }

  .header-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    position: relative;
    z-index: 1;
  }

  .header-info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    
    .q-icon {
      color: rgba(59, 130, 246, 0.8);
      font-size: 22px;
      margin-top: 2px;
      
      .body--dark & {
        color: rgba(96, 165, 250, 0.9);
      }
    }
  }

  .header-text {
    flex: 1;
  }

  .header-title {
    font-size: 18px;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.9);
    margin: 0 0 6px 0;
    line-height: 1.3;
    letter-spacing: -0.025em;
    
    .body--dark & {
      color: rgba(248, 250, 252, 0.95);
    }
  }

  .header-description {
    font-size: 14px;
    color: rgba(71, 85, 105, 0.8);
    margin: 0;
    line-height: 1.5;
    font-weight: 400;
    
    .body--dark & {
      color: rgba(148, 163, 184, 0.9);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .q-btn {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(226, 232, 240, 0.6);
      color: rgba(71, 85, 105, 0.8);
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
        color: rgba(59, 130, 246, 0.9);
        transform: scale(1.05);
      }
      
      .body--dark & {
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(71, 85, 105, 0.4);
        color: rgba(148, 163, 184, 0.9);
        
        &:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(96, 165, 250, 0.4);
          color: rgba(96, 165, 250, 1);
        }
      }
    }
  }
}

// =============================================
// ENHANCED CONTENT AREA
// =============================================

.filter-panel-content {
  padding: 24px;
  
  .filter-fields-container {
    margin-bottom: 20px;
  }
}

// =============================================
// SUPERIOR GRID SYSTEM
// Responsive, accessible, beautiful
// =============================================

.filter-grid {
  display: grid;
  gap: 20px;
  
  // Enhanced responsive columns with better breakpoints
  &.filter-grid--desktop-1 { grid-template-columns: 1fr; }
  &.filter-grid--desktop-2 { grid-template-columns: repeat(2, 1fr); }
  &.filter-grid--desktop-3 { grid-template-columns: repeat(3, 1fr); }
  &.filter-grid--desktop-4 { grid-template-columns: repeat(4, 1fr); }
  &.filter-grid--desktop-5 { grid-template-columns: repeat(5, 1fr); }
  &.filter-grid--desktop-6 { grid-template-columns: repeat(6, 1fr); }

  // Tablet responsive (optimal UX for 768px - 1024px)
  @media (max-width: 1024px) {
    gap: 16px;
    
    &.filter-grid--tablet-1 { grid-template-columns: 1fr; }
    &.filter-grid--tablet-2 { grid-template-columns: repeat(2, 1fr); }
    &.filter-grid--tablet-3 { grid-template-columns: repeat(3, 1fr); }
    
    // Smart fallbacks for large desktop grids
    &.filter-grid--desktop-4,
    &.filter-grid--desktop-5,
    &.filter-grid--desktop-6 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  // Mobile responsive (perfect for touch interfaces)
  @media (max-width: 640px) {
    gap: 16px;
    
    &.filter-grid--mobile-1 { grid-template-columns: 1fr; }
    &.filter-grid--mobile-2 { grid-template-columns: repeat(2, 1fr); }
    
    // All grids collapse to single column on mobile for optimal UX
    &.filter-grid--desktop-3,
    &.filter-grid--desktop-4,
    &.filter-grid--desktop-5,
    &.filter-grid--desktop-6,
    &.filter-grid--tablet-2,
    &.filter-grid--tablet-3 {
      grid-template-columns: 1fr;
    }
  }

  // Enhanced spacing variants
  &.filter-grid--spacing-none { gap: 0; }
  &.filter-grid--spacing-xs { gap: 8px; }
  &.filter-grid--spacing-sm { gap: 12px; }
  &.filter-grid--spacing-md { gap: 20px; }
  &.filter-grid--spacing-lg { gap: 28px; }
}

.filter-field-wrapper {
  min-width: 0; // Prevent grid overflow
  
  // Enhanced responsive field sizing
  &.field-wrapper--small {
    grid-column: span 1;
  }
  
  &.field-wrapper--medium {
    grid-column: span 1;
    
    @media (min-width: 768px) {
      grid-column: span 1;
    }
  }
  
  &.field-wrapper--large {
    grid-column: span 1;
    
    @media (min-width: 768px) {
      grid-column: span 2;
    }
  }
  
  &.field-wrapper--full {
    grid-column: 1 / -1;
  }
}

// =============================================
// BEAUTIFUL SHOW MORE SECTION
// =============================================

.show-more-section {
  margin-top: 20px;
  text-align: center;
  border-top: 1px solid rgba(226, 232, 240, 0.4);
  padding-top: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(59, 130, 246, 0.6) 50%, 
      transparent 100%);
  }
  
  .body--dark & {
    border-top-color: rgba(71, 85, 105, 0.3);
    
    &::before {
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(96, 165, 250, 0.8) 50%, 
        transparent 100%);
    }
  }
  
  .q-btn {
    min-width: 140px;
    height: 40px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 10px;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: rgba(59, 130, 246, 0.9);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.15) 0%, 
        rgba(139, 92, 246, 0.15) 100%);
      border-color: rgba(59, 130, 246, 0.4);
      color: rgba(59, 130, 246, 1);
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
    }
    
    .body--dark & {
      background: linear-gradient(135deg, 
        rgba(30, 41, 59, 0.8) 0%, 
        rgba(15, 23, 42, 0.9) 100%);
      border-color: rgba(71, 85, 105, 0.4);
      color: rgba(148, 163, 184, 0.9);
      
      &:hover {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.2) 0%, 
          rgba(139, 92, 246, 0.2) 100%);
        border-color: rgba(96, 165, 250, 0.5);
        color: rgba(96, 165, 250, 1);
        box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
      }
    }
  }
}

// =============================================
// GORGEOUS GROUP STYLING
// =============================================

.filter-groups {
  margin-top: 24px;
  
  .filter-group {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.6) 0%, 
      rgba(248, 250, 252, 0.8) 100%);
    border: 1px solid rgba(226, 232, 240, 0.5);
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .body--dark & {
      background: linear-gradient(135deg, 
        rgba(30, 41, 59, 0.6) 0%, 
        rgba(15, 23, 42, 0.8) 100%);
      border-color: rgba(71, 85, 105, 0.3);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &:hover {
      border-color: rgba(59, 130, 246, 0.3);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
      
      .body--dark & {
        border-color: rgba(96, 165, 250, 0.4);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      }
    }
  }

  .filter-group-header {
    padding: 16px 20px;
    background: linear-gradient(135deg, 
      rgba(248, 250, 252, 0.8) 0%, 
      rgba(241, 245, 249, 0.9) 100%);
    border-bottom: 1px solid rgba(226, 232, 240, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
    
    .body--dark & {
      background: linear-gradient(135deg, 
        rgba(30, 41, 59, 0.8) 0%, 
        rgba(15, 23, 42, 0.9) 100%);
      border-bottom-color: rgba(71, 85, 105, 0.3);
    }
    
    .group-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }

    .group-title {
      font-size: 15px;
      font-weight: 700;
      color: rgba(15, 23, 42, 0.9);
      flex: 1;
      letter-spacing: -0.01em;
      
      .body--dark & {
        color: rgba(248, 250, 252, 0.95);
      }
    }

    .group-toggle {
      color: rgba(71, 85, 105, 0.7);
      transition: all 0.2s ease;
      
      .body--dark & {
        color: rgba(148, 163, 184, 0.8);
      }
    }

    .group-description {
      font-size: 13px;
      color: rgba(71, 85, 105, 0.7);
      margin: 0;
      padding-left: 30px;
      line-height: 1.4;
      
      .body--dark & {
        color: rgba(148, 163, 184, 0.8);
      }
    }

    &:hover {
      background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.05) 0%, 
        rgba(139, 92, 246, 0.05) 100%);
      
      .body--dark & {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.1) 0%, 
          rgba(139, 92, 246, 0.1) 100%);
      }
      
      .group-title {
        color: rgba(59, 130, 246, 0.9);
        
        .body--dark & {
          color: rgba(96, 165, 250, 1);
        }
      }
      
      .group-toggle {
        color: rgba(59, 130, 246, 0.8);
        transform: scale(1.1);
        
        .body--dark & {
          color: rgba(96, 165, 250, 0.9);
        }
      }
    }
  }

  .filter-group-content {
    padding: 20px;
  }
}

// =============================================
// ENHANCED FOOTER DESIGN
// =============================================

.filter-panel-footer {
  padding: 16px 24px;
  background: linear-gradient(135deg, 
    rgba(248, 250, 252, 0.9) 0%, 
    rgba(241, 245, 249, 0.95) 100%);
  border-top: 1px solid rgba(226, 232, 240, 0.6);

  .body--dark & {
    background: linear-gradient(135deg, 
      rgba(30, 41, 59, 0.9) 0%, 
      rgba(15, 23, 42, 0.95) 100%);
    border-top-color: rgba(71, 85, 105, 0.4);
  }

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .active-filters-summary {
    .active-count {
      font-size: 14px;
      color: rgba(71, 85, 105, 0.8);
      font-weight: 600;
      
      .body--dark & {
        color: rgba(148, 163, 184, 0.9);
      }
    }
  }

  .footer-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .q-btn {
      height: 36px;
      padding: 0 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
  }

  // Mobile responsive footer
  @media (max-width: 640px) {
    padding: 16px 20px;
    
    .footer-content {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .footer-actions {
      justify-content: center;
    }
  }
}

// =============================================
// RESPONSIVE MOBILE OPTIMIZATIONS
// =============================================

@media (max-width: 768px) {
  .filter-panel {
    border-radius: 12px;
    margin: 0 -8px;
  }
  
  .filter-panel-header {
    padding: 16px 20px;

    .header-content {
      gap: 16px;
    }

    .header-title {
      font-size: 16px;
    }

    .header-description {
      font-size: 13px;
    }
  }

  .filter-panel-content {
    padding: 16px 20px;
  }

  .filter-groups {
    .filter-group-header {
      padding: 12px 16px;
    }
    
    .filter-group-content {
      padding: 16px;
    }
  }
}

@media (max-width: 480px) {
  .filter-panel {
    margin: 0 -16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}

// =============================================
// ACCESSIBILITY & FOCUS STATES
// =============================================

.filter-panel {
  // Enhanced focus management
  .filter-panel-header .header-actions .q-btn,
  .show-more-section .q-btn,
  .filter-group-header {
    &:focus-visible {
      outline: 2px solid rgba(59, 130, 246, 0.8);
      outline-offset: 2px;
      border-radius: 6px;
    }
  }
  
  // Reduced motion support
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
</style> 