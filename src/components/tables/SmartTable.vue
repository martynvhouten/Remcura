<template>
  <div class="smart-table-container">
    <!-- Strategy Indicator (only in development) -->
    <div v-if="showStrategyIndicator" class="strategy-indicator">
      <q-chip
        :color="strategyColor"
        text-color="white"
        size="sm"
        :icon="strategyIcon"
      >
        {{ strategy.toUpperCase() }} ({{ totalCount }} records)
      </q-chip>
    </div>

    <!-- Client-Side Table (< 1000 records) -->
    <div v-if="isClientSide" class="medical-table">
      <q-table
        v-model:pagination="pagination"
        :rows="visibleData"
        :columns="columns"
        :loading="loading"
        :row-key="rowKey"
        flat
        bordered
        separator="cell"
        v-bind="$attrs"
        @request="onTableRequest as any"
      >
        <!-- Pass through all slots -->
        <template v-for="(_, slot) in $slots" #[slot]="scope">
          <slot :name="slot" v-bind="scope" />
        </template>
      </q-table>
    </div>

    <!-- Server-Side Table (1000-5000 records) -->
    <div v-else-if="isServerSide" class="medical-table">
      <q-table
        v-model:pagination="pagination"
        :rows="visibleData"
        :columns="columns"
        :loading="loading"
        :row-key="rowKey"
        server-side-pagination
        flat
        bordered
        separator="cell"
        v-bind="$attrs"
        @request="onTableRequest as any"
      >
        <!-- Pass through all slots -->
        <template v-for="(_, slot) in $slots" #[slot]="scope">
          <slot :name="slot" v-bind="scope" />
        </template>
      </q-table>
    </div>

    <!-- Virtualized Table (5000+ records) -->
    <div v-else-if="isVirtualized" class="medical-table">
      <VirtualizedTable
        :rows="visibleData"
        :columns="columns as any"
        :row-key="rowKey as string"
        :item-height="itemHeight"
        :container-height="virtualizedHeight"
        :loading="loading"
        v-bind="$attrs"
      >
        <!-- Pass through all slots -->
        <template v-for="(_, slot) in $slots" #[slot]="scope">
          <slot :name="slot" v-bind="scope" />
        </template>
      </VirtualizedTable>
    </div>

    <!-- Performance Info (development only) -->
    <div v-if="showPerformanceInfo" class="performance-info">
      <q-expansion-item
        icon="speed"
        label="Performance Info"
        dense
        header-class="text-caption"
      >
        <q-card flat>
          <q-card-section class="text-caption">
            <div><strong>Strategy:</strong> {{ strategy }}</div>
            <div>
              <strong>Total Records:</strong> {{ totalCount.toLocaleString() }}
            </div>
            <div>
              <strong>Visible Records:</strong>
              {{ visibleData.length.toLocaleString() }}
            </div>
            <div><strong>Memory Usage:</strong> {{ memoryUsage }}</div>
            <div><strong>Render Time:</strong> {{ renderTime }}ms</div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import {
    useSmartTable,
    type SmartTableConfig,
  } from 'src/composables/useSmartTable';
  import VirtualizedTable from './VirtualizedTable.vue';
  import type { QTableColumn } from 'quasar';

  type TableRow = Record<string, unknown>;

  interface Props {
    // Data
    data?: TableRow[];
    columns: QTableColumn[];
    rowKey?: string;

    // Smart table config
    config?: SmartTableConfig;

    // Display options
    showStrategyIndicator?: boolean;
    showPerformanceInfo?: boolean;
    virtualizedHeight?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    rowKey: 'id',
    showStrategyIndicator: false,
    showPerformanceInfo: false,
    virtualizedHeight: 400,
    config: () => ({}),
    data: () => [],
  });

  const emit = defineEmits<{
    dataLoaded: [data: TableRow[]];
    strategyChanged: [strategy: string];
  }>();

  // Smart table composable
  const {
    loading,
    strategy,
    pagination,
    visibleData,
    totalCount,
    setData,
    onTableRequest,
    isClientSide,
    isServerSide,
    isVirtualized,
    itemHeight,
  } = useSmartTable(props.config);

  // Performance tracking
  const renderTime = ref(0);
  const renderStart = ref(0);

  // Strategy indicator styling
  const strategyColor = computed(() => {
    switch (strategy.value) {
      case 'client-side':
        return 'green';
      case 'server-side':
        return 'blue';
      case 'virtualized':
        return 'purple';
      default:
        return 'grey';
    }
  });

  const strategyIcon = computed(() => {
    switch (strategy.value) {
      case 'client-side':
        return 'memory';
      case 'server-side':
        return 'cloud';
      case 'virtualized':
        return 'view_list';
      default:
        return 'table_chart';
    }
  });

  // Memory usage estimation
  const memoryUsage = computed(() => {
    const bytes = JSON.stringify(visibleData.value).length * 2; // Rough estimate
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  });

  // Watch for data changes
  const updateData = () => {
    if (props.data) {
      renderStart.value = performance.now();
      setData(props.data);
      renderTime.value = Math.round(performance.now() - renderStart.value);
      emit('dataLoaded', props.data);
    }
  };

  // Watch strategy changes
  const prevStrategy = ref(strategy.value);
  const watchStrategy = () => {
    if (strategy.value !== prevStrategy.value) {
      emit('strategyChanged', strategy.value);
      prevStrategy.value = strategy.value;
    }
  };

  onMounted(() => {
    updateData();
    watchStrategy();
  });

  // Expose methods for parent components
  defineExpose({
    strategy,
    totalCount,
    visibleData,
    pagination,
    setData,
    loading,
  });
</script>

<style lang="scss" scoped>
  .smart-table-container {
    position: relative;
  }

  .strategy-indicator {
    position: absolute;
    top: -8px;
    right: 8px;
    z-index: 10;

    .q-chip {
      font-size: 10px;
      height: 20px;
    }
  }

  .performance-info {
    margin-top: 8px;

    .q-expansion-item {
      border: 1px solid var(--border-primary);
      border-radius: 4px;
    }
  }

  // Ensure medical-table styles are applied
  .medical-table {
    position: relative;
  }
</style>
