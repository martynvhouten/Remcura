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
      <!-- FilterPanel component -->
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

      <!-- Smart Products Table -->
      <div class="products-table-container">
        <SmartTable
          :data="products"
          :columns="tableColumns"
          :config="smartTableConfig"
          :show-strategy-indicator="isDevelopment"
          :show-performance-info="isDevelopment"
          row-key="id"
          :rows-per-page-options="[25, 50, 100]"
          @strategy-changed="onStrategyChanged"
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
              <q-chip
                :color="
                  props.row.gs1_status === 'complete' ? 'positive' : 'orange'
                "
                text-color="white"
                size="sm"
                dense
              >
                {{ $t(`productsPage.gs1Status.${props.row.gs1_status}`) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Price Cell -->
          <template #body-cell-price="props">
            <q-td :props="props" class="price-info">
              <div class="price-value">
                <span v-if="props.row.price" class="price-amount">
                  € {{ props.row.price.toFixed(2) }}
                </span>
                <span v-else class="no-price">-</span>
              </div>
            </q-td>
          </template>

          <!-- Batch Status Cell -->
          <template #body-cell-batch_status="props">
            <q-td :props="props">
              <q-chip
                :color="
                  props.row.batch_status === 'batch_tracked' ? 'info' : 'grey'
                "
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

          <!-- Row with click handler for expansion -->
          <template #body-cell-name="props">
            <q-td
              :props="props"
              class="product-name-cell cursor-pointer"
              @click="toggleRowExpansion(props.row.id)"
            >
              <div class="product-info">
                <div class="product-name">{{ props.row.name }}</div>
                <div v-if="props.row.brand" class="product-brand">
                  {{ props.row.brand }}
                </div>
              </div>
            </q-td>
          </template>
        </SmartTable>
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
    <BarcodeScanner v-model="showGtinScanner" @scan="handleGtinScan" />

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
    <ConfirmDialog
      v-model="showDeleteDialog"
      type="danger"
      :title="$t('products.deleteConfirm')"
      :message="$t('products.deleteMessage', { name: productToDelete?.name })"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useProductsStore } from 'src/stores/products';
  import { useOrderListsStore } from 'src/stores/orderLists';
  import { useAuthStore } from 'src/stores/auth';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import FilterPanel from 'src/components/filters/FilterPanel.vue';
  import ConfirmDialog from 'src/components/base/ConfirmDialog.vue';
  import SmartTable from 'src/components/tables/SmartTable.vue';
  // ✅ PERFORMANCE OPTIMIZATION: Dynamic imports for heavy dialogs

  const ProductDetailsDialog = defineAsyncComponent(
    () => import('src/components/products/ProductDetailsDialog.vue')
  );
  const ShoppingCartDialog = defineAsyncComponent(
    () => import('src/components/products/ShoppingCartDialog.vue')
  );
  const OrderListDialog = defineAsyncComponent(
    () => import('src/components/products/OrderListDialog.vue')
  );
  const BarcodeScanner = defineAsyncComponent(
    () => import('src/components/BarcodeScanner.vue')
  );
  const AdvancedSearchDialog = defineAsyncComponent(
    () => import('src/components/products/AdvancedSearchDialog.vue')
  );
  const ProductFormDialog = defineAsyncComponent(
    () => import('src/components/products/ProductFormDialog.vue')
  );

  import { productsFilterPreset } from '@/presets/filters/products';
  import { usePermissions } from 'src/services/permissions';
  import type {
    ProductWithStock,
    ProductBatchSummary,
  } from 'src/types/inventory';
  import type {
    FilterValues,
    FilterChangeEvent,
    FilterResetEvent,
  } from '@/types/filters';

  const { t, locale } = useI18n();
  const $q = useQuasar();
  const productsStore = useProductsStore();
  const orderListsStore = useOrderListsStore();
  const authStore = useAuthStore();
  const permissions = usePermissions();

  // Permission checks - TODO: Connect to proper auth system
  const canCreate = ref(true);
  const canEdit = ref(true);
  const canDelete = ref(true);

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

  // Store getters - using storeToRefs for reactivity
  const {
    products,
    loading,
    cart,
    cartItemsCount,
    cartTotal,
    filters,
    availableCategories,
    availableCountries,
    availableGpcCodes,
    availableLifecycleStatuses,
    availableSuppliers,
    productStats,
  } = storeToRefs(productsStore);
  
  const { orderLists } = storeToRefs(orderListsStore);

  // Development mode indicator
  const isDevelopment = computed(() => process.env.NODE_ENV === 'development');

  // Smart table configuration for large datasets
  const smartTableConfig = computed(() => ({
    clientSideThreshold: 1000, // Switch to server-side at 1000 products
    virtualizationThreshold: 5000, // Switch to virtualization at 5000 products
    debounceMs: 300,
    itemHeight: 60,
    serverSideLoader: async (pagination: any, filters: any) => {
      // Server-side loading for large datasets
      const practiceId = authStore.clinicId;
      if (!practiceId) return { data: [], totalCount: 0 };

      // TODO: Implement server-side pagination when needed
      // For now, return all products (client-side handles pagination)
      return {
        data: products.value,
        totalCount: products.value.length,
      };
    },
  }));

  // Handle strategy changes
  const onStrategyChanged = (strategy: string) => {
    console.log(`Products table strategy changed to: ${strategy}`);
    $q.notify({
      type: 'info',
      message: `Table optimized for ${strategy} mode`,
      timeout: 2000,
    });
  };

  // Table columns configuration with enhanced sorting support
  const tableColumns = computed(() => [
    {
      name: 'name',
      label: t('productsPage.table.name'),
      field: 'name',
      align: 'left' as const,
      sortable: true,
      style: 'width: 250px',
      classes: 'col-name',
      headerClasses: 'col-name',
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
      classes: 'col-status',
      headerClasses: 'col-status',
    },
    {
      name: 'gs1_status',
      label: t('productsPage.table.gs1Status'),
      field: 'gs1_status',
      align: 'center' as const,
      sortable: false,
      style: 'width: 140px',
      classes: 'col-status',
      headerClasses: 'col-status',
    },
    {
      name: 'price',
      label: t('productsPage.table.price'),
      field: 'lowest_price',
      align: 'right' as const,
      sortable: true,
      style: 'width: 120px',
      classes: 'col-numeric',
      headerClasses: 'col-numeric',
    },
    {
      name: 'batch_status',
      label: t('productsPage.table.stockType'),
      field: 'batch_status',
      align: 'center' as const,
      sortable: false,
      style: 'width: 140px',
      classes: 'col-status',
      headerClasses: 'col-status',
    },
    {
      name: 'actions',
      label: t('productsPage.table.actions'),
      field: '',
      align: 'center' as const,
      sortable: false,
      style: 'width: 180px',
      classes: 'col-actions',
      headerClasses: 'col-actions',
    },
  ]);

  // Legacy filter options for compatibility
  const categoryOptions = computed(
    () =>
      availableCategories.value
        ?.filter((cat): cat is string => cat !== null)
        .map((cat) => ({
          label: cat,
          value: cat,
        })) ?? []
  );

  const stockStatusOptions = computed(() => [
    { label: t('productsPage.stockStatus.in_stock'), value: 'in_stock' },
    { label: t('productsPage.stockStatus.low_stock'), value: 'low_stock' },
    {
      label: t('productsPage.stockStatus.out_of_stock'),
      value: 'out_of_stock',
    },
  ]);

  const countryOptions = computed(
    () =>
      availableCountries.value
        ?.filter((country): country is string => country !== null && country !== undefined)
        .map((country) => ({
          label: `${getCountryFlag(country)} ${getCountryName(country)}`,
          value: country,
        })) ?? []
  );

  const gpcOptions = computed(
    () =>
      availableGpcCodes.value?.map((gpc: string) => ({
        label: `${gpc} - ${getGpcDescription(gpc)}`,
        value: gpc,
      })) ?? []
  );

  const lifecycleOptions = computed(() => [
    { label: t('productsPage.lifecycleStatus.active'), value: 'active' },
    {
      label: t('productsPage.lifecycleStatus.discontinued'),
      value: 'discontinued',
    },
    { label: t('productsPage.lifecycleStatus.new'), value: 'new' },
    { label: t('productsPage.lifecycleStatus.phase_out'), value: 'phase_out' },
  ]);

  const supplierOptions = computed(() =>
    availableSuppliers.value.map((supplier) => ({
      label: typeof supplier === 'string' ? supplier : supplier.name,
      value: typeof supplier === 'string' ? supplier : supplier.id,
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
    filterValues.value = {
      ...productsFilterPreset.defaultFilters,
    } as FilterValues;
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

  const getStockStatusLabel = (status: string): string => {
    switch (status) {
      case 'in_stock':
        return t('productsPage.stockStatus.in_stock');
      case 'low_stock':
        return t('productsPage.stockStatus.low_stock');
      case 'out_of_stock':
        return t('productsPage.stockStatus.out_of_stock');
      default:
        return t('productsPage.stockStatus.unavailable');
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
    const gtinMatch = products.value.find(
      (product: ProductWithStock) => product.gtin === gtin
    );
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
            handler: () => showProductDetails(gtinMatch),
          },
        ],
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
      if (!practiceId) {
        return;
      }

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

  const handleAdvancedSearch = (criteria: any) => {
    // Apply advanced search criteria to filters
    Object.assign(filters, criteria);

    // Update search results count
    searchResultsCount.value = products.value.length;

    $q.notify({
      type: 'positive',
      message: t('productsPage.advancedSearch.resultsFound', {
        count: products.value.length,
      }),
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
    if (!productToDelete.value) {
      return;
    }

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

  // Table request handler for sorting and pagination
  const onTableRequest = (props: any) => {
    // Use the composable's handler and then update rowsNumber
    tableRequestHandler(props);
    pagination.value.rowsNumber = products.value.length;
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
      filterValues.value = {
        ...productsFilterPreset.defaultFilters,
      } as FilterValues;
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
      // Minimal product-specific styling - main table styling handled by global medical-table class
      .product-info {
        .product-name {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
        }

        .product-brand {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: var(--space-1);
        }
      }

      .sku-code {
        font-family: var(--font-family-mono);
        background: var(--neutral-100);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .price-value {
        font-weight: var(--font-weight-semibold);
        color: var(--brand-primary);
      }

      .action-buttons {
        display: flex;
        gap: var(--space-1);
        justify-content: center;

        .q-btn {
          min-width: 32px;
          min-height: 32px;
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
