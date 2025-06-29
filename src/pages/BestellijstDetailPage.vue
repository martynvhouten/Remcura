<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="currentBestellijst?.name || $t('bestellijsten.title')"
        :subtitle="$t('bestellijsten.subtitle')"
        icon="inventory_2"
      >
        <template #actions>
          <q-btn
            color="secondary"
            :icon="scanMode ? 'qr_code_scanner' : 'qr_code'"
            :label="$t('bestellijsten.scanMode')"
            @click="toggleScanMode"
            :outline="!scanMode"
            class="btn-modern"
          />
          <q-btn
            color="primary"
            icon="add"
            :label="$t('bestellijsten.addProduct')"
            @click="showAddProductDialog = true"
            class="btn-modern"
            unelevated
          />
        </template>
      </PageTitle>
    </template>

    <!-- Scan Mode Banner -->
    <q-banner v-if="scanMode" class="bg-secondary text-white q-mb-md">
      <template v-slot:avatar>
        <q-icon name="qr_code_scanner" />
      </template>
      <div class="text-h6">{{ $t('bestellijsten.scanModeActive') }}</div>
      <div class="text-body2">{{ $t('bestellijsten.scanBarcode') }}</div>
      
      <template v-slot:action>
        <q-btn
          flat
          color="white"
          :label="$t('common.close')"
          @click="toggleScanMode"
        />
      </template>
    </q-banner>

    <!-- Scan Input (when in scan mode) -->
    <q-card v-if="scanMode" class="card-modern q-mb-md">
      <q-card-section>
        <q-input
          v-model="scanInput"
          :label="$t('bestellijsten.enterBarcode')"
          outlined
          autofocus
          @keyup.enter="processScan"
          clearable
        >
          <template v-slot:append>
            <q-btn
              color="primary"
              icon="search"
              @click="processScan"
              flat
              round
            />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- Products Table -->
    <q-card class="card-modern">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">{{ $t('bestellijsten.itemCount') }}</div>
          <div class="q-gutter-sm">
            <q-btn
              color="positive"
              icon="shopping_cart"
              :label="$t('bestellijsten.orderAll')"
              @click="addAllSuggestionsToCart"
              :disable="itemsWithSuggestions.length === 0"
              unelevated
            />
          </div>
        </div>

        <q-table
          :rows="items"
          :columns="tableColumns"
          :loading="loading"
          row-key="id"
          :pagination="{ rowsPerPage: 20 }"
          class="modern-table"
          flat
          bordered
        >
          <!-- Stock Status Column -->
          <template v-slot:body-cell-stock_status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row)"
                text-color="white"
                size="sm"
              >
                {{ getStatusText(props.row) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Current Stock Column (editable) -->
          <template v-slot:body-cell-current_stock="props">
            <q-td :props="props">
              <q-input
                v-model.number="props.row.current_stock"
                type="number"
                dense
                outlined
                @blur="updateStock(props.row)"
                style="width: 80px"
              />
            </q-td>
          </template>

          <!-- Minimum Stock Column (editable) -->
          <template v-slot:body-cell-minimum_stock="props">
            <q-td :props="props">
              <q-input
                v-model.number="props.row.minimum_stock"
                type="number"
                dense
                outlined
                @blur="updateStock(props.row)"
                style="width: 80px"
              />
            </q-td>
          </template>

          <!-- Maximum Stock Column (editable) -->
          <template v-slot:body-cell-maximum_stock="props">
            <q-td :props="props">
              <q-input
                v-model.number="props.row.maximum_stock"
                type="number"
                dense
                outlined
                @blur="updateStock(props.row)"
                style="width: 80px"
              />
            </q-td>
          </template>

          <!-- Order Suggestion Column -->
          <template v-slot:body-cell-suggestion="props">
            <q-td :props="props">
              <q-chip
                v-if="getSuggestion(props.row) > 0"
                color="primary"
                text-color="white"
                icon="add_shopping_cart"
                size="sm"
              >
                +{{ getSuggestion(props.row) }}
              </q-chip>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <!-- Actions Column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                v-if="getSuggestion(props.row) > 0"
                flat
                dense
                icon="add_shopping_cart"
                color="primary"
                @click="addToCart(props.row)"
                :aria-label="$t('bestellijsten.addToCart')"
              >
                <q-tooltip>{{ $t('bestellijsten.addToCart') }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="delete"
                color="negative"
                @click="confirmRemoveItem(props.row)"
                :aria-label="$t('bestellijsten.delete')"
              >
                <q-tooltip>{{ $t('bestellijsten.delete') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add Product Dialog -->
    <q-dialog v-model="showAddProductDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('bestellijsten.addProduct') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="productSearchQuery"
            :label="$t('bestellijsten.searchProducts')"
            outlined
            clearable
            @input="searchProducts"
            debounce="300"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-list v-if="searchResults.length > 0" class="q-mt-md">
            <q-item
              v-for="product in searchResults"
              :key="product.id"
              clickable
              @click="selectProduct(product)"
            >
              <q-item-section>
                <q-item-label>{{ product.name }}</q-item-label>
                <q-item-label caption>{{ product.sku }} - {{ product.unit }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  icon="add"
                  color="primary"
                  @click="selectProduct(product)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="closeAddProductDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useBestellijstenStore } from 'src/stores/bestellijsten'
import type { BestellijstItem, Product } from 'src/types/supabase'
import PageLayout from 'src/components/PageLayout.vue'
import PageTitle from 'src/components/PageTitle.vue'

const route = useRoute()
const { t } = useI18n()
const $q = useQuasar()
const bestellijstenStore = useBestellijstenStore()

// State
const loading = ref(false)
const scanInput = ref('')
const showAddProductDialog = ref(false)
const productSearchQuery = ref('')
const searchResults = ref<Product[]>([])

// Computed
const currentBestellijst = computed(() => bestellijstenStore.currentBestellijst)
const scanMode = computed(() => bestellijstenStore.scanMode)
const itemsWithSuggestions = computed(() => bestellijstenStore.itemsWithSuggestions)

const items = computed(() => {
  return currentBestellijst.value?.product_list_items || []
})

const tableColumns = computed(() => [
  {
    name: 'name',
    label: t('bestellijsten.productName'),
    field: (row: any) => row.products?.name || '-',
    align: 'left',
    sortable: true
  },
  {
    name: 'sku',
    label: t('bestellijsten.sku'),
    field: (row: any) => row.products?.sku || '-',
    align: 'left'
  },
  {
    name: 'current_stock',
    label: t('bestellijsten.currentStock'),
    field: 'current_stock',
    align: 'center',
    sortable: true
  },
  {
    name: 'minimum_stock',
    label: t('bestellijsten.minimumStock'),
    field: 'minimum_stock',
    align: 'center'
  },
  {
    name: 'maximum_stock',
    label: t('bestellijsten.maximumStock'),
    field: 'maximum_stock',
    align: 'center'
  },
  {
    name: 'stock_status',
    label: t('bestellijsten.stockStatus'),
    field: 'stock_status',
    align: 'center'
  },
  {
    name: 'suggestion',
    label: t('bestellijsten.orderSuggestion'),
    field: 'suggestion',
    align: 'center'
  },
  {
    name: 'actions',
    label: t('common.actions'),
    field: 'actions',
    align: 'center'
  }
])

// Methods
const toggleScanMode = () => {
  bestellijstenStore.toggleScanMode()
  if (scanMode.value) {
    scanInput.value = ''
  }
}

const processScan = async () => {
  if (!scanInput.value) return

  const result = await bestellijstenStore.processBarcodeScan(scanInput.value)
  
  if (result.success) {
    $q.notify({
      type: 'positive',
      message: t('bestellijsten.countUpdated')
    })
    scanInput.value = ''
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || t('bestellijsten.productNotFound')
    })
  }
}

const updateStock = async (item: BestellijstItem) => {
  const result = await bestellijstenStore.updateBestellijstItem(item.id, {
    current_stock: item.current_stock,
    minimum_stock: item.minimum_stock,
    maximum_stock: item.maximum_stock
  })

  if (!result.success) {
    $q.notify({
      type: 'negative',
      message: result.error || t('bestellijsten.errorUpdatingStock')
    })
  }
}

const getSuggestion = (item: BestellijstItem): number => {
  return bestellijstenStore.getReorderSuggestion(item) || 0
}

const getStatusColor = (item: BestellijstItem): string => {
  const status = bestellijstenStore.getStockStatus(item)
  switch (status) {
    case 'ok': return 'positive'
    case 'low': return 'warning'
    case 'out': return 'negative'
    default: return 'grey'
  }
}

const getStatusText = (item: BestellijstItem): string => {
  const status = bestellijstenStore.getStockStatus(item)
  switch (status) {
    case 'ok': return t('bestellijsten.stockOk')
    case 'low': return t('bestellijsten.stockLow')
    case 'out': return t('bestellijsten.stockOut')
    default: return '-'
  }
}

const addToCart = async (item: BestellijstItem) => {
  // TODO: Implement add to cart functionality
  $q.notify({
    type: 'info',
    message: 'Add to cart functionality coming soon'
  })
}

const addAllSuggestionsToCart = async () => {
  // TODO: Implement add all suggestions to cart
  $q.notify({
    type: 'info',
    message: 'Add all suggestions functionality coming soon'
  })
}

const confirmRemoveItem = (item: BestellijstItem) => {
  $q.dialog({
    title: t('bestellijsten.delete'),
    message: t('bestellijsten.confirmDeleteItem'),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await bestellijstenStore.removeFromBestellijst(item.id)
    
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: t('bestellijsten.itemDeleted')
      })
    } else {
      $q.notify({
        type: 'negative',
        message: result.error
      })
    }
  })
}

const searchProducts = async () => {
  if (!productSearchQuery.value || productSearchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searchResults.value = await bestellijstenStore.searchProducts(productSearchQuery.value)
}

const selectProduct = async (product: Product) => {
  if (!currentBestellijst.value) return

  const result = await bestellijstenStore.addProductToBestellijst(
    currentBestellijst.value.id,
    product.id
  )

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: t('bestellijsten.itemAdded')
    })
    closeAddProductDialog()
  } else {
    $q.notify({
      type: 'negative',
      message: result.error
    })
  }
}

const closeAddProductDialog = () => {
  showAddProductDialog.value = false
  productSearchQuery.value = ''
  searchResults.value = []
}

// Lifecycle
onMounted(async () => {
  const bestellijstId = route.params.id as string
  if (bestellijstId) {
    loading.value = true
    try {
      await bestellijstenStore.fetchBestellijst(bestellijstId)
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('bestellijsten.errorLoadingList')
      })
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.modern-table {
  border-radius: 8px;
  overflow: hidden;
}
</style> 