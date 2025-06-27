<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('products.title')"
        subtitle="Beheer je medische voorraad en ontvang automatische herbestelmeldingen"
        icon="inventory_2"
        :meta="[
          { icon: 'inventory_2', text: 'Voorraad beheer' },
          { icon: 'analytics', text: `${totalProducts} producten` }
        ]"
      >
        <template #actions>
          <q-btn
            color="secondary"
            icon="refresh"
            :label="$t('common.refresh')"
            @click="refreshProducts"
            :loading="loading"
            class="btn-modern"
            outline
          />
          <q-btn
            color="primary"
            icon="add"
            :label="$t('products.addProduct')"
            @click="showAddProductDialog = true"
            class="btn-modern"
            unelevated
          />
        </template>
      </PageTitle>
    </template>

      <!-- Filters and Search -->
      <q-card flat class="filters-card q-pa-md">
        <div class="row q-gutter-md items-end">
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              v-model="searchQuery"
              :label="$t('common.search')"
              outlined
              dense
              clearable
              debounce="300"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="stockFilter"
              :options="stockFilterOptions"
              :label="'Filter op voorraadstatus'"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card>

      <!-- Products Table -->
      <q-card class="table-card">
        <q-table
          :rows="filteredProducts"
          :columns="tableColumns"
          :loading="loading"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          :filter="searchQuery"
          :filter-method="filterMethod"
          class="products-table"
        >
          <!-- Custom column templates -->
          <template v-slot:body-cell-stock_status="props">
            <q-td :props="props">
              <StockStatusChip :product="props.row" />
            </q-td>
          </template>

          <template v-slot:body-cell-current_stock="props">
            <q-td :props="props">
              <q-badge 
                :color="getStockColor(props.row)"
                :label="props.value"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-reorder_suggestion="props">
            <q-td :props="props">
              <q-chip
                v-if="getReorderSuggestion(props.row)"
                color="primary"
                text-color="white"
                icon="add_shopping_cart"
                size="sm"
              >
                +{{ getReorderSuggestion(props.row) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click="editProduct(props.row)"
              />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDeleteProduct(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- Add/Edit Product Dialog -->
      <ProductEditDialog
        v-model="showAddProductDialog"
        :product="editingProduct"
        @save="handleSaveProduct"
      />
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useClinicStore } from 'src/stores/clinic'
import type { ClinicProduct } from 'src/types/supabase'
import StockStatusChip from 'src/components/StockStatusChip.vue'
import ProductEditDialog from 'src/components/ProductEditDialog.vue'
import PageLayout from 'src/components/PageLayout.vue'
import PageTitle from 'src/components/PageTitle.vue'

const { t } = useI18n()
const $q = useQuasar()
const clinicStore = useClinicStore()

// State
const loading = ref(false)
const searchQuery = ref('')
const stockFilter = ref('all')
const showAddProductDialog = ref(false)
const editingProduct = ref<ClinicProduct | null>(null)

// Table configuration
const tableColumns = computed(() => [
  {
    name: 'product_name',
    label: t('products.productName'),
    field: 'product_name',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'product_sku',
    label: t('products.productSku'),
    field: 'product_sku',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'current_stock',
    label: t('products.currentStock'),
    field: 'current_stock',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'minimum_stock',
    label: t('products.minimumStock'),
    field: 'minimum_stock',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'maximum_stock',
    label: t('products.maximumStock'),
    field: 'maximum_stock',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'stock_status',
    label: 'Status',
    field: 'stock_status',
    align: 'center' as const
  },
  {
    name: 'reorder_suggestion',
    label: 'Bestel suggestie',
    field: 'reorder_suggestion',
    align: 'center' as const
  },
  {
    name: 'actions',
    label: 'Acties',
    field: 'actions',
    align: 'center' as const
  }
])

const stockFilterOptions = computed(() => [
  { label: 'Alle producten', value: 'all' },
  { label: 'Op voorraad', value: 'in_stock' },
  { label: 'Lage voorraad', value: 'low_stock' },
  { label: 'Niet op voorraad', value: 'out_of_stock' }
])

// Computed properties
const totalProducts = computed(() => clinicStore.products.length)

const filteredProducts = computed(() => {
  let products = clinicStore.products

  // Apply stock filter
  if (stockFilter.value !== 'all') {
    products = products.filter(product => {
      switch (stockFilter.value) {
        case 'in_stock':
          return product.current_stock > product.minimum_stock
        case 'low_stock':
          return product.current_stock <= product.minimum_stock && product.current_stock > 0
        case 'out_of_stock':
          return product.current_stock === 0
        default:
          return true
      }
    })
  }

  return products
})

// Methods
const refreshProducts = async () => {
  loading.value = true
  try {
    await clinicStore.fetchProducts()
    $q.notify({
      type: 'positive',
      message: 'Producten succesvol vernieuwd'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('errors.generic')
    })
  } finally {
    loading.value = false
  }
}

const filterMethod = (rows: readonly any[], terms: string) => {
  if (!terms) return rows
  
  const lowerTerms = terms.toLowerCase()
  return rows.filter(row => 
    row.product_name.toLowerCase().includes(lowerTerms) ||
    (row.product_sku && row.product_sku.toLowerCase().includes(lowerTerms))
  )
}

const getStockColor = (product: ClinicProduct) => {
  if (product.current_stock === 0) return 'negative'
  if (product.current_stock <= product.minimum_stock) return 'warning'
  return 'positive'
}

const getReorderSuggestion = (product: ClinicProduct) => {
  return clinicStore.getReorderSuggestion(product)
}

const editProduct = (product: ClinicProduct) => {
  editingProduct.value = product
  showAddProductDialog.value = true
}

const confirmDeleteProduct = (product: ClinicProduct) => {
  $q.dialog({
    title: t('products.deleteProduct'),
    message: `Weet je zeker dat je "${product.product_name}" wilt verwijderen?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await clinicStore.deleteProduct(product.id)
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: t('alerts.productDeleted')
      })
    } else {
      $q.notify({
        type: 'negative',
        message: result.error || t('errors.generic')
      })
    }
  })
}

const handleSaveProduct = async (productData: any) => {
  const isEditing = !!editingProduct.value
  
  const result = isEditing
    ? await clinicStore.updateProduct(editingProduct.value!.id, productData)
    : await clinicStore.addProduct(productData)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: isEditing ? t('alerts.productUpdated') : t('alerts.productAdded')
    })
    
    showAddProductDialog.value = false
    editingProduct.value = null
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || t('errors.generic')
    })
  }
}

// Lifecycle
onMounted(() => {
  refreshProducts()
})

// Watch for dialog close to reset editing state
watch(() => showAddProductDialog.value, (newVal: boolean) => {
  if (!newVal) {
    editingProduct.value = null
  }
})
</script>

<style lang="scss" scoped>
.filters-card {
  margin-bottom: var(--space-6);
  border-radius: var(--radius-xl);
  border: 1px solid var(--neutral-200);
  background: var(--neutral-100);
}

.table-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  :deep(.q-table) {
    .q-table__container {
      border-radius: var(--radius-xl);
    }
    
    .q-table__top {
      padding: var(--space-5);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .q-td {
      padding: var(--space-4);
      vertical-align: middle;
      border-bottom: 1px solid var(--neutral-100);
      
      &:first-child {
        padding-left: var(--space-5);
      }
      
      &:last-child {
        padding-right: var(--space-5);
      }
    }
    
    .q-th {
      padding: var(--space-4) var(--space-5);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-700);
      background: var(--neutral-50);
      
      &:first-child {
        border-top-left-radius: var(--radius-xl);
      }
      
      &:last-child {
        border-top-right-radius: var(--radius-xl);
      }
    }
    
    tbody tr:hover {
      background-color: var(--neutral-50);
    }
  }
}

// Dark mode styling
body.body--dark {
  .filters-card {
    border-color: var(--neutral-300);
    background: var(--neutral-200);
  }
  
  .table-card {
    :deep(.q-table) {
      .q-th {
        background: var(--neutral-200);
        color: var(--neutral-900);
      }
      
      .q-td {
        border-bottom-color: var(--neutral-300);
        color: var(--neutral-900);
      }
      
      tbody tr:hover {
        background-color: var(--neutral-200);
      }
    }
  }
}

// Responsive design
@media (max-width: 1024px) {
  .filters-card {
    margin-bottom: var(--space-4);
  }
}
</style> 