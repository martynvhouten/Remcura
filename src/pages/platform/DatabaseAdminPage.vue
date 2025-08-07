<template>
  <PageLayout>
    <PageTitle
      title="Database Administration"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'Database Admin', to: '/platform/database' },
      ]"
    >
      <template #actions>
        <q-btn
          flat
          round
          icon="refresh"
          size="md"
          class="app-btn-refresh"
          @click="refreshStats"
        />
      </template>
    </PageTitle>

    <!-- Database Statistics -->
    <div class="row q-mb-lg stats-cards-container">
      <!-- Total Tables Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard
          title="Database tables"
          icon="table_view"
          icon-color="primary"
        >
          <div class="kpi-content">
            <div class="kpi-value text-primary">{{ stats.totalTables }}</div>
            <div class="kpi-subtitle">Total tables</div>
          </div>
        </BaseCard>
      </div>

      <!-- Total Rows Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Database rows" icon="dataset" icon-color="positive">
          <div class="kpi-content">
            <div class="kpi-value text-positive">{{ stats.totalRows }}</div>
            <div class="kpi-subtitle">Total rows</div>
          </div>
        </BaseCard>
      </div>

      <!-- Database Size Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Database size" icon="storage" icon-color="info">
          <div class="kpi-content">
            <div class="kpi-value text-info">{{ stats.databaseSize }}</div>
            <div class="kpi-subtitle">Database size</div>
          </div>
        </BaseCard>
      </div>

      <!-- Active Connections Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Active connections" icon="link" icon-color="warning">
          <div class="kpi-content">
            <div class="kpi-value text-warning">
              {{ stats.activeConnections }}
            </div>
            <div class="kpi-subtitle">Active connections</div>
          </div>
        </BaseCard>
      </div>
    </div>
    <!-- Table Statistics -->
    <div class="q-mb-lg medical-table">
      <q-table
        :rows="tableStats"
        :columns="tableColumns"
        row-key="table_name"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="table-stats-table"
        title="Table statistics"
      />
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import PageLayout from '@/components/PageLayout.vue';
  import PageTitle from '@/components/PageTitle.vue';
  import BaseCard from '@/components/cards/BaseCard.vue';

  const loading = ref(false);
  const stats = ref({
    totalTables: 0,
    totalRows: 0,
    databaseSize: '0 MB',
    activeConnections: 0,
  });

  const tableStats = ref([]);

  const tableColumns = [
    {
      name: 'table_name',
      label: 'Table Name',
      field: 'table_name',
      align: 'left',
    },
    { name: 'row_count', label: 'Rows', field: 'row_count', align: 'right' },
    { name: 'size', label: 'Size', field: 'size', align: 'right' },
    {
      name: 'last_updated',
      label: 'Last Updated',
      field: 'last_updated',
      align: 'left',
    },
  ];

  const refreshStats = async () => {
    loading.value = true;
    try {
      // TODO: Implement database statistics fetching
      console.log('Refreshing database statistics...');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    refreshStats();
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
