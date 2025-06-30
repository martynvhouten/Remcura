<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('bestellijsten.title')"
        :subtitle="$t('bestellijsten.subtitle')"
        icon="playlist_add_check"
      >
        <template #actions>
          <q-btn
            v-bind="refreshBtn"
            @click="refreshData"
            :loading="loading"
          />
          <q-btn
            v-bind="newListBtn"
            @click="showCreateDialog = true"
          />
        </template>
      </PageTitle>
    </template>

    <BaseCard 
      variant="elevated"
      :title="$t('bestellijsten.overview')"
      icon="playlist_add_check"
      header-color="primary"
    >
      <div class="text-body2 text-grey-6">{{ $t('bestellijsten.subtitle') }}</div>
    </BaseCard>

    <!-- Quick Stats Cards -->
    <div class="row q-mb-lg">
      <div class="col-6 col-sm-3 col-md-3 q-pa-sm">
        <q-card class="stat-card card-modern">
          <q-card-section class="text-center">
            <q-icon name="list" size="2em" color="primary" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold">{{ bestellijsten.length }}</div>
            <div class="text-caption text-grey-6">{{ $t('bestellijsten.title') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3 col-md-3 q-pa-sm">
        <q-card class="stat-card card-modern">
          <q-card-section class="text-center">
            <q-icon name="inventory_2" size="2em" color="positive" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold">{{ totalItems }}</div>
            <div class="text-caption text-grey-6">{{ $t('bestellijsten.itemCount') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3 col-md-3 q-pa-sm">
        <q-card class="stat-card card-modern">
          <q-card-section class="text-center">
            <q-icon name="warning" size="2em" color="warning" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold">{{ lowStockCount }}</div>
            <div class="text-caption text-grey-6">{{ $t('bestellijsten.stockLow') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3 col-md-3 q-pa-sm">
        <q-card class="stat-card card-modern">
          <q-card-section class="text-center">
            <q-icon name="shopping_cart" size="2em" color="info" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold">{{ shoppingCarts.length }}</div>
            <div class="text-caption text-grey-6">{{ $t('bestellijsten.shoppingCart') }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Bestellijsten Grid -->
    <q-card class="card-modern">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div 
            v-for="bestellijst in bestellijsten" 
            :key="bestellijst.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <q-card 
              class="bestellijst-card card-modern cursor-pointer"
              @click="openBestellijst(bestellijst.id)"
              :class="{ 'bestellijst-card--has-warnings': hasWarnings(bestellijst) }"
            >
              <q-card-section>
                <div class="row items-start justify-between">
                  <div class="col">
                    <h6 class="text-h6 q-ma-none q-mb-xs">{{ bestellijst.name }}</h6>
                    <p class="text-body2 text-grey-6 q-ma-none" v-if="bestellijst.description">
                      {{ bestellijst.description }}
                    </p>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="more_vert"
                    @click.stop="showListActions(bestellijst)"
                    class="text-grey-6"
                  >
                    <q-menu>
                      <q-list>
                        <q-item clickable @click="editBestellijst(bestellijst)">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>{{ $t('bestellijsten.editList') }}</q-item-section>
                        </q-item>
                        <q-item clickable @click="duplicateBestellijst(bestellijst)">
                          <q-item-section avatar>
                            <q-icon name="content_copy" />
                          </q-item-section>
                          <q-item-section>{{ $t('bestellijsten.duplicateList') }}</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable @click="confirmDeleteBestellijst(bestellijst)" class="text-negative">
                          <q-item-section avatar>
                            <q-icon name="delete" />
                          </q-item-section>
                          <q-item-section>{{ $t('bestellijsten.deleteList') }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>

                <div class="q-mt-md">
                  <div class="row q-gutter-sm items-center">
                    <q-chip 
                      size="sm" 
                      color="primary" 
                      text-color="white"
                      icon="inventory_2"
                    >
                      {{ getItemCount(bestellijst) }} {{ $t('bestellijsten.itemCount').toLowerCase() }}
                    </q-chip>
                    
                    <q-chip 
                      v-if="getLowStockCount(bestellijst) > 0"
                      size="sm" 
                      color="warning" 
                      text-color="white"
                      icon="warning"
                    >
                      {{ getLowStockCount(bestellijst) }} {{ $t('bestellijsten.stockLow').toLowerCase() }}
                    </q-chip>
                    
                    <q-chip 
                      v-if="getOutOfStockCount(bestellijst) > 0"
                      size="sm" 
                      color="negative" 
                      text-color="white"
                      icon="error"
                    >
                      {{ getOutOfStockCount(bestellijst) }} {{ $t('bestellijsten.stockOut').toLowerCase() }}
                    </q-chip>
                  </div>
                </div>

                <div class="text-caption text-grey-6 q-mt-sm">
                  {{ $t('bestellijsten.lastUpdated') }}: 
                  {{ formatDate(bestellijst.updated_at) }}
                </div>
              </q-card-section>
              
              <q-card-actions align="right">
                <q-btn
                  flat
                  color="primary"
                  :label="$t('common.open')"
                  @click.stop="openBestellijst(bestellijst.id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="bestellijsten.length === 0 && !loading" class="text-center q-pa-xl">
          <q-icon name="shopping_cart" size="4em" color="grey-4" class="q-mb-md" />
          <h5 class="text-h5 text-grey-6 q-ma-none q-mb-md">{{ $t('bestellijsten.noItems') }}</h5>
          <q-btn
            color="primary"
            icon="add"
            :label="$t('bestellijsten.createList')"
            @click="showCreateDialog = true"
            unelevated
            no-caps
            class="btn-modern"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ editingBestellijst ? $t('bestellijsten.editList') : $t('bestellijsten.createList') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveBestellijst" class="q-gutter-md">
            <q-input
              v-model="bestellijstForm.name"
              :label="$t('bestellijsten.listName')"
              filled
              :rules="[val => !!val || 'Name is required']"
              autofocus
            />
            
            <q-input
              v-model="bestellijstForm.description"
              :label="$t('bestellijsten.listDescription')"
              filled
              type="textarea"
              rows="3"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('bestellijsten.cancel')" @click="closeCreateDialog" />
          <q-btn 
            color="primary" 
            :label="$t('bestellijsten.save')" 
            @click="saveBestellijst"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useButtons } from 'src/composables/useButtons'
import { useBestellijstenStore } from 'src/stores/bestellijsten'
import { useAuthStore } from 'src/stores/auth'
import type { BestellijstWithItems, BestellijstInsert } from 'src/types/supabase'
import PageLayout from 'src/components/PageLayout.vue'
import PageTitle from 'src/components/PageTitle.vue'
import BaseCard from 'src/components/base/BaseCard.vue'

const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()
const bestellijstenStore = useBestellijstenStore()
const { quickActions } = useButtons()

// Button configurations
const refreshBtn = computed(() => quickActions.refresh())
const newListBtn = computed(() => quickActions.create())
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingBestellijst = ref<BestellijstWithItems | null>(null)
const bestellijstForm = ref<BestellijstInsert>({
  practice_id: '',
  name: '',
  description: ''
})

// Computed
const bestellijsten = computed(() => bestellijstenStore.bestellijsten)
const shoppingCarts = computed(() => bestellijstenStore.shoppingCarts)

const totalItems = computed(() => {
  return bestellijsten.value.reduce((total, list) => 
    total + (list.product_list_items?.length || 0), 0
  )
})

const lowStockCount = computed(() => {
  return bestellijsten.value.reduce((total, list) => 
    total + getLowStockCount(list), 0
  )
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      bestellijstenStore.fetchBestellijsten(),
      bestellijstenStore.fetchShoppingCarts()
    ])
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('bestellijsten.errorLoadingLists')
    })
  } finally {
    loading.value = false
  }
}

const openBestellijst = (id: string) => {
  router.push(`/bestellijsten/${id}`)
}

const getItemCount = (bestellijst: BestellijstWithItems): number => {
  return bestellijst.product_list_items?.length || 0
}

const getLowStockCount = (bestellijst: BestellijstWithItems): number => {
  return bestellijst.product_list_items?.filter(item => 
    item.current_stock <= item.minimum_stock && item.current_stock > 0
  ).length || 0
}

const getOutOfStockCount = (bestellijst: BestellijstWithItems): number => {
  return bestellijst.product_list_items?.filter(item => 
    item.current_stock === 0
  ).length || 0
}

const hasWarnings = (bestellijst: BestellijstWithItems): boolean => {
  return getLowStockCount(bestellijst) > 0 || getOutOfStockCount(bestellijst) > 0
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

const showListActions = (bestellijst: BestellijstWithItems) => {
  // Menu is handled by q-menu in template
}

const editBestellijst = (bestellijst: BestellijstWithItems) => {
  editingBestellijst.value = bestellijst
  bestellijstForm.value = {
    practice_id: bestellijst.practice_id,
    name: bestellijst.name,
    description: bestellijst.description || ''
  }
  showCreateDialog.value = true
}

const duplicateBestellijst = async (bestellijst: BestellijstWithItems) => {
  const duplicateForm: BestellijstInsert = {
    practice_id: authStore.clinicId || '',
    name: `${bestellijst.name} (kopie)`,
    description: bestellijst.description || ''
  }

  const result = await bestellijstenStore.createBestellijst(duplicateForm)
  
  if (result.success) {
    $q.notify({
      type: 'positive',
      message: t('bestellijsten.listCreated')
    })
    await refreshData()
  } else {
    $q.notify({
      type: 'negative',
      message: result.error
    })
  }
}

const confirmDeleteBestellijst = (bestellijst: BestellijstWithItems) => {
  $q.dialog({
    title: t('bestellijsten.deleteList'),
    message: t('bestellijsten.confirmDelete'),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await bestellijstenStore.deleteBestellijst(bestellijst.id)
    
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: t('bestellijsten.listDeleted')
      })
    } else {
      $q.notify({
        type: 'negative',
        message: result.error
      })
    }
  })
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  editingBestellijst.value = null
  bestellijstForm.value = {
    practice_id: '',
    name: '',
    description: ''
  }
}

const saveBestellijst = async () => {
  if (!bestellijstForm.value.name) return

  saving.value = true
  
  try {
    bestellijstForm.value.practice_id = authStore.clinicId || ''
    
    let result
    if (editingBestellijst.value) {
      result = await bestellijstenStore.updateBestellijst(
        editingBestellijst.value.id, 
        bestellijstForm.value
      )
    } else {
      result = await bestellijstenStore.createBestellijst(bestellijstForm.value)
    }

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: editingBestellijst.value 
          ? t('bestellijsten.listUpdated')
          : t('bestellijsten.listCreated')
      })
      closeCreateDialog()
      await refreshData()
    } else {
      $q.notify({
        type: 'negative',
        message: result.error
      })
    }
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.bestellijst-card {
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.bestellijst-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.bestellijst-card--has-warnings {
  border-left-color: var(--q-warning);
}

.bestellijst-card--has-warnings:hover {
  border-left-color: var(--q-warning);
}
</style> 