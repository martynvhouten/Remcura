<template>
  <div class="virtualized-table-container">
    <!-- Table Header -->
    <div class="table-header">
      <div 
        v-for="column in columns" 
        :key="column.name"
        class="header-cell"
        :style="{ width: getColumnWidth(column) }"
      >
        <q-btn
          v-if="column.sortable"
          flat
          dense
          :label="column.label"
          :icon-right="getSortIcon(column.name)"
          @click="toggleSort(column.name)"
          class="sort-btn"
        />
        <span v-else>{{ column.label }}</span>
      </div>
    </div>

    <!-- Virtualized Body -->
    <div 
      ref="scrollContainer"
      class="table-body"
      :style="{ height: `${containerHeight}px` }"
      @scroll="handleScroll"
    >
      <!-- Virtual spacer for items above visible area -->
      <div :style="{ height: `${offsetY}px` }"></div>
      
      <!-- Visible items -->
      <div
        v-for="(row, index) in visibleItems"
        :key="getRowKey(row)"
        class="table-row"
        :class="{ 'row-even': (startIndex + index) % 2 === 0 }"
        :style="{ height: `${itemHeight}px` }"
      >
        <div
          v-for="column in columns"
          :key="column.name"
          class="table-cell"
          :style="{ width: getColumnWidth(column) }"
        >
          <!-- Custom cell content via slots -->
          <slot 
            :name="`body-cell-${column.name}`"
            :props="{ row, column, value: row[column.field] }"
          >
            <!-- Default cell content -->
            <span>{{ formatCellValue(row, column) }}</span>
          </slot>
        </div>
      </div>

      <!-- Virtual spacer for items below visible area -->
      <div :style="{ height: `${bottomSpacerHeight}px` }"></div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots size="50px" color="primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Column {
  name: string
  label: string
  field: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  format?: (val: any) => string
}

interface Props {
  rows: any[]
  columns: Column[]
  rowKey: string
  loading?: boolean
  itemHeight?: number
  containerHeight?: number
  bufferSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  itemHeight: 60,
  containerHeight: 600,
  bufferSize: 5
})

interface Emits {
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void
}

const emit = defineEmits<Emits>()

// Refs
const scrollContainer = ref<HTMLElement>()
const scrollTop = ref(0)
const sortColumn = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Computed properties for virtualization
const totalItems = computed(() => props.rows.length)

const itemsPerPage = computed(() => 
  Math.ceil(props.containerHeight / props.itemHeight) + props.bufferSize * 2
)

const startIndex = computed(() => 
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize)
)

const endIndex = computed(() => 
  Math.min(totalItems.value, startIndex.value + itemsPerPage.value)
)

const visibleItems = computed(() => 
  props.rows.slice(startIndex.value, endIndex.value)
)

const offsetY = computed(() => startIndex.value * props.itemHeight)

const bottomSpacerHeight = computed(() => 
  (totalItems.value - endIndex.value) * props.itemHeight
)

// Methods
const handleScroll = () => {
  if (scrollContainer.value) {
    scrollTop.value = scrollContainer.value.scrollTop
  }
}

const toggleSort = (columnName: string) => {
  if (sortColumn.value === columnName) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = columnName
    sortDirection.value = 'asc'
  }
  emit('sort', columnName, sortDirection.value)
}

const getSortIcon = (columnName: string) => {
  if (sortColumn.value !== columnName) return 'unfold_more'
  return sortDirection.value === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
}

const getColumnWidth = (column: Column) => {
  return column.width || 'auto'
}

const getRowKey = (row: any) => {
  return row[props.rowKey]
}

const formatCellValue = (row: any, column: Column) => {
  const value = row[column.field]
  if (column.format) {
    return column.format(value)
  }
  return value ?? '-'
}

// Performance optimization: Throttled scroll handling
let scrollTimeout: NodeJS.Timeout | null = null
const throttledHandleScroll = () => {
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(handleScroll, 16) // ~60fps
}

// Lifecycle
onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', throttledHandleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', throttledHandleScroll)
  }
  if (scrollTimeout) clearTimeout(scrollTimeout)
})

// Watch for data changes and reset scroll
watch(() => props.rows.length, () => {
  scrollTop.value = 0
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
})
</script>

<style lang="scss" scoped>
.virtualized-table-container {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.table-header {
  display: flex;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .header-cell {
    padding: 12px 16px;
    font-weight: 600;
    font-size: 14px;
    color: #424242;
    border-right: 1px solid #e0e0e0;
    
    &:last-child {
      border-right: none;
    }
    
    .sort-btn {
      padding: 0;
      min-height: auto;
      color: inherit;
      font-weight: inherit;
      text-transform: none;
      justify-content: flex-start;
    }
  }
}

.table-body {
  overflow-y: auto;
  position: relative;
  
  .table-row {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #fafafa;
    }
    
    &.row-even {
      background-color: #f9f9f9;
      
      &:hover {
        background-color: #f0f0f0;
      }
    }
    
    .table-cell {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #424242;
      border-right: 1px solid #f0f0f0;
      
      &:last-child {
        border-right: none;
      }
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

// Dark mode support
body.body--dark .virtualized-table-container {
  background: #1e1e1e;
  border-color: #333;
  
  .table-header {
    background: #2d2d2d;
    border-bottom-color: #333;
    
    .header-cell {
      color: #e0e0e0;
      border-right-color: #333;
    }
  }
  
  .table-body {
    .table-row {
      border-bottom-color: #333;
      
      &:hover {
        background-color: #2a2a2a;
      }
      
      &.row-even {
        background-color: #252525;
        
        &:hover {
          background-color: #2a2a2a;
        }
      }
      
      .table-cell {
        color: #e0e0e0;
        border-right-color: #333;
      }
    }
  }
}

// Performance optimizations
.table-row {
  will-change: transform;
  contain: layout style paint;
}

.table-body {
  will-change: scroll-position;
  contain: layout;
}
</style>