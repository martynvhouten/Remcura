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
        @click="$emit('refresh', widget.id)"
      >
        <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="settings"
        size="sm"
        @click="$emit('configure', widget.id)"
      >
        <q-tooltip>{{ $t('common.configure') }}</q-tooltip>
      </q-btn>
    </template>

    <!-- Widget Content based on type -->
    <component :is="widgetComponent" :data="widget.data" v-bind="widgetProps" />
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { BaseDashboardWidget } from '@/components/cards';

  // Import platform widget components
  import MetricWidget from './widgets/MetricWidget.vue';
  import ChartWidget from './widgets/ChartWidget.vue';
  import ListWidget from './widgets/ListWidget.vue';
  import SystemWidget from './widgets/SystemWidget.vue';
  import TableWidget from './widgets/TableWidget.vue';

  export interface PlatformWidget {
    id: string;
    title: string;
    type: 'metric' | 'chart' | 'list' | 'table' | 'system';
    data: Record<string, any>;
    size: 'small' | 'medium' | 'large';
    position: number;
    visible: boolean;
    loading?: boolean;
    error?: string;
  }

  interface Props {
    widget: PlatformWidget;
    loading?: boolean;
    showActions?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    showActions: true,
  });

  const emit = defineEmits<{
    refresh: [widgetId: string];
    configure: [widgetId: string];
  }>();

  const { t } = useI18n();

  // Computed properties
  const widgetComponent = computed(() => {
    switch (props.widget.type) {
      case 'metric':
        return MetricWidget;
      case 'chart':
        return ChartWidget;
      case 'list':
        return ListWidget;
      case 'table':
        return TableWidget;
      case 'system':
        return SystemWidget;
      default:
        return MetricWidget; // Fallback
    }
  });

  const widgetProps = computed(() => {
    const baseProps: Record<string, any> = {};

    // Add any specific props based on widget type
    if (props.widget.type === 'chart') {
      // Platform charts might have different requirements
      baseProps.chartType = 'line'; // Default for platform
    }

    return baseProps;
  });

  const hasActions = computed(() => {
    return props.showActions;
  });
</script>
