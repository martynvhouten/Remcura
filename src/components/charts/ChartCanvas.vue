<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas" class="chart-canvas" />

    <div v-if="!ready || isEmpty" class="chart-fallback">
      <q-icon name="bar_chart" size="4em" class="text-grey-4 q-mb-md" />
      <div class="text-subtitle2 text-grey-6">
        {{ $t('platform.chart.loading') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    watch,
    onMounted,
    onBeforeUnmount,
    nextTick,
    computed,
  } from 'vue';
  import { useI18n } from 'vue-i18n';

  interface Dataset {
    label: string;
    data: number[];
    color?: string;
  }

  interface Props {
    type: 'bar' | 'line' | 'doughnut' | 'pie';
    labels: string[];
    datasets: Dataset[];
    height?: number | string;
    options?: Record<string, any>;
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'bar',
    labels: () => [],
    datasets: () => [],
    height: 240,
    options: () => ({}),
  });

  const emit = defineEmits<{
    'datapoint-click': [
      payload: {
        label: string;
        value: number;
        datasetIndex: number;
        index: number;
      },
    ];
  }>();

  const { t } = useI18n();

  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  const chartInstance = ref<any>(null);
  const ready = ref(false);

  const isEmpty = computed(
    () => !props.labels?.length || !props.datasets?.length
  );

  function getDefaultOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom' as const },
        tooltip: { enabled: true },
      },
      onClick: (_evt: any, elements: any[]) => {
        if (!elements || elements.length === 0) return;
        const el = elements[0];
        const datasetIndex = el.datasetIndex;
        const index = el.index;
        const label = props.labels[index];
        const value = props.datasets[datasetIndex]?.data[index] ?? 0;
        emit('datapoint-click', { label, value, datasetIndex, index });
      },
      scales:
        props.type === 'doughnut' || props.type === 'pie'
          ? undefined
          : {
              y: { beginAtZero: true },
              x: {},
            },
    };
  }

  function buildConfig() {
    const datasets = props.datasets.map(ds => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color || 'rgba(33, 150, 243, 0.6)',
      borderColor: ds.color || 'rgba(33, 150, 243, 1)',
      borderWidth: 2,
      fill: props.type === 'line' ? false : true,
      tension: props.type === 'line' ? 0.3 : undefined,
    }));

    return {
      type: props.type as any,
      data: { labels: props.labels, datasets },
      options: {
        ...getDefaultOptions(),
        ...(props.options || {}),
      },
    };
  }

  async function initChart() {
    try {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      if (!chartCanvas.value) return;
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      const config = buildConfig();
      chartInstance.value = new Chart(ctx, config);
      ready.value = true;
    } catch (e) {
      ready.value = false;
    }
  }

  function destroyChart() {
    if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }
  }

  async function refreshChart() {
    await nextTick();
    if (!chartInstance.value) {
      await initChart();
      return;
    }
    const config = buildConfig();
    chartInstance.value.config.type = config.type;
    chartInstance.value.config.data = config.data;
    chartInstance.value.config.options = config.options;
    chartInstance.value.update();
  }

  watch(
    () => [props.type, props.labels, props.datasets, props.options],
    refreshChart,
    { deep: true }
  );

  onMounted(async () => {
    await nextTick();
    await initChart();
  });

  onBeforeUnmount(() => {
    destroyChart();
  });
</script>

<style scoped>
  .chart-wrapper {
    position: relative;
    width: 100%;
    min-height: 220px;
  }
  .chart-canvas {
    width: 100%;
    height: v-bind('height + "px"');
  }
  .chart-fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
  }
</style>
