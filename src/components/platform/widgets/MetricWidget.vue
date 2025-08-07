<template>
  <BaseDashboardWidget :hide-header="true">
    <!-- Single Value Metric -->
    <template v-if="isSingleValue">
      <div class="metric-primary">
        <div class="metric-value">{{ formatValue(primaryValue) }}</div>
        <div class="metric-label">{{ primaryLabel }}</div>
        <div v-if="trend" class="metric-trend" :class="trendClass">
          <q-icon :name="trendIcon" class="q-mr-xs" />
          {{ trend }}
        </div>
      </div>
    </template>

    <!-- Multi-Value Metrics -->
    <template v-else>
      <div class="metrics-grid">
        <div 
          v-for="(value, key) in filteredData" 
          :key="key"
          class="metric-item"
        >
          <div class="metric-value">{{ formatValue(value) }}</div>
          <div class="metric-label">{{ formatLabel(key) }}</div>
        </div>
      </div>
    </template>

    <!-- Progress Bar (if percentage data) -->
    <template v-if="hasPercentage">
      <div class="metric-progress q-mt-md">
        <q-linear-progress
          :value="percentageValue / 100"
          :color="progressColor"
          size="8px"
          rounded
        />
        <div class="text-caption text-center q-mt-xs">
          {{ Math.round(percentageValue) }}% {{ progressLabel }}
        </div>
      </div>
    </template>

    <!-- Additional Info -->
    <template v-if="additionalInfo">
      <div class="metric-info q-mt-md">
        <div 
          v-for="(info, key) in additionalInfo" 
          :key="key"
          class="info-item text-caption"
        >
          <span class="info-label">{{ formatLabel(key) }}:</span>
          <span class="info-value q-ml-xs">{{ formatValue(info) }}</span>
        </div>
      </div>
    </template>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BaseDashboardWidget } from '@/components/cards';

const { t } = useI18n();

// Props
interface Props {
  data: Record<string, any>;
}

const props = defineProps<Props>();

// Computed properties
const isSingleValue = computed(() => {
  const keys = Object.keys(props.data);
  return keys.length === 1 || (keys.includes('value') || keys.includes('count') || keys.includes('total'));
});

const primaryValue = computed(() => {
  if (props.data.value !== undefined) return props.data.value;
  if (props.data.count !== undefined) return props.data.count;
  if (props.data.total !== undefined) return props.data.total;
  if (props.data.total_value !== undefined) return props.data.total_value;
  
  // Return first numeric value
  const firstNumericKey = Object.keys(props.data).find(key => 
    typeof props.data[key] === 'number'
  );
  return firstNumericKey ? props.data[firstNumericKey] : 0;
});

const primaryLabel = computed(() => {
  if (props.data.label) return props.data.label;
  if (props.data.title) return props.data.title;
  return '';
});

const trend = computed(() => {
  return props.data.trend;
});

const trendClass = computed(() => {
  if (!trend.value) return '';
  
  if (trend.value === 'up' || trend.value === 'increasing') return 'trend-positive';
  if (trend.value === 'down' || trend.value === 'decreasing') return 'trend-negative';
  return 'trend-neutral';
});

const trendIcon = computed(() => {
  if (!trend.value) return '';
  
  if (trend.value === 'up' || trend.value === 'increasing') return 'trending_up';
  if (trend.value === 'down' || trend.value === 'decreasing') return 'trending_down';
  return 'trending_flat';
});

const filteredData = computed(() => {
  const filtered: Record<string, any> = {};
  
  // Exclude metadata keys
  const excludeKeys = ['label', 'title', 'trend', 'status', 'last_check', 'error'];
  
  Object.keys(props.data).forEach(key => {
    if (!excludeKeys.includes(key) && typeof props.data[key] === 'number') {
      filtered[key] = props.data[key];
    }
  });
  
  return filtered;
});

const hasPercentage = computed(() => {
  return props.data.compliance_rate !== undefined || 
         props.data.health_percentage !== undefined ||
         props.data.percentage !== undefined;
});

const percentageValue = computed(() => {
  return props.data.compliance_rate || 
         props.data.health_percentage || 
         props.data.percentage || 0;
});

const progressColor = computed(() => {
  const value = percentageValue.value;
  if (value >= 90) return 'positive';
  if (value >= 70) return 'warning';
  return 'negative';
});

const progressLabel = computed(() => {
  if (props.data.compliance_rate !== undefined) return t('platform.metrics.compliance');
  if (props.data.health_percentage !== undefined) return t('platform.metrics.health');
  return t('platform.metrics.progress');
});

const additionalInfo = computed(() => {
  const info: Record<string, any> = {};
  
  // Include text/status information
  const includeKeys = ['status', 'last_check', 'response_time_ms', 'environment'];
  
  Object.keys(props.data).forEach(key => {
    if (includeKeys.includes(key) && props.data[key] !== undefined) {
      info[key] = props.data[key];
    }
  });
  
  return Object.keys(info).length > 0 ? info : null;
});

// Methods
function formatValue(value: any): string {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  }
  
  return String(value);
}

function formatLabel(key: string): string {
  // Convert snake_case to readable labels
  const formatted = key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  // Try to get translation first
  const translationKey = `platform.metrics.${key}`;
  const translated = t(translationKey);
  
  return translated !== translationKey ? translated : formatted;
}
</script>

<style lang="scss" scoped>
// Platform metric widget content styling (wrapper now handled by BaseDashboardWidget)

.metric-primary {
  text-align: center;
  
  .metric-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--q-primary);
    line-height: 1;
    margin-bottom: 0.5rem;
  }
  
  .metric-label {
    font-size: 1rem;
    color: var(--q-dark);
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .metric-trend {
    font-size: 0.875rem;
    font-weight: 500;
    
    &.trend-positive {
      color: var(--q-positive);
    }
    
    &.trend-negative {
      color: var(--q-negative);
    }
    
    &.trend-neutral {
      color: var(--q-dark);
    }
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  
  .metric-item {
    text-align: center;
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(var(--q-primary-rgb), 0.05);
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--q-primary);
      line-height: 1.2;
    }
    
    .metric-label {
      font-size: 0.75rem;
      color: var(--q-dark);
      margin-top: 0.25rem;
      line-height: 1.2;
    }
  }
}

.metric-progress {
  .q-linear-progress {
    border-radius: 4px;
  }
}

.metric-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: var(--q-dark);
      opacity: 0.7;
    }
    
    .info-value {
      font-weight: 500;
      color: var(--q-dark);
    }
  }
}

// Dark mode
.body--dark {
  .metric-primary .metric-label,
  .metrics-grid .metric-item .metric-label,
  .metric-info .info-item .info-label,
  .metric-info .info-item .info-value {
    color: var(--q-dark-page);
  }
  
  .metrics-grid .metric-item {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .metric-info .info-item {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

// Responsive design
@media (max-width: 480px) {
  .metric-primary .metric-value {
    font-size: 2rem;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    
    .metric-item {
      padding: 0.25rem;
      
      .metric-value {
        font-size: 1.25rem;
      }
      
      .metric-label {
        font-size: 0.7rem;
      }
    }
  }
}
</style>