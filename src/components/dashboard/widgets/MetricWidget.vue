<template>
  <BaseDashboardWidget :hide-header="true">
    <!-- Single Metric Display -->
    <div v-if="isSingleMetric" class="single-metric">
      <q-icon
        :name="metricIcon"
        :color="metricColor"
        size="3rem"
        class="metric-icon"
      />
      <div class="metric-value">{{ formatValue(primaryValue) }}</div>
      <div class="metric-label">{{ metricLabel }}</div>
      <div
        v-if="trend"
        class="metric-trend"
        :class="`trend-${trend.direction}`"
      >
        <q-icon :name="trendIcon" size="sm" />
        <span>{{ trend.value }}</span>
      </div>
    </div>

    <!-- Multi Metric Display -->
    <div v-else class="multi-metrics">
      <div v-for="metric in metrics" :key="metric.key" class="metric-item">
        <div class="metric-row">
          <q-icon :name="metric.icon" :color="metric.color" size="1.5rem" />
          <div class="metric-content">
            <div class="metric-value">{{ formatValue(metric.value) }}</div>
            <div class="metric-label">{{ metric.label }}</div>
          </div>
        </div>
        <q-separator v-if="metric !== metrics[metrics.length - 1]" />
      </div>
    </div>

    <!-- Progress Indicator (for business health etc.) -->
    <div v-if="showProgress" class="progress-section">
      <div class="progress-label">
        <span>{{ progressLabel }}</span>
        <span class="progress-value">{{ progressValue }}%</span>
      </div>
      <q-linear-progress
        :value="progressValue / 100"
        :color="progressColor"
        size="8px"
        rounded
        class="q-mt-sm"
      />
    </div>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useFormatting } from '@/composables/useFormatting';
  import { BaseDashboardWidget } from '@/components/cards';

  interface MetricData {
    // Single metric mode
    value?: number | string;
    label?: string;
    icon?: string;
    color?: string;
    trend?: {
      direction: 'up' | 'down' | 'neutral';
      value: string;
    };

    // Multi metric mode
    metrics?: Array<{
      key: string;
      value: number | string;
      label: string;
      icon: string;
      color: string;
    }>;

    // Progress mode
    teamSize?: number;
    practiceHealth?: number;
  }

  interface Props {
    data: MetricData;
  }

  const props = defineProps<Props>();
  const { t } = useI18n();
  const { formatCurrency, formatValue: formatNumberValue } = useFormatting();

  const isSingleMetric = computed(
    () =>
      !props.data.metrics &&
      (props.data.value !== undefined ||
        props.data.practiceHealth !== undefined)
  );

  const primaryValue = computed(() => {
    if (props.data.practiceHealth !== undefined) {
      return props.data.practiceHealth;
    }
    return props.data.value;
  });

  const metricLabel = computed(() => {
    if (props.data.practiceHealth !== undefined) {
      return 'Praktijk Gezondheid';
    }
    return props.data.label || 'Metric';
  });

  const metricIcon = computed(() => {
    if (props.data.practiceHealth !== undefined) {
      return 'health_and_safety';
    }
    return props.data.icon || 'trending_up';
  });

  const metricColor = computed(() => {
    if (props.data.practiceHealth !== undefined) {
      const health = props.data.practiceHealth;
      if (health >= 90) {
        return 'positive';
      }
      if (health >= 70) {
        return 'warning';
      }
      return 'negative';
    }
    return props.data.color || 'primary';
  });

  const trend = computed(() => props.data.trend);

  const trendIcon = computed(() => {
    if (!trend.value) {
      return '';
    }
    switch (trend.value.direction) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  });

  const metrics = computed(() => {
    if (props.data.metrics) {
      return props.data.metrics;
    }

    // Create metrics for business overview
    if (props.data.teamSize !== undefined) {
      return [
        {
          key: 'team',
          value: props.data.teamSize,
          label: t('dashboard.widgets.teamMembers'),
          icon: 'people',
          color: 'primary',
        },
        {
          key: 'health',
          value: `${props.data.practiceHealth || 0}%`,
          label: t('dashboard.widgets.systemStatus'),
          icon: 'health_and_safety',
          color: 'positive',
        },
      ];
    }

    return [];
  });

  const showProgress = computed(
    () => props.data.practiceHealth !== undefined && isSingleMetric.value
  );

  const progressLabel = computed(() =>
    t('dashboard.service.widgets.systemHealth')
  );
  const progressValue = computed(() => props.data.practiceHealth || 0);
  const progressColor = computed(() => {
    const value = progressValue.value;
    if (value >= 90) {
      return 'positive';
    }
    if (value >= 70) {
      return 'warning';
    }
    return 'negative';
  });

  function formatValue(value: number | string | undefined): string {
    if (value === undefined) {
      return '0';
    }
    if (typeof value === 'string') {
      return value;
    }

    // Format large numbers with K/M suffixes
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return formatNumberValue(value);
  }
</script>

<style lang="scss" scoped>
  // Metric widget content styling (wrapper now handled by BaseDashboardWidget)

  .single-metric {
    text-align: center;

    .metric-icon {
      margin-bottom: var(--space-4);
      opacity: 0.8;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: var(--space-2);
    }

    .metric-label {
      font-size: var(--text-lg);
      color: var(--text-muted);
      margin-bottom: var(--space-3);
    }

    .metric-trend {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: var(--font-weight-medium);

      &.trend-up {
        background: var(--positive-50);
        color: var(--positive-700);
      }

      &.trend-down {
        background: var(--negative-50);
        color: var(--negative-700);
      }

      &.trend-neutral {
        background: var(--neutral-100);
        color: var(--neutral-600);
      }
    }
  }

  .multi-metrics {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);

    .metric-item {
      .metric-row {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-3) 0;
      }

      .metric-content {
        flex: 1;

        .metric-value {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          line-height: 1.2;
        }

        .metric-label {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin-top: var(--space-1);
        }
      }
    }
  }

  .progress-section {
    margin-top: var(--space-6);

    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-bottom: var(--space-2);

      .progress-value {
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
      }
    }
  }

  // Dark mode
  body.body--dark {
    .single-metric {
      .metric-value {
        color: var(--text-primary-dark);
      }

      .metric-trend {
        &.trend-neutral {
          background: var(--neutral-800);
          color: var(--neutral-400);
        }
      }
    }

    .multi-metrics {
      .metric-content .metric-value {
        color: var(--text-primary-dark);
      }
    }

    .progress-section {
      .progress-label .progress-value {
        color: var(--text-primary-dark);
      }
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .single-metric {
      .metric-value {
        font-size: 2rem;
      }

      .metric-icon {
        size: 2.5rem;
      }
    }

    .multi-metrics {
      gap: var(--space-3);

      .metric-row {
        gap: var(--space-3);
        padding: var(--space-2) 0;
      }
    }
  }
</style>
