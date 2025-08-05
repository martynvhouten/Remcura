<template>
  <div class="chart-widget">
    <!-- Chart.js will be rendered here -->
    <canvas ref="chartCanvas" class="chart-canvas"></canvas>
    
    <!-- Fallback for when Chart.js is not available -->
    <div v-if="!chartReady" class="chart-fallback">
      <q-icon name="bar_chart" size="4em" class="text-grey-4 q-mb-md" />
      <div class="text-subtitle2 text-grey-6">{{ $t('platform.chart.loading') }}</div>
      
      <!-- Simple data display -->
      <div v-if="data.labels && data.data" class="simple-chart q-mt-md">
        <div 
          v-for="(value, index) in data.data" 
          :key="index"
          class="chart-bar"
        >
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

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
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartReady = ref(false);
const chartInstance = ref<any>(null);

// Computed
const maxValue = computed(() => {
  if (props.data.data) {
    return Math.max(...props.data.data);
  }
  return 100;
});

// Methods
async function initChart() {
  try {
    // Dynamic import of Chart.js to avoid bundling if not needed
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);
    
    if (!chartCanvas.value) return;
    
    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;
    
    const config = getChartConfig();
    chartInstance.value = new Chart(ctx, config);
    chartReady.value = true;
  } catch (error) {
    console.warn('Chart.js not available, using fallback display');
    chartReady.value = false;
  }
}

function getChartConfig() {
  const { chart_type = 'bar', labels = [], data = [], datasets = [] } = props.data;
  
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
          fill: false
        }))
      },
      options: getChartOptions()
    };
  }
  
  // Otherwise create a simple dataset
  return {
    type: chart_type as any,
    data: {
      labels,
      datasets: [{
        label: props.data.title || 'Data',
        data,
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2
      }]
    },
    options: getChartOptions()
  };
}

function getChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };
}

function destroyChart() {
  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }
}

// Lifecycle
onMounted(async () => {
  await nextTick();
  initChart();
});

onUnmounted(() => {
  destroyChart();
});
</script>

<style lang="scss" scoped>
.chart-widget {
  height: 100%;
  position: relative;
  
  .chart-canvas {
    width: 100%;
    height: 100%;
  }
  
  .chart-fallback {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    
    .simple-chart {
      width: 100%;
      max-width: 300px;
      
      .chart-bar {
        margin-bottom: 1rem;
        
        .bar-label {
          font-size: 0.875rem;
          color: var(--q-dark);
          margin-bottom: 0.25rem;
          text-align: left;
        }
        
        .bar-container {
          position: relative;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          height: 24px;
          overflow: hidden;
          
          .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--q-primary), var(--q-secondary));
            transition: width 0.5s ease;
            border-radius: 4px;
          }
          
          .bar-value {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--q-dark);
          }
        }
      }
    }
  }
}

// Dark mode
.body--dark {
  .chart-fallback .simple-chart .chart-bar .bar-container {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>