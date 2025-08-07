<template>
  <PageLayout>
    <PageTitle
      title="System Logs"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'System Logs', to: '/platform/logs' },
      ]"
    >
      <template #actions>
        <q-btn
          flat
          round
          icon="refresh"
          size="md"
          class="app-btn-refresh"
          @click="refreshLogs"
        />
        <q-btn
          class="app-btn-secondary"
          icon="download"
          label="Export Logs"
          @click="exportLogs"
        />
      </template>
    </PageTitle>

    <!-- Application Logs Table -->
    <div class="q-mb-lg medical-table">
      <q-table
        :rows="logs"
        :columns="columns"
        row-key="id"
        :loading="loading"
        virtual-scroll
        :rows-per-page-options="[0]"
        style="height: 400px"
        class="system-logs-table"
        title="Application logs"
      >
        <template v-slot:body-cell-level="props">
          <q-td :props="props">
            <q-chip
              :color="getLogLevelColor(props.value)"
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

  const logs = ref([]);
  const loading = ref(false);

  const columns = [
    {
      name: 'timestamp',
      label: 'Timestamp',
      field: 'timestamp',
      align: 'left',
    },
    { name: 'level', label: 'Level', field: 'level', align: 'center' },
    { name: 'service', label: 'Service', field: 'service', align: 'left' },
    { name: 'message', label: 'Message', field: 'message', align: 'left' },
    { name: 'user_id', label: 'User ID', field: 'user_id', align: 'left' },
  ];

  const refreshLogs = async () => {
    loading.value = true;
    try {
      // TODO: Implement log fetching
      console.log('Refreshing system logs...');
    } finally {
      loading.value = false;
    }
  };

  const exportLogs = () => {
    console.log('Exporting logs...');
    // TODO: Implement log export
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'negative';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
        return 'grey';
      default:
        return 'grey';
    }
  };

  onMounted(() => {
    refreshLogs();
  });
</script>
