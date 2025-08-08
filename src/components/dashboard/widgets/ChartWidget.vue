<template>
  <BaseDashboardWidget :hide-header="true">
    <div class="chart-filters" v-if="showFilters">
      <div class="row q-col-gutter-sm items-center">
        <div class="col-auto">
          <q-select
            v-model="localPeriod"
            :options="periodOptions"
            dense
            outlined
            emit-value
            map-options
            :label="$t('analyticsPage.period')"
          />
        </div>
        <div class="col-auto" v-if="locations?.length">
          <q-select
            v-model="localLocation"
            :options="locations"
            option-value="id"
            option-label="name"
            dense
            outlined
            emit-value
            map-options
            :label="$t('locations.title')"
          />
        </div>
        <div class="col-auto" v-if="suppliers?.length">
          <q-select
            v-model="localSupplier"
            :options="suppliers"
            option-value="id"
            option-label="name"
            dense
            outlined
            emit-value
            map-options
            :label="$t('suppliers.title')"
          />
        </div>
      </div>
    </div>

    <ChartCanvas
      :type="resolvedType"
      :labels="chartJsLabels"
      :datasets="chartJsDatasets"
      :options="chartOptions"
      :height="260"
      @datapoint-click="handlePointClick"
    />
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { BaseDashboardWidget } from '@/components/cards';
  import ChartCanvas from '@/components/charts/ChartCanvas.vue';

  interface ChartData {
    analytics?: Array<{
      event_type: string;
      created_at: string;
      user_id?: string;
    }>;
    items?: Array<{ label: string; value: number }>;
    chart_type?: string;
    labels?: string[];
    datasets?: Array<{ label: string; data: number[]; color?: string }>;
  }

  interface Props {
    data: ChartData;
    chartType: 'bar' | 'line' | 'pie';
    showFilters?: boolean;
    locations?: Array<{ id: string; name: string }>;
    suppliers?: Array<{ id: string; name: string }>;
  }

  const props = withDefaults(defineProps<Props>(), { showFilters: false });

  // Local filters
  const localPeriod = ref<'7d' | '30d' | '90d' | '1y'>('7d');
  const localLocation = ref<string | null>(null);
  const localSupplier = ref<string | null>(null);
  const periodOptions = [
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '1y', value: '1y' },
  ];

  // Process analytics data
  const analyticsData = computed(() => props.data.analytics || []);

  // Chart.js compatible computed values
  const resolvedType = computed(
    () => (props.data.chart_type as any) || props.chartType || 'bar'
  );

  const chartJsLabels = computed<string[]>(() => {
    if (props.data.labels && props.data.datasets) return props.data.labels;
    if (props.data.items) return props.data.items.map(i => i.label);

    if (analyticsData.value.length > 0 && resolvedType.value === 'line') {
      // last 7 days labels
      const dailyCount: Record<string, number> = {};
      analyticsData.value.forEach(e => {
        const d = new Date(e.created_at).toLocaleDateString();
        dailyCount[d] = (dailyCount[d] || 0) + 1;
      });
      return Object.keys(dailyCount).slice(-7);
    }

    if (analyticsData.value.length > 0) {
      // event types labels
      const eventCount: Record<string, number> = {};
      analyticsData.value.forEach(e => {
        eventCount[e.event_type] = (eventCount[e.event_type] || 0) + 1;
      });
      return Object.keys(eventCount).slice(0, 5);
    }
    return [];
  });

  const chartJsDatasets = computed(() => {
    if (props.data.labels && props.data.datasets) return props.data.datasets;
    if (props.data.items) {
      return [{ label: 'Data', data: props.data.items.map(i => i.value) }];
    }
    if (analyticsData.value.length > 0 && resolvedType.value === 'line') {
      const byDay: Record<string, number> = {};
      analyticsData.value.forEach(e => {
        const d = new Date(e.created_at).toLocaleDateString();
        byDay[d] = (byDay[d] || 0) + 1;
      });
      const labels = chartJsLabels.value;
      return [{ label: 'Events', data: labels.map(l => byDay[l] || 0) }];
    }
    if (analyticsData.value.length > 0) {
      const eventCount: Record<string, number> = {};
      analyticsData.value.forEach(e => {
        eventCount[e.event_type] = (eventCount[e.event_type] || 0) + 1;
      });
      const labels = chartJsLabels.value;
      return [{ label: 'Events', data: labels.map(l => eventCount[l] || 0) }];
    }
    return [];
  });

  const chartOptions = computed(() => ({
    plugins: { legend: { display: true, position: 'bottom' } },
  }));

  function handlePointClick(payload: { label: string; value: number }) {
    // Drill-down hook: consumers can watch for this event via parent component if needed
    // For now, no-op to keep incremental and non-breaking
  }

  // Emit filter changes (optional future use)
  watch([localPeriod, localLocation, localSupplier], () => {
    // In a non-breaking migration we keep it internal; parents can extend later as needed
  });

  // Remove previous CSS-chart-only helpers

  function getEventLabel(eventType: string): string {
    return eventType;
  }
</script>

<style lang="scss" scoped>
  .chart-filters {
    margin-bottom: var(--space-3);
  }
</style>
