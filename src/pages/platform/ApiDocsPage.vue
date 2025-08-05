<template>
  <PageLayout>
    <PageTitle 
      title="API Documentation"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'API Documentation', to: '/platform/api-docs' }
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

    <div class="row q-gutter-lg">
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">API Overview</div>
          </template>
          
          <div class="q-pa-md">
            <div class="row q-gutter-md">
              <div class="col-md-4 col-12">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-primary">{{ apiStats.totalEndpoints }}</div>
                  <div class="text-caption">Total Endpoints</div>
                </q-card>
              </div>
              <div class="col-md-4 col-12">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-positive">{{ apiStats.requestsToday }}</div>
                  <div class="text-caption">Requests Today</div>
                </q-card>
              </div>
              <div class="col-md-4 col-12">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-info">{{ apiStats.avgResponseTime }}ms</div>
                  <div class="text-caption">Avg Response Time</div>
                </q-card>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">API Endpoints</div>
          </template>
          
          <div class="q-pa-md">
            <q-table
              :rows="endpoints"
              :columns="endpointColumns"
              row-key="id"
              :loading="loading"
              flat
              bordered
            >
              <template #body-cell-method="props">
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
              
              <template #body-cell-status="props">
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
const apiStats = ref({
  totalEndpoints: 0,
  requestsToday: 0,
  avgResponseTime: 0
})

const endpoints = ref([])

const endpointColumns = [
  { name: 'method', label: 'Method', field: 'method', align: 'center' },
  { name: 'path', label: 'Endpoint', field: 'path', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'requests_count', label: 'Requests', field: 'requests_count', align: 'right' },
  { name: 'avg_response_time', label: 'Avg Time (ms)', field: 'avg_response_time', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET': return 'info'
    case 'POST': return 'positive'
    case 'PUT': return 'warning'
    case 'DELETE': return 'negative'
    default: return 'grey'
  }
}

const refreshApiStats = async () => {
  loading.value = true
  try {
    // TODO: Implement API statistics fetching
    console.log('Refreshing API statistics...')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshApiStats()
})
</script>