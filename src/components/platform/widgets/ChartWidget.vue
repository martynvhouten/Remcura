<template>
  <BaseDashboardWidget :hide-header="true">
    <!-- Chart.js will be rendered here -->
    <canvas ref="chartCanvas" class="chart-canvas"></canvas>

    <!-- Fallback for when Chart.js is not available -->
    <div v-if="!chartReady" class="chart-fallback">
      <q-icon name="bar_chart" size="4em" class="text-grey-4 q-mb-md" />
      <div class="text-subtitle2 text-grey-6">
        {{ $t('platform.chart.loading') }}
      </div>

      <!-- Simple data display -->
      <div v-if="data.labels && data.data" class="simple-chart q-mt-md">
        <div v-for="(value, index) in data.data" :key="index" class="chart-bar">
          <div class="bar-label">{{ data.labels[index] }}</div>
          <div class="bar-container">
            <div
              class="bar-fill"
              :style="{ width: `${(value / maxValue) * 100}%` }"
            ></div>
            <span class="bar-value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { BaseDashboardWidget } from '@/components/cards';
  import ChartCanvas from '@/components/charts/ChartCanvas.vue';

  const { t } = useI18n();

  // Props
  interface Props {
    data: {
      chart_type?: string;
      labels?: string[];
      data?: number[];
      datasets?: Array<{
        label: string;
        data: number[];
        color: string;
      }>;
      title?: string;
      total?: number;
    };
  }

  const props = defineProps<Props>();

  // Reactive state
  const chartReady = ref(true);

  // Computed
  const maxValue = computed(() => {
    if (props.data.data) {
      return Math.max(...props.data.data);
    }
    return 100;
  });

  // Methods
  function getChartConfig() {
    const {
      chart_type = 'bar',
      labels = [],
      data = [],
      datasets = [],
    } = props.data;

    // If datasets are provided, use them
    if (datasets.length > 0) {
      return {
        type: chart_type as any,
        data: {
          labels,
          datasets: datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: dataset.color,
            borderColor: dataset.color,
            borderWidth: 2,
            fill: false,
          })),
        },
        options: getChartOptions(),
      };
    }

    // Otherwise create a simple dataset
    return {
      type: chart_type as any,
      data: {
        labels,
        datasets: [
          {
            label: props.data.title || 'Data',
            data,
            backgroundColor: 'rgba(33, 150, 243, 0.6)',
            borderColor: 'rgba(33, 150, 243, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: getChartOptions(),
    };
  }

  function getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    };
  }

  // Lifecycle (no-op, ChartCanvas handles rendering)
</script>

<style lang="scss" scoped>
  // Platform chart widget content styling (wrapper now handled by BaseDashboardWidget)

  /* ChartCanvas handles rendering and fallback */

  // Dark mode
  .body--dark {
    /* no-op */
  }
</style>
