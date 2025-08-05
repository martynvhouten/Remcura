<template>
  <PageLayout>
    <PageTitle 
      title="Backup & Restore"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'Backup', to: '/platform/backup' }
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

    <div class="row q-gutter-lg">
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">Backup Status</div>
          </template>
          
          <div class="q-pa-md">
            <div class="row q-gutter-md">
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-positive">{{ backupStats.totalBackups }}</div>
                  <div class="text-caption">Total Backups</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-info">{{ backupStats.lastBackup }}</div>
                  <div class="text-caption">Last Backup</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-warning">{{ backupStats.totalSize }}</div>
                  <div class="text-caption">Total Size</div>
                </q-card>
              </div>
              <div class="col-md-3 col-6">
                <q-card flat bordered class="text-center q-pa-md">
                  <div class="text-h4 text-primary">{{ backupStats.retention }}</div>
                  <div class="text-caption">Retention Days</div>
                </q-card>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">Backup History</div>
          </template>
          
          <div class="q-pa-md">
            <q-table
              :rows="backups"
              :columns="backupColumns"
              row-key="id"
              :loading="loading"
              flat
              bordered
            >
              <template #body-cell-status="props">
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
              
              <template #body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    icon="download"
                    size="sm"
                    class="app-btn-info"
                    @click="downloadBackup(props.row)"
                  />
                  <q-btn
                    flat
                    round
                    icon="restore"
                    size="sm"
                    class="app-btn-warning"
                    @click="restoreBackup(props.row)"
                  />
                  <q-btn
                    flat
                    round
                    icon="delete"
                    size="sm"
                    class="app-btn-danger"
                    @click="deleteBackup(props.row)"
                  />
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
const creating = ref(false)

const backupStats = ref({
  totalBackups: 0,
  lastBackup: 'N/A',
  totalSize: '0 GB',
  retention: 30
})

const backups = ref([])

const backupColumns = [
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
  { name: 'name', label: 'Name', field: 'name', align: 'left' },
  { name: 'size', label: 'Size', field: 'size', align: 'right' },
  { name: 'type', label: 'Type', field: 'type', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const getBackupStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'positive'
    case 'failed': return 'negative'
    case 'in_progress': return 'warning'
    default: return 'grey'
  }
}

const refreshBackups = async () => {
  loading.value = true
  try {
    // TODO: Implement backup fetching
    console.log('Refreshing backups...')
  } finally {
    loading.value = false
  }
}

const createBackup = async () => {
  creating.value = true
  try {
    // TODO: Implement backup creation
    console.log('Creating backup...')
  } finally {
    creating.value = false
  }
}

const downloadBackup = (backup: any) => {
  console.log('Download backup:', backup)
  // TODO: Implement backup download
}

const restoreBackup = (backup: any) => {
  console.log('Restore backup:', backup)
  // TODO: Implement backup restore
}

const deleteBackup = (backup: any) => {
  console.log('Delete backup:', backup)
  // TODO: Implement backup deletion
}

onMounted(() => {
  refreshBackups()
})
</script>