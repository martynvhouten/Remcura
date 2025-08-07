<template>
  <PageLayout>
    <PageTitle
      title="API Documentation"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'API Documentation', to: '/platform/api-docs' },
      ]"
    >
      <template #actions>
        <q-btn
          flat
          round
          icon="refresh"
          size="md"
          class="app-btn-refresh"
          @click="refreshApiStats"
        />
      </template>
    </PageTitle>

    <!-- API Statistics -->
    <div class="row q-mb-lg stats-cards-container">
      <!-- Total Endpoints Card -->
      <div class="col-12 col-sm-6 col-lg-4 stats-card-col">
        <BaseCard title="API endpoints" icon="api" icon-color="primary">
          <div class="kpi-content">
            <div class="kpi-value text-primary">
              {{ apiStats.totalEndpoints }}
            </div>
            <div class="kpi-subtitle">Total endpoints</div>
          </div>
        </BaseCard>
      </div>

      <!-- Requests Today Card -->
      <div class="col-12 col-sm-6 col-lg-4 stats-card-col">
        <BaseCard
          title="Daily requests"
          icon="trending_up"
          icon-color="positive"
        >
          <div class="kpi-content">
            <div class="kpi-value text-positive">
              {{ apiStats.requestsToday }}
            </div>
            <div class="kpi-subtitle">Requests today</div>
          </div>
        </BaseCard>
      </div>

      <!-- Average Response Time Card -->
      <div class="col-12 col-sm-6 col-lg-4 stats-card-col">
        <BaseCard title="Response time" icon="speed" icon-color="info">
          <div class="kpi-content">
            <div class="kpi-value text-info">
              {{ apiStats.avgResponseTime }}ms
            </div>
            <div class="kpi-subtitle">Avg response time</div>
          </div>
        </BaseCard>
      </div>
    </div>
    <!-- API Endpoints Table -->
    <div class="q-mb-lg medical-table">
      <q-table
        :rows="endpoints"
        :columns="endpointColumns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="api-endpoints-table"
        title="API endpoints"
      >
        <template v-slot:body-cell-method="props">
          <q-td :props="props">
            <q-chip
              :color="getMethodColor(props.value)"
              text-color="white"
              size="sm"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="props.value === 'active' ? 'positive' : 'negative'"
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
  const apiStats = ref({
    totalEndpoints: 0,
    requestsToday: 0,
    avgResponseTime: 0,
  });

  const endpoints = ref([]);

  const endpointColumns = [
    { name: 'method', label: 'Method', field: 'method', align: 'center' },
    { name: 'path', label: 'Endpoint', field: 'path', align: 'left' },
    {
      name: 'description',
      label: 'Description',
      field: 'description',
      align: 'left',
    },
    {
      name: 'requests_count',
      label: 'Requests',
      field: 'requests_count',
      align: 'right',
    },
    {
      name: 'avg_response_time',
      label: 'Avg Time (ms)',
      field: 'avg_response_time',
      align: 'right',
    },
    { name: 'status', label: 'Status', field: 'status', align: 'center' },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'info';
      case 'POST':
        return 'positive';
      case 'PUT':
        return 'warning';
      case 'DELETE':
        return 'negative';
      default:
        return 'grey';
    }
  };

  const refreshApiStats = async () => {
    loading.value = true;
    try {
      // TODO: Implement API statistics fetching
      console.log('Refreshing API statistics...');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    refreshApiStats();
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
          font-family: var(--font-family-primary);
          font-size: var(--text-4xl, 2.25rem);
          font-weight: var(--font-weight-bold, 700);
          line-height: var(--leading-tight, 1.25);
          margin-bottom: var(--space-2, 8px);
          font-variant-numeric: tabular-nums;
        }

        .kpi-subtitle {
          font-family: var(--font-family-primary);
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
