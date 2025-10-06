<template>
  <PageLayout>
    <PageTitle
      title="Backup & Restore"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'Backup', to: '/platform/backup' },
      ]"
    >
      <template #actions>
        <q-btn
          flat
          round
          icon="refresh"
          size="md"
          class="app-btn-refresh"
          @click="refreshBackups"
        />
        <q-btn
          class="app-btn-primary"
          icon="backup"
          label="Create Backup"
          @click="createBackup"
          :loading="creating"
        />
      </template>
    </PageTitle>

    <!-- Backup Statistics -->
    <div class="row q-mb-lg stats-cards-container">
      <!-- Total Backups Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Total backups" icon="backup" icon-color="positive">
          <div class="kpi-content">
            <div class="kpi-value text-positive">
              {{ backupStats.totalBackups }}
            </div>
            <div class="kpi-subtitle">Total backups</div>
          </div>
        </BaseCard>
      </div>

      <!-- Last Backup Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Last backup" icon="schedule" icon-color="info">
          <div class="kpi-content">
            <div class="kpi-value text-info">{{ backupStats.lastBackup }}</div>
            <div class="kpi-subtitle">Last backup</div>
          </div>
        </BaseCard>
      </div>

      <!-- Total Size Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Total size" icon="storage" icon-color="warning">
          <div class="kpi-content">
            <div class="kpi-value text-warning">
              {{ backupStats.totalSize }}
            </div>
            <div class="kpi-subtitle">Total size</div>
          </div>
        </BaseCard>
      </div>

      <!-- Retention Days Card -->
      <div class="col-12 col-sm-6 col-lg-3 stats-card-col">
        <BaseCard title="Retention policy" icon="timer" icon-color="primary">
          <div class="kpi-content">
            <div class="kpi-value text-primary">
              {{ backupStats.retention }}
            </div>
            <div class="kpi-subtitle">Retention days</div>
          </div>
        </BaseCard>
      </div>
    </div>
    <!-- Backup History Table -->
    <div class="q-mb-lg medical-table">
      <q-table
        :rows="backups"
        :columns="backupColumns as any"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="backup-history-table"
        title="Backup history"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="getBackupStatusColor(props.value)"
              text-color="white"
              size="sm"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              icon="download"
              size="sm"
              class="app-btn-info"
              @click="downloadBackup(props.row)"
            >
              <q-tooltip>Download</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="restore"
              size="sm"
              class="app-btn-warning"
              @click="restoreBackup(props.row)"
            >
              <q-tooltip>Restore</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="delete"
              size="sm"
              class="app-btn-danger"
              @click="deleteBackup(props.row)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
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
  const creating = ref(false);

  const backupStats = ref({
    totalBackups: 0,
    lastBackup: 'N/A',
    totalSize: '0 GB',
    retention: 30,
  });

  const backups = ref([]);

  const backupColumns = [
    {
      name: 'created_at',
      label: 'Created',
      field: 'created_at',
      align: 'left',
    },
    { name: 'name', label: 'Name', field: 'name', align: 'left' },
    { name: 'size', label: 'Size', field: 'size', align: 'right' },
    { name: 'type', label: 'Type', field: 'type', align: 'center' },
    { name: 'status', label: 'Status', field: 'status', align: 'center' },
    { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
  ];

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'positive';
      case 'failed':
        return 'negative';
      case 'in_progress':
        return 'warning';
      default:
        return 'grey';
    }
  };

  const refreshBackups = async () => {
    loading.value = true;
    try {
      // TODO: Implement backup fetching
      console.log('Refreshing backups...');
    } finally {
      loading.value = false;
    }
  };

  const createBackup = async () => {
    creating.value = true;
    try {
      // TODO: Implement backup creation
      console.log('Creating backup...');
    } finally {
      creating.value = false;
    }
  };

  const downloadBackup = (backup: any) => {
    console.log('Download backup:', backup);
    // TODO: Implement backup download
  };

  const restoreBackup = (backup: any) => {
    console.log('Restore backup:', backup);
    // TODO: Implement backup restore
  };

  const deleteBackup = (backup: any) => {
    console.log('Delete backup:', backup);
    // TODO: Implement backup deletion
  };

  onMounted(() => {
    refreshBackups();
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
