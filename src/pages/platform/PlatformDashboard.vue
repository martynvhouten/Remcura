<template>
  <PageLayout>
    <PageTitle 
      :title="$t('platform.title')"
      :subtitle="$t('platform.subtitle')"
      icon="admin_panel_settings"
    >
      <template #actions>
        <q-chip 
          :color="systemHealthColor" 
          text-color="white" 
          :icon="systemHealthIcon"
          class="q-px-md"
        >
          {{ $t(`platform.systemHealth.${dashboardData?.platformMetrics.systemHealth}`) }}
        </q-chip>
      </template>
    </PageTitle>

    <!-- System Info Bar -->
    <q-card class="q-mb-lg">
      <q-card-section class="bg-grey-1">
        <div class="row items-center q-gutter-lg">
          <div class="col-auto">
            <span class="text-caption text-grey-6">{{ $t('platform.version') }}:</span>
            <span class="text-weight-bold q-ml-xs">{{ dashboardData?.systemInfo.version }}</span>
          </div>
          <div class="col-auto">
            <span class="text-caption text-grey-6">{{ $t('platform.environment') }}:</span>
            <span class="text-weight-bold q-ml-xs">{{ dashboardData?.systemInfo.environment }}</span>
          </div>
          <div class="col-auto">
            <span class="text-caption text-grey-6">{{ $t('platform.uptime') }}:</span>
            <span class="text-weight-bold q-ml-xs">{{ dashboardData?.systemInfo.uptime }}</span>
          </div>
          <div class="col-auto">
            <span class="text-caption text-grey-6">{{ $t('platform.lastDeployment') }}:</span>
            <span class="text-weight-bold q-ml-xs">{{ formatDateTime(dashboardData?.systemInfo.lastDeployment) }}</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Platform Metrics Overview -->
    <div class="metrics-overview q-pa-md">
      <div class="row q-gutter-md">
        <div class="col-12 col-md-3">
          <q-card class="metric-card bg-primary text-white">
            <q-card-section>
              <div class="text-h3">{{ dashboardData?.platformMetrics.totalPractices || 0 }}</div>
              <div class="text-subtitle2">{{ $t('platform.metrics.totalPractices') }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="metric-card bg-secondary text-white">
            <q-card-section>
              <div class="text-h3">{{ dashboardData?.platformMetrics.totalUsers || 0 }}</div>
              <div class="text-subtitle2">{{ $t('platform.metrics.totalUsers') }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="metric-card bg-info text-white">
            <q-card-section>
              <div class="text-h3">{{ dashboardData?.platformMetrics.activeToday || 0 }}</div>
              <div class="text-subtitle2">{{ $t('platform.metrics.activeToday') }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="metric-card bg-accent text-white">
            <q-card-section>
              <div class="text-h3">{{ formatNumber(dashboardData?.platformMetrics.totalEvents || 0) }}</div>
              <div class="text-subtitle2">{{ $t('platform.metrics.totalEvents') }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions q-pa-md">
      <div class="text-h6 q-mb-md">{{ $t('platform.quickActions.title') }}</div>
      <div class="row q-gutter-md">
        <div 
          v-for="action in dashboardData?.quickActions" 
          :key="action.id"
          class="col-auto"
        >
          <q-btn
            :color="action.color"
            :icon="action.icon"
            :label="action.label"
            :to="action.route"
            class="app-btn-secondary full-width"
            size="lg"
            style="min-width: 200px"
          />
        </div>
      </div>
    </div>

    <!-- Dashboard Widgets -->
    <div class="dashboard-widgets q-pa-md">
      <div class="row q-gutter-md">
        <div 
          v-for="widget in sortedWidgets" 
          :key="widget.id"
          :class="getWidgetClass(widget.size)"
        >
          <platform-widget
            :widget="widget"
            @refresh="refreshWidget"
            @configure="configureWidget"
          />
        </div>
      </div>
    </div>

    <!-- Refresh FAB -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="refresh"
        color="primary"
        class="app-btn-refresh"
        :loading="loading"
        @click="refreshDashboard"
      >
        <q-tooltip>{{ $t('platform.actions.refresh') }}</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { platformDashboardService, type PlatformDashboardData } from '@/services/dashboard/platform-dashboard';
import { dashboardLogger } from '@/utils/logger';
import PlatformWidget from '@/components/platform/PlatformWidget.vue';
import PageLayout from '@/components/PageLayout.vue';
import PageTitle from '@/components/PageTitle.vue';

const { t } = useI18n();
const $q = useQuasar();

// Reactive state
const loading = ref(false);
const dashboardData = ref<PlatformDashboardData | null>(null);
const refreshInterval = ref<NodeJS.Timer | null>(null);

// Computed properties
const sortedWidgets = computed(() => {
  return dashboardData.value?.widgets.slice().sort((a, b) => a.position - b.position) || [];
});

const systemHealthColor = computed(() => {
  const health = dashboardData.value?.platformMetrics.systemHealth;
  switch (health) {
    case 'healthy': return 'positive';
    case 'warning': return 'warning';
    case 'critical': return 'negative';
    default: return 'grey';
  }
});

const systemHealthIcon = computed(() => {
  const health = dashboardData.value?.platformMetrics.systemHealth;
  switch (health) {
    case 'healthy': return 'check_circle';
    case 'warning': return 'warning';
    case 'critical': return 'error';
    default: return 'help';
  }
});

// Methods
function getWidgetClass(size: 'small' | 'medium' | 'large'): string {
  switch (size) {
    case 'small': return 'col-12 col-md-6 col-lg-4';
    case 'medium': return 'col-12 col-md-6 col-lg-6';
    case 'large': return 'col-12';
    default: return 'col-12 col-md-6';
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDateTime(dateString?: string): string {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

async function loadDashboard() {
  try {
    loading.value = true;
    dashboardLogger.info('🌐 Loading platform dashboard...');
    
    dashboardData.value = await platformDashboardService.getDashboardData();
    
    dashboardLogger.info('✅ Platform dashboard loaded successfully');
  } catch (error) {
    dashboardLogger.error('❌ Failed to load platform dashboard:', error);
    
    // Show error notification
    $q.notify({
      type: 'negative',
      message: t('platform.errors.loadFailed'),
      actions: [
        {
          label: t('common.retry'),
          color: 'white',
          handler: () => loadDashboard()
        }
      ]
    });
  } finally {
    loading.value = false;
  }
}

async function refreshDashboard() {
  await loadDashboard();
  
  $q.notify({
    type: 'positive',
    message: t('platform.messages.refreshed'),
    timeout: 2000
  });
}

async function refreshWidget(widgetId: string) {
  try {
    dashboardLogger.info(`🔄 Refreshing widget: ${widgetId}`);
    
    // Find and update the specific widget
    if (dashboardData.value) {
      const widget = dashboardData.value.widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.loading = true;
        
        // Reload the entire dashboard for now
        // In a more sophisticated implementation, we'd reload just this widget
        await loadDashboard();
      }
    }
  } catch (error) {
    dashboardLogger.error(`❌ Failed to refresh widget ${widgetId}:`, error);
  }
}

function configureWidget(widgetId: string) {
  dashboardLogger.info(`⚙️ Configuring widget: ${widgetId}`);
  
  $q.notify({
    type: 'info',
    message: t('platform.messages.configureWidget', { widget: widgetId }),
    timeout: 3000
  });
}

function startAutoRefresh() {
  // Auto-refresh every 5 minutes
  refreshInterval.value = setInterval(() => {
    loadDashboard();
  }, 5 * 60 * 1000);
}

function stopAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
}

// Lifecycle
onMounted(() => {
  loadDashboard();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style lang="scss" scoped>
.platform-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.platform-header {
  border-bottom: 3px solid rgba(255, 255, 255, 0.2);
}

.system-info-bar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Roboto Mono', monospace;
  
  .text-caption {
    opacity: 0.8;
  }
}

.metrics-overview {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.metric-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
}

.quick-actions {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px 16px 0 0;
  margin-top: 2rem;
}

.dashboard-widgets {
  background: rgba(255, 255, 255, 0.98);
  min-height: 60vh;
}

// Dark mode support
.body--dark {
  .platform-dashboard {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .quick-actions {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
  
  .dashboard-widgets {
    background: rgba(0, 0, 0, 0.9);
  }
}

// Responsive design
@media (max-width: 768px) {
  .system-info-bar .row {
    flex-direction: column;
    align-items: flex-start;
    
    .col-auto {
      margin-bottom: 0.5rem;
    }
  }
  
  .platform-header .row {
    flex-direction: column;
    text-align: center;
    
    .col-auto:last-child {
      margin-top: 1rem;
    }
  }
}
</style>