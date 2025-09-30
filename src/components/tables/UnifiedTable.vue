<template>
  <div ref="tableContainer" class="unified-table-container medical-table">
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
  import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  // Types
  type TableRow = Record<string, unknown>;

  type TableFieldAccessor = keyof TableRow | ((row: TableRow) => unknown);

  interface TableColumn {
    name: string;
    label: string;
    field: TableFieldAccessor;
    align?: 'left' | 'right' | 'center';
    sortable?: boolean;
    style?: string;
    headerStyle?: string;
    classes?: string;
    headerClasses?: string;
    format?: (val: unknown, row: TableRow) => string;
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
    rows: TableRow[];
    columns: TableColumn[];
    loading?: boolean;
    pagination?: TablePagination;
    noDataMessage?: string;
    sortable?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    rows: () => [],
    columns: () => [],
    loading: false,
    pagination: () => ({
      sortBy: undefined,
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 0,
    }),
    sortable: true,
    noDataMessage: '',
  });

  // Emits
  const emit = defineEmits<{
    'update:pagination': [pagination: TablePagination];
    request: [requestProps: TableRequestPayload];
  }>();
  interface TableRequestPayload {
    pagination: TablePagination;
    filter?: unknown;
    rows?: TableRow[];
    columns?: TableColumn[];
    [key: string]: unknown;
  }

  const { t } = useI18n();

  // Template ref for the table container
  const tableContainer = ref<HTMLElement>();

  // Internal pagination state
  const internalPagination = ref<TablePagination>({ ...props.pagination });

  // Watch for external pagination changes
  watch(
    () => props.pagination,
    newPagination => {
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
  const onTableRequest = (requestProps: TableRequestPayload) => {
    const { pagination } = requestProps;
    internalPagination.value = { ...pagination };
    emit('request', requestProps);
  };

  // Enable horizontal scroll with mouse wheel
  const handleWheelScroll = (event: WheelEvent) => {
    if (!tableContainer.value) return;

    // Check if horizontal scroll is needed
    const { scrollWidth, clientWidth, scrollLeft } = tableContainer.value;
    const canScrollHorizontally = scrollWidth > clientWidth;

    // Only handle horizontal scroll when:
    // 1. Shift key is held (explicit horizontal scroll intent)
    // 2. Table needs horizontal scroll AND we're already scrolled horizontally
    if (canScrollHorizontally && event.shiftKey && event.deltaY !== 0) {
      event.preventDefault();
      tableContainer.value.scrollLeft += event.deltaY;
    }

    // For normal vertical scroll, let the browser handle it naturally
    // This ensures smooth transitions between horizontal and vertical scrolling
  };

  // Lifecycle hooks
  onMounted(() => {
    if (tableContainer.value) {
      // Use passive: true for better performance unless we need to preventDefault
      tableContainer.value.addEventListener('wheel', handleWheelScroll, {
        passive: false,
      });
    }
  });

  onUnmounted(() => {
    if (tableContainer.value) {
      tableContainer.value.removeEventListener('wheel', handleWheelScroll);
    }
  });
</script>

<style lang="scss" scoped>
  .unified-table-container {
    overflow-x: auto; // Enable horizontal scroll
    overflow-y: visible;

    .unified-table {
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-primary);
      min-width: 100%; // Ensure table can grow beyond container

      // Enhanced headers with consistent styling
      :deep(.unified-table-header) {
        background: var(--brand-primary); // Consistent hoofdblauwe kleur
        color: white;
        font-family: var(--font-family);
        font-weight: var(--font-weight-bold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: var(--text-xs);
        padding: var(--space-3) var(--space-4);
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: var(--shadow-sm);

        &:last-child {
          border-right: none;
        }

        // Sortable column hover effect
        &.sortable {
          cursor: pointer;
          transition: background var(--transition-base);

          &:hover {
            background: var(--brand-primary-dark);
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
          background: rgba(
            30,
            58,
            138,
            0.05
          ); // Subtle blue hover using brand primary
          box-shadow: var(--shadow-md);
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
        background: var(--brand-primary);
        color: white;

        &.sortable:hover {
          background: var(--brand-primary-dark);
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
          background: rgba(30, 58, 138, 0.08);
          box-shadow: var(--shadow-md);
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
