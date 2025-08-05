<template>
  <PageLayout>
    <PageTitle 
      title="Database Administration"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'Database Admin', to: '/platform/database' }
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

    <div class="row q-gutter-lg">
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">Database Statistics</div>
          </template>
          
          <div class="q-pa-md">
            <div class="row q-gutter-md">
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-primary">{{ stats.totalTables }}</div>
                  <div class="text-caption">Total Tables</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-positive">{{ stats.totalRows }}</div>
                  <div class="text-caption">Total Rows</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-info">{{ stats.databaseSize }}</div>
                  <div class="text-caption">Database Size</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-warning">{{ stats.activeConnections }}</div>
                  <div class="text-caption">Active Connections</div>
                </q-card>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">Table Statistics</div>
          </template>
          
          <div class="q-pa-md">
            <q-table
              :rows="tableStats"
              :columns="tableColumns"
              row-key="table_name"
              :loading="loading"
              flat
              bordered
            />
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
const stats = ref({
  totalTables: 0,
  totalRows: 0,
  databaseSize: '0 MB',
  activeConnections: 0
})

const tableStats = ref([])

const tableColumns = [
  { name: 'table_name', label: 'Table Name', field: 'table_name', align: 'left' },
  { name: 'row_count', label: 'Rows', field: 'row_count', align: 'right' },
  { name: 'size', label: 'Size', field: 'size', align: 'right' },
  { name: 'last_updated', label: 'Last Updated', field: 'last_updated', align: 'left' }
]

const refreshStats = async () => {
  loading.value = true
  try {
    // TODO: Implement database statistics fetching
    console.log('Refreshing database statistics...')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshStats()
})
</script>