<template>
  <div class="unified-table-container medical-table">
    <q-table
      v-bind="$attrs"
      :rows="rows"
      :columns="enhancedColumns"
      :loading="loading"
      :pagination="internalPagination"
      row-key="id"
      flat
      bordered
      separator="cell"
      class="unified-table"
      @update:pagination="onPaginationUpdate"
      @request="onTableRequest"
    >
      <!-- Pass through all slots -->
      <template v-for="(_, slot) in $slots" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps || {}" />
      </template>

      <!-- Default loading template -->
      <template v-if="!$slots.loading" #loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- Default no-data template -->
      <template v-if="!$slots['no-data']" #no-data>
        <div class="full-width row flex-center q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>{{ noDataMessage || $t('common.noData') }}</span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Types
interface TableColumn {
  name: string;
  label: string;
  field: string | ((row: any) => any);
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  style?: string;
  headerStyle?: string;
  classes?: string;
  headerClasses?: string;
  format?: (val: any, row: any) => string;
}

interface TablePagination {
  sortBy?: string;
  descending?: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
}

// Props
interface Props {
  rows: any[];
  columns: TableColumn[];
  loading?: boolean;
  pagination?: TablePagination;
  noDataMessage?: string;
  sortable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: () => ({
    sortBy: undefined,
    descending: false,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
  }),
  sortable: true,
});

// Emits
const emit = defineEmits<{
  'update:pagination': [pagination: TablePagination];
  'request': [requestProps: any];
}>();

const { t } = useI18n();

// Internal pagination state
const internalPagination = ref<TablePagination>({ ...props.pagination });

// Watch for external pagination changes
watch(
  () => props.pagination,
  (newPagination) => {
    internalPagination.value = { ...newPagination };
  },
  { deep: true }
);

// Enhanced columns with consistent styling and sortable defaults
const enhancedColumns = computed(() => {
  return props.columns.map(column => ({
    ...column,
    sortable: column.sortable !== false && props.sortable,
    headerClasses: `unified-table-header ${column.headerClasses || ''}`,
    classes: `unified-table-cell ${column.classes || ''}`,
    headerStyle: column.headerStyle || '',
    style: column.style || '',
  }));
});

// Handle pagination updates
const onPaginationUpdate = (newPagination: TablePagination) => {
  internalPagination.value = { ...newPagination };
  emit('update:pagination', newPagination);
};

// Handle table requests (sorting, pagination)
const onTableRequest = (requestProps: any) => {
  const { pagination } = requestProps;
  internalPagination.value = { ...pagination };
  emit('request', requestProps);
};
</script>

<style lang="scss" scoped>
.unified-table-container {
  .unified-table {
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-primary);

    // Enhanced headers with consistent styling
    :deep(.unified-table-header) {
      background: linear-gradient(135deg, #1e3a8a, #1e40af) !important; // Donkerdere header
      color: white !important;
      font-family: var(--font-family-primary);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: var(--text-xs);
      padding: var(--space-3) var(--space-4);
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      &:last-child {
        border-right: none;
      }
      
      // Sortable column hover effect
      &.sortable {
        cursor: pointer;
        transition: background var(--transition-base);
        
        &:hover {
          background: linear-gradient(135deg, #1e40af, #2563eb) !important;
        }
      }
    }

    // Consistent row styling with alternating colors
    :deep(.q-tr) {
      border-bottom: 1px solid var(--border-primary);
      transition: all var(--transition-fast);

      // Alternating row colors
      &:nth-child(even) {
        background: var(--neutral-50);
      }

      &:nth-child(odd) {
        background: white;
      }

      &:hover {
        background: rgba(30, 58, 138, 0.05) !important; // Subtle blue hover
        transform: translateX(2px);
        box-shadow: 4px 0 12px rgba(30, 58, 138, 0.1);
      }
    }

    // Cell styling
    :deep(.unified-table-cell) {
      padding: var(--space-3) var(--space-4);
      border-right: 1px solid var(--border-primary);
      vertical-align: middle;
      
      &:last-child {
        border-right: none;
      }

      // Numeric columns
      &.col-numeric {
        font-variant-numeric: tabular-nums;
        font-weight: var(--font-weight-semibold);
        text-align: right;
      }

      // Status columns
      &.col-status {
        text-align: center;
        font-weight: var(--font-weight-medium);
      }

      // Product/name columns
      &.col-product,
      &.col-name {
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
      }

      // Action columns
      &.col-actions {
        text-align: center;
      }
    }

    // Loading and empty states
    :deep(.q-table__bottom) {
      padding: var(--space-3) var(--space-4);
      border-top: 1px solid var(--border-primary);
    }

    :deep(.q-table__top) {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border-primary);
    }
  }
}

// Dark mode support
body.body--dark .unified-table-container {
  .unified-table {
    background: var(--bg-secondary);
    border-color: var(--border-primary);

    :deep(.unified-table-header) {
      background: linear-gradient(135deg, #1e3a8a, #1e40af) !important;
      color: white !important;
      
      &.sortable:hover {
        background: linear-gradient(135deg, #1e40af, #2563eb) !important;
      }
    }

    :deep(.q-tr) {
      border-bottom-color: var(--border-primary);

      &:nth-child(even) {
        background: var(--bg-tertiary);
      }

      &:nth-child(odd) {
        background: var(--bg-secondary);
      }

      &:hover {
        background: rgba(30, 58, 138, 0.08) !important;
      }
    }

    :deep(.unified-table-cell) {
      border-right-color: var(--border-primary);
      color: var(--text-primary);
    }

    :deep(.q-table__bottom),
    :deep(.q-table__top) {
      border-color: var(--border-primary);
      background: var(--bg-secondary);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .unified-table-container {
    .unified-table {
      :deep(.unified-table-header),
      :deep(.unified-table-cell) {
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-sm);
      }
    }
  }
}
</style>