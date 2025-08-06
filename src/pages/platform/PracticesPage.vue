<template>
  <PageLayout>
    <PageTitle 
      title="Practice Management"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'Practices', to: '/platform/practices' }
      ]"
    >
      <template #actions>
        <q-btn
          flat
          round
          icon="refresh"
          size="md"
          class="app-btn-refresh"
          @click="refreshData"
        />
        <q-btn
          class="app-btn-primary"
          icon="add"
          label="Create Practice"
          @click="$router.push('/platform/practices/create')"
        />
      </template>
    </PageTitle>

    <div class="row q-gutter-lg">
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">Practices Overview</div>
          </template>
          
          <div class="q-pa-md">
            <div class="medical-table">
              <q-table
              :rows="practices"
              :columns="columns"
              row-key="id"
              :loading="loading"
              flat
              bordered
            >
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.value)"
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
                    icon="edit"
                    size="sm"
                    class="app-btn-secondary"
                    @click="editPractice(props.row)"
                  />
                  <q-btn
                    flat
                    round
                    icon="visibility"
                    size="sm"
                    class="app-btn-info"
                    @click="viewPractice(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
            </div>
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

const practices = ref([])
const loading = ref(false)

const columns = [
  { name: 'name', label: 'Practice Name', field: 'name', align: 'left' },
  { name: 'email', label: 'Contact Email', field: 'email', align: 'left' },
  { name: 'users_count', label: 'Users', field: 'users_count', align: 'center' },
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const refreshData = async () => {
  loading.value = true
  try {
    // TODO: Implement practice data fetching
    console.log('Refreshing practices data...')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'positive'
    case 'inactive': return 'negative'
    case 'suspended': return 'warning'
    default: return 'grey'
  }
}

const editPractice = (practice: any) => {
  console.log('Edit practice:', practice)
  // TODO: Implement edit functionality
}

const viewPractice = (practice: any) => {
  console.log('View practice:', practice)
  // TODO: Implement view functionality
}

onMounted(() => {
  refreshData()
})
</script>