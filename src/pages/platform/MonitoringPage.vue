<template>
  <PageLayout>
    <PageTitle 
      title="System Monitoring"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'Monitoring', to: '/platform/monitoring' }
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

    <div class="row q-gutter-lg">
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">System Health</div>
          </template>
          
          <div class="q-pa-md">
            <div class="row q-gutter-md">
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-positive">{{ metrics.uptime }}</div>
                  <div class="text-caption">Uptime</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-info">{{ metrics.cpuUsage }}%</div>
                  <div class="text-caption">CPU Usage</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-warning">{{ metrics.memoryUsage }}%</div>
                  <div class="text-caption">Memory Usage</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-primary">{{ metrics.diskUsage }}%</div>
                  <div class="text-caption">Disk Usage</div>
                </q-card>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">Recent Alerts</div>
          </template>
          
          <div class="q-pa-md">
            <q-table
              :rows="alerts"
              :columns="alertColumns"
              row-key="id"
              :loading="loading"
              flat
              bordered
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
        </BaseCard>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import PageTitle from '@/components/PageTitle.vue'
import BaseCard from '@/components/cards/BaseCard.vue'

const loading = ref(false)
const metrics = ref({
  uptime: '99.9%',
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0
})

const alerts = ref([])

const alertColumns = [
  { name: 'timestamp', label: 'Time', field: 'timestamp', align: 'left' },
  { name: 'severity', label: 'Severity', field: 'severity', align: 'center' },
  { name: 'service', label: 'Service', field: 'service', align: 'left' },
  { name: 'message', label: 'Alert', field: 'message', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'negative'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'grey'
  }
}

const refreshMetrics = async () => {
  loading.value = true
  try {
    // TODO: Implement metrics fetching
    console.log('Refreshing monitoring metrics...')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshMetrics()
})
</script>