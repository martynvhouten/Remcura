<template>
  <div class="chart-canvas-wrapper">
    <canvas ref="canvasEl" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import { Chart, ChartData, ChartOptions } from 'chart.js/auto';

  interface DatasetInput {
    label: string;
    data: number[];
    color?: string;
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }

  interface Props {
    type: string;
    labels: string[];
    datasets: DatasetInput[];
    options?: ChartOptions;
    height?: number | string;
  }

  const props = withDefaults(defineProps<Props>(), {
    options: undefined,
    height: 240,
  });
  const emit = defineEmits<{
    (e: 'datapoint-click', payload: { label: string; value: number }): void;
  }>();

  const canvasEl = ref<HTMLCanvasElement | null>(null);
  let chart: Chart | null = null;

  function buildData(): ChartData {
    return {
      labels: props.labels,
      datasets: props.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor || ds.color || 'rgba(33,150,243,0.4)',
        borderColor: ds.borderColor || ds.color || 'rgba(33,150,243,1)',
        borderWidth: 2,
        fill: props.type === 'line' ? false : true,
      })),
    } as ChartData;
  }

  function renderChart() {
    if (!canvasEl.value) return;
    
    const ctx = canvasEl.value.getContext('2d');
    if (!ctx) return;
    
    chart?.destroy();
    chart = new Chart(ctx, {
      type: props.type as any,
      data: buildData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'bottom' } },
        ...props.options,
        // Click handler
        onClick: (_event, activeElements) => {
          if (!chart || activeElements.length === 0) return;
          const element = activeElements[0] as any;
          const { index, datasetIndex } = element;
          const label = props.labels?.[index] ?? '';
          const value = (props.datasets?.[datasetIndex]?.data || [])[index] ?? 0;
          emit('datapoint-click', { label, value });
        },
      } as ChartOptions,
    });
  }

  onMounted(() => {
    renderChart();
  });

  onUnmounted(() => {
    chart?.destroy();
    chart = null;
  });

  watch(
    () => [props.type, props.labels, props.datasets, props.options],
    () => {
      if (!chart) {
        renderChart();
        return;
      }
      (chart.config as any).type = props.type;
      chart.data = buildData();
      chart.options = { ...chart.options, ...props.options } as ChartOptions;
      chart.update();
    },
    { deep: true }
  );
</script>

<style scoped>
  .chart-canvas-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 160px;
  }

  canvas {
    display: block;
    width: 100% !important;
  }
</style>


