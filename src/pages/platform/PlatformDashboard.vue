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
          {{
            $t(
              `platform.systemHealth.${dashboardData?.platformMetrics.systemHealth}`
            )
          }}
        </q-chip>
      </template>
    </PageTitle>

    <!-- System Info Bar -->
    <q-card class="q-mb-lg">
      <q-card-section class="bg-grey-1">
        <div class="row items-center q-gutter-lg">
          <div class="col-auto">
            <span class="text-caption text-grey-6"
              >{{ $t('platform.version') }}:</span
            >
            <span class="text-weight-bold q-ml-xs">{{
              dashboardData?.systemInfo.version
            }}</span>
          </div>
          <div class="col-auto">
            <span class="text-caption text-grey-6"
              >{{ $t('platform.environment') }}:</span
            >
            <span class="text-weight-bold q-ml-xs">{{
              dashboardData?.systemInfo.environment
            }}</span>
          </div>
          <div class="col-auto">
            <span class="text-caption text-grey-6"
              >{{ $t('platform.uptime') }}:</span
            >
            <span class="text-weight-bold q-ml-xs">{{
              dashboardData?.systemInfo.uptime
            }}</span>
          </div>
          <div class="col-auto">
            <span class="text-caption text-grey-6"
              >{{ $t('platform.lastDeployment') }}:</span
            >
            <span class="text-weight-bold q-ml-xs">{{
              formatDateTime(dashboardData?.systemInfo.lastDeployment)
            }}</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Platform Metrics Overview -->
    <div class="row q-mb-lg stats-cards-container">
      <!-- Total Practices Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          :title="$t('platform.metrics.totalPractices')"
          icon="business"
          icon-color="primary"
        >
          <div class="kpi-content">
            <div class="kpi-value text-primary">
              {{ dashboardData?.platformMetrics.totalPractices || 0 }}
            </div>
            <div class="kpi-subtitle">Practices</div>
          </div>
        </BaseCard>
      </div>

      <!-- Total Users Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          :title="$t('platform.metrics.totalUsers')"
          icon="people"
          icon-color="info"
        >
          <div class="kpi-content">
            <div class="kpi-value text-info">
              {{ dashboardData?.platformMetrics.totalUsers || 0 }}
            </div>
            <div class="kpi-subtitle">Users</div>
          </div>
        </BaseCard>
      </div>

      <!-- Active Today Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          :title="$t('platform.metrics.activeToday')"
          icon="trending_up"
          icon-color="positive"
        >
          <div class="kpi-content">
            <div class="kpi-value text-positive">
              {{ dashboardData?.platformMetrics.activeToday || 0 }}
            </div>
            <div class="kpi-subtitle">Active today</div>
          </div>
        </BaseCard>
      </div>

      <!-- Total Events Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          :title="$t('platform.metrics.totalEvents')"
          icon="event"
          icon-color="warning"
        >
          <div class="kpi-content">
            <div class="kpi-value text-warning">
              {{
                formatNumber(dashboardData?.platformMetrics.totalEvents || 0)
              }}
            </div>
            <div class="kpi-subtitle">Events</div>
          </div>
        </BaseCard>
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
          <DynamicPlatformWidget
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
  import {
    platformDashboardService,
    type PlatformDashboardData,
  } from '@/services/dashboard/platform-dashboard';
  import { dashboardLogger } from '@/utils/logger';
  import DynamicPlatformWidget from '@/components/platform/DynamicPlatformWidget.vue';
  import PageLayout from '@/components/PageLayout.vue';
  import PageTitle from '@/components/PageTitle.vue';
  import { BaseCard } from '@/components/cards';

  const { t } = useI18n();
  const $q = useQuasar();

  // Reactive state
  const loading = ref(false);
  const dashboardData = ref<PlatformDashboardData | null>(null);
  const refreshInterval = ref<NodeJS.Timer | null>(null);

  // Computed properties
  const sortedWidgets = computed(() => {
    return (
      dashboardData.value?.widgets
        .slice()
        .sort((a, b) => a.position - b.position) || []
    );
  });

  const systemHealthColor = computed(() => {
    const health = dashboardData.value?.platformMetrics.systemHealth;
    switch (health) {
      case 'healthy':
        return 'positive';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'negative';
      default:
        return 'grey';
    }
  });

  const systemHealthIcon = computed(() => {
    const health = dashboardData.value?.platformMetrics.systemHealth;
    switch (health) {
      case 'healthy':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'help';
    }
  });

  // Methods
  function getWidgetClass(size: 'small' | 'medium' | 'large'): string {
    switch (size) {
      case 'small':
        return 'col-12 col-md-6 col-lg-4';
      case 'medium':
        return 'col-12 col-md-6 col-lg-6';
      case 'large':
        return 'col-12';
      default:
        return 'col-12 col-md-6';
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
      minute: '2-digit',
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
            handler: () => loadDashboard(),
          },
        ],
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
      timeout: 2000,
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
      timeout: 3000,
    });
  }

  function startAutoRefresh() {
    // Auto-refresh every 5 minutes
    refreshInterval.value = setInterval(
      () => {
        loadDashboard();
      },
      5 * 60 * 1000
    );
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
  /* Dashboard Statistics Cards */
  .stats-cards-container {
    .stats-card-col {
      padding: var(--space-2, 8px);

      .kpi-content {
        text-align: center;
        padding: var(--space-4, 16px);

        .kpi-value {
          font-family: var(--font-family);
          font-size: var(--text-4xl, 2.25rem);
          font-weight: var(--font-weight-bold, 700);
          line-height: var(--leading-tight, 1.25);
          margin-bottom: var(--space-2, 8px);
          font-variant-numeric: tabular-nums;
        }

        .kpi-subtitle {
          font-family: var(--font-family);
          font-size: var(--text-xs, 0.75rem);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: var(--leading-normal, 1.5);
        }
      }
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
    .platform-header .row {
      flex-direction: column;
      text-align: center;

      .col-auto:last-child {
        margin-top: 1rem;
      }
    }
  }
</style>
