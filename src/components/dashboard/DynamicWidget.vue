<template>
  <BaseDashboardWidget
    :title="widget.title"
    :loading="widget.loading || loading"
  >
    <template v-if="hasActions" #actions>
      <q-btn
        flat
        round
        dense
        icon="refresh"
        size="sm"
        :loading="widget.loading || loading"
        type="button"
        @click="triggerRefresh"
      >
        <q-tooltip>{{ $t('dashboard.actions.refresh') }}</q-tooltip>
      </q-btn>
    </template>

    <!-- Widget Content based on type -->
    <component
      :is="widgetComponent"
      :data="widget.data"
      :widget-id="widget.id"
      v-bind="widgetProps"
    />
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { BaseDashboardWidget } from '@/components/cards';

  // Import widget components
  import MetricWidget from './widgets/MetricWidget.vue';
  import ChartWidget from './widgets/ChartWidget.vue';
  import ListWidget from './widgets/ListWidget.vue';
  import AlertWidget from './widgets/AlertWidget.vue';
  import QuickActionWidget from './widgets/QuickActionWidget.vue';

  type WidgetKind =
    | 'metric'
    | 'chart'
    | 'list'
    | 'alert'
    | 'quickAction'
    | 'table';

  export interface DashboardWidget {
    id: string;
    title: string;
    type: WidgetKind;
    data: Record<string, unknown>;
    size: 'small' | 'medium' | 'large';
    position: number;
    visible: boolean;
    loading?: boolean;
    error?: string;
  }

  interface Props {
    widget: DashboardWidget;
    loading?: boolean;
    showActions?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    showActions: true,
  });

  const emit = defineEmits<{
    refresh: [widgetId: string];
  }>();

  // Computed properties
  const widgetComponent = computed(() => {
    switch (props.widget.type) {
      case 'metric':
        return MetricWidget;
      case 'chart':
        return ChartWidget;
      case 'list':
        return ListWidget;
      case 'alert':
        return AlertWidget;
      case 'quickAction':
        return QuickActionWidget;
      case 'table':
        return ListWidget; // Use ListWidget for table data for now
      default:
        return MetricWidget; // Fallback
    }
  });

  const widgetProps = computed((): Record<string, unknown> => {
    if (props.widget.type === 'chart') {
      return {
        chartType: determineChartType(),
      };
    }

    return {};
  });

  const hasActions = computed(() => {
    return (
      props.showActions &&
      (props.widget.type === 'chart' || props.widget.type === 'list')
    );
  });

  const triggerRefresh = () => {
    emit('refresh', props.widget.id);
  };

  function determineChartType(): 'bar' | 'line' | 'pie' {
    // Determine chart type based on widget data or ID
    if (
      props.widget.id.includes('analytics') ||
      props.widget.id.includes('trend')
    )
      return 'line';
    if (
      props.widget.id.includes('cost') ||
      props.widget.id.includes('distribution')
    )
      return 'pie';
    return 'bar';
  }
</script>
