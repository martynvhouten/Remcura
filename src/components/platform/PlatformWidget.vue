<template>
  <q-card class="platform-widget" :class="widgetClass">
    <q-card-section class="widget-header">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="widget-title">{{ widget.title }}</div>
          <div v-if="widget.error" class="text-negative text-caption">
            <q-icon name="error" class="q-mr-xs" />
            {{ widget.error }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            round
            dense
            icon="refresh"
            size="sm"
            :loading="widget.loading"
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
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="widget-content">
      <!-- Loading State -->
      <div v-if="widget.loading" class="loading-container">
        <q-circular-progress
          indeterminate
          size="50px"
          color="primary"
          class="q-ma-md"
        />
        <div class="text-caption text-grey-6">{{ $t('common.loading') }}</div>
      </div>

      <!-- Error State -->
      <div v-else-if="widget.error" class="error-container text-center">
        <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
        <div class="text-subtitle2 text-negative">{{ $t('platform.widget.errorTitle') }}</div>
        <div class="text-caption text-grey-6 q-mt-xs">{{ widget.error }}</div>
        <q-btn
          outline
          color="primary"
          :label="$t('common.retry')"
          class="q-mt-md"
          @click="$emit('refresh', widget.id)"
        />
      </div>

      <!-- Widget Content -->
      <div v-else>
        <!-- Metric Widget -->
        <template v-if="widget.type === 'metric'">
          <metric-widget :data="widget.data" />
        </template>

        <!-- Chart Widget -->
        <template v-else-if="widget.type === 'chart'">
          <chart-widget :data="widget.data" />
        </template>

        <!-- Table Widget -->
        <template v-else-if="widget.type === 'table'">
          <table-widget :data="widget.data" />
        </template>

        <!-- List Widget -->
        <template v-else-if="widget.type === 'list'">
          <list-widget :data="widget.data" />
        </template>

        <!-- System Widget -->
        <template v-else-if="widget.type === 'system'">
          <system-widget :data="widget.data" />
        </template>

        <!-- Default/Unknown Widget Type -->
        <template v-else>
          <div class="text-center text-grey-6">
            <q-icon name="help_outline" size="48px" class="q-mb-md" />
            <div class="text-subtitle2">{{ $t('platform.widget.unknownType') }}</div>
            <div class="text-caption">{{ widget.type }}</div>
          </div>
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PlatformWidget } from '@/services/dashboard/platform-dashboard';
import MetricWidget from './widgets/MetricWidget.vue';
import ChartWidget from './widgets/ChartWidget.vue';
import TableWidget from './widgets/TableWidget.vue';
import ListWidget from './widgets/ListWidget.vue';
import SystemWidget from './widgets/SystemWidget.vue';

const { t } = useI18n();

// Props
interface Props {
  widget: PlatformWidget;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  refresh: [widgetId: string];
  configure: [widgetId: string];
}>();

// Computed
const widgetClass = computed(() => {
  const classes = ['platform-widget'];
  
  // Add size class
  classes.push(`widget-${props.widget.size}`);
  
  // Add type class
  classes.push(`widget-type-${props.widget.type}`);
  
  // Add state classes
  if (props.widget.loading) classes.push('widget-loading');
  if (props.widget.error) classes.push('widget-error');
  
  return classes.join(' ');
});
</script>

<style lang="scss" scoped>
.platform-widget {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  // Size variants
  &.widget-small {
    min-height: 200px;
  }
  
  &.widget-medium {
    min-height: 300px;
  }
  
  &.widget-large {
    min-height: 400px;
  }
  
  // State variants
  &.widget-loading {
    opacity: 0.7;
  }
  
  &.widget-error {
    border-color: var(--q-negative);
    background: rgba(244, 67, 54, 0.02);
  }
}

.widget-header {
  background: linear-gradient(90deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: white;
  padding: 12px 16px;
  
  .widget-title {
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
}

.widget-content {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

// Dark mode support
.body--dark {
  .platform-widget {
    background: var(--q-dark);
    border-color: rgba(255, 255, 255, 0.1);
    
    &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }
    
    &.widget-error {
      background: rgba(244, 67, 54, 0.1);
    }
  }
  
  .widget-header {
    background: linear-gradient(90deg, #1976d2 0%, #424242 100%);
  }
}

// Animation for loading states
.widget-loading .widget-content {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}
</style>