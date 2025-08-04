<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('productsPage.title')"
        :subtitle="$t('productsPage.subtitle')"
        icon="inventory_2"
      >
        <template #actions>
          <q-btn
            flat
            round
            icon="refresh"
            size="md"
            @click="refreshData"
            :loading="loading"
            class="app-btn-refresh"
          >
            <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="canCreate"
            icon="add"
            :label="$t('products.createProduct')"
            @click="showCreateProductDialog"
            unelevated
            no-caps
            class="app-btn-secondary"
          />
          <q-btn
            icon="add_shopping_cart"
            :label="$t('productsPage.viewCart')"
            @click="showCartDialog = true"
            :disable="cartItemsCount === 0"
            unelevated
            no-caps
            class="app-btn-primary"
          >
            <q-badge
              v-if="cartItemsCount > 0"
              color="red"
              floating
              :label="cartItemsCount"
            />
          </q-btn>
        </template>
      </PageTitle>
    </template>

    <div class="products-page">
      <!-- Modern FilterPanel Component -->
      <div class="filters-section q-mb-lg">
        <FilterPanel
          :preset="productsFilterPreset"
          v-model="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterReset"
          @clear="handleFilterClear"
          :loading="loading"
          collapsible
          class="products-filter-panel"
        />
      </div>

      <!-- Products Table -->
      <div class="products-table-container">
        <q-table
          :rows="filteredProducts"
          :columns="tableColumns"
          :loading="loading"
          :pagination="pagination"
          :rows-per-page-options="[25, 50, 100]"
          row-key="id"
          flat
          bordered
          class="products-table"
          @update:pagination="
            value =>
              (pagination = { ...value, rowsNumber: value.rowsNumber ?? 0 })
          "
        >
          <!-- Loading -->
          <template #loading>
            <q-inner-loading showing color="primary" />
          </template>

          <!-- No Data -->
          <template #no-data>
            <div class="full-width row flex-center q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>{{ $t('productsPage.noProductsFound') }}</span>
            </div>
          </template>

          <!-- Product Name Cell -->
          <template #body-cell-name="props">
            <q-td :props="props" class="product-name-cell">
              <div class="product-info">
                <div class="product-name">{{ props.row.name }}</div>
                <div v-if="props.row.brand" class="product-brand">
                  {{ props.row.brand }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- SKU Cell -->
          <template #body-cell-sku="props">
            <q-td :props="props">
              <code class="sku-code">{{ props.row.sku || '-' }}</code>
            </q-td>
          </template>

          <!-- Stock Status Cell -->
          <template #body-cell-stock_status="props">
            <q-td :props="props">
              <q-chip
                :color="getStockStatusColor(props.row.stock_status)"
                :text-color="getStockStatusTextColor(props.row.stock_status)"
                size="sm"
                dense
              >
                {{ $t(`productsPage.stockStatus.${props.row.stock_status}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- GS1 Status Cell -->
          <template #body-cell-gs1_status="props">
            <q-td :props="props">
              <div class="gs1-status-cell">
                <div v-if="props.row.gtin || props.row.gpc_brick_code || props.row.country_of_origin" class="gs1-data">
                  <div v-if="props.row.gtin" class="gs1-item">
                    <q-icon name="qr_code_2" size="xs" color="primary" />
                    <span class="gs1-value">{{ props.row.gtin }}</span>
                  </div>
                  <div v-if="props.row.country_of_origin" class="gs1-item">
                    <q-icon name="flag" size="xs" color="info" />
                    <span class="gs1-value">{{ props.row.country_of_origin }}</span>
                  </div>
                  <div v-if="props.row.gpc_brick_code" class="gs1-item">
                    <q-icon name="category" size="xs" color="orange" />
                    <span class="gs1-value">{{ props.row.gpc_brick_code }}</span>
                  </div>
                </div>
                <div v-else class="no-gs1-data">
                  <q-icon name="close" size="xs" color="grey-5" />
                  <span class="text-grey-5">{{ $t('productsPage.noGs1Data') }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Price Cell -->
          <template #body-cell-price="props">
            <q-td :props="props" class="price-info">
              <div class="price-value">
                {{ props.row.lowest_price ? `€${props.row.lowest_price.toFixed(2)}` : '-' }}
              </div>
            </q-td>
          </template>

          <!-- Batch Status Cell -->
          <template #body-cell-batch_status="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.batch_status === 'batch_tracked' ? 'info' : 'grey'"
                text-color="white"
                size="sm"
                dense
              >
                {{ $t(`productsPage.batchStatus.${props.row.batch_status}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Actions Cell -->
          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  size="sm"
                  flat
                  dense
                  round
                  icon="visibility"
                  color="primary"
                  @click="showProductDetails(props.row)"
                >
                  <q-tooltip>{{ $t('productsPage.viewDetails') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canEdit"
                  size="sm"
                  flat
                  dense
                  round
                  icon="edit"
                  color="warning"
                  @click="editProduct(props.row)"
                >
                  <q-tooltip>{{ $t('products.editProduct') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canDelete"
                  size="sm"
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  @click="deleteProduct(props.row)"
                >
                  <q-tooltip>{{ $t('products.deleteProduct') }}</q-tooltip>
                </q-btn>
                <q-btn
                  size="sm"
                  flat
                  dense
                  round
                  icon="add_shopping_cart"
                  color="positive"
                  @click="handleAddToCart(props.row)"
                >
                  <q-tooltip>{{ $t('productsPage.addToCart') }}</q-tooltip>
                </q-btn>
                <q-btn
                  size="sm"
                  flat
                  dense
                  round
                  icon="list_alt"
                  color="orange"
                  @click="handleAddToOrderList(props.row)"
                >
                  <q-tooltip>{{ $t('productsPage.addToOrderList') }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Row Expansion -->
          <template #body="props">
            <q-tr :props="props">
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                @click="col.name === 'name' ? toggleRowExpansion(props.row.id) : null"
                :class="{ 'cursor-pointer': col.name === 'name' }"
              >
                <slot :name="`body-cell-${col.name}`" :props="{ ...props, col }">
                  {{ col.value }}
                </slot>
              </q-td>
            </q-tr>

            <!-- Expanded Row Content -->
            <q-tr v-show="expandedRows.includes(props.row.id)" :props="props">
              <q-td colspan="100%" class="expanded-content">
                <div class="expanded-grid">
                  <!-- Product Details -->
                  <div class="detail-section">
                    <div class="section-title">{{ $t('productsPage.productDetails') }}</div>
                    <div class="detail-items">
                      <div v-if="props.row.description" class="detail-item">
                        <span class="detail-label">{{ $t('productsPage.description') }}:</span>
                        <span class="detail-value">{{ props.row.description }}</span>
                      </div>
                      <div v-if="props.row.unit" class="detail-item">
                        <span class="detail-label">{{ $t('productsPage.unit') }}:</span>
                        <span class="detail-value">{{ props.row.unit }}</span>
                      </div>
                      <div v-if="props.row.category" class="detail-item">
                        <span class="detail-label">{{ $t('productsPage.category') }}:</span>
                        <span class="detail-value">{{ props.row.category }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- GS1 Information -->
                  <div v-if="props.row.gtin || props.row.gpc_brick_code" class="detail-section">
                    <div class="section-title">{{ $t('productsPage.gs1Information') }}</div>
                    <div class="detail-items">
                      <div v-if="props.row.gtin" class="detail-item">
                        <span class="detail-label">GTIN:</span>
                        <span class="detail-value">{{ props.row.gtin }}</span>
                      </div>
                      <div v-if="props.row.gpc_brick_code" class="detail-item">
                        <span class="detail-label">GPC:</span>
                        <span class="detail-value">{{ props.row.gpc_brick_code }}</span>
                      </div>
                      <div v-if="props.row.product_lifecycle_status" class="detail-item">
                        <span class="detail-label">{{ $t('productsPage.lifecycle') }}:</span>
                        <span class="detail-value">{{ props.row.product_lifecycle_status }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Suppliers -->
                  <div v-if="props.row.suppliers?.length" class="detail-section">
                    <div class="section-title">{{ $t('productsPage.suppliers') }}</div>
                    <div class="supplier-list">
                      <div v-for="supplier in props.row.suppliers" :key="supplier.id" class="supplier-item">
                        <span class="supplier-name">{{ supplier.name }}</span>
                        <span v-if="supplier.price" class="supplier-price">€{{ supplier.price.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Stock Levels -->
                  <div v-if="props.row.stock_levels?.length" class="detail-section">
                    <div class="section-title">{{ $t('productsPage.stockLevels') }}</div>
                    <div class="stock-list">
                      <div v-for="stock in props.row.stock_levels" :key="stock.location_id" class="stock-item">
                        <span class="location-name">{{ stock.location_name || 'Unknown Location' }}</span>
                        <span class="stock-amount">{{ stock.current_quantity || 0 }} {{ props.row.unit || 'pcs' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Product Details Dialog -->
    <ProductDetailsDialog
      v-model="showDetailsDialog"
      :product="selectedProduct"
      @add-to-cart="handleAddToCart"
      @add-to-order-list="handleAddToOrderList"
    />

    <!-- Shopping Cart Dialog -->
    <ShoppingCartDialog
      v-model="showCartDialog"
      :cart-items="cart"
      :cart-total="cartTotal"
      @update-quantity="updateCartItemQuantity"
      @remove-item="removeFromCart"
      @clear-cart="clearCart"
      @checkout="handleCheckout"
    />

    <!-- Order List Dialog -->
    <OrderListDialog
      v-model="showOrderListDialog"
      :order-lists="orderLists"
      :selected-product="selectedProduct"
      @create-order-list="handleCreateOrderList"
      @add-to-existing="handleAddToExistingOrderList"
    />

    <!-- GTIN Barcode Scanner -->
    <BarcodeScanner
      v-model="showGtinScanner"
      @scan="handleGtinScan"
    />

    <!-- Advanced Search Dialog -->
    <AdvancedSearchDialog
      v-model="showAdvancedSearch"
      :current-filters="filters"
      :country-options="countryOptions"
      :gpc-options="gpcOptions"
      :category-options="categoryOptions"
      :supplier-options="supplierOptions"
      :stock-status-options="stockStatusOptions"
      :lifecycle-options="lifecycleOptions"
      :results-count="searchResultsCount"
      @search="handleAdvancedSearch"
      @open-scanner="showGtinScanner = true"
      @preview="handleSearchPreview"
    />

    <!-- Product Form Dialog -->
    <ProductFormDialog
      v-model="showProductFormDialog"
      :product="selectedProductForEdit"
      @saved="onProductSaved"
      @scan-barcode="showGtinScanner = true"
    />

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('products.deleteConfirm') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ $t('products.deleteMessage', { name: productToDelete?.name }) }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            :label="$t('common.delete')"
            color="negative"
            @click="confirmDelete"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useProductsStore } from 'src/stores/products';
import { useOrderListsStore } from 'src/stores/orderLists';
import { useAuthStore } from 'src/stores/auth';
import PageLayout from 'src/components/PageLayout.vue';
import PageTitle from 'src/components/PageTitle.vue';
import FilterPanel from 'src/components/filters/FilterPanel.vue';
import ProductDetailsDialog from 'src/components/products/ProductDetailsDialog.vue';
import ShoppingCartDialog from 'src/components/products/ShoppingCartDialog.vue';
import OrderListDialog from 'src/components/products/OrderListDialog.vue';
import BarcodeScanner from 'src/components/BarcodeScanner.vue';
import AdvancedSearchDialog from 'src/components/products/AdvancedSearchDialog.vue';
import ProductFormDialog from 'src/components/products/ProductFormDialog.vue';
import { productsFilterPreset } from '@/presets/filters/products';
import { usePermissions } from 'src/services/permissions';
import type {
  ProductWithStock,
  ProductBatchSummary,
} from 'src/types/inventory';
import type { FilterValues, FilterChangeEvent, FilterResetEvent } from '@/types/filters';

const { t, locale } = useI18n();
const $q = useQuasar();
const productsStore = useProductsStore();
const orderListsStore = useOrderListsStore();
const authStore = useAuthStore();
const permissions = usePermissions();

// Permission checks
const canCreate = ref(false);
const canEdit = ref(false);
const canDelete = ref(false);

// Reactive data
const selectedProduct = ref<ProductWithStock | null>(null);
const showDetailsDialog = ref(false);
const showCartDialog = ref(false);
const showOrderListDialog = ref(false);
const showGtinScanner = ref(false);
const showAdvancedSearch = ref(false);
const showProductFormDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedProductForEdit = ref<ProductWithStock | null>(null);
const productToDelete = ref<ProductWithStock | null>(null);
const deleting = ref(false);
const expandedRows = ref<string[]>([]);
const searchResultsCount = ref<number | null>(null);

// New filter state for FilterPanel
const filterValues = ref<FilterValues>({});

const pagination = ref({
  sortBy: null as string | null,
  descending: false,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
});

// Store getters - using storeToRefs for reactivity
const {
  products,
  filteredProducts,
  loading,
  cart,
  cartItemsCount,
  cartTotal,
  orderLists,
  filters,
  availableCategories,
  availableCountries,
  availableGpcCodes,
  availableLifecycleStatuses,
  availableSuppliers,
  productStats,
} = storeToRefs(productsStore);

// Table columns configuration
const tableColumns = computed(() => [
  {
    name: 'name',
    label: t('productsPage.table.name'),
    field: 'name',
    align: 'left' as const,
    sortable: true,
    style: 'width: 250px',
  },
  {
    name: 'sku',
    label: t('productsPage.table.sku'),
    field: 'sku',
    align: 'left' as const,
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'stock_status',
    label: t('productsPage.table.stockStatus'),
    field: 'stock_status',
    align: 'center' as const,
    sortable: true,
    style: 'width: 150px',
  },
  {
    name: 'gs1_status',
    label: t('productsPage.table.gs1Status'),
    field: 'gs1_status',
    align: 'center' as const,
    sortable: false,
    style: 'width: 140px',
  },
  {
    name: 'price',
    label: t('productsPage.table.price'),
    field: 'lowest_price',
    align: 'right' as const,
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'batch_status',
    label: t('productsPage.table.stockType'),
    field: 'batch_status',
    align: 'center' as const,
    sortable: false,
    style: 'width: 140px',
  },
  {
    name: 'actions',
    label: t('productsPage.table.actions'),
    field: '',
    align: 'center' as const,
    sortable: false,
    style: 'width: 180px',
  },
]);

// Legacy filter options for compatibility
const categoryOptions = computed(
  () =>
    availableCategories.value?.map((cat: string) => ({ label: cat, value: cat })) ??
    []
);

const stockStatusOptions = computed(() => [
  { label: t('productsPage.stockStatus.in_stock'), value: 'in_stock' },
  { label: t('productsPage.stockStatus.low_stock'), value: 'low_stock' },
  {
    label: t('productsPage.stockStatus.out_of_stock'),
    value: 'out_of_stock',
  },
]);

const countryOptions = computed(() => 
  availableCountries.value?.map((country: string) => ({
    label: `${getCountryFlag(country)} ${getCountryName(country)}`,
    value: country,
  })) ?? []
);

const gpcOptions = computed(() => 
  availableGpcCodes.value?.map((gpc: string) => ({
    label: `${gpc} - ${getGpcDescription(gpc)}`,
    value: gpc,
  })) ?? []
);

const lifecycleOptions = computed(() => [
  { label: t('productsPage.lifecycleStatus.active'), value: 'active' },
  { label: t('productsPage.lifecycleStatus.discontinued'), value: 'discontinued' },
  { label: t('productsPage.lifecycleStatus.new'), value: 'new' },
  { label: t('productsPage.lifecycleStatus.phase_out'), value: 'phase_out' },
]);

const supplierOptions = computed(() => 
  availableSuppliers.value.map((supplier: string) => ({
    label: supplier,
    value: supplier,
  }))
);

// Filter event handlers
const handleFilterChange = (event: FilterChangeEvent) => {
  // Convert FilterPanel values to store filter format
  const storeFilters = convertFilterValuesToStoreFormat(filterValues.value);
  updateFilters(storeFilters);
};

const handleFilterReset = (event: FilterResetEvent) => {
  // Reset to default values
  filterValues.value = { ...productsFilterPreset.defaultFilters } as FilterValues;
  productsStore.clearFilters();
};

const handleFilterClear = () => {
  // Clear all filters
  filterValues.value = {};
  productsStore.clearFilters();
};

// Helper to convert FilterPanel values to store format
const convertFilterValuesToStoreFormat = (values: FilterValues) => {
  return {
    search: String(values.search || ''),
    category: String(values.category || ''),
    supplier: String(values.supplier || ''),
    stock_status: String(values.stock_status || 'all'),
    gtin: String(values.gtin || ''),
    country_of_origin: String(values.country_of_origin || ''),
    gpc_brick_code: String(values.gpc_brick_code || ''),
    lifecycle_status: String(values.lifecycle_status || ''),
    orderable_only: Boolean(values.orderable_only || false),
  };
};

// Helper functions
const getStockStatusColor = (status: string): string => {
  switch (status) {
    case 'in_stock':
      return 'positive';
    case 'low_stock':
      return 'warning';
    case 'out_of_stock':
      return 'negative';
    default:
      return 'grey';
  }
};

const getStockStatusTextColor = (status: string): string => {
  switch (status) {
    case 'in_stock':
      return 'white';
    case 'low_stock':
      return 'black';
    case 'out_of_stock':
      return 'white';
    default:
      return 'black';
  }
};

const getCountryFlag = (countryCode: string): string => {
  // Simple flag implementation - could be enhanced
  return '🏳️';
};

const getCountryName = (countryCode: string): string => {
  // Simple country name implementation
  return countryCode;
};

const getGpcDescription = (gpcCode: string): string => {
  // Simple GPC description implementation
  return 'Product Classification';
};

const isValidGTIN = (value: string): boolean => {
  return /^\d{8,14}$/.test(value);
};

const handleGtinScan = (gtin: string) => {
  // Update filter values
  filterValues.value = { ...filterValues.value, gtin };
  
  // Check if we found a product with this GTIN
  const gtinMatch = filteredProducts.value.find((product: ProductWithStock) => product.gtin === gtin);
  if (gtinMatch) {
    $q.notify({
      type: 'positive',
      message: t('productsPage.gtinFound', { product: gtinMatch.name }),
      icon: 'qr_code_2',
      position: 'top',
      actions: [
        {
          label: t('productsPage.viewProduct'),
          color: 'white',
          handler: () => showProductDetails(gtinMatch)
        }
      ]
    });
  } else {
    $q.notify({
      type: 'warning',
      message: t('productsPage.gtinNotFound', { gtin }),
      icon: 'search_off',
      position: 'top',
    });
  }
};

const toggleRowExpansion = (productId: string) => {
  const index = expandedRows.value.indexOf(productId);
  if (index > -1) {
    expandedRows.value.splice(index, 1);
  } else {
    expandedRows.value.push(productId);
  }
};

const showProductDetails = (product: ProductWithStock) => {
  selectedProduct.value = product;
  showDetailsDialog.value = true;
};

const handleAddToCart = (product: ProductWithStock) => {
  try {
    productsStore.addToCart(product, 1);
    $q.notify({
      type: 'positive',
      message: t('productsPage.addedToCart', { productName: product.name }),
      position: 'top',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('productsPage.cartAddError'),
      position: 'top',
    });
  }
};

const handleAddToOrderList = (product: ProductWithStock) => {
  selectedProduct.value = product;
  showOrderListDialog.value = true;
};

const refreshData = async () => {
  try {
    const practiceId = authStore.clinicId;
    if (!practiceId) { return; }

    await productsStore.refreshData(practiceId);
    $q.notify({
      type: 'positive',
      message: t('productsPage.dataRefreshed'),
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('productsPage.productLoadError'),
    });
  }
};

// Store actions
const { updateFilters } = productsStore;
const { updateCartItemQuantity, removeFromCart, clearCart } = productsStore;
const handleCreateOrderList = orderListsStore.createOrderList;
const handleAddToExistingOrderList = orderListsStore.addOrderListItem;

const handleCheckout = () => {
  $q.notify({
    type: 'info',
    message: t('common.comingSoon'),
  });
};

const handleAdvancedSearch = (criteria: ProductSearchCriteria) => {
  // Apply advanced search criteria to filters
  Object.assign(filters, criteria);
  
  // Update search results count
  searchResultsCount.value = filteredProducts.value.length;
  
  $q.notify({
    type: 'positive',
    message: t('productsPage.advancedSearch.resultsFound', { count: filteredProducts.value.length }),
  });
};

const handleSearchPreview = (criteria: any) => {
  // For preview, we'll simulate the search without actually applying filters
  const mockCount = Math.floor(Math.random() * products.value.length);
  searchResultsCount.value = mockCount;
};

// Product CRUD Methods
const showCreateProductDialog = () => {
  selectedProductForEdit.value = null;
  showProductFormDialog.value = true;
};

const editProduct = (product: ProductWithStock) => {
  selectedProductForEdit.value = product;
  showProductFormDialog.value = true;
};

const deleteProduct = (product: ProductWithStock) => {
  productToDelete.value = product;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
      if (!productToDelete.value) { return; }

  deleting.value = true;
  try {
    await productsStore.deleteProduct(productToDelete.value.id);
    
    $q.notify({
      type: 'positive',
      message: t('products.deleted', { name: productToDelete.value.name }),
    });
    
    showDeleteDialog.value = false;
    productToDelete.value = null;
    
    // Refresh products list
    await refreshData();
  } catch (error) {
    console.error('Error deleting product:', error);
    $q.notify({
      type: 'negative',
      message: t('products.deleteError'),
    });
  } finally {
    deleting.value = false;
  }
};

const onProductSaved = async (product: any) => {
  showProductFormDialog.value = false;
  selectedProductForEdit.value = null;
  
  // Refresh products list to show the changes
  await refreshData();
};

// Lifecycle
onMounted(async () => {
  const practiceId = authStore.clinicId;
  
  if (practiceId) {
    // Clear any existing filters first
    productsStore.clearFilters();
    
    await productsStore.fetchProducts(practiceId);
    
    // If no products loaded on first try, wait and retry once
    if (products.value.length === 0) {
              // Retrying product loading...
      await new Promise(resolve => setTimeout(resolve, 1000));
      await productsStore.fetchProducts(practiceId);
    }
  }
  
  // Initialize filter values with defaults
  if (productsFilterPreset.defaultFilters) {
    filterValues.value = { ...productsFilterPreset.defaultFilters } as FilterValues;
  }

  // Check user permissions
  try {
    canCreate.value = await permissions.canCreateProducts();
    canEdit.value = await permissions.canEditProducts();
    canDelete.value = await permissions.canDeleteProducts();
  } catch (error) {
    console.error('Error checking permissions:', error);
    // Default to no permissions on error
    canCreate.value = false;
    canEdit.value = false;
    canDelete.value = false;
  }
});
</script>

<style lang="scss" scoped>
.products-page {

  .filters-section {
    margin-bottom: 1.5rem;

    .products-filter-panel {
      background: var(--q-card-background);
      border-radius: 8px;
    }
  }

  .products-table-container {
    .products-table {
      .product-name-cell {
        .product-info {
          .product-name {
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
          }

          .product-brand {
            font-size: 0.8rem;
            color: rgba(0, 0, 0, 0.6);
            margin-top: 0.25rem;
          }
        }
      }

      .sku-code {
        font-family: monospace;
        background: rgba(0, 0, 0, 0.05);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }

      .gs1-status-cell {
        min-width: 120px;

        .gs1-data {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .gs1-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;

            .gs1-value {
              font-size: 0.8rem;
              font-family: monospace;
            }

            &:first-child .gs1-value {
              font-weight: 600;
              color: var(--q-primary);
            }
          }

          .gs1-item:not(:first-child) {
            .gs1-value {
              font-size: 0.75rem;
              color: rgba(0, 0, 0, 0.7);
            }

            .q-icon {
              font-size: 1em;
              line-height: 1;
            }
          }
        }

        .no-gs1-data {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }
      }

      .price-info {
        align-items: flex-end;

        .price-value {
          font-weight: 600;
          color: var(--q-primary);
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.25rem;
        justify-content: center;
      }

      .expanded-content {
        padding: 1rem;
        background: rgba(0, 0, 0, 0.02);
        border-top: 1px solid rgba(0, 0, 0, 0.08);

        .expanded-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;

          .detail-section {
            .section-title {
              font-size: 0.875rem;
              font-weight: 600;
              margin: 0 0 0.75rem 0;
              color: rgba(0, 0, 0, 0.8);
            }

            .detail-items {
              .detail-item {
                display: flex;
                margin-bottom: 0.5rem;

                .detail-label {
                  font-weight: 500;
                  margin-right: 0.5rem;
                  min-width: 80px;
                  font-size: 0.8rem;
                  color: rgba(0, 0, 0, 0.7);
                }

                .detail-value {
                  font-size: 0.8rem;
                  color: rgba(0, 0, 0, 0.8);
                }
              }
            }

            .supplier-list,
            .stock-list {
              .supplier-item,
              .stock-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                background: white;
                border-radius: 4px;
                margin-bottom: 0.5rem;
                border: 1px solid rgba(0, 0, 0, 0.08);

                .supplier-name,
                .location-name {
                  font-size: 0.8rem;
                  font-weight: 500;
                }

                .supplier-price,
                .stock-amount {
                  font-size: 0.8rem;
                  color: var(--q-primary);
                  font-weight: 600;
                }
              }
            }
          }
        }
      }
    }
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .products-page {
    .products-table-container {
      overflow-x: auto;
    }
  }
}
</style>
