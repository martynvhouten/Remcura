<template>
  <PageLayout>
    <PageTitle
      title="System Monitoring"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'Monitoring', to: '/platform/monitoring' },
      ]"
    >
      <template #actions>
        <q-btn
          flat
          round
          icon="refresh"
          size="md"
          class="app-btn-refresh"
          @click="refreshMetrics"
        />
      </template>
    </PageTitle>

    <!-- System Health Metrics -->
    <div class="row q-mb-lg stats-cards-container">
      <!-- Uptime Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          title="System uptime"
          icon="trending_up"
          icon-color="positive"
        >
          <div class="kpi-content">
            <div class="kpi-value text-positive">{{ metrics.uptime }}</div>
            <div class="kpi-subtitle">Uptime</div>
          </div>
        </BaseCard>
      </div>

      <!-- CPU Usage Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="CPU usage" icon="memory" icon-color="info">
          <div class="kpi-content">
            <div class="kpi-value text-info">{{ metrics.cpuUsage }}%</div>
            <div class="kpi-subtitle">CPU usage</div>
          </div>
        </BaseCard>
      </div>

      <!-- Memory Usage Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Memory usage" icon="storage" icon-color="warning">
          <div class="kpi-content">
            <div class="kpi-value text-warning">{{ metrics.memoryUsage }}%</div>
            <div class="kpi-subtitle">Memory usage</div>
          </div>
        </BaseCard>
      </div>

      <!-- Disk Usage Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Disk usage" icon="hard_drive" icon-color="primary">
          <div class="kpi-content">
            <div class="kpi-value text-primary">{{ metrics.diskUsage }}%</div>
            <div class="kpi-subtitle">Disk usage</div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Recent Alerts Table -->
    <div class="q-mb-lg medical-table">
      <q-table
        :rows="alerts"
        :columns="alertColumns as any"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="alerts-table"
        title="Recent alerts"
      >
        <template #body-cell-severity="props">
          <q-td :props="props">
            <q-chip
              :color="getSeverityColor(props.value)"
              text-color="white"
              size="sm"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="props.value === 'resolved' ? 'positive' : 'negative'"
              text-color="white"
              size="sm"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>
      </q-table>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import PageLayout from '@/components/PageLayout.vue';
  import PageTitle from '@/components/PageTitle.vue';
  import BaseCard from '@/components/cards/BaseCard.vue';

  const loading = ref(false);
  const metrics = ref({
    uptime: '99.9%',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
  });

  const alerts = ref([]);

  const alertColumns = [
    { name: 'timestamp', label: 'Time', field: 'timestamp', align: 'left' },
    { name: 'severity', label: 'Severity', field: 'severity', align: 'center' },
    { name: 'service', label: 'Service', field: 'service', align: 'left' },
    { name: 'message', label: 'Alert', field: 'message', align: 'left' },
    { name: 'status', label: 'Status', field: 'status', align: 'center' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'negative';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'grey';
    }
  };

  const refreshMetrics = async () => {
    loading.value = true;
    try {
      // TODO: Implement metrics fetching
      console.log('Refreshing monitoring metrics...');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    refreshMetrics();
  });
</script>

<style scoped>
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
</style>
